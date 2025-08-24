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
    originalUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
    earnings: {
        total: { type: Number, default: 0 },
        thisMonth: { type: Number, default: 0 }
    },
    completedRides: { type: Number, default: 0 },
    driverInfo: {
        licenseNumber: { type: String, required: true },
        licenseExpiry: { type: Date },
        vehicleType: { type: String, required: true },
        vehicleMake: { type: String },
        vehicleModel: { type: String },
        vehicleYear: { type: Number },
        vehicleColor: { type: String },
        registrationNumber: { type: String },
        drivingExperience: { type: String },
        isVerified: { type: Boolean, default: true },
        documents: {
            licensePhoto: { type: String },
            vehicleRC: { type: String },
            insurance: { type: String },
            profilePhoto: { type: String }
        }
    },
    settings: {
        shareLocation: { type: Boolean, default: true },
        marketingEmails: { type: Boolean, default: false },
        showProfile: { type: Boolean, default: true },
        rideUpdates: { type: Boolean, default: true },
        promotionalOffers: { type: Boolean, default: false },
        emailNotifications: { type: Boolean, default: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);