const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ['prosthetics', 'orthotics', 'footwear', 'accessories'],
    },
    subcategory: {
      type: String,
      required: [true, 'Product subcategory is required'],
      enum: [
        // Prosthetics
        'upper-limb',
        'lower-limb',
        'cosmetic',
        'sports',
        // Orthotics
        'ankle-foot',
        'knee-ankle-foot',
        'spinal',
        'upper-limb-orthotics',
        // Footwear
        'diabetic',
        'orthopedic',
        'custom',
        // Accessories
        'socks',
        'liners',
        'suspension-systems',
      ],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: [
      {
        url: String,
        altText: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    features: [String],
    specifications: {
      type: Map,
      of: String,
    },
    isCustomizable: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    brand: {
      type: String,
      enum: [
        'ottobock',
        'ossur',
        'fillauer',
        'hanger',
        'other',
      ],
      default: 'other',
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ rating: -1 });

// Virtual for product URL
productSchema.virtual('url').get(function () {
  return `/products/${this.slug}`;
});

// Virtual for product reviews (to be populated)
productSchema.virtual('reviews', {
  ref: 'Review', // The model to use
  localField: '_id', // Find reviews where `localField`
  foreignField: 'product', // is equal to `foreignField`
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
