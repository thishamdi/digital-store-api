import express from 'express';
import {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    sendVerificationOtp,
    verifyEmail
} from '../controllers/auth.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';
import { otpRateLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', authMiddleware, logoutAdmin);
router.post('/refresh-token', refreshAccessToken);
router.post('/send-verification', authMiddleware, otpRateLimiter, sendVerificationOtp);
router.post('/verify-email', authMiddleware, verifyEmail);
router.post('/forgot-password', otpRateLimiter, forgotPassword);
router.post('/reset-password', resetPassword);


// Protected admin route example
router.get('/admin/dashboard', authMiddleware, adminOnly, (req, res) => {
    res.json({ message: 'Welcome to admin dashboard' });
});

export default router;