import express from 'express';
import {
    createOrder,
    getOrderByCode,
    updateOrderByCode
} from '../controllers/order.controller.js';
import { adminOnly, authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/', createOrder);
router.get('/:code', getOrderByCode);

// Admin routes
router.patch('/:code', adminOnly, authMiddleware, updateOrderByCode);

export default router;