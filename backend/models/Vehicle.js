const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    license_plate: { type: String, unique: true, required: true },
    location: {
        latitude: Number,
        longitude: Number
    },
    availability: { type: Boolean, default: true },
    driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fare_per_km: { type: Number, required: true },
    vehicle_type: { type: String, enum: ['economy', 'standard', 'premium'], default: 'economy' }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);