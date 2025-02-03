import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  description: String,
  featured: {
    type: Boolean,
    default: false
  },
  filters: [{
    name: String,
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'date']
    },
    values: [mongoose.Schema.Types.Mixed]
  }],
  icon: String,
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subcategories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Indexes
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ slug: 1, parent: 1 });

export default mongoose.model('Category', categorySchema);