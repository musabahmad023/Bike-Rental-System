import React from 'react';

const ReviewsList = ({ reviews, onDeleteReview }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="reviews-list-empty">
        <p>No reviews yet. Be the first to review this bike!</p>
      </div>
    );
  }
  return (
    <div className="reviews-list">
      <h3>Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review.id} className="review-item card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <h5 className="card-title">{review.userName}</h5>
              <div className="review-rating">
                {Array.from({ length: 5 }).map((_, index) => (
                  <i key={index} className={`bi ${index < Math.floor(review.rating) ? 'bi-star-fill' : index < review.rating ? 'bi-star-half' : 'bi-star'}`} style={{ color: '#ffc107' }}></i>
                ))}
                <span className="ms-1">{review.rating}</span>
              </div>
            </div>
            <p className="card-text">{review.comment}</p>
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">{review.date}</div>
              {onDeleteReview && (
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDeleteReview(review.id)}>
                  <i className="bi bi-trash"></i> Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;
