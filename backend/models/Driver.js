const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'driver' },
    profile_image: { type: String },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    rating: { type: Number, default: 0 },
    driverInfo: {
        licenseNumber: { type: String, required: true },
        vehicleType: { type: String, required: true },
        experience: { type: Number, required: true },
        isVerified: { type: Boolean, default: false },
        documents: {
            license: { type: String },
            insurance: { type: String },
            registration: { type: String }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);