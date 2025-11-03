const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// User endpoints
router.post('/validate', protect, couponController.validateCoupon);

// Admin endpoints
router.get('/', protect, adminOnly, couponController.getCoupons);
router.post('/', protect, adminOnly, couponController.createCoupon);
router.put('/:code', protect, adminOnly, couponController.updateCoupon);
router.delete('/:code', protect, adminOnly, couponController.deleteCoupon);
router.post('/:code/toggle', protect, adminOnly, couponController.toggleCoupon);

module.exports = router;
