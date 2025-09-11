const express = require('express');
const rideController = require('../controllers/rideController');
const auth =require('../middleware/auth');
const role = require('../middleware/role');
const { checkDriverSuspensionForRides } = require('../middleware/suspensionCheck');

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
router.post('/:rideId/start', auth, role(['driver']), checkDriverSuspensionForRides, rideController.startTrip);
router.get('/:rideId/status', auth, role(['user', 'driver']), rideController.getTripStatus);



// Cancel a ride
router.put('/:id/cancel', auth, role(['user', 'driver']), checkDriverSuspensionForRides, rideController.cancelRide);

// Update ride status (driver or admin)
router.put('/:id/status', auth, role(['driver', 'admin']), checkDriverSuspensionForRides, rideController.updateRideStatus);

// Get rides for user or driver
router.get('/mine', auth, role(['user', 'driver', 'admin']), rideController.getUserRides); // as user
router.get('/driver', auth, role(['driver']), checkDriverSuspensionForRides, rideController.getDriverRides);

// Get ride requests for drivers
router.get('/requests', auth, role(['driver']), checkDriverSuspensionForRides, rideController.getRideRequests);

// Accept a ride request
router.put('/:id/accept', auth, role(['driver']), checkDriverSuspensionForRides, rideController.acceptRideRequest);

// Get active trips for admin monitoring
router.get('/active-trips', auth, role(['admin']), rideController.getActiveTrips);

// Complete ride (driver only)
router.put('/:id/complete', auth, role(['driver']), checkDriverSuspensionForRides, rideController.completeRide);

module.exports = router;