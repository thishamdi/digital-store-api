import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    slug: req.body.title.toLowerCase().replace(/ /g, '-')
  });

  return res.status(201).json(
    new ApiResponse(201, product, 'Product created successfully')
  );
});

const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    status,
    category,
    minPrice,
    maxPrice,
    platform,
    tag
  } = req.query;

  const filter = {};
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: 'category'
  };

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter['pricing.basePrice'] = {
      ...(minPrice && { $gte: minPrice }),
      ...(maxPrice && { $lte: maxPrice })
    };
  }
  if (platform) filter['digitalContent.platform'] = platform;
  if (tag) filter.tags = tag;

  const result = await Product.paginate(filter, options);

  res.json(new ApiResponse(200, {
    totalItems: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page,
    limit: result.limit,
    products: result.docs
  }));
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category')
    .lean();

  if (!product) throw new ApiError(404, 'Product not found');

  // Track view
  await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });

  return res.json(new ApiResponse(200, product));
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) throw new ApiError(404, 'Product not found');

  return res.json(new ApiResponse(200, product, 'Product updated'));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) throw new ApiError(404, 'Product not found');

  return res.json(new ApiResponse(200, null, 'Product deleted'));
});

const getProductFilters = asyncHandler(async (req, res) => {
  const filters = await Category.findById(req.query.category)
    .select('filters')
    .lean();

  const priceRange = await Product.aggregate([
    { $match: { category: new mongoose.Types.ObjectId(req.query.category) } },
    {
      $group: {
        _id: null,
        minPrice: { $min: "$pricing.basePrice" },
        maxPrice: { $max: "$pricing.basePrice" }
      }
    }
  ]);

  res.json(new ApiResponse(200, {
    categoryFilters: filters?.filters || [],
    priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
  }));
});

export {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getProductFilters
};