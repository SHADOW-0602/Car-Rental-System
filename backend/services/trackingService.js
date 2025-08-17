const { calculateDistance } = require('../utils/haversine');
const Ride = require('../models/Ride');

class TripTracker {
    constructor(io) {
        this.io = io;
        this.activeTrips = new Map();
        this.trackingIntervals = new Map();
    }

    // Start tracking a trip
    startTracking(rideId, driverLocation, destination) {
        const tripData = {
            rideId,
            currentLocation: driverLocation,
            destination,
            startTime: new Date(),
            totalDistance: calculateDistance(
                driverLocation.latitude, driverLocation.longitude,
                destination.latitude, destination.longitude
            ),
            status: 'in_progress'
        };

        this.activeTrips.set(rideId, tripData);
        this.simulateMovement(rideId);
        
        return tripData;
    }

    // Simulate driver movement towards destination
    simulateMovement(rideId) {
        const interval = setInterval(() => {
            const trip = this.activeTrips.get(rideId);
            if (!trip || trip.status === 'completed') {
                clearInterval(interval);
                this.trackingIntervals.delete(rideId);
                return;
            }

            const { currentLocation, destination } = trip;
            const remainingDistance = calculateDistance(
                currentLocation.latitude, currentLocation.longitude,
                destination.latitude, destination.longitude
            );

            if (remainingDistance < 0.1) { // Within 100m
                this.completeTrip(rideId);
                return;
            }

            // Move towards destination (simulate 40 km/h average speed)
            const stepSize = 0.01; // Approximate step in degrees
            const latDiff = destination.latitude - currentLocation.latitude;
            const lonDiff = destination.longitude - currentLocation.longitude;
            
            const stepLat = latDiff > 0 ? Math.min(stepSize, latDiff) : Math.max(-stepSize, latDiff);
            const stepLon = lonDiff > 0 ? Math.min(stepSize, lonDiff) : Math.max(-stepSize, lonDiff);

            trip.currentLocation.latitude += stepLat;
            trip.currentLocation.longitude += stepLon;

            // Calculate ETA (assuming 40 km/h average speed)
            const eta = Math.ceil(remainingDistance / 40 * 60); // minutes

            const update = {
                rideId,
                currentLocation: trip.currentLocation,
                remainingDistance: Math.round(remainingDistance * 100) / 100,
                eta,
                status: trip.status,
                timestamp: new Date()
            };

            // Emit to specific ride room
            this.io.to(`ride_${rideId}`).emit('locationUpdate', update);
            
        }, 3000); // Update every 3 seconds

        this.trackingIntervals.set(rideId, interval);
    }

    // Complete trip
    completeTrip(rideId) {
        const trip = this.activeTrips.get(rideId);
        if (trip) {
            trip.status = 'completed';
            trip.endTime = new Date();
            
            this.io.to(`ride_${rideId}`).emit('tripCompleted', {
                rideId,
                message: 'Trip completed successfully',
                duration: Math.ceil((trip.endTime - trip.startTime) / 60000), // minutes
                timestamp: new Date()
            });

            // Update ride status in database
            Ride.findByIdAndUpdate(rideId, { 
                status: 'completed',
                completed_at: new Date()
            }).catch(console.error);
        }

        this.stopTracking(rideId);
    }

    // Stop tracking
    stopTracking(rideId) {
        const interval = this.trackingIntervals.get(rideId);
        if (interval) {
            clearInterval(interval);
            this.trackingIntervals.delete(rideId);
        }
        this.activeTrips.delete(rideId);
    }

    // Get current trip status
    getTripStatus(rideId) {
        return this.activeTrips.get(rideId) || null;
    }

    // Update driver location manually
    updateDriverLocation(rideId, location) {
        const trip = this.activeTrips.get(rideId);
        if (trip) {
            trip.currentLocation = location;
            
            const remainingDistance = calculateDistance(
                location.latitude, location.longitude,
                trip.destination.latitude, trip.destination.longitude
            );
            
            const eta = Math.ceil(remainingDistance / 40 * 60);

            const update = {
                rideId,
                currentLocation: location,
                remainingDistance: Math.round(remainingDistance * 100) / 100,
                eta,
                status: trip.status,
                timestamp: new Date()
            };

            this.io.to(`ride_${rideId}`).emit('locationUpdate', update);
            return update;
        }
        return null;
    }
}

module.exports = TripTracker;