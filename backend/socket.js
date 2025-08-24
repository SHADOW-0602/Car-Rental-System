const socketIO = require('socket.io');

function initSocket(server) {
    const io = socketIO(server, {
        cors: { origin: "*" }
    });

    io.on('connection', socket => {
        console.log(`🔌 User connected: ${socket.id}`);

        // Live driver location updates
        socket.on('updateLocation', data => {
            io.emit('driverLocationUpdate', data);
        });

        // New ride request from user
        socket.on('rideRequest', data => {
            io.emit('newRideRequest', data);
        });

        // Analytics updates for admin dashboard
        socket.on('analyticsUpdate', data => {
            io.emit('analyticsUpdate', data);
        });

        // General custom notifications
        socket.on('sendNotification', data => {
            io.emit('notification', data);
        });



        // Disconnect
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });

    return io;
}

module.exports = { initSocket };