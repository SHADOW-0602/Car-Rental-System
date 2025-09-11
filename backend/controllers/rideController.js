const path = require('path');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const { calculateDistance } = require('../utils/haversine');
const { parseLocationFile, findNearbyDrivers, findDriversInZone, getDistanceMatrix } = require('../services/locationService');
const InvoiceService = require('../services/invoiceService');
const RatingService = require('../services/ratingService');
const rideTrackingService = require('../services/rideTrackingService');

const invoiceService = new InvoiceService();
const ratingService = new RatingService();

exports.requestRide = async (req, res) => {
    try {
        const { pickup_location, drop_location, vehicle_type, payment_method, preferred_driver_id } = req.body;
        
        // Check for existing active ride
        const existingRide = await Ride.findOne({
            user_id: req.user.id,
            status: { $in: ['requested', 'accepted', 'in_progress'] }
        }).populate('driver_id', 'name phone rating');
        
        if (existingRide) {
            return res.json({
                success: true,
                hasActiveRide: true,
                ride: existingRide,
                message: 'You have an active ride. Complete it before booking another.'
            });
        }
        
        // Validate required fields
        if (!pickup_location || !drop_location) {
            return res.status(400).json({ 
                success: false,
                error: 'Pickup and drop locations are required'
            });
        }
        
        if (!payment_method) {
            return res.status(400).json({ 
                success: false,
                error: 'Payment method is required'
            });
        }
        
        // Calculate distance and fare
        const distance = calculateDistance(
            pickup_location.latitude, pickup_location.longitude,
            drop_location.latitude, drop_location.longitude
        );
        const baseFare = 50;
        const perKmRate = vehicle_type === 'suv' ? 20 : vehicle_type === 'sedan' ? 15 : 12;
        const fare = Math.round(baseFare + (distance * perKmRate));
        
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
        const rideData = {
            user_id: req.user.id,
            pickup_location,
            drop_location,
            distance,
            fare,
            vehicle_type: vehicle_type || 'economy',
            payment_method,
            status: 'requested'
        };
        
        // If preferred driver is specified, add to ride data
        if (preferred_driver_id) {
            rideData.preferred_driver_id = preferred_driver_id;
        }
        
        const ride = await Ride.create(rideData);

        // Send notifications to drivers
        const io = req.app.get('io');
        if (io) {
            if (preferred_driver_id) {
                // Send to specific preferred driver
                io.emit(`driver_notification_${preferred_driver_id}`, {
                    type: 'ride_request',
                    rideId: ride._id,
                    message: `New ride request from ${req.user.name}`,
                    pickup: pickup_location.address || `${pickup_location.latitude}, ${pickup_location.longitude}`,
                    destination: drop_location.address || `${drop_location.latitude}, ${drop_location.longitude}`,
                    fare: fare,
                    distance: Math.round(distance * 100) / 100,
                    vehicle_type,
                    payment_method,
                    isPreferred: true,
                    timestamp: new Date()
                });
            } else {
                // Send to all nearby drivers
                nearbyDrivers.forEach(driver => {
                    io.emit(`driver_notification_${driver._id}`, {
                        type: 'ride_request',
                        rideId: ride._id,
                        message: `New ride request from ${req.user.name}`,
                        pickup: pickup_location.address || `${pickup_location.latitude}, ${pickup_location.longitude}`,
                        destination: drop_location.address || `${drop_location.latitude}, ${drop_location.longitude}`,
                        fare: fare,
                        distance: Math.round(distance * 100) / 100,
                        vehicle_type,
                        payment_method,
                        timestamp: new Date()
                    });
                });
            }
        }

        res.json({ 
            success: true,
            hasActiveRide: false,
            ride,
            estimatedFare: fare,
            estimatedDistance: distance,
            message: 'Ride request sent to nearby drivers. Please wait for a driver to accept.',
            waitingForAccept: true
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
        
        // Add ETA and enhanced info for each driver
        const enhancedDrivers = nearbyDrivers.map(driver => ({
            ...driver.toObject(),
            eta: Math.ceil(driver.distance * 2), // 2 minutes per km
            vehicle_info: {
                type: vehicle_type,
                model: `${vehicle_type.charAt(0).toUpperCase() + vehicle_type.slice(1)} Car`
            },
            availability: 'available'
        }));
        
        res.json({
            success: true,
            drivers: enhancedDrivers,
            count: enhancedDrivers.length
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
            updateData['timestamps.completed_at'] = new Date();
            // Stop ride simulation
            rideTrackingService.stopRideSimulation(req.params.id);
        }
        
        if (status === 'in_progress' && !updateData['timestamps.started_at']) {
            updateData['timestamps.started_at'] = new Date();
        }
        
        const ride = await Ride.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate('user_id', 'name phone')
            .populate('driver_id', 'name phone rating');
        
        // Auto-generate invoice when ride is completed
        if (status === 'completed') {
            try {
                await invoiceService.generateInvoice(req.params.id);
            } catch (invoiceError) {
                console.error('Invoice generation failed for ride:', encodeURIComponent(req.params.id), 'Error:', invoiceError.message);
            }
            
            // Notify user that ride is completed and payment is required
            const io = req.app.get('io');
            if (io) {
                io.emit(`user_notification_${ride.user_id._id}`, {
                    type: 'ride_completed',
                    rideId: req.params.id,
                    message: 'Your ride has been completed. Please proceed with payment.',
                    paymentMethod: ride.payment_method,
                    fare: ride.fare,
                    timestamp: new Date()
                });
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



exports.cancelRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate('user_id', 'name phone')
            .populate('driver_id', 'name phone');
        
        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }
        
        if (ride.status === 'completed' || ride.status === 'cancelled') {
            return res.status(400).json({ success: false, error: 'Cannot cancel this ride' });
        }
        
        // Check authorization
        if (req.user.role === 'user' && ride.user_id._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        if (req.user.role === 'driver' && ride.driver_id && ride.driver_id._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        
        ride.status = 'cancelled';
        ride.timestamps.cancelled_at = new Date();
        await ride.save();
        
        // Stop ride simulation if in progress
        if (ride.status === 'in_progress') {
            rideTrackingService.stopRideSimulation(req.params.id);
        }
        
        // Clear location update interval
        if (global.locationIntervals && global.locationIntervals[req.params.id]) {
            clearInterval(global.locationIntervals[req.params.id]);
            delete global.locationIntervals[req.params.id];
        }
        
        // Send notifications
        const io = req.app.get('io');
        if (io) {
            if (req.user.role === 'user' && ride.driver_id) {
                // Notify driver that user cancelled
                io.emit(`driver_notification_${ride.driver_id._id}`, {
                    type: 'ride_cancelled',
                    rideId: req.params.id,
                    message: `Ride cancelled by ${ride.user_id.name}`,
                    timestamp: new Date()
                });
            } else if (req.user.role === 'driver' && ride.user_id) {
                // Notify user that driver cancelled
                io.emit(`user_notification_${ride.user_id._id}`, {
                    type: 'ride_cancelled',
                    rideId: req.params.id,
                    message: `Ride cancelled by driver ${ride.driver_id ? ride.driver_id.name : 'Driver'}`,
                    timestamp: new Date()
                });
            }
        }
        
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
        ride.timestamps.started_at = new Date();
        await ride.save();
        
        // Start ride simulation (only for driver tracking)
        rideTrackingService.startRideSimulation(
            rideId,
            ride.pickup_location,
            ride.drop_location,
            req.user.id
        );
        
        // Notify user that trip has started
        const io = req.app.get('io');
        if (io) {
            io.emit(`user_notification_${ride.user_id}`, {
                type: 'trip_started',
                rideId: rideId,
                message: 'Your trip has started. The driver is on the way to your destination.',
                timestamp: new Date()
            });
        }
        
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
        
        // Check authorization - user can access their own rides, driver can access assigned rides
        const isAuthorized = 
            (req.user.role === 'user' && ride.user_id._id.toString() === req.user.id) ||
            (req.user.role === 'driver' && ride.driver_id && ride.driver_id._id.toString() === req.user.id) ||
            req.user.role === 'admin';
            
        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Unauthorized access to this ride' });
        }
        
        // Provide driver location data for tracking
        let driverLocation = null;
        if (ride.status === 'in_progress' && ride.driver_id) {
            try {
                const locationData = rideTrackingService.getRideStatus(rideId);
                if (locationData && req.user.role === 'driver') {
                    trackingData = locationData;
                }
                // For users, provide basic location info without detailed tracking
                if (locationData && req.user.role === 'user') {
                    driverLocation = {
                        address: locationData.currentLocation?.address || 'En route',
                        progress: locationData.progress || 0,
                        eta: locationData.eta || 'Calculating...'
                    };
                }
            } catch (trackingError) {
                console.log('Tracking data not available:', trackingError.message);
            }
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
            tracking: trackingData,
            driverLocation,
            isTracking: ride.status === 'in_progress' && req.user.role === 'driver',
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

exports.acceptRideRequest = async (req, res) => {
    try {
        const rideId = req.params.id;
        const driverId = req.user.id;
        
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }
        
        if (ride.status !== 'requested') {
            return res.status(400).json({ success: false, error: 'Ride already accepted or cancelled' });
        }
        
        ride.driver_id = driverId;
        ride.status = 'accepted';
        ride.timestamps.accepted_at = new Date();
        await ride.save();
        
        const populatedRide = await Ride.findById(rideId)
            .populate('user_id', 'name phone')
            .populate('driver_id', 'name phone rating');
        
        // Notify user that ride was accepted
        const io = req.app.get('io');
        if (io) {
            io.emit(`user_notification_${ride.user_id}`, {
                type: 'ride_accepted',
                rideId: rideId,
                message: `Your ride has been accepted by ${req.user.name}`,
                driver: {
                    name: req.user.name,
                    phone: req.user.phone,
                    rating: req.user.rating
                },
                ride: populatedRide,
                timestamp: new Date()
            });
            
            // Start sending driver location updates to user
            const locationUpdateInterval = setInterval(async () => {
                try {
                    // Get current driver location from drivers.txt
                    const driversData = parseLocationFile();
                    const driverLocation = driversData.find(d => d._id === driverId);
                    
                    if (driverLocation && populatedRide.status !== 'completed' && populatedRide.status !== 'cancelled') {
                        // Calculate ETA based on distance to pickup/destination
                        const targetLocation = populatedRide.status === 'accepted' ? 
                            populatedRide.pickup_location : populatedRide.drop_location;
                        
                        const distance = calculateDistance(
                            driverLocation.latitude, driverLocation.longitude,
                            targetLocation.latitude, targetLocation.longitude
                        );
                        
                        const eta = Math.ceil(distance * 2); // 2 minutes per km
                        
                        // Emit location update to user
                        io.emit(`ride_tracking_${rideId}`, {
                            currentLocation: {
                                latitude: driverLocation.latitude,
                                longitude: driverLocation.longitude,
                                address: driverLocation.address || `${driverLocation.latitude.toFixed(4)}, ${driverLocation.longitude.toFixed(4)}`
                            },
                            eta: eta,
                            distance: distance.toFixed(2),
                            status: populatedRide.status,
                            timestamp: new Date()
                        });
                    } else {
                        clearInterval(locationUpdateInterval);
                    }
                } catch (error) {
                    console.error('Error sending location update:', error);
                }
            }, 5000); // Update every 5 seconds
            
            // Store interval ID to clear it later
            global.locationIntervals = global.locationIntervals || {};
            global.locationIntervals[rideId] = locationUpdateInterval;
            
            // Notify admin about ride acceptance
            io.emit('admin_notification', {
                type: 'ride_accepted',
                rideId: rideId,
                message: `Ride accepted by driver ${req.user.name}`,
                user: populatedRide.user_id.name,
                driver: req.user.name,
                timestamp: new Date()
            });
        }
        
        res.json({ success: true, ride: populatedRide });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get all active trips for admin monitoring
exports.getActiveTrips = async (req, res) => {
    try {
        const activeTrips = await Ride.find({ 
            status: { $in: ['accepted', 'in_progress'] }
        })
        .populate('user_id', 'name phone')
        .populate('driver_id', 'name phone rating')
        .sort({ 'timestamps.started_at': -1 });
        
        res.json({ success: true, trips: activeTrips });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Complete ride (driver only)
exports.completeRide = async (req, res) => {
    try {
        const rideId = req.params.id;
        const driverId = req.user.id;
        
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }
        
        if (ride.driver_id.toString() !== driverId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        
        if (ride.status !== 'in_progress') {
            return res.status(400).json({ success: false, error: 'Ride must be in progress to complete' });
        }
        
        ride.status = 'completed';
        ride.timestamps.completed_at = new Date();
        await ride.save();
        
        // Stop ride simulation and location updates
        rideTrackingService.stopRideSimulation(rideId);
        
        // Clear location update interval
        if (global.locationIntervals && global.locationIntervals[rideId]) {
            clearInterval(global.locationIntervals[rideId]);
            delete global.locationIntervals[rideId];
        }
        
        // Auto-generate invoice
        try {
            await invoiceService.generateInvoice(rideId);
        } catch (invoiceError) {
            console.error('Invoice generation failed for ride:', rideId, 'Error:', invoiceError.message);
        }
        
        const populatedRide = await Ride.findById(rideId)
            .populate('user_id', 'name phone')
            .populate('driver_id', 'name phone rating');
        
        // Notify user that ride is completed and payment is required
        const io = req.app.get('io');
        if (io) {
            io.emit(`user_notification_${ride.user_id}`, {
                type: 'ride_completed',
                rideId: rideId,
                message: 'Your ride has been completed. Please proceed with payment.',
                paymentMethod: ride.payment_method,
                fare: ride.fare,
                ride: populatedRide,
                timestamp: new Date()
            });
        }
        
        res.json({ success: true, ride: populatedRide, message: 'Ride completed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};