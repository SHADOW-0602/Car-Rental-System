const Rating = require('../models/Rating');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');

class RatingService {
    // Submit rating for completed ride
    async submitRating(rideId, raterId, ratingData) {
        try {
            const ride = await Ride.findById(rideId);
            if (!ride || ride.status !== 'completed') {
                throw new Error('Ride not found or not completed');
            }

            // Determine rater and rated types
            const isRaterUser = ride.user_id.toString() === raterId;
            const isRaterDriver = ride.driver_id.toString() === raterId;

            if (!isRaterUser && !isRaterDriver) {
                throw new Error('You are not authorized to rate this ride');
            }

            const raterType = isRaterUser ? 'user' : 'driver';
            const ratedType = isRaterUser ? 'driver' : 'user';
            const ratedId = isRaterUser ? ride.driver_id : ride.user_id;

            // Check if rating already exists
            const existingRating = await Rating.findOne({ ride_id: rideId, rater_id: raterId });
            if (existingRating) {
                throw new Error('You have already rated this ride');
            }

            // Create rating
            const rating = new Rating({
                ride_id: rideId,
                rater_id: raterId,
                rated_id: ratedId,
                rater_type: raterType,
                rated_type: ratedType,
                rating: ratingData.rating,
                comment: ratingData.comment,
                categories: ratingData.categories
            });

            await rating.save();

            // Update average rating
            await this.updateAverageRating(ratedId, ratedType);

            return rating;
        } catch (error) {
            throw new Error(`Rating submission failed: ${error.message}`);
        }
    }

    // Update average rating for user or driver
    async updateAverageRating(userId, userType) {
        const ratings = await Rating.find({ 
            rated_id: userId,
            rated_type: userType 
        });

        if (ratings.length === 0) return;

        const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = Math.round((totalRating / ratings.length) * 10) / 10;

        const Model = userType === 'driver' ? Driver : User;
        await Model.findByIdAndUpdate(userId, { rating: averageRating });
    }

    // Get ratings for a user/driver
    async getRatings(userId, userType, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        const ratings = await Rating.find({ 
            rated_id: userId,
            rated_type: userType 
        })
        .populate('rater_id', 'name')
        .populate('ride_id', 'pickup_location drop_location createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const total = await Rating.countDocuments({ 
            rated_id: userId,
            rated_type: userType 
        });

        return {
            ratings: ratings.map(r => ({
                rating: r.rating,
                comment: r.comment,
                categories: r.categories,
                rater_name: r.rater_id.name,
                ride_date: r.ride_id.createdAt,
                pickup: r.ride_id.pickup_location?.address,
                drop: r.ride_id.drop_location?.address,
                created_at: r.createdAt
            })),
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_ratings: total
            }
        };
    }

    // Get rating summary for user/driver
    async getRatingSummary(userId, userType) {
        const ratings = await Rating.find({ 
            rated_id: userId,
            rated_type: userType 
        });

        if (ratings.length === 0) {
            return {
                average_rating: 0,
                total_ratings: 0,
                rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                category_averages: {}
            };
        }

        // Calculate distribution
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        ratings.forEach(r => distribution[r.rating]++);

        // Calculate category averages
        const categoryTotals = { punctuality: 0, behavior: 0, cleanliness: 0, communication: 0 };
        const categoryCounts = { punctuality: 0, behavior: 0, cleanliness: 0, communication: 0 };

        ratings.forEach(r => {
            if (r.categories) {
                Object.keys(categoryTotals).forEach(cat => {
                    if (r.categories[cat]) {
                        categoryTotals[cat] += r.categories[cat];
                        categoryCounts[cat]++;
                    }
                });
            }
        });

        const categoryAverages = {};
        Object.keys(categoryTotals).forEach(cat => {
            categoryAverages[cat] = categoryCounts[cat] > 0 
                ? Math.round((categoryTotals[cat] / categoryCounts[cat]) * 10) / 10 
                : 0;
        });

        const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = Math.round((totalRating / ratings.length) * 10) / 10;

        return {
            average_rating: averageRating,
            total_ratings: ratings.length,
            rating_distribution: distribution,
            category_averages: categoryAverages
        };
    }

    // Check if user can rate a ride
    async canRate(rideId, userId) {
        const ride = await Ride.findById(rideId);
        if (!ride || ride.status !== 'completed') {
            return { canRate: false, reason: 'Ride not completed' };
        }

        const isParticipant = ride.user_id.toString() === userId || ride.driver_id.toString() === userId;
        if (!isParticipant) {
            return { canRate: false, reason: 'Not authorized' };
        }

        const existingRating = await Rating.findOne({ ride_id: rideId, rater_id: userId });
        if (existingRating) {
            return { canRate: false, reason: 'Already rated' };
        }

        return { canRate: true };
    }

    // Get mutual ratings for a ride
    async getRideRatings(rideId) {
        const ratings = await Rating.find({ ride_id: rideId })
            .populate('rater_id', 'name')
            .populate('rated_id', 'name');

        return ratings.map(r => ({
            rater: { id: r.rater_id._id, name: r.rater_id.name, type: r.rater_type },
            rated: { id: r.rated_id._id, name: r.rated_id.name, type: r.rated_type },
            rating: r.rating,
            comment: r.comment,
            categories: r.categories,
            created_at: r.createdAt
        }));
    }
}

module.exports = RatingService;