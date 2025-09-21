import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import config from '../config';

export default function RatingSystem({ rideId, userRole, onRatingComplete }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${config.API_BASE_URL}/ratings`,
        {
          ride_id: rideId,
          rating: rating,
          feedback: feedback,
          rated_by: userRole
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSubmitted(true);
      if (onRatingComplete) {
        onRatingComplete();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rating-system submitted">
        <div className="success-icon">✅</div>
        <h3>Thank you for your feedback!</h3>
        <p>Your rating has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="rating-system">
      <h3>Rate your {userRole === 'user' ? 'Driver' : 'Passenger'}</h3>
      
      <form onSubmit={handleRatingSubmit}>
        {/* Star Rating */}
        <div className="star-rating">
          <div className="rating-label">
            How was your {userRole === 'user' ? 'ride' : 'passenger'}?
          </div>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${star <= rating ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                disabled={submitting}
              >
                ⭐
              </button>
            ))}
          </div>
          <div className="rating-text">
            {rating === 0 && 'Select a rating'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </div>
        </div>

        {/* Feedback Text */}
        <div className="feedback-section">
          <label htmlFor="feedback" className="feedback-label">
            Additional feedback (optional)
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={`Tell us about your experience with this ${userRole === 'user' ? 'driver' : 'passenger'}...`}
            className="feedback-textarea"
            rows="4"
            disabled={submitting}
          />
        </div>

        {/* Quick Feedback Tags */}
        <div className="feedback-tags">
          <div className="tags-label">Quick feedback:</div>
          <div className="tags">
            {(userRole === 'user' ? [
              'Professional driver',
              'Safe driving',
              'Clean vehicle',
              'Good communication',
              'On time',
              'Friendly'
            ] : [
              'Polite passenger',
              'Clear instructions',
              'Ready on time',
              'Good communication',
              'Respectful',
              'Easy pickup'
            ]).map((tag) => (
              <button
                key={tag}
                type="button"
                className={`feedback-tag ${feedback.includes(tag) ? 'selected' : ''}`}
                onClick={() => {
                  if (feedback.includes(tag)) {
                    setFeedback(feedback.replace(tag + ', ', '').replace(tag, ''));
                  } else {
                    setFeedback(feedback + (feedback ? ', ' : '') + tag);
                  }
                }}
                disabled={submitting}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="rating-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={rating === 0 || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </form>
    </div>
  );
}

RatingSystem.propTypes = {
  rideId: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
  onRatingComplete: PropTypes.func
};
