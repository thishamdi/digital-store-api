import express from 'express';
import {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getProductFilters
} from '../controllers/product.controller.js';
import { adminOnly, authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin routes
router.post('/', authMiddleware, adminOnly, createProduct);
router.patch('/:id', authMiddleware, adminOnly, updateProduct);
router.delete('/:id', authMiddleware, adminOnly, deleteProduct);

// Public routes
router.get('/', getProducts);
router.get('/filters', getProductFilters);
router.get('/:slug', getProductBySlug);

export default router;