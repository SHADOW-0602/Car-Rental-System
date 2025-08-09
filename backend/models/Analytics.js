const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    total_rides: { type: Number, default: 0 },
    total_earnings: { type: Number, default: 0 },
    active_drivers: { type: Number, default: 0 },
    active_users: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);