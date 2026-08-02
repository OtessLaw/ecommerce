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

    const invoiceNum = generateInvoiceNumber();

    if (Order.db && Order.db.readyState === 1) {
      const order = new Order({
        user: req.user ? req.user._id : undefined,
        guestEmail: guestEmail || (req.user ? req.user.email : 'guest@example.com'),
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        vatAmount,
        shippingPrice,
        discountAmount,
        totalPrice,
        invoiceNumber: invoiceNum,
        isPaid: paymentMethod === 'CashOnDelivery' ? false : false,
      });

      const createdOrder = await order.save();

      // Send SMS alert
      const phone = shippingAddress.phone || req.user?.phone;
      if (phone) {
        fasreachService.sendSMS({
          recipient: phone,
          message: `Dear ${shippingAddress.fullName}, your J&J Vintage order #${invoiceNum} (₦${totalPrice.toLocaleString()}) has been received!`,
        });
      }

      return res.status(201).json(createdOrder);
    }

    // In-memory fallback
    const mockOrder = {
      _id: `ord_${Date.now()}`,
      user: req.user ? req.user._id : 'guest_user',
      guestEmail: guestEmail || (req.user ? req.user.email : 'guest@example.com'),
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      vatAmount,
      shippingPrice,
      discountAmount,
      totalPrice,
      invoiceNumber: invoiceNum,
      isPaid: false,
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
    };
    memoryOrders.unshift(mockOrder);

    // Send SMS
    if (shippingAddress?.phone) {
      fasreachService.sendSMS({
        recipient: shippingAddress.phone,
        message: `Dear ${shippingAddress.fullName}, your J&J Vintage order #${invoiceNum} (₦${totalPrice.toLocaleString()}) has been placed successfully!`,
      });
    }

    res.status(201).json(mockOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public / Private
const getOrderById = async (req, res) => {
  try {
    if (Order.db && Order.db.readyState === 1) {
      const order = await Order.findById(req.params.id).populate('user', 'name email');
      if (order) return res.json(order);
    }

    const found = memoryOrders.find((o) => o._id === req.params.id || o.invoiceNumber === req.params.id);
    if (found) return res.json(found);

    res.status(404).json({ message: 'Order not found' });
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
        fasreachService.sendSMS({
          recipient: order.shippingAddress.phone,
          message: `J&J Vintage Order #${order.invoiceNumber} status updated to '${status}'. Tracking: ${trackingNumber || 'N/A'}. Thank you for shopping with J&J Vintage!`,
        });
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
