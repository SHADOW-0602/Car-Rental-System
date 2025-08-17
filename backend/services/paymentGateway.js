const Razorpay = require('razorpay');
const stripe = require('stripe');
const crypto = require('crypto');

class PaymentGateway {
    constructor() {
        // Initialize Razorpay
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Initialize Stripe
        this.stripe = stripe(process.env.STRIPE_SECRET_KEY);
    }

    // Razorpay Integration
    async createRazorpayOrder(amount, currency = 'INR', receipt) {
        try {
            const options = {
                amount: amount * 100, // Convert to paise
                currency,
                receipt,
                payment_capture: 1
            };

            const order = await this.razorpay.orders.create(options);
            return {
                success: true,
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: process.env.RAZORPAY_KEY_ID
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async verifyRazorpayPayment(paymentId, orderId, signature) {
        try {
            const body = orderId + '|' + paymentId;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            return expectedSignature === signature;
        } catch (error) {
            return false;
        }
    }

    async getRazorpayPayment(paymentId) {
        try {
            return await this.razorpay.payments.fetch(paymentId);
        } catch (error) {
            throw new Error(`Razorpay payment fetch failed: ${error.message}`);
        }
    }

    // Stripe Integration
    async createStripePaymentIntent(amount, currency = 'inr', metadata = {}) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: amount * 100, // Convert to smallest currency unit
                currency,
                metadata,
                automatic_payment_methods: {
                    enabled: true
                }
            });

            return {
                success: true,
                client_secret: paymentIntent.client_secret,
                payment_intent_id: paymentIntent.id
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async confirmStripePayment(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return {
                success: paymentIntent.status === 'succeeded',
                status: paymentIntent.status,
                payment_method: paymentIntent.payment_method
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // PayPal Integration (Basic)
    async createPayPalOrder(amount, currency = 'USD') {
        try {
            // This would integrate with PayPal SDK
            // For demo purposes, returning mock response
            const orderId = `PAYPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            return {
                success: true,
                order_id: orderId,
                approval_url: `https://sandbox.paypal.com/checkoutnow?token=${orderId}`,
                amount,
                currency
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async verifyPayPalPayment(orderId, payerId) {
        try {
            // Mock verification for demo
            return {
                success: true,
                status: 'COMPLETED',
                payer_id: payerId
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Refund Methods
    async processRefund(paymentMethod, paymentId, amount, reason = 'Customer request') {
        try {
            switch (paymentMethod) {
                case 'razorpay':
                    return await this.razorpayRefund(paymentId, amount, reason);
                case 'stripe':
                    return await this.stripeRefund(paymentId, amount, reason);
                case 'paypal':
                    return await this.paypalRefund(paymentId, amount, reason);
                default:
                    throw new Error('Unsupported payment method for refund');
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async razorpayRefund(paymentId, amount, reason) {
        try {
            const refund = await this.razorpay.payments.refund(paymentId, {
                amount: amount * 100,
                notes: { reason }
            });

            return {
                success: true,
                refund_id: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async stripeRefund(paymentIntentId, amount, reason) {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount * 100,
                reason: 'requested_by_customer',
                metadata: { reason }
            });

            return {
                success: true,
                refund_id: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async paypalRefund(orderId, amount, reason) {
        // Mock PayPal refund for demo
        return {
            success: true,
            refund_id: `REFUND_${Date.now()}`,
            amount,
            status: 'completed'
        };
    }
}

module.exports = PaymentGateway;