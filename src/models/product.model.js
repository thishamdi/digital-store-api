import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    digitalContent: {
        type: {
            type: String,
            enum: ['account', 'subscription', 'gift-card', 'serial-key', 'software']
        },
        platform: String,
        credentials: {
            email: String,
            password: String
        },
        serialKey: String,
        activationDate: Date,
        expirationDate: Date,
        additionalData: mongoose.Schema.Types.Mixed
    },
    pricing: {
        basePrice: {
            type: Number,
            required: true,
            min: 0.01
        },
        salePrice: Number,
        currency: {
            type: String,
            default: 'USD',
            enum: ['USD', 'EUR', 'GBP']
        },
        discountPercentage: Number
    },
    media: [{
        url: String,
        type: {
            type: String,
            enum: ['image', 'video']
        }
    }],
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    tags: [String],
    status: {
        type: String,
        enum: ['draft', 'active', 'archived'],
        default: 'draft'
    },
    specifications: mongoose.Schema.Types.Mixed,
    salesCount: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    variants: [{
        duration: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        originalPrice: Number,
        discountPercentage: Number
    }],
    requiredCustomerData: [{
        fieldName: String,
        fieldType: {
            type: String,
            enum: ['email', 'text', 'dropdown']
        },
        options: [String]
    }],
    content: {
        shortDescription: [String],
        fullDescription: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', productSchema);
