import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Category from '../models/category.model.js';

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    ...req.body,
    slug: req.body.name.toLowerCase().replace(/ /g, '-')
  });

  return res.status(201).json(
    new ApiResponse(201, category, 'Category created')
  );
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ parent: null })
    .populate('children')
    .lean();

  res.json(new ApiResponse(200, categories));
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate('children')
    .lean();

  if (!category) throw new ApiError(404, 'Category not found');

  res.json(new ApiResponse(200, category));
});

export { createCategory, getCategories, getCategoryBySlug };