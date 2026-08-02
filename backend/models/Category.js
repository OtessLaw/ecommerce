const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    parentCategory: { type: String, enum: ['Men', 'Women', 'Kids', 'Shoes', 'Bags', 'Accessories', 'Jewelry', 'Beauty', 'New Arrivals', 'Luxury', 'Sale'], default: 'Men' },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
