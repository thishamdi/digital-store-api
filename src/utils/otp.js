import crypto from 'crypto';

export const generateOtp = () => {
    // Generate 6-digit numeric OTP
    return crypto.randomInt(100000, 999999).toString();
};

export const hashOtp = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};