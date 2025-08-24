const path = require('path');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const { calculateDistance } = require('../utils/haversine');
const { parseLocationFile, findNearbyDrivers, findDriversInZone, getDistanceMatrix } = require('../services/locationService');
const InvoiceService = require('../services/invoiceService');
const RatingService = require('../services/ratingService');

const invoiceService = new InvoiceService();
const ratingService = new RatingService();

exports.requestRide = async (req, res) => {
    try {
        const { pickup_location, drop_location, vehicle_type } = req.body;
        
        // Calculate distance and fare
        const distance = calculateDistance(
            pickup_location.latitude, pickup_location.longitude,
            drop_location.latitude, drop_location.longitude
        );
        const fare = Math.round(distance * 15); // ₹15 per km
        
        // Find nearby available drivers
        const nearbyDrivers = await findNearbyDrivers(pickup_location, vehicle_type);
        
        if (nearbyDrivers.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No drivers available nearby',
                availableDrivers: 0
            });
        }

        // Create ride request
        const ride = await Ride.create({
            user_id: req.user.id,
            pickup_location,
            drop_location,
            distance,
            fare,
            status: 'requested'
        });

        res.json({ 
            success: true,
            ride,
            nearbyDrivers: nearbyDrivers.slice(0, 5), // Return top 5 nearest
            estimatedFare: fare,
            estimatedDistance: distance
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.findNearbyDrivers = async (req, res) => {
    try {
        const { latitude, longitude, vehicle_type, radius = 5 } = req.query;
        const pickup_location = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
        
        const nearbyDrivers = await findNearbyDrivers(pickup_location, vehicle_type, radius);
        
        res.json({
            success: true,
            drivers: nearbyDrivers,
            count: nearbyDrivers.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateRideStatus = async (req, res) => {
    try {
        const { status, location } = req.body;
        const updateData = { status };
        
        if (status === 'completed') {
            updateData.completed_at = new Date();
        }
        
        if (status === 'in_progress' && !updateData.started_at) {
            updateData.started_at = new Date();
        }
        
        const ride = await Ride.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate('user_id', 'name phone')
            .populate('driver_id', 'name phone rating');
        
        // Auto-generate invoice when ride is completed
        if (status === 'completed') {
            try {
                await invoiceService.generateInvoice(req.params.id);
            } catch (invoiceError) {
                console.error('Invoice generation failed:', invoiceError.message);
            }
        }
            
        res.json({ success: true, ride });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getUserRides = async (req, res) => {
    try {
        const rides = await Ride.find({ user_id: req.user.id })
            .populate('driver_id', 'name phone rating')
            .sort({ createdAt: -1 });
        res.json({ success: true, rides });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getDriverRides = async (req, res) => {
    try {
        const rides = await Ride.find({ driver_id: req.user.id })
            .populate('user_id', 'name phone')
            .sort({ createdAt: -1 });
        res.json({ success: true, rides });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.confirmRide = async (req, res) => {
    try {
        const { rideId, driverId } = req.body;
        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }

        if (ride.status !== 'requested') {
            return res.status(400).json({ success: false, error: 'Ride already confirmed or cancelled' });
        }

        ride.driver_id = driverId;
        ride.status = 'accepted';
        await ride.save();

        const populatedRide = await Ride.findById(rideId)
            .populate('user_id', 'name phone')
            .populate('driver_id', 'name phone rating');

        res.json({ success: true, ride: populatedRide });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.cancelRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        
        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }
        
        if (ride.status === 'completed') {
            return res.status(400).json({ success: false, error: 'Cannot cancel completed ride' });
        }
        
        ride.status = 'cancelled';
        await ride.save();
        
        res.json({ success: true, message: 'Ride cancelled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.findDriversInZone = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        const pickup_location = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
        
        const zoneData = await findDriversInZone(pickup_location);
        
        res.json({
            success: true,
            zone: zoneData.zone,
            drivers: zoneData.drivers,
            count: zoneData.count
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getDistanceMatrix = async (req, res) => {
    try {
        const { origins, destinations } = req.body;
        
        const matrix = await getDistanceMatrix(origins, destinations);
        
        res.json({
            success: true,
            matrix,
            origins_count: origins.length,
            destinations_count: destinations.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.calculateFare = async (req, res) => {
    try {
        const { pickup_location, drop_location, vehicle_type } = req.body;
        
        const distance = calculateDistance(
            pickup_location.latitude, pickup_location.longitude,
            drop_location.latitude, drop_location.longitude
        );
        
        // Base fare calculation
        const baseFare = 50; // ₹50 base fare
        const perKmRate = vehicle_type === 'suv' ? 20 : vehicle_type === 'sedan' ? 15 : 12;
        const fare = baseFare + (distance * perKmRate);
        
        res.json({
            success: true,
            distance: Math.round(distance * 100) / 100,
            estimatedFare: Math.round(fare),
            baseFare,
            perKmRate,
            estimatedTime: Math.ceil(distance * 3) // 3 minutes per km
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.startTrip = async (req, res) => {
    try {
        const { rideId } = req.params;
        const { driverLocation } = req.body;
        
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }
        
        if (ride.status !== 'accepted') {
            return res.status(400).json({ success: false, error: 'Ride must be accepted to start trip' });
        }
        
        // Update ride status
        ride.status = 'in_progress';
        await ride.save();
        
        res.json({
            success: true,
            message: 'Trip started successfully',
            ride,
            trackingEnabled: true
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getTripStatus = async (req, res) => {
    try {
        const { rideId } = req.params;
        
        const ride = await Ride.findById(rideId)
            .populate('user_id', 'name phone')
            .populate('driver_id', 'name phone rating');
            
        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }
        
        // Calculate remaining distance if trip is in progress
        let remainingDistance = null;
        let eta = null;
        
        if (ride.status === 'in_progress' && ride.pickup_location && ride.drop_location) {
            remainingDistance = calculateDistance(
                ride.pickup_location.latitude, ride.pickup_location.longitude,
                ride.drop_location.latitude, ride.drop_location.longitude
            );
            eta = Math.ceil(remainingDistance / 40 * 60); // 40 km/h average speed
        }
        
        // Check rating status if ride is completed
        let ratingStatus = null;
        if (ride.status === 'completed') {
            const canRate = await ratingService.canRate(rideId, req.user.id);
            ratingStatus = {
                canRate: canRate.canRate,
                reason: canRate.reason || null
            };
        }
        
        res.json({
            success: true,
            ride,
            remainingDistance,
            eta,
            isTracking: ride.status === 'in_progress',
            ratingStatus
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getRideRequests = async (req, res) => {
    try {
        const requests = await Ride.find({ 
            status: 'requested',
            driver_id: { $exists: false }
        })
        .populate('user_id', 'name phone rating')
        .sort({ createdAt: -1 })
        .limit(20);
        
        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};