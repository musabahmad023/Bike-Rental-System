import React, { useState } from 'react';
import reviewService from '../services/review.service';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import { useAuth } from '../context/AuthContext';

const AllReviews = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState(reviewService.getAllReviews());

  const handleReviewSubmitted = (newReview) => {
    setReviews([...reviews, newReview]);
  };

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">All Bike Reviews</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <ReviewsList reviews={reviews} />
        </div>
        <div>
          {currentUser ? (
            <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
          ) : (
            <div className="alert alert-info">Please log in to add a review.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllReviews;
