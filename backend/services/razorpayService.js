// Service to interact with Razorpay API
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (amount, receipt) => {
    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt,
            payment_capture: 1
        });
        return order;
    } catch (err) {
        throw new Error('Razorpay order creation failed: ' + err.message);
    }
};