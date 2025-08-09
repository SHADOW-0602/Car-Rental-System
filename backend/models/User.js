const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'driver', 'admin'], default: 'user' },
    profile_image: { type: String },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    rating: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);