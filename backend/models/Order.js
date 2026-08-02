const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.Mixed, required: true },
  title: { type: String, required: true, default: 'J&J Vintage Item' },
  price: { type: Number, required: true, default: 0 },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  selectedColor: { type: String, default: 'Standard' },
  selectedSize: { type: String, default: 'M' },
  image: { type: String, required: true, default: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.Mixed },
    guestEmail: { type: String },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: 'Ghana' },
    },
    paymentMethod: { type: String, enum: ['Paystack', 'CashOnDelivery'], default: 'Paystack' },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      reference: { type: String },
      paidAt: { type: String },
      channel: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    vatAmount: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    discountAmount: { type: Number, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    trackingNumber: { type: String },
    invoiceNumber: { type: String, required: true, unique: true },
    deliveredAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
