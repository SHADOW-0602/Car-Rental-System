const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Fare estimation
router.post('/estimate-fare', auth, role(['user']), invoiceController.estimateFare);

// Apply discount/promo code
router.post('/apply-discount', auth, role(['user']), invoiceController.applyDiscount);

// Generate invoice for completed ride
router.post('/generate/:rideId', auth, role(['driver', 'admin']), invoiceController.generateInvoice);

// Get invoice details
router.get('/:invoiceId', auth, role(['user', 'driver', 'admin']), invoiceController.getInvoice);

// Get trip summary
router.get('/trip-summary/:rideId', auth, role(['user', 'driver']), invoiceController.getTripSummary);

// Submit feedback
router.post('/:invoiceId/feedback', auth, role(['user']), invoiceController.submitFeedback);

// Get user's invoices
router.get('/user/history', auth, role(['user']), invoiceController.getUserInvoices);

module.exports = router;