const express = require('express');
const paymentController = require('../controllers/paymentController');
const webhookController = require('../controllers/webhookController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { paymentLimiter, validatePaymentAmount, pciHeaders, verifyRazorpayWebhook, verifyStripeWebhook } = require('../middleware/paymentSecurity');

const router = express.Router();

// Webhook endpoints (no auth required)
router.post('/webhook/razorpay', express.raw({ type: 'application/json' }), verifyRazorpayWebhook, webhookController.handleRazorpayWebhook);
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), verifyStripeWebhook, webhookController.handleStripeWebhook);

// Apply payment security middleware
router.use(pciHeaders);
router.use(paymentLimiter);

// Initiate payment for completed ride
router.post('/initiate', auth, role(['user']), validatePaymentAmount, paymentController.initiatePayment);

// Verify and complete payment
router.post('/:paymentId/verify', auth, role(['user']), paymentController.verifyPayment);

// Get payment details
router.get('/:paymentId', auth, role(['user', 'admin']), paymentController.getPayment);

// Get user's payment history
router.get('/user/history', auth, role(['user']), paymentController.getPaymentHistory);

// Process refund (admin only)
router.post('/:paymentId/refund', auth, role(['admin']), role.auditLog('payment_refund', 'payment'), paymentController.processRefund);

// Get payment analytics (admin only)
router.get('/admin/analytics', auth, role(['admin']), paymentController.getPaymentAnalytics);

module.exports = router;