const path = require('path');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const User = require('../models/User');
const { calculateDistance } = require('../utils/haversine');
const { parseLocationFile, findNearbyDrivers, findDriversInZone, getDistanceMatrix } = require('../services/locationService');
const InvoiceService = require('../services/invoiceService');
const RatingService = require('../services/ratingService');
// Note: TrackingService is now handled via socket.io in trackingSocket.js
const { generateOTPWithExpiry, verifyOTP, isOTPExpired } = require('../utils/otpGenerator');

const invoiceService = new InvoiceService();
const ratingService = new RatingService();

// Helper function to get driver's current location
async function getDriverCurrentLocation(driverId) {
    try {
        const driversData = parseLocationFile();
        return driversData.find(d => d._id === driverId);
    } catch (error) {
        console.error('Error getting driver location:', error);
        return null;
    }
}

exports.requestRide = async (req, res) => {
    try {
        const { pickup_location, drop_location, vehicle_type, payment_method, preferred_driver_id, surge_multiplier } = req.body;
        
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
        
        // Calculate distance and fare with surge pricing
        const distance = calculateDistance(
            pickup_location.latitude, pickup_location.longitude,
            drop_location.latitude, drop_location.longitude
        );
        
        // Vehicle type rates
        const vehicleRates = {
            economy: { baseFare: 50, perKm: 15, perMin: 2 },
            sedan: { baseFare: 70, perKm: 20, perMin: 2.5 },
            suv: { baseFare: 90, perKm: 25, perMin: 3 }
        };
        
        const rates = vehicleRates[vehicle_type] || vehicleRates.economy;
        const estimatedTime = Math.round(distance * 2);
        
        // Calculate base fare
        const baseFare = rates.baseFare;
        const distanceFare = distance * rates.perKm;
        const timeFare = estimatedTime * rates.perMin;
        const baseEstimatedFare = Math.round(baseFare + distanceFare + timeFare);
        
        // Apply surge pricing
        const surgeMultiplierValue = surge_multiplier || await calculateSurgePricing(pickup_location, vehicle_type);
        const fare = Math.round(baseEstimatedFare * surgeMultiplierValue);
        
        // Find nearby available drivers with enhanced matching
        const nearbyDrivers = await findNearbyDriversWithMatching(pickup_location, vehicle_type, req.user.id);
        
        // Create ride request even if no drivers are immediately available
        // This allows for real-time driver matching as drivers come online

        // Create ride request
        const rideData = {
            user_id: req.user.id,
            pickup_location,
            drop_location,
            distance,
            fare,
            baseFare,
            surgeMultiplier: surgeMultiplierValue,
            vehicle_type: vehicle_type || 'economy',
            payment_method,
            status: 'requested',
            estimatedTime,
            fareBreakdown: {
                baseFare,
                distanceFare: Math.round(distanceFare),
                timeFare: Math.round(timeFare),
                surgeAmount: Math.round((fare - baseEstimatedFare))
            }
        };
        
        // If preferred driver is specified, add to ride data
        if (preferred_driver_id) {
            rideData.preferred_driver_id = preferred_driver_id;
        }
        
        const ride = await Ride.create(rideData);

        // Send notifications to drivers
        const io = req.app.get('io');
        if (io) {
            // Notify admin about new ride request
            io.emit('admin_notification', {
                type: 'new_ride_request',
                rideId: ride._id,
                message: `New ride request from ${req.user.name}`,
                user: req.user.name,
                pickup: pickup_location.address,
                destination: drop_location.address,
                fare: fare,
                timestamp: new Date()
            });
            
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
            } else if (nearbyDrivers.length > 0) {
                // Send to nearby drivers only (within 10km radius)
                nearbyDrivers.forEach(driver => {
                    if (driver.distance <= 10) { // Only notify drivers within 10km
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
                    }
                });
            }
        }

        res.json({ 
            success: true,
            hasActiveRide: false,
            ride,
            estimatedFare: fare,
            estimatedDistance: distance,
            message: nearbyDrivers.length > 0 ? 
                'Ride request sent to nearby drivers. Please wait for a driver to accept.' :
                'Ride request created. Searching for available drivers in your area...',
            waitingForAccept: true,
            availableDrivers: nearbyDrivers.length
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
            // Tracking is now handled via socket.io
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

// This duplicate function is removed - see the correct one below



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
        
        // Tracking is now handled via socket.io
        
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
        
        // Vehicle type rates (consistent with main calculation)
        const vehicleRates = {
            economy: { baseFare: 50, perKm: 15, perMin: 2 },
            sedan: { baseFare: 70, perKm: 20, perMin: 2.5 },
            suv: { baseFare: 90, perKm: 25, perMin: 3 }
        };
        
        const rates = vehicleRates[vehicle_type] || vehicleRates.economy;
        const fare = rates.baseFare + (distance * rates.perKm);
        
        res.json({
            success: true,
            distance: Math.round(distance * 100) / 100,
            estimatedFare: Math.round(fare),
            baseFare: rates.baseFare,
            perKmRate: rates.perKm,
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
        
        // Tracking is now handled via socket.io
        
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
        
        // Check authorization - admin can access all rides, users can access their own, drivers can access assigned rides
        const isAuthorized = 
            req.user.role === 'admin' ||
            (req.user.role === 'user' && ride.user_id && ride.user_id._id.toString() === req.user.id) ||
            (req.user.role === 'driver' && ride.driver_id && ride.driver_id._id.toString() === req.user.id);
            
        if (!isAuthorized) {
            console.log('Authorization failed:', {
                userRole: req.user.role,
                userId: req.user.id,
                rideUserId: ride.user_id?._id?.toString(),
                rideDriverId: ride.driver_id?._id?.toString()
            });
            return res.status(403).json({ success: false, error: 'Unauthorized access to this ride' });
        }
        
        // Provide driver location data for tracking
        let driverLocation = null;
        let trackingData = null;
        if (ride.status === 'in_progress' && ride.driver_id) {
            // Tracking data is now provided via socket.io real-time updates
            // Check if ride has tracking data in database
            if (ride.tracking) {
                if (req.user.role === 'driver') {
                    trackingData = ride.tracking;
                } else if (req.user.role === 'user') {
                    driverLocation = {
                        address: ride.tracking.currentLocation?.address || 'En route',
                        progress: ride.tracking.progress || 0,
                        eta: ride.tracking.eta || 'Calculating...'
                    };
                }
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
        console.log('Getting ride requests for driver:', req.user.id);
        
        const requests = await Ride.find({ 
            status: 'requested',
            $or: [
                { driver_id: { $exists: false } },
                { driver_id: null }
            ],
            declined_by: { $ne: req.user.id }
        })
        .populate('user_id', 'name phone rating')
        .sort({ createdAt: -1 })
        .limit(20);
        
        console.log('Found ride requests:', requests.length);
        requests.forEach(req => {
            console.log('Request ID:', req._id, 'Status:', req.status);
        });
        
        res.json({ success: true, requests });
    } catch (err) {
        console.error('Get ride requests error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.acceptRideRequest = async (req, res) => {
    try {
        console.log('=== ACCEPT RIDE REQUEST ENDPOINT HIT ===');
        console.log('Method:', req.method);
        console.log('URL:', req.url);
        console.log('Params:', req.params);
        console.log('Headers:', req.headers.authorization ? 'Bearer token present' : 'No auth header');
        console.log('User:', { id: req.user?.id, role: req.user?.role, name: req.user?.name });
        
        if (!req.user) {
            console.log('❌ No user in request');
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        
        const rideId = req.params.id;
        const driverId = req.user.id;
        
        console.log('Accepting ride:', rideId, 'by driver:', driverId);
        
        // Validate ObjectId format
        if (!rideId || !rideId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('❌ Invalid ride ID format:', rideId);
            return res.status(400).json({ success: false, error: 'Invalid ride ID format' });
        }
        
        // Validate driver ID format
        if (!driverId || !driverId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('❌ Invalid driver ID format:', driverId);
            return res.status(400).json({ success: false, error: 'Invalid driver ID format' });
        }
        
        console.log('✅ ID validation passed');
        
        console.log('🔍 Searching for ride in database...');
        const ride = await Ride.findById(rideId);
        if (!ride) {
            console.log('❌ Ride not found:', rideId);
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }
        
        console.log('✅ Found ride:', {
            id: ride._id,
            status: ride.status,
            user_id: ride.user_id,
            driver_id: ride.driver_id,
            declined_by: ride.declined_by
        });
        
        if (ride.status !== 'requested') {
            console.log('❌ Ride status check failed:', {
                rideId,
                currentStatus: ride.status,
                expectedStatus: 'requested',
                driverId,
                declinedBy: ride.declined_by
            });
            return res.status(400).json({ 
                success: false, 
                error: `Ride status is '${ride.status}', expected 'requested'` 
            });
        }
        
        console.log('✅ Ride status check passed');
        
        // Check if driver has already declined this ride
        if (ride.declined_by && ride.declined_by.includes(driverId)) {
            console.log('❌ Driver has already declined this ride:', { rideId, driverId });
            return res.status(400).json({ 
                success: false, 
                error: 'You have already declined this ride request' 
            });
        }
        
        console.log('✅ Driver decline check passed');
        
        // Generate OTP for ride verification
        const otpData = generateOTPWithExpiry(10); // 10 minutes expiry
        
        // Get driver information from Driver model
        console.log('🔍 Searching for driver in database...');
        const driver = await Driver.findById(driverId).select('name phone rating');
        if (!driver) {
            console.log('❌ Driver not found in Driver model:', driverId);
            return res.status(404).json({ success: false, error: 'Driver not found' });
        }
        
        console.log('✅ Found driver:', driver.name);
        
        // Calculate distance from driver to user
        const driverLocation = await getDriverCurrentLocation(driverId);
        const distanceFromUser = driverLocation ? 
            calculateDistance(
                driverLocation.latitude, driverLocation.longitude,
                ride.pickup_location.latitude, ride.pickup_location.longitude
            ) : 2; // Default 2km if location not available
        
        // Calculate ETA (assuming average speed of 30 km/h)
        const eta = Math.ceil((distanceFromUser / 30) * 60); // in minutes
        
        console.log('Distance from user:', distanceFromUser, 'ETA:', eta);
        
        ride.driver_id = driverId;
        ride.status = 'accepted';
        ride.timestamps.accepted_at = new Date();
        ride.ride_phases.driver_accepted = new Date();
        ride.otp = otpData;
        ride.driver_info = {
            name: driver.name,
            phone: driver.phone,
            vehicle_number: driver.driverInfo?.vehicleNumber || 'MH-12-AB-1234',
            vehicle_model: driver.driverInfo?.vehicleModel || 'Sedan',
            rating: driver.rating || 4.5,
            distance_from_user: Math.round(distanceFromUser * 100) / 100,
            eta: eta,
            photo: driver.profilePhoto || null
        };
        
        // Initialize tracking
        ride.tracking = {
            isActive: true,
            currentLocation: driverLocation ? {
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                address: driverLocation.address || 'Driver location',
                timestamp: new Date()
            } : null,
            eta: eta,
            progress: 0,
            lastUpdate: new Date()
        };
        
        console.log('💾 Saving ride with driver_id:', driverId);
        await ride.save();
        console.log('✅ Ride saved successfully');
        
        const populatedRide = await Ride.findById(rideId)
            .populate('user_id', 'name phone')
            .populate('driver_id', 'name phone rating');
        
        console.log('Populated ride:', populatedRide);
        
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
            
            // Notify all drivers that this ride is no longer available
            io.emit('ride_no_longer_available', {
                rideId: rideId,
                message: 'Ride has been accepted by another driver',
                acceptedBy: req.user.name,
                timestamp: new Date()
            });
            
            // Also send specific notifications to remove from driver interfaces
            const allDrivers = await User.find({ role: 'driver' }).select('_id');
            allDrivers.forEach(driver => {
                if (driver._id.toString() !== driverId) {
                    io.emit(`driver_notification_${driver._id}`, {
                        type: 'remove_ride_request',
                        rideId: rideId,
                        message: 'Ride no longer available',
                        timestamp: new Date()
                    });
                }
            });
            
            // Start Uber-like tracking service
            if (io.trackingService && driverLocation) {
                io.trackingService.startDriverTracking(
                    rideId,
                    driverLocation,
                    populatedRide.pickup_location
                );
            }
            
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
        
        console.log('✅ Sending success response with ride:', populatedRide._id);
        res.json({ success: true, ride: populatedRide, message: 'Ride accepted successfully' });
    } catch (err) {
        console.error('Accept ride error:', err);
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

// Verify OTP and start ride (driver only)
exports.verifyOTPAndStartRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const { otp } = req.body;
        const driverId = req.user.id;
        
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }
        
        if (ride.driver_id.toString() !== driverId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        
        if (ride.status !== 'accepted') {
            return res.status(400).json({ success: false, error: 'Ride must be accepted to start' });
        }
        
        // Verify OTP
        if (!verifyOTP(otp, ride.otp.code, ride.otp.expires_at)) {
            if (isOTPExpired(ride.otp.expires_at)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'OTP has expired. Please request a new ride.' 
                });
            }
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid OTP. Please check with the passenger.' 
            });
        }
        
        // Start the ride
        ride.status = 'in_progress';
        ride.timestamps.started_at = new Date();
        await ride.save();
        
        // Tracking is now handled via socket.io
        
        // Notify user that ride has started
        const io = req.app.get('io');
        if (io) {
            io.emit(`user_notification_${ride.user_id}`, {
                type: 'ride_started',
                rideId: rideId,
                message: 'Your ride has started. Driver is on the way to your destination.',
                timestamp: new Date()
            });
        }
        
        res.json({
            success: true,
            message: 'Ride started successfully',
            ride
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Complete ride with payment verification (driver only)
exports.completeRideWithPayment = async (req, res) => {
    try {
        const { rideId } = req.params;
        const { paymentReceived } = req.body;
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
        
        // Check if payment is received
        if (!paymentReceived) {
            return res.status(400).json({ 
                success: false, 
                error: 'Payment must be received before ending the ride' 
            });
        }
        
        ride.status = 'completed';
        ride.payment_status = 'paid';
        ride.timestamps.completed_at = new Date();
        await ride.save();
        
        // Tracking is now handled via socket.io
        
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
        
        // Notify user that ride is completed
        const io = req.app.get('io');
        if (io) {
            io.emit(`user_notification_${ride.user_id}`, {
                type: 'ride_completed',
                rideId: rideId,
                message: 'Your ride has been completed. Thank you for choosing our service!',
                ride: populatedRide,
                timestamp: new Date()
            });
        }
        
        res.json({
            success: true,
            message: 'Ride completed successfully',
            ride: populatedRide
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Complete ride (driver only) - Legacy function for backward compatibility
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
        
        // Tracking is now handled via socket.io
        
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

// Get user's rides (includes ALL statuses including 'requested')
exports.getUserRides = async (req, res) => {
    try {
        console.log('Getting rides for user:', req.user.id);
        
        const rides = await Ride.find({ user_id: req.user.id })
            .populate('driver_id', 'name phone rating')
            .sort({ createdAt: -1 });
        
        console.log(`Found ${rides.length} rides for user ${req.user.id}`);
        rides.forEach(ride => {
            console.log(`Ride ${ride._id}: status=${ride.status}, created=${ride.createdAt}`);
        });
        
        res.json({ success: true, rides });
    } catch (err) {
        console.error('Get user rides error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get driver's rides
exports.getDriverRides = async (req, res) => {
    try {
        const rides = await Ride.find({ driver_id: req.user.id })
            .populate('user_id', 'name phone rating')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, rides });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Find nearby drivers with enhanced matching
async function findNearbyDriversWithMatching(pickupLocation, vehicleType, userId) {
    try {
        // Get all available drivers
        const availableDrivers = await Driver.find({
            status: 'available',
            'driverInfo.isVerified': true,
            location: { $exists: true },
            $or: [
                { 'vehicleInfo.type': vehicleType },
                { 'driverInfo.vehicleType': vehicleType },
                { vehicle_type: vehicleType }
            ]
        }).select('name phone rating location lastActive vehicleInfo driverInfo vehicle_type');
        
        if (availableDrivers.length === 0) {
            return [];
        }
        
        // Calculate scores for each driver
        const driversWithScores = availableDrivers.map(driver => {
            const distance = calculateDistance(
                pickupLocation.latitude,
                pickupLocation.longitude,
                driver.location.latitude,
                driver.location.longitude
            );
            
            // Calculate matching score based on multiple factors
            let score = 0;
            
            // Distance score (closer is better)
            const maxDistance = 10; // 10km max
            const distanceScore = Math.max(0, (maxDistance - distance) / maxDistance) * 40;
            score += distanceScore;
            
            // Rating score (higher rating is better)
            const ratingScore = (driver.rating || 4.0) * 5; // Max 25 points
            score += ratingScore;
            
            // Vehicle type exact match bonus
            const driverVehicleType = driver.vehicleInfo?.type || driver.driverInfo?.vehicleType || driver.vehicle_type;
            if (driverVehicleType === vehicleType) {
                score += 20;
            }
            
            // Activity score (more recent activity is better)
            const lastActiveMinutes = (new Date() - new Date(driver.lastActive)) / (1000 * 60);
            const activityScore = Math.max(0, (30 - lastActiveMinutes) / 30) * 10; // Max 10 points
            score += activityScore;
            
            // Response time score (based on historical data)
            const responseTimeScore = 10; // Default score
            score += responseTimeScore;
            
            return {
                ...driver.toObject(),
                distance,
                score,
                eta: Math.round(distance * 2) // Rough ETA calculation
            };
        });
        
        // Sort by score (highest first) and distance (closest first)
        driversWithScores.sort((a, b) => {
            if (Math.abs(a.score - b.score) < 5) {
                return a.distance - b.distance; // If scores are close, prefer closer driver
            }
            return b.score - a.score;
        });
        
        // Return top 5 drivers
        return driversWithScores.slice(0, 5);
    } catch (error) {
        console.error('Error in enhanced driver matching:', error);
        return [];
    }
}

// Find nearby drivers
exports.findNearbyDrivers = async (req, res) => {
    try {
        const { latitude, longitude, vehicle_type } = req.query;
        
        if (!latitude || !longitude) {
            return res.status(400).json({ 
                success: false, 
                error: 'Latitude and longitude are required' 
            });
        }
        
        const drivers = await findNearbyDriversWithMatching(
            { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            vehicle_type,
            req.user.id
        );
        
        res.json({ success: true, drivers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Find drivers in zone
exports.findDriversInZone = async (req, res) => {
    try {
        const { zone } = req.query;
        
        if (!zone) {
            return res.status(400).json({ 
                success: false, 
                error: 'Zone is required' 
            });
        }
        
        const drivers = await findDriversInZone(zone);
        
        res.json({ success: true, drivers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Calculate fare with surge pricing
exports.calculateFare = async (req, res) => {
    try {
        const { pickup_location, drop_location, vehicle_type, include_surge } = req.body;
        
        console.log('Fare calculation request:', {
            pickup: pickup_location?.address || 'No address',
            drop: drop_location?.address || 'No address',
            vehicle_type,
            pickup_coords: `${pickup_location?.latitude}, ${pickup_location?.longitude}`,
            drop_coords: `${drop_location?.latitude}, ${drop_location?.longitude}`
        });
        
        if (!pickup_location || !drop_location) {
            return res.status(400).json({ 
                success: false, 
                error: 'Pickup and drop locations are required' 
            });
        }
        
        if (!pickup_location.latitude || !pickup_location.longitude || !drop_location.latitude || !drop_location.longitude) {
            return res.status(400).json({ 
                success: false, 
                error: 'Location coordinates are required' 
            });
        }
        
        const distance = calculateDistance(
            pickup_location.latitude, 
            pickup_location.longitude,
            drop_location.latitude, 
            drop_location.longitude
        );
        
        console.log('Calculated distance:', distance, 'km');
        
        // Vehicle type rates
        const vehicleRates = {
            economy: { baseFare: 50, perKm: 15, perMin: 2 },
            sedan: { baseFare: 70, perKm: 20, perMin: 2.5 },
            suv: { baseFare: 90, perKm: 25, perMin: 3 }
        };
        
        const rates = vehicleRates[vehicle_type] || vehicleRates.economy;
        
        // Calculate base fare
        const baseFare = rates.baseFare;
        const distanceFare = distance * rates.perKm;
        const estimatedTime = Math.round(distance * 2); // Rough estimate
        const timeFare = estimatedTime * rates.perMin;
        
        let baseEstimatedFare = Math.round(baseFare + distanceFare + timeFare);
        
        // Calculate surge pricing based on demand and time
        let surgeMultiplier = 1.0;
        if (include_surge) {
            surgeMultiplier = await calculateSurgePricing(pickup_location, vehicle_type);
        }
        
        const finalFare = Math.round(baseEstimatedFare * surgeMultiplier);
        
        const result = {
            success: true,
            distance: distance.toFixed(2),
            baseFare,
            estimatedFare: finalFare,
            estimatedTime,
            vehicle_type,
            surgeMultiplier: parseFloat(surgeMultiplier.toFixed(2)),
            fareBreakdown: {
                baseFare,
                distanceFare: Math.round(distanceFare),
                timeFare: Math.round(timeFare),
                surgeAmount: Math.round((finalFare - baseEstimatedFare))
            }
        };
        
        console.log('Fare calculation result:', result);
        res.json(result);
    } catch (err) {
        console.error('Fare calculation error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Calculate surge pricing based on demand and time
async function calculateSurgePricing(pickupLocation, vehicleType) {
    try {
        const now = new Date();
        const hour = now.getHours();
        
        // Base surge factors
        let surgeMultiplier = 1.0;
        
        // Time-based surge (rush hours)
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            surgeMultiplier += 0.5; // 50% increase during rush hours
        }
        
        // Weekend surge
        if (now.getDay() === 0 || now.getDay() === 6) {
            surgeMultiplier += 0.3; // 30% increase on weekends
        }
        
        // Check demand in the area (simplified - in real app, this would be based on actual demand data)
        const nearbyRides = await Ride.countDocuments({
            status: { $in: ['requested', 'accepted', 'in_progress'] },
            createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // Last 30 minutes
            'pickup_location.latitude': {
                $gte: pickupLocation.latitude - 0.01,
                $lte: pickupLocation.latitude + 0.01
            },
            'pickup_location.longitude': {
                $gte: pickupLocation.longitude - 0.01,
                $lte: pickupLocation.longitude + 0.01
            }
        });
        
        // Demand-based surge
        if (nearbyRides > 10) {
            surgeMultiplier += 0.4; // 40% increase for high demand
        } else if (nearbyRides > 5) {
            surgeMultiplier += 0.2; // 20% increase for medium demand
        }
        
        // Vehicle type surge
        if (vehicleType === 'suv') {
            surgeMultiplier += 0.2; // 20% increase for SUVs
        }
        
        // Cap surge at 3x
        return Math.min(surgeMultiplier, 3.0);
    } catch (error) {
        console.error('Error calculating surge pricing:', error);
        return 1.0; // Default to no surge if calculation fails
    }
}

// Get distance matrix
exports.getDistanceMatrix = async (req, res) => {
    try {
        const { origins, destinations } = req.body;
        
        if (!origins || !destinations) {
            return res.status(400).json({ 
                success: false, 
                error: 'Origins and destinations are required' 
            });
        }
        
        const matrix = await getDistanceMatrix(origins, destinations);
        
        res.json({ success: true, matrix });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Cancel ride
exports.cancelRide = async (req, res) => {
    try {
        const rideId = req.params.id;
        const userId = req.user.id;
        
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }
        
        // Check authorization
        if (ride.user_id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        
        // Only allow cancellation if ride is not completed
        if (ride.status === 'completed') {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot cancel completed ride' 
            });
        }
        
        ride.status = 'cancelled';
        ride.timestamps.cancelled_at = new Date();
        await ride.save();
        
        // Notify driver if ride was accepted
        if (ride.driver_id) {
            const io = req.app.get('io');
            if (io) {
                io.emit(`driver_notification_${ride.driver_id}`, {
                    type: 'ride_cancelled',
                    rideId: rideId,
                    message: 'Ride has been cancelled by the passenger',
                    timestamp: new Date()
                });
            }
        }
        
        res.json({ success: true, message: 'Ride cancelled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update ride status
exports.updateRideStatus = async (req, res) => {
    try {
        const rideId = req.params.id;
        const { status } = req.body;
        const userId = req.user.id;
        
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }
        
        // Check authorization
        if (ride.driver_id && ride.driver_id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        
        ride.status = status;
        if (status === 'in_progress') {
            ride.timestamps.started_at = new Date();
        } else if (status === 'completed') {
            ride.timestamps.completed_at = new Date();
        }
        
        await ride.save();
        
        res.json({ success: true, message: 'Ride status updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Decline a ride request
exports.declineRideRequest = async (req, res) => {
    try {
        const rideId = req.params.id;
        const driverId = req.user.id;
        
        // Add driver to declined list to prevent showing the same request again
        await Ride.findByIdAndUpdate(rideId, {
            $addToSet: { declined_by: driverId }
        });
        
        res.json({ 
            success: true, 
            message: 'Ride request declined' 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Test endpoint to check if ride exists
exports.testRideExists = async (req, res) => {
    try {
        const rideId = req.params.id;
        console.log('Testing ride existence for ID:', rideId);
        
        const ride = await Ride.findById(rideId);
        console.log('Found ride:', ride ? 'YES' : 'NO');
        
        if (ride) {
            console.log('Ride details:', {
                id: ride._id,
                status: ride.status,
                user_id: ride.user_id,
                driver_id: ride.driver_id
            });
        }
        
        res.json({
            success: true,
            exists: !!ride,
            ride: ride ? {
                id: ride._id,
                status: ride.status,
                user_id: ride.user_id,
                driver_id: ride.driver_id
            } : null
        });
    } catch (err) {
        console.error('Test ride error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};