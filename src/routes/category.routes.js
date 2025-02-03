import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryBySlug
} from '../controllers/category.controller.js';
import { adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin routes
router.post('/', adminOnly, createCategory);

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

export default router;