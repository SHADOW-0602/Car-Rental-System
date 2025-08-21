const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { initSocket } = require('./socket');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const SetupService = require('./services/setupService');
const { securityHeaders, sanitizeData, generalLimiter } = require('./middleware/security');

// Load environment variables
dotenv.config();

// Express app + Create an HTTP server for socket.io
const app = express();
const server = http.createServer(app);

// Security Middleware
app.use(securityHeaders);
app.use(sanitizeData);
app.use(generalLimiter);

// CORS Configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/setup', require('./routes/setupRoutes'));
app.use('/api/security', require('./routes/securityRoutes'));

// Global error handlers
process.on('uncaughtException', (err) => {
    logger.error('[Process] Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('[Process] Unhandled Rejection:', { reason, promise });
    process.exit(1);
});

// Initialize collections if they don't exist
const initializeCollections = async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const existingCollections = collections.map(col => col.name);
    
    const requiredCollections = ['users', 'drivers', 'admins', 'vehicles', 'rides', 'analytics', 'chats', 'invoices', 'ratings', 'payments'];
    
    for (const collectionName of requiredCollections) {
        if (!existingCollections.includes(collectionName)) {
            await mongoose.connection.db.createCollection(collectionName);
            console.log(`✅ Created collection: ${collectionName}`);
        }
    }
};

// Validate environment before starting
if (!SetupService.validateEnvironment()) {
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        logger.info('✅ MongoDB connected successfully');
        console.log('✅ MongoDB connected');
        await initializeCollections();
        await SetupService.initializeSystem();
    })
    .catch(err => {
        logger.error('❌ MongoDB connection error:', err);
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Initialize Socket.io for real-time communication
const io = initSocket(server);
require('./socket/chatSocket')(io);
const tripTracker = require('./socket/trackingSocket')(io);

// Make trip tracker available globally
app.set('tripTracker', tripTracker);

// Use global error handler
app.use(errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
    logger.warn(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'Route not found',
        errorCode: 'ROUTE_NOT_FOUND'
    });
});

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
    logger.info(`🚗 Car Rental API started on port ${PORT}`);
    console.log(`🚗 Car Rental API running on port ${PORT}`);
}).on('error', (err) => {
    logger.error('[Server] Failed to start:', err);
    process.exit(1);
});