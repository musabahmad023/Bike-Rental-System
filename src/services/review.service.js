// Review service for handling bike reviews

// In-memory storage for reviews (in a real app, this would be a database)
let reviews = [
  {
    id: 1,
    bikeId: 1,
    userId: 1,
    rating: 4.5,
    comment: "Great bike, very comfortable for long rides.",
    userName: "John Doe",
    date: "2025-04-20"
  },
  {
    id: 2,
    bikeId: 2,
    userId: 2,
    rating: 5,
    comment: "Excellent mountain bike, handled rough terrain perfectly.",
    userName: "Jane Smith",
    date: "2025-04-15"
  }
];

// Get all reviews
const getAllReviews = () => {
  return [...reviews];
};

// Get reviews for a specific bike
const getReviewsByBikeId = (bikeId) => {
  return reviews.filter(review => review.bikeId === bikeId);
};

// Get reviews by a specific user
const getReviewsByUserId = (userId) => {
  return reviews.filter(review => review.userId === userId);
};

// Add a new review
const addReview = (review) => {
  const newReview = {
    id: reviews.length + 1,
    ...review,
    date: new Date().toISOString().split('T')[0]
  };
  reviews.push(newReview);
  return newReview;
};

// Delete a review
const deleteReview = (id) => {
  const index = reviews.findIndex(review => review.id === id);
  if (index !== -1) {
    const deletedReview = reviews[index];
    reviews = reviews.filter(review => review.id !== id);
    return deletedReview;
  }
  return null;
};

// Calculate average rating for a bike
const getAverageRating = (bikeId) => {
  const bikeReviews = getReviewsByBikeId(bikeId);
  if (bikeReviews.length === 0) {
    return 0;
  }
  const sum = bikeReviews.reduce((total, review) => total + review.rating, 0);
  return (sum / bikeReviews.length).toFixed(1);
};

const reviewService = {
  getAllReviews,
  getReviewsByBikeId,
  getReviewsByUserId,
  addReview,
  deleteReview,
  getAverageRating
};

export default reviewService;
