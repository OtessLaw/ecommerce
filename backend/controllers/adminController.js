const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const Ticket = require('../models/Ticket');
const { initialProducts } = require('../utils/seedData');
const { memoryOrders } = require('./orderController');

let storeSettings = {
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_mock_paystack_public_key',
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_paystack_secret_key',
  paystackMode: 'test',
  fasreachApiKey: process.env.FASREACH_API_KEY || 'mock_fasreach_key',
  fasreachSenderId: process.env.FASREACH_SENDER_ID || 'JJVINTAGE',
  storeCurrency: 'NGN',
  currencySymbol: '₦',
  supportEmail: 'support@jjvintage.com',
  supportPhone: '+2348012345678',
};

// @desc    Get Admin Dashboard Stats & Analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    let totalRevenue = 14850000;
    let totalOrders = 48;
    let pendingOrders = 6;
    let totalProducts = initialProducts.length;
    let lowStockCount = 2;
    let totalUsers = 124;

    if (Order.db && Order.db.readyState === 1) {
      const orders = await Order.find({});
      totalOrders = orders.length;
      totalRevenue = orders.reduce((acc, o) => (o.isPaid ? acc + o.totalPrice : acc), 0);
      pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
      totalProducts = await Product.countDocuments({});
      lowStockCount = await Product.countDocuments({ stock: { $lte: 5 } });
      totalUsers = await User.countDocuments({});
    }

    const salesChart = [
      { month: 'Jan', revenue: 1800000, orders: 12 },
      { month: 'Feb', revenue: 2400000, orders: 16 },
      { month: 'Mar', revenue: 3100000, orders: 22 },
      { month: 'Apr', revenue: 2900000, orders: 19 },
      { month: 'May', revenue: 4200000, orders: 28 },
      { month: 'Jun', revenue: 5600000, orders: 35 },
      { month: 'Jul', revenue: 6800000, orders: 42 },
    ];

    res.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockCount,
      totalUsers,
      salesChart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Store & Gateway Settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
  try {
    res.json(storeSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Store & Gateway Settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    storeSettings = { ...storeSettings, ...req.body };
    console.log('[Admin Settings Updated]', storeSettings);
    res.json({ message: 'Gateway & Store Settings updated successfully', settings: storeSettings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    if (User.db && User.db.readyState === 1) {
      const users = await User.find({}).select('-password');
      return res.json(users);
    }

    res.json([
      { _id: 'user_1', name: 'Admin User', email: 'admin@luxury.com', role: 'admin', createdAt: new Date() },
      { _id: 'user_2', name: 'Jane Doe', email: 'customer@luxury.com', role: 'customer', createdAt: new Date() },
      { _id: 'user_3', name: 'Michael Smith', email: 'staff@luxury.com', role: 'staff', createdAt: new Date() },
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate Coupon
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code required' });

    const validCoupons = {
      LUXURY15: { discountPercentage: 15, code: 'LUXURY15' },
      GOLD20: { discountPercentage: 20, code: 'GOLD20' },
      WELCOME10: { discountPercentage: 10, code: 'WELCOME10' },
    };

    const upperCode = code.toUpperCase();
    if (validCoupons[upperCode]) {
      return res.json(validCoupons[upperCode]);
    }

    res.status(404).json({ message: 'Invalid or expired coupon code' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  validateCoupon,
  getSettings,
  updateSettings,
};
