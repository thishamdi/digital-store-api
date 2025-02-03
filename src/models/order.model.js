import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderCode: {
        type: String,
        unique: true,
        default: () => Math.random().toString(36).substr(2, 8).toUpperCase()
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        variant: {
            duration: String,
            price: Number,
            originalPrice: Number
        },
        quantity: Number,
        customerData: mongoose.Schema.Types.Mixed
    }],
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },
    totalAmount: Number,
    adminComments: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);