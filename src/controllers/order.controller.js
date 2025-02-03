import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';

const createOrder = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items } = req.body;
        let totalAmount = 0;

        const orderItems = await Promise.all(items.map(async item => {
            const product = await Product.findById(item.productId).session(session);

            // Validate product and stock
            if (!product || product.stock < item.quantity) {
                throw new ApiError(400, `Insufficient stock for ${product?.title || 'product'}`);
            }

            // Find selected variant
            const variant = product.variants.id(item.variantId);
            if (!variant) throw new ApiError(400, 'Invalid product variant');

            // Validate required customer data
            const customerData = {};
            product.requiredCustomerData.forEach(field => {
                if (!item.customerData[field.fieldName]) {
                    throw new ApiError(400, `${field.fieldName} is required`);
                }
                customerData[field.fieldName] = item.customerData[field.fieldName];
            });

            // Calculate item price
            const itemPrice = variant.price * item.quantity;
            totalAmount += itemPrice;

            // Update product stock
            product.stock -= item.quantity;
            await product.save({ session });

            return {
                product: product._id,
                variant: {
                    duration: variant.duration,
                    price: variant.price,
                    originalPrice: variant.originalPrice
                },
                quantity: item.quantity,
                customerData
            };
        }));

        // Create order
        const order = await Order.create([{
            items: orderItems,
            totalAmount
        }], { session });

        await session.commitTransaction();

        return res.status(201).json(
            new ApiResponse(201, {
                orderCode: order[0].orderCode,
                totalAmount: order[0].totalAmount
            }, 'Order created successfully')
        );

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

const getOrderByCode = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ orderCode: req.params.code })
        .populate('items.product', 'title pricing variants')
        .lean();

    if (!order) throw new ApiError(404, 'Order not found');

    return res.json(new ApiResponse(200, order));
});

const updateOrderByCode = asyncHandler(async (req, res) => {
    const { status, comments } = req.body;

    const order = await Order.findOneAndUpdate(
        { orderCode: req.params.code },
        {
            status,
            adminComments: comments,
            $push: { statusHistory: { status, timestamp: new Date() } }
        },
        { new: true }
    );

    if (!order) throw new ApiError(404, 'Order not found');

    return res.json(new ApiResponse(200, order, 'Order updated'));
});

export {
    createOrder,
    getOrderByCode,
    updateOrderByCode
};