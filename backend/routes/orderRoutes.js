const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').post(createOrder).get(protect, authorize('admin', 'staff'), getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(getOrderById);
router.route('/:id/status').put(protect, authorize('admin', 'staff'), updateOrderStatus);

module.exports = router;
