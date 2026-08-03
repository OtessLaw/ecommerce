const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const fasreachService = require('../services/fasreachService');
const { generateInvoiceNumber } = require('../utils/skuGenerator');
const { initialProducts } = require('../utils/seedData');

const memoryOrders = [];

// @desc    Create new order
// @route   POST /api/orders
// @access  Public / Private
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod = 'Paystack',
      itemsPrice,
      vatAmount,
      shippingPrice,
      discountAmount = 0,
      totalPrice,
      guestEmail,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    // Normalize order items to ensure title, price, quantity, and image are always defined
    const normalizedItems = orderItems.map((item) => ({
      product: item.product || item._id || 'prod_1',
      title: item.title || item.name || 'J&J Vintage Item',
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      selectedColor: item.selectedColor || 'Standard',
      selectedSize: item.selectedSize || 'M',
      image: item.image || (Array.isArray(item.images) ? item.images[0] : item.images) || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    }));

    const invoiceNum = generateInvoiceNumber();

    if (Order.db && Order.db.readyState === 1) {
      const order = new Order({
        user: req.user ? req.user._id : undefined,
        guestEmail: guestEmail || (req.user ? req.user.email : 'guest@example.com'),
        orderItems: normalizedItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        vatAmount,
        shippingPrice,
        discountAmount,
        totalPrice,
        orderNumber: invoiceNum,
        invoiceNumber: invoiceNum,
        isPaid: paymentMethod === 'CashOnDelivery' ? false : false,
      });

      const createdOrder = await order.save();

      // Send SMS alert with exact JNJ Vintage templates
      const phone = shippingAddress.phone || req.user?.phone;
      const customerName = shippingAddress.fullName || req.user?.name || 'Valued Customer';
      if (phone) {
        fasreachService.sendOrderConfirmation(phone, invoiceNum, totalPrice, customerName, paymentMethod);
      }

      return res.status(201).json(createdOrder);
    }

    // In-memory fallback
    const mockOrder = {
      _id: `ord_${Date.now()}`,
      user: req.user ? req.user._id : 'guest_user',
      guestEmail: guestEmail || (req.user ? req.user.email : 'guest@example.com'),
      orderItems: normalizedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      vatAmount,
      shippingPrice,
      discountAmount,
      totalPrice,
      orderNumber: invoiceNum,
      invoiceNumber: invoiceNum,
      isPaid: false,
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
    };
    memoryOrders.unshift(mockOrder);

    // Send SMS
    if (shippingAddress?.phone) {
      const customerName = shippingAddress.fullName || req.user?.name || 'Valued Customer';
      fasreachService.sendOrderConfirmation(shippingAddress.phone, invoiceNum, totalPrice, customerName, paymentMethod);
    }

    res.status(201).json(mockOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order by ID, Invoice Number, or Phone
// @route   GET /api/orders/:id
// @access  Public / Private
const getOrderById = async (req, res) => {
  try {
    const rawQuery = (req.params.id || '').trim();
    if (!rawQuery) {
      return res.status(400).json({ message: 'Order query parameter required' });
    }

    if (Order.db && Order.db.readyState === 1) {
      let order = null;

      // 1. Search by Invoice Number or Order Number
      order = await Order.findOne({
        $or: [
          { invoiceNumber: { $regex: '^' + rawQuery + '$', $options: 'i' } },
          { orderNumber: { $regex: '^' + rawQuery + '$', $options: 'i' } },
        ],
      });

      // 2. Search by Phone Number if digits entered
      const cleanDigits = rawQuery.replace(/[^0-9]/g, '');
      if (!order && cleanDigits.length >= 7) {
        order = await Order.findOne({
          'shippingAddress.phone': { $regex: cleanDigits },
        }).sort({ createdAt: -1 });
      }

      // 3. Fallback to ObjectId lookup if 24-char hex string
      if (!order && mongoose.Types.ObjectId.isValid(rawQuery)) {
        order = await Order.findById(rawQuery);
      }

      if (order) return res.json(order);
    }

    // In-memory fallback lookup
    const found = memoryOrders.find(
      (o) =>
        o._id === rawQuery ||
        o.invoiceNumber?.toLowerCase() === rawQuery.toLowerCase() ||
        o.orderNumber?.toLowerCase() === rawQuery.toLowerCase() ||
        (rawQuery.replace(/[^0-9]/g, '').length >= 7 && o.shippingAddress?.phone?.replace(/[^0-9]/g, '').includes(rawQuery.replace(/[^0-9]/g, '')))
    );

    if (found) return res.json(found);

    res.status(404).json({ message: 'No order found matching this Invoice Number or Phone' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    if (Order.db && Order.db.readyState === 1) {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json(orders);
    }

    const userOrders = memoryOrders.filter((o) => String(o.user) === String(req.user._id));
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin / Staff)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    if (Order.db && Order.db.readyState === 1) {
      const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
      return res.json(orders);
    }

    res.json(memoryOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin / Staff)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    if (Order.db && Order.db.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      order.orderStatus = status;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (status === 'Delivered') order.deliveredAt = Date.now();

      const updated = await order.save();

      if (order.shippingAddress?.phone) {
        fasreachService.sendOrderStatusUpdate(order.shippingAddress.phone, order.invoiceNumber, status);
      }

      return res.json(updated);
    }

    const index = memoryOrders.findIndex((o) => o._id === req.params.id);
    if (index !== -1) {
      memoryOrders[index].orderStatus = status;
      if (trackingNumber) memoryOrders[index].trackingNumber = trackingNumber;
      return res.json(memoryOrders[index]);
    }

    res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  memoryOrders,
};
