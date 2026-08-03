const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, updateUserRole, validateCoupon, getSettings, updateSettings } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('admin', 'staff'), getDashboardStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.route('/settings').get(getSettings).put(updateSettings);
router.post('/coupons/validate', validateCoupon);

module.exports = router;
