import React, { useState } from 'react';
import reviewService from '../services/review.service';

const ReviewForm = ({ bikeId, userId, userName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReview = {
      bikeId,
      userId,
      userName,
      rating: parseFloat(rating),
      comment
    };
    reviewService.addReview(newReview);
    setSubmitted(true);
    setRating(5);
    setComment('');
    if (onReviewSubmitted) {
      onReviewSubmitted(newReview);
    }
  };

  return (
    <div className="review-form-container">
      <h3>Write a Review</h3>
      {submitted && (
        <div className="alert alert-success">
          Thanks for your review! It has been submitted successfully.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="rating">Rating:</label>
          <select id="rating" className="form-control" value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="5">5 Stars - Excellent</option>
            <option value="4">4 Stars - Very Good</option>
            <option value="3">3 Stars - Good</option>
            <option value="2">2 Stars - Fair</option>
            <option value="1">1 Star - Poor</option>
          </select>
        </div>
        <div className="form-group mb-3">
          <label htmlFor="comment">Your Review:</label>
          <textarea id="comment" className="form-control" rows="4" value={comment} onChange={(e) => setComment(e.target.value)} required placeholder="Share your experience with this bike..."></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Submit Review</button>
      </form>
    </div>
  );
};

export default ReviewForm;
