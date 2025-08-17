const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vehicle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    pickup_location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    drop_location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    fare: Number,
    distance: Number,
    status: { 
        type: String, 
        enum: ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'], 
        default: 'requested' 
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    tracking: {
        isActive: { type: Boolean, default: false },
        currentLocation: {
            latitude: Number,
            longitude: Number
        },
        eta: Number, // minutes
        lastUpdate: Date
    },
    payment_details: {
        payment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
        gateway_used: String,
        transaction_id: String
    },
    timestamps: {
        createdAt: { type: Date, default: Date.now },
        started_at: Date,
        completed_at: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);