const TripTracker = require('../services/trackingService');

module.exports = (io) => {
    const tripTracker = new TripTracker(io);

    io.on('connection', (socket) => {
        console.log(`User connected for tracking: ${socket.id}`);

        // Join ride room for real-time updates
        socket.on('joinRide', (rideId) => {
            socket.join(`ride_${rideId}`);
            console.log(`Socket ${socket.id} joined ride ${rideId}`);
            
            // Send current trip status if exists
            const tripStatus = tripTracker.getTripStatus(rideId);
            if (tripStatus) {
                socket.emit('tripStatus', tripStatus);
            }
        });

        // Leave ride room
        socket.on('leaveRide', (rideId) => {
            socket.leave(`ride_${rideId}`);
            console.log(`Socket ${socket.id} left ride ${rideId}`);
        });

        // Start trip tracking (driver initiates)
        socket.on('startTrip', (data) => {
            const { rideId, driverLocation, destination } = data;
            const tripData = tripTracker.startTracking(rideId, driverLocation, destination);
            
            io.to(`ride_${rideId}`).emit('tripStarted', {
                message: 'Trip started - tracking enabled',
                tripData,
                timestamp: new Date()
            });
        });

        // Manual location update from driver
        socket.on('updateLocation', (data) => {
            const { rideId, location } = data;
            const update = tripTracker.updateDriverLocation(rideId, location);
            
            if (update) {
                socket.emit('locationUpdated', { success: true, update });
            } else {
                socket.emit('locationUpdated', { success: false, error: 'Trip not found' });
            }
        });

        // Stop trip tracking
        socket.on('stopTrip', (rideId) => {
            tripTracker.stopTracking(rideId);
            io.to(`ride_${rideId}`).emit('tripStopped', {
                message: 'Trip tracking stopped',
                timestamp: new Date()
            });
        });

        // Complete trip
        socket.on('completeTrip', (rideId) => {
            tripTracker.completeTrip(rideId);
        });

        // Get current trip status
        socket.on('getTripStatus', (rideId) => {
            const status = tripTracker.getTripStatus(rideId);
            socket.emit('tripStatus', status || { error: 'Trip not found' });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected from tracking: ${socket.id}`);
        });
    });

    return tripTracker;
};