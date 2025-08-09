// Service to compute dashboard analytics
const Ride = require('../models/Ride');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

exports.getDailyStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalRides = await Ride.countDocuments({ createdAt: { $gte: today } });
    const totalEarnings = await Ride.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, sum: { $sum: '$fare' } } }
    ]);
    const activeDrivers = await Vehicle.countDocuments({ availability: true });
    const activeUsers = await User.countDocuments({ role: 'user' });

    return {
        date: today,
        total_rides: totalRides,
        total_earnings: totalEarnings.length ? totalEarnings[0].sum : 0,
        active_drivers: activeDrivers,
        active_users: activeUsers
    };
};