const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Stripe
router.post('/stripe/create-session', protect, paymentController.createStripeSession);
router.post('/stripe/webhook', paymentController.stripeWebhook); // Webhook nie wymaga auth

// PayPal
router.post('/paypal/create-order', protect, paymentController.createPayPalOrder);
router.post('/paypal/capture', protect, paymentController.capturePayPalPayment);

// Payment history
router.get('/history', protect, paymentController.getPaymentHistory);

// Test endpoint (tylko development)
router.post('/complete-test', protect, paymentController.completeTestPayment);

module.exports = router;
