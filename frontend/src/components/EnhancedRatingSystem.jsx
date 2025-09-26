import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const EnhancedRatingSystem = ({ ride, userType, onComplete }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [categories, setCategories] = useState({});
    const [selectedCompliments, setSelectedCompliments] = useState([]);
    const [tip, setTip] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [complimentOptions, setComplimentOptions] = useState([]);

    const categoryLabels = {
        driver: {
            punctuality: 'On time',
            driving_skill: 'Driving skill',
            vehicle_condition: 'Vehicle condition',
            behavior: 'Behavior'
        },
        user: {
            politeness: 'Politeness',
            punctuality: 'On time',
            cleanliness: 'Cleanliness',
            payment: 'Payment'
        }
    };

    const tipOptions = [0, 10, 20, 30, 50];

    useEffect(() => {
        loadComplimentOptions();
    }, []);

    const loadComplimentOptions = async () => {
        try {
            // In a real app, this would be an API call
            const options = {
                driver: [
                    'Great driving', 'Friendly', 'Clean car', 'On time',
                    'Safe driver', 'Good music', 'Helpful', 'Professional'
                ],
                user: [
                    'Polite', 'On time', 'Easy to find', 'Respectful',
                    'Clean', 'Good conversation', 'Quiet', 'Friendly'
                ]
            };
            
            const targetType = userType === 'user' ? 'driver' : 'user';
            setComplimentOptions(options[targetType] || []);
        } catch (err) {
            console.error('Failed to load compliment options:', err);
        }
    };

    const handleStarClick = (starRating) => {
        setRating(starRating);
        
        // Initialize category ratings based on overall rating
        const targetType = userType === 'user' ? 'driver' : 'user';
        const categoryKeys = Object.keys(categoryLabels[targetType] || {});
        const initialCategories = {};
        
        categoryKeys.forEach(key => {
            initialCategories[key] = starRating;
        });
        
        setCategories(initialCategories);
    };

    const handleCategoryRating = (category, categoryRating) => {
        setCategories(prev => ({
            ...prev,
            [category]: categoryRating
        }));
    };

    const handleComplimentToggle = (compliment) => {
        setSelectedCompliments(prev => 
            prev.includes(compliment)
                ? prev.filter(c => c !== compliment)
                : [...prev, compliment]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const ratingData = {
                rating,
                feedback: feedback.trim(),
                categories,
                compliments: selectedCompliments,
                tip: userType === 'user' ? tip : 0
            };

            await api.post(`/rides/${ride._id}/rate`, ratingData);
            
            if (onComplete) {
                onComplete({
                    success: true,
                    rating,
                    tip,
                    message: 'Thank you for your feedback!'
                });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    const getRatingText = (stars) => {
        const texts = {
            1: 'Terrible',
            2: 'Bad',
            3: 'Okay',
            4: 'Good',
            5: 'Excellent'
        };
        return texts[stars] || '';
    };

    const getRatingColor = (stars) => {
        if (stars <= 2) return 'text-red-500';
        if (stars === 3) return 'text-yellow-500';
        return 'text-green-500';
    };

    const renderStarRating = (currentRating, onRate, size = 'large') => {
        const starSize = size === 'large' ? 'text-4xl' : 'text-xl';
        
        return (
            <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                        key={star}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRate(star)}
                        onMouseEnter={() => size === 'large' && setHoverRating(star)}
                        onMouseLeave={() => size === 'large' && setHoverRating(0)}
                        className={`${starSize} ${
                            star <= (hoverRating || currentRating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                    >
                        ⭐
                    </motion.button>
                ))}
            </div>
        );
    };

    const renderCategoryRatings = () => {
        const targetType = userType === 'user' ? 'driver' : 'user';
        const categoryKeys = Object.keys(categoryLabels[targetType] || {});
        
        if (categoryKeys.length === 0) return null;

        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Rate specific aspects:</h3>
                {categoryKeys.map((category) => (
                    <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            {categoryLabels[targetType][category]}
                        </span>
                        {renderStarRating(
                            categories[category] || 0,
                            (rating) => handleCategoryRating(category, rating),
                            'small'
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderCompliments = () => {
        if (complimentOptions.length === 0) return null;

        return (
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Add compliments (optional):</h3>
                <div className="flex flex-wrap gap-2">
                    {complimentOptions.map((compliment) => (
                        <motion.button
                            key={compliment}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleComplimentToggle(compliment)}
                            className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                                selectedCompliments.includes(compliment)
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {compliment}
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    };

    const renderTipSection = () => {
        if (userType !== 'user') return null;

        return (
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Add a tip (optional):</h3>
                <div className="flex space-x-2">
                    {tipOptions.map((tipAmount) => (
                        <motion.button
                            key={tipAmount}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setTip(tipAmount)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                tip === tipAmount
                                    ? 'bg-green-100 border-green-300 text-green-700'
                                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {tipAmount === 0 ? 'No tip' : `₹${tipAmount}`}
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    };

    const getTargetName = () => {
        if (userType === 'user') {
            return ride.driver_info?.name || 'your driver';
        } else {
            return ride.user_id?.name || 'the passenger';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6"
        >
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Rate {getTargetName()}
                </h2>
                <p className="text-gray-600">
                    How was your {userType === 'user' ? 'ride' : 'passenger'}?
                </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
                    >
                        <div className="flex items-center space-x-2">
                            <span className="text-red-600">⚠️</span>
                            <span className="text-red-800 text-sm">{error}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Star Rating */}
            <div className="text-center mb-6">
                {renderStarRating(rating, handleStarClick)}
                <AnimatePresence>
                    {(rating > 0 || hoverRating > 0) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`mt-2 text-lg font-semibold ${getRatingColor(hoverRating || rating)}`}
                        >
                            {getRatingText(hoverRating || rating)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Category Ratings */}
            {rating > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6"
                >
                    {renderCategoryRatings()}
                </motion.div>
            )}

            {/* Feedback Text */}
            {rating > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6"
                >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional feedback (optional):
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder={`Tell us more about your experience with ${getTargetName()}...`}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        {feedback.length}/500 characters
                    </div>
                </motion.div>
            )}

            {/* Compliments */}
            {rating >= 4 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6"
                >
                    {renderCompliments()}
                </motion.div>
            )}

            {/* Tip Section */}
            {rating >= 4 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6"
                >
                    {renderTipSection()}
                </motion.div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={loading || rating === 0}
                className="w-full bg-black text-white py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
                {loading ? 'Submitting...' : 'Submit rating'}
            </button>

            {/* Skip Option */}
            <div className="text-center mt-4">
                <button
                    onClick={() => onComplete && onComplete({ success: false, skipped: true })}
                    className="text-gray-500 text-sm hover:text-gray-700"
                >
                    Skip for now
                </button>
            </div>
        </motion.div>
    );
};

export default EnhancedRatingSystem;