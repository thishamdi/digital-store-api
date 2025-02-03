import rateLimit from 'express-rate-limit';

export const otpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 OTP requests per windowMs
    message: 'Too many OTP requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});