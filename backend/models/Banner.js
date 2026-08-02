const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String, default: '/shop' },
    ctaText: { type: String, default: 'DISCOVER COLLECTION' },
    position: { type: String, enum: ['hero', 'featured', 'flash_sale'], default: 'hero' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
