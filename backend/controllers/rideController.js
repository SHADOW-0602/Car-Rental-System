const path = require('path');
const Ride = require('../models/Ride');
const { calculateDistance } = require('../utils/haversine');
const { parseLocationFile } = require('../services/locationService');

exports.requestRide = async (req, res) => {
    try {
        const { pickup_location, drop_location } = req.body;
        const drivers = await parseLocationFile(path.join(__dirname, '..', 'location-data', 'gps.txt'));
        const nearbyDrivers = drivers.filter(d =>
            calculateDistance(pickup_location.latitude, pickup_location.longitude, d.latitude, d.longitude) <= 5
        );

        if (nearbyDrivers.length === 0) return res.status(404).json({ error: 'No drivers available nearby' });

        const ride = await Ride.create({
            user_id: req.user.id,
            driver_id: null,
            pickup_location,
            drop_location,
            status: 'requested'
        });

        res.json({ ride, nearbyDrivers });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateRideStatus = async (req, res) => {
    try {
        const { status, driver_id } = req.body;
        const ride = await Ride.findByIdAndUpdate(req.params.id, { status, driver_id }, { new: true });
        res.json(ride);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserRides = async (req, res) => {
    try {
        const rides = await Ride.find({ user_id: req.user.id });
        res.json(rides);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDriverRides = async (req, res) => {
    try {
        const rides = await Ride.find({ driver_id: req.user.id });
        res.json(rides);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.confirmRide = async (req, res) => {
    try {
        const { rideId, driverId } = req.body;
        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        ride.driver_id = driverId;
        ride.status = 'accepted';
        await ride.save();

        res.json(ride);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};