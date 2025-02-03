import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/user.model.js';

export const authMiddleware = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken ||
            req.header('Authorization')?.replace('Bearer ', '');

        if (!accessToken) {
            throw new ApiError(401, 'Unauthorized request');
        }

        const decoded = verifyAccessToken(accessToken);
        const user = await User.findById(decoded.userId).select('-password -refreshToken');

        if (!user) {
            throw new ApiError(401, 'Invalid access token');
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid access token');
    }
});

export const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        throw new ApiError(403, 'Forbidden: Admin access required');
    }
    next();
};

export const requireVerifiedEmail = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        throw new ApiError(403, 'Please verify your email address');
    }
    next();
};