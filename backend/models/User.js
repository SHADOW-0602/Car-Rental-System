const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    profile_image: { type: String },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    rating: { type: Number, default: 0 },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    twoFactorBackupCodes: [{ type: String }],
    settings: {
        shareLocation: { type: Boolean, default: true },
        marketingEmails: { type: Boolean, default: false },
        showProfile: { type: Boolean, default: true },
        rideUpdates: { type: Boolean, default: true },
        promotionalOffers: { type: Boolean, default: false },
        emailNotifications: { type: Boolean, default: true }
    },
    driverApplication: {
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        appliedAt: { type: Date },
        reviewedAt: { type: Date },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        rejectionReason: { type: String },
        
        // Personal Information
        fullName: { type: String },
        phone: { type: String },
        email: { type: String },
        dateOfBirth: { type: Date },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        
        // License Information
        licenseNumber: { type: String },
        licenseExpiry: { type: Date },
        licenseState: { type: String },
        drivingExperience: { type: String },
        previousExperience: { type: Boolean },
        
        // Vehicle Information
        vehicleType: { type: String },
        vehicleMake: { type: String },
        vehicleModel: { type: String },
        vehicleYear: { type: Number },
        vehicleColor: { type: String },
        registrationNumber: { type: String },
        
        // Documents
        documents: {
            licensePhoto: { type: String },
            vehicleRC: { type: String },
            insurance: { type: String },
            profilePhoto: { type: String }
        },
        
        // Verification
        backgroundCheck: { type: Boolean },
        termsAccepted: { type: Boolean }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);