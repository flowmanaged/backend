const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Wszystkie endpointy wymagają autoryzacji i roli admin
router.use(protect, adminOnly);

// Dashboard
router.get('/stats', adminController.getStats);

// Users management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/toggle-premium', adminController.toggleUserPremium);

// Payments
router.get('/payments', adminController.getPayments);

module.exports = router;
