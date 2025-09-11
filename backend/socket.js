const socketIO = require('socket.io');


function initSocket(server) {
    const io = socketIO(server, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:3001"],
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    io.on('connection', socket => {
        console.log(`🔌 User connected: ${encodeURIComponent(socket.id)}`);
        
        // Send connection confirmation
        socket.emit('connection-confirmed', { 
            socketId: socket.id, 
            timestamp: new Date() 
        });



        // Live driver location updates
        socket.on('updateLocation', data => {
            io.emit('driverLocationUpdate', data);
        });
        
        // Join admin room for admin-specific updates
        socket.on('joinAdminRoom', () => {
            socket.join('admin-room');
            console.log('Admin joined admin room for live monitoring');
            
            // Send initial live data to newly connected admin
            socket.emit('adminConnected', {
                message: 'Connected to live monitoring',
                timestamp: new Date()
            });
        });
        
        // Admin-specific driver location updates
        socket.on('adminLocationUpdate', data => {
            io.to('admin-room').emit('driverLocationUpdate', data);
        });
        
        // Live trip updates for admin monitoring
        socket.on('tripUpdate', data => {
            io.to('admin-room').emit('tripUpdate', data);
        });
        
        // System alerts for admin
        socket.on('systemAlert', data => {
            io.to('admin-room').emit('systemAlert', data);
        });
        
        // Real-time metrics updates
        socket.on('metricsUpdate', data => {
            io.to('admin-room').emit('liveUpdate', data);
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
            console.log(`❌ User disconnected: ${encodeURIComponent(socket.id)}`);
        });
    });

    return io;
}



module.exports = { initSocket };