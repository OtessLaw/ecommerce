const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  type: { type: String, enum: ['add', 'subtract', 'adjustment', 'order'], required: true },
  note: { type: String },
  date: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Product title is required'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    barcode: { type: String, uppercase: true },
    description: { type: String, required: true },
    specifications: [{ key: String, value: String }],
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    salePrice: { type: Number, default: 0, min: 0 },
    category: { type: String, required: true },
    parentCategory: {
      type: String,
      enum: ['Men', 'Women', 'Kids', 'Shoes', 'Sneakers', 'Bags', 'Accessories', 'Jewelry', 'Beauty', 'New Arrivals', 'Luxury', 'Sale'],
      required: true,
    },
    brand: { type: String, default: 'J&J Vintage' },
    stock: { type: Number, required: true, default: 10, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    stockHistory: [stockHistorySchema],
    colors: [{ name: String, hex: String }],
    sizes: [{ type: String }],
    images: [{ type: String, required: true }],
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    discountPercentage: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
