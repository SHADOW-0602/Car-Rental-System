const express = require('express');
const rideController = require('../controllers/rideController');
const auth =require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Request a ride (user)
router.post('/request', auth, role(['user']), rideController.requestRide);

// Find nearby drivers
router.get('/nearby-drivers', auth, role(['user']), rideController.findNearbyDrivers);

// Find drivers in zone
router.get('/zone-drivers', auth, role(['user']), rideController.findDriversInZone);

// Calculate fare estimate
router.post('/calculate-fare', auth, role(['user']), rideController.calculateFare);

// Get distance matrix
router.post('/distance-matrix', auth, role(['user', 'admin']), rideController.getDistanceMatrix);

// Trip tracking
router.post('/:rideId/start', auth, role(['driver']), rideController.startTrip);
router.get('/:rideId/status', auth, role(['user', 'driver']), rideController.getTripStatus);

// Confirm a ride with a driver
router.post('/confirm', auth, role(['user']), rideController.confirmRide);

// Cancel a ride
router.put('/:id/cancel', auth, role(['user', 'driver']), rideController.cancelRide);

// Update ride status (driver or admin)
router.put('/:id/status', auth, role(['driver', 'admin']), rideController.updateRideStatus);

// Get rides for user or driver
router.get('/mine', auth, role(['user', 'driver']), rideController.getUserRides); // as user
router.get('/driver', auth, role(['driver']), rideController.getDriverRides);

module.exports = router;