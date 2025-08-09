const express = require('express');
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

const router = express.Router();

// Initiate payment for a ride
router.post('/process', auth, paymentController.processPayment);

module.exports = router;