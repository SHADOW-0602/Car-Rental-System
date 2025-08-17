const express = require('express');
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Submit rating for completed ride
router.post('/ride/:rideId', auth, role(['user', 'driver']), ratingController.submitRating);

// Check if user can rate a ride
router.get('/ride/:rideId/can-rate', auth, role(['user', 'driver']), ratingController.canRate);

// Get ratings for a specific ride
router.get('/ride/:rideId', auth, role(['user', 'driver', 'admin']), ratingController.getRideRatings);

// Get current user's ratings and summary
router.get('/my-ratings', auth, role(['user', 'driver']), ratingController.getMyRatings);
router.get('/my-summary', auth, role(['user', 'driver']), ratingController.getMyRatingSummary);

// Public rating views
router.get('/user/:userId', ratingController.getUserRatings);
router.get('/user/:userId/summary', ratingController.getUserRatingSummary);

module.exports = router;