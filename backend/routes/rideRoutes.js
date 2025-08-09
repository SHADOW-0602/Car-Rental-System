const express = require('express');
const rideController = require('../controllers/rideController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Request a ride (user)
router.post('/request', auth, role(['user']), rideController.requestRide);

// Update ride status (driver or admin)
router.put('/:id/status', auth, role(['driver', 'admin']), rideController.updateRideStatus);

// Get rides for user or driver
router.get('/mine', auth, role(['user', 'driver']), rideController.getUserRides); // as user
router.get('/driver', auth, role(['driver']), rideController.getDriverRides);

module.exports = router;