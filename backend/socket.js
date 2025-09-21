const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Driver = require('./models/Driver');
const TrackingService = require('./services/TrackingService');

function initSocket(server) {
    const io = socketIO(server, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:3001"],
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // Initialize tracking service
    const trackingService = new TrackingService(io);

    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
            
            if (!token) {
                console.log('Socket connection without token - allowing for public access');
                socket.user = null;
                return next();
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            let user;
            if (decoded.role === 'driver') {
                user = await Driver.findById(decoded.id).select('-password');
            } else {
                user = await User.findById(decoded.id).select('-password');
            }

            if (!user) {
                console.log('Socket auth: User not found for ID:', decoded.id);
                socket.user = null;
                return next();
            }

            socket.user = { ...user.toObject(), role: decoded.role };
            next();
        } catch (error) {
            console.log('Socket auth error:', error.message);
            socket.user = null;
            next();
        }
    });

    io.on('connection', socket => {
        console.log(`🔌 User connected: ${socket.id} (${socket.user?.name || 'Anonymous'})`);
        
        // Send connection confirmation
        socket.emit('connection-confirmed', { 
            socketId: socket.id, 
            user: socket.user ? { name: socket.user.name, role: socket.user.role } : null,
            timestamp: new Date() 
        });



        // Live driver location updates
        socket.on('updateLocation', data => {
            // Update tracking service if this is for an active ride
            if (data.rideId) {
                trackingService.updateDriverLocation(data.rideId, {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    address: data.address
                });
            }
            
            // Broadcast to admin and other listeners
            io.emit('driverLocationUpdate', data);
        });
        
        // Join ride room for real-time tracking
        socket.on('joinRideRoom', (rideId) => {
            socket.join(`ride_${rideId}`);
            console.log(`Socket ${socket.id} joined ride room: ${rideId}`);
            
            // Send current tracking status if available
            const trackingStatus = trackingService.getTrackingStatus(rideId);
            if (trackingStatus) {
                socket.emit('trackingStatus', trackingStatus);
            }
        });
        
        // Leave ride room
        socket.on('leaveRideRoom', (rideId) => {
            socket.leave(`ride_${rideId}`);
            console.log(`Socket ${socket.id} left ride room: ${rideId}`);
        });
        
        // Start trip tracking (when driver picks up passenger)
        socket.on('startTrip', (data) => {
            const { rideId, pickupLocation, dropLocation } = data;
            trackingService.startTripTracking(rideId, pickupLocation, dropLocation);
            
            io.to(`ride_${rideId}`).emit('tripStarted', {
                rideId,
                message: 'Trip started - tracking your journey',
                timestamp: new Date()
            });
        });
        
        // Complete trip
        socket.on('completeTrip', (rideId) => {
            trackingService.handleTripCompletion(rideId);
        });
        
        // Emergency stop tracking
        socket.on('emergencyStop', (rideId) => {
            trackingService.emergencyStop(rideId);
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

    // Store tracking service in io for access from other modules
    io.trackingService = trackingService;
    
    return io;
}



module.exports = { initSocket };