import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import User from '../models/user.model.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.validation.js';
import { generateOtp, hashOtp } from '../utils/otp.js';
import { sendOtpEmail } from '../services/email.service.js';

const registerAdmin = asyncHandler(async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) throw new ApiError(409, 'User already exists');

    const user = await User.create({
        username,
        email,
        password,
        role: 'admin'
    });

    const { accessToken, refreshToken } = generateTokens({
        userId: user._id,
        role: user.role
    });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    };

    return res
        .status(201)
        .cookie('accessToken', accessToken, { ...options, maxAge: 15 * 60 * 1000 })
        .cookie('refreshToken', refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .json(new ApiResponse(201, { user: user.toJSON() }, 'Admin registered successfully'));
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'admin' });
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials');

    const { accessToken, refreshToken } = generateTokens({
        userId: user._id,
        role: user.role
    });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, { ...options, maxAge: 15 * 60 * 1000 })
        .cookie('refreshToken', refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .json(new ApiResponse(200, { user: user.toJSON() }, 'Login successful'));
});

const logoutAdmin = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    };

    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'Logout successful'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, 'Unauthorized request');

    const decoded = verifyRefreshToken(incomingRefreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
        userId: user._id,
        role: user.role
    });

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, { ...options, maxAge: 15 * 60 * 1000 })
        .cookie('refreshToken', newRefreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .json(new ApiResponse(200, { accessToken }, 'Access token refreshed'));
});


const forgotPassword = asyncHandler(async (req, res) => {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(200).json(new ApiResponse(200, {}, 'If the email exists, an OTP will be sent'));

    // Check rate limit
    if (user.lastOtpRequest && Date.now() - user.lastOtpRequest < 60000) {
        throw new ApiError(429, 'Please wait 1 minute before requesting new OTP');
    }

    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    // Save OTP and expiry
    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;
    user.lastOtpRequest = Date.now();
    await user.save({ validateBeforeSave: false });

    // Send email
    await sendOtpEmail(user.email, otp, 'password reset');

    return res.status(200).json(
        new ApiResponse(200, {}, 'Password reset OTP sent if account exists')
    );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { otp, newPassword } = req.body;
    const hashedOtp = hashOtp(otp);

    const user = await User.findOne({
        resetPasswordOtp: hashedOtp,
        resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, 'Invalid or expired OTP');
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    // Invalidate all sessions
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, 'Password reset successful')
    );
});


const sendVerificationOtp = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user.isEmailVerified) {
        throw new ApiError(400, 'Email already verified');
    }

    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    // Save OTP and expiry (15 minutes)
    user.emailVerificationOtp = hashedOtp;
    user.emailVerificationExpiry = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // Send email
    await sendOtpEmail(user.email, otp, 'verification');

    return res.status(200).json(
        new ApiResponse(200, {}, 'Verification OTP sent successfully')
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const hashedOtp = hashOtp(otp);

    const user = await User.findOne({
        _id: req.user._id,
        emailVerificationExpiry: { $gt: Date.now() }
    });

    if (!user || user.emailVerificationOtp !== hashedOtp) {
        throw new ApiError(400, 'Invalid or expired OTP');
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, 'Email verified successfully')
    );
});

export { registerAdmin, loginAdmin, logoutAdmin, refreshAccessToken, resetPassword, forgotPassword, sendVerificationOtp, verifyEmail };