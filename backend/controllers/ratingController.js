const RatingService = require('../services/ratingService');

const ratingService = new RatingService();

// Submit rating for completed ride
exports.submitRating = async (req, res) => {
    try {
        const { rideId } = req.params;
        const { rating, comment, categories } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }

        const ratingData = { rating, comment, categories };
        const result = await ratingService.submitRating(rideId, req.user.id, ratingData);

        res.json({
            success: true,
            message: 'Rating submitted successfully',
            rating: result
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get ratings for current user
exports.getMyRatings = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userType = req.user.role === 'driver' ? 'driver' : 'user';
        
        const result = await ratingService.getRatings(req.user.id, userType, parseInt(page), parseInt(limit));
        
        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get rating summary for current user
exports.getMyRatingSummary = async (req, res) => {
    try {
        const userType = req.user.role === 'driver' ? 'driver' : 'user';
        const summary = await ratingService.getRatingSummary(req.user.id, userType);
        
        res.json({
            success: true,
            summary
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Check if user can rate a ride
exports.canRate = async (req, res) => {
    try {
        const { rideId } = req.params;
        const result = await ratingService.canRate(rideId, req.user.id);
        
        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get ratings for a specific ride
exports.getRideRatings = async (req, res) => {
    try {
        const { rideId } = req.params;
        const ratings = await ratingService.getRideRatings(rideId);
        
        res.json({
            success: true,
            ratings
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get ratings for specific user/driver (public view)
exports.getUserRatings = async (req, res) => {
    try {
        const { userId } = req.params;
        const { userType, page = 1, limit = 5 } = req.query;
        
        if (!['user', 'driver'].includes(userType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user type'
            });
        }
        
        const result = await ratingService.getRatings(userId, userType, parseInt(page), parseInt(limit));
        
        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get rating summary for specific user/driver (public view)
exports.getUserRatingSummary = async (req, res) => {
    try {
        const { userId } = req.params;
        const { userType } = req.query;
        
        if (!['user', 'driver'].includes(userType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user type'
            });
        }
        
        const summary = await ratingService.getRatingSummary(userId, userType);
        
        res.json({
            success: true,
            summary
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get driver dashboard statistics
exports.getDriverStats = async (req, res) => {
    try {
        const stats = await ratingService.getDriverDashboardStats(req.user.id);
        
        res.json({
            success: true,
            stats
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};