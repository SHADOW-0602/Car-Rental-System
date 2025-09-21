const { calculateDistance } = require('../utils/haversine');
const Ride = require('../models/Ride');

class TrackingService {
    constructor(io) {
        this.io = io;
        this.activeRides = new Map();
        this.trackingIntervals = new Map();
    }

    // Start tracking when driver accepts ride
    startDriverTracking(rideId, driverLocation, pickupLocation) {
        const trackingData = {
            rideId,
            phase: 'driver_arriving',
            driverLocation,
            targetLocation: pickupLocation,
            startTime: new Date(),
            isActive: true
        };

        this.activeRides.set(rideId, trackingData);
        this.simulateDriverMovement(rideId);
        
        return trackingData;
    }

    // Start trip tracking when passenger gets in
    startTripTracking(rideId, pickupLocation, dropLocation) {
        const existingTracking = this.activeRides.get(rideId);
        if (existingTracking) {
            existingTracking.phase = 'in_progress';
            existingTracking.targetLocation = dropLocation;
            existingTracking.driverLocation = pickupLocation;
            existingTracking.tripStartTime = new Date();
        }
    }

    // Simulate driver movement (like Uber's real-time tracking)
    simulateDriverMovement(rideId) {
        const interval = setInterval(async () => {
            const tracking = this.activeRides.get(rideId);
            if (!tracking || !tracking.isActive) {
                clearInterval(interval);
                this.trackingIntervals.delete(rideId);
                return;
            }

            const { driverLocation, targetLocation, phase } = tracking;
            
            // Calculate distance to target
            const distanceToTarget = calculateDistance(
                driverLocation.latitude, driverLocation.longitude,
                targetLocation.latitude, targetLocation.longitude
            );

            // Check if arrived
            if (distanceToTarget < 0.05) { // Within 50 meters
                if (phase === 'driver_arriving') {
                    this.handleDriverArrival(rideId);
                } else if (phase === 'in_progress') {
                    this.handleTripCompletion(rideId);
                }
                return;
            }

            // Move driver towards target (simulate movement)
            const stepSize = 0.001; // Smaller steps for smoother movement
            const latDiff = targetLocation.latitude - driverLocation.latitude;
            const lonDiff = targetLocation.longitude - driverLocation.longitude;
            
            const stepLat = latDiff > 0 ? Math.min(stepSize, latDiff) : Math.max(-stepSize, latDiff);
            const stepLon = lonDiff > 0 ? Math.min(stepSize, lonDiff) : Math.max(-stepSize, lonDiff);

            tracking.driverLocation.latitude += stepLat;
            tracking.driverLocation.longitude += stepLon;

            // Calculate ETA (assuming 30 km/h average speed)
            const eta = Math.ceil((distanceToTarget / 30) * 60);

            // Calculate progress
            let progress = 0;
            if (phase === 'driver_arriving') {
                progress = Math.max(0, Math.min(50, 50 - (distanceToTarget * 10)));
            } else if (phase === 'in_progress') {
                const totalDistance = tracking.totalTripDistance || distanceToTarget;
                progress = Math.max(50, Math.min(100, 50 + ((totalDistance - distanceToTarget) / totalDistance) * 50));
            }

            // Update ride in database
            try {
                await Ride.findByIdAndUpdate(rideId, {
                    'tracking.currentLocation': {
                        latitude: tracking.driverLocation.latitude,
                        longitude: tracking.driverLocation.longitude,
                        address: phase === 'driver_arriving' ? 'Coming to pick you up' : 'En route to destination',
                        timestamp: new Date()
                    },
                    'tracking.eta': eta,
                    'tracking.progress': progress,
                    'tracking.lastUpdate': new Date()
                });
            } catch (error) {
                console.error('Error updating ride tracking:', error);
            }

            // Emit real-time updates
            const updateData = {
                rideId,
                currentLocation: {
                    latitude: tracking.driverLocation.latitude,
                    longitude: tracking.driverLocation.longitude,
                    address: phase === 'driver_arriving' ? 'Coming to pick you up' : 'En route to destination'
                },
                eta,
                progress,
                phase,
                distanceToTarget: Math.round(distanceToTarget * 1000) / 1000,
                timestamp: new Date()
            };

            // Send to user
            this.io.emit(`ride_tracking_${rideId}`, updateData);
            
            // Send to admin
            this.io.emit('admin_ride_update', updateData);

        }, 3000); // Update every 3 seconds

        this.trackingIntervals.set(rideId, interval);
    }

    // Handle driver arrival at pickup
    async handleDriverArrival(rideId) {
        try {
            await Ride.findByIdAndUpdate(rideId, {
                status: 'driver_arriving',
                'ride_phases.driver_arriving': new Date(),
                'tracking.progress': 50
            });

            this.io.emit(`ride_tracking_${rideId}`, {
                rideId,
                phase: 'driver_arrived',
                message: 'Your driver has arrived!',
                timestamp: new Date()
            });

            // Stop movement simulation temporarily
            const tracking = this.activeRides.get(rideId);
            if (tracking) {
                tracking.isActive = false;
            }

        } catch (error) {
            console.error('Error handling driver arrival:', error);
        }
    }

    // Handle trip completion
    async handleTripCompletion(rideId) {
        try {
            const ride = await Ride.findById(rideId);
            if (ride) {
                await ride.completeRide();
            }

            this.io.emit(`ride_tracking_${rideId}`, {
                rideId,
                phase: 'completed',
                message: 'Trip completed successfully!',
                timestamp: new Date()
            });

            this.stopTracking(rideId);

        } catch (error) {
            console.error('Error completing trip:', error);
        }
    }

    // Manual location update from driver app
    updateDriverLocation(rideId, location) {
        const tracking = this.activeRides.get(rideId);
        if (tracking) {
            tracking.driverLocation = {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address || 'Updated location'
            };

            // Emit immediate update
            this.io.emit(`ride_tracking_${rideId}`, {
                rideId,
                currentLocation: tracking.driverLocation,
                timestamp: new Date()
            });

            return true;
        }
        return false;
    }

    // Get current tracking status
    getTrackingStatus(rideId) {
        const tracking = this.activeRides.get(rideId);
        if (!tracking) return null;

        const distanceToTarget = calculateDistance(
            tracking.driverLocation.latitude, tracking.driverLocation.longitude,
            tracking.targetLocation.latitude, tracking.targetLocation.longitude
        );

        return {
            rideId,
            phase: tracking.phase,
            currentLocation: tracking.driverLocation,
            targetLocation: tracking.targetLocation,
            distanceToTarget,
            eta: Math.ceil((distanceToTarget / 30) * 60),
            isActive: tracking.isActive
        };
    }

    // Stop tracking
    stopTracking(rideId) {
        const interval = this.trackingIntervals.get(rideId);
        if (interval) {
            clearInterval(interval);
            this.trackingIntervals.delete(rideId);
        }
        this.activeRides.delete(rideId);
    }

    // Emergency stop all tracking for a ride
    emergencyStop(rideId) {
        this.stopTracking(rideId);
        this.io.emit(`ride_tracking_${rideId}`, {
            rideId,
            phase: 'stopped',
            message: 'Tracking stopped',
            timestamp: new Date()
        });
    }
}

module.exports = TrackingService;