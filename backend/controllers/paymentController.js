const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const Invoice = require('../models/Invoice');
const PaymentGateway = require('../services/paymentGateway');
const { requirePermission } = require('../middleware/rbac');

const paymentGateway = new PaymentGateway();

// Initiate payment for a ride
exports.initiatePayment = async (req, res) => {
    try {
        const { rideId, paymentMethod, amount } = req.body;

        // Verify ride exists and belongs to user
        const ride = await Ride.findById(rideId);
        if (!ride || ride.user_id.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                error: 'Ride not found or unauthorized'
            });
        }

        if (ride.status !== 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Payment can only be made for completed rides'
            });
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({ 
            ride_id: rideId, 
            status: { $in: ['completed', 'processing'] }
        });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                error: 'Payment already processed for this ride'
            });
        }

        let gatewayResponse;
        const receipt = `ride_${rideId}_${Date.now()}`;

        // Create payment order based on method
        switch (paymentMethod) {
            case 'razorpay':
                gatewayResponse = await paymentGateway.createRazorpayOrder(amount, 'INR', receipt);
                break;
            case 'stripe':
                gatewayResponse = await paymentGateway.createStripePaymentIntent(amount, 'inr', {
                    ride_id: rideId,
                    user_id: req.user.id
                });
                break;
            case 'paypal':
                gatewayResponse = await paymentGateway.createPayPalOrder(amount, 'USD');
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Unsupported payment method'
                });
        }

        if (!gatewayResponse.success) {
            return res.status(400).json({
                success: false,
                error: gatewayResponse.error
            });
        }

        // Create payment record
        const payment = new Payment({
            ride_id: rideId,
            user_id: req.user.id,
            amount,
            payment_method: paymentMethod,
            gateway_details: {
                order_id: gatewayResponse.order_id || gatewayResponse.payment_intent_id,
                gateway_response: gatewayResponse
            },
            status: 'processing',
            metadata: {
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            }
        });

        await payment.save();

        res.json({
            success: true,
            payment_id: payment._id,
            gateway_response: gatewayResponse
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Verify and complete payment
exports.verifyPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { gateway_payment_id, signature, payer_id } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment || payment.user_id.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found or unauthorized'
            });
        }

        let verificationResult;

        // Verify payment based on method
        switch (payment.payment_method) {
            case 'razorpay':
                const isValid = await paymentGateway.verifyRazorpayPayment(
                    gateway_payment_id,
                    payment.gateway_details.order_id,
                    signature
                );
                verificationResult = { success: isValid };
                if (isValid) {
                    payment.gateway_details.payment_id = gateway_payment_id;
                    payment.gateway_details.signature = signature;
                }
                break;

            case 'stripe':
                verificationResult = await paymentGateway.confirmStripePayment(
                    payment.gateway_details.order_id
                );
                break;

            case 'paypal':
                verificationResult = await paymentGateway.verifyPayPalPayment(
                    payment.gateway_details.order_id,
                    payer_id
                );
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Unsupported payment method'
                });
        }

        if (verificationResult.success) {
            payment.status = 'completed';
            payment.transaction_details.completed_at = new Date();
            
            // Update ride payment status
            await Ride.findByIdAndUpdate(payment.ride_id, {
                payment_status: 'paid'
            });
        } else {
            payment.status = 'failed';
            payment.transaction_details.failed_at = new Date();
            payment.transaction_details.failure_reason = verificationResult.error || 'Payment verification failed';
        }

        await payment.save();

        res.json({
            success: verificationResult.success,
            payment_status: payment.status,
            message: verificationResult.success ? 'Payment completed successfully' : 'Payment verification failed'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get payment details
exports.getPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId)
            .populate('ride_id', 'pickup_location drop_location distance fare')
            .populate('user_id', 'name email');

        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }

        // Check authorization
        if (req.user.role !== 'admin' && payment.user_id._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized access'
            });
        }

        res.json({
            success: true,
            payment
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get user's payment history
exports.getPaymentHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const payments = await Payment.find({ user_id: req.user.id })
            .populate('ride_id', 'pickup_location drop_location createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments({ user_id: req.user.id });

        res.json({
            success: true,
            payments,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_payments: total
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Process refund (admin only)
exports.processRefund = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { refund_amount, reason } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Can only refund completed payments'
            });
        }

        const refundResult = await paymentGateway.processRefund(
            payment.payment_method,
            payment.gateway_details.payment_id || payment.gateway_details.order_id,
            refund_amount,
            reason
        );

        if (refundResult.success) {
            payment.status = 'refunded';
            payment.transaction_details.refund_amount = refund_amount;
            payment.transaction_details.refund_reason = reason;
            payment.transaction_details.refunded_at = new Date();
            
            await payment.save();

            res.json({
                success: true,
                message: 'Refund processed successfully',
                refund_details: refundResult
            });
        } else {
            res.status(400).json({
                success: false,
                error: refundResult.error
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get payment analytics (admin only)
exports.getPaymentAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const matchCondition = {};
        if (startDate && endDate) {
            matchCondition.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const analytics = await Payment.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: null,
                    total_payments: { $sum: 1 },
                    total_amount: { $sum: '$amount' },
                    completed_payments: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    failed_payments: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    },
                    refunded_payments: {
                        $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
                    }
                }
            }
        ]);

        const methodBreakdown = await Payment.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$payment_method',
                    count: { $sum: 1 },
                    total_amount: { $sum: '$amount' }
                }
            }
        ]);

        res.json({
            success: true,
            analytics: analytics[0] || {},
            method_breakdown: methodBreakdown
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};