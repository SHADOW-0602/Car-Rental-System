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
    timestamps: {
        createdAt: { type: Date, default: Date.now },
        completed_at: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);