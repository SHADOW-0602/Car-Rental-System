const razorpayService = require('../services/razorpayService');

exports.processPayment = async (req, res) => {
    try {
        const { amount, rideId } = req.body;
        const order = await razorpayService.createOrder(amount, `ride_${rideId}`);
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};