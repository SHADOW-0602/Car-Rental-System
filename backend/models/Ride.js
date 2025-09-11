const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    preferred_driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

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
    vehicle_type: {
        type: String,
        enum: ['economy', 'sedan', 'suv'],
        default: 'economy'
    },
    payment_method: {
        type: String,
        enum: ['cash', 'razorpay', 'stripe', 'paypal'],
        default: 'cash'
    },
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
        accepted_at: Date,
        started_at: Date,
        completed_at: Date,
        cancelled_at: Date
    }
}, { timestamps: true });

// Add index for efficient queries
rideSchema.index({ status: 1, createdAt: -1 });
rideSchema.index({ driver_id: 1, status: 1 });
rideSchema.index({ preferred_driver_id: 1, status: 1 });
rideSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('Ride', rideSchema);