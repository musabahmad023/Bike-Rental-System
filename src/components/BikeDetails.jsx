import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bikeService from '../services/bike.service';
import reviewService from '../services/review.service';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';

const BikeDetails = ({ currentUser }) => {
  const { bikeId } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bikeId) {
      navigate('/catalog');
      return;
    }
    const fetchData = () => {
      const bikeData = bikeService.getBikeById(parseInt(bikeId));
      if (!bikeData) {
        navigate('/catalog');
        return;
      }
      setBike(bikeData);
      setReviews(reviewService.getReviewsByBikeId(parseInt(bikeId)));
      setLoading(false);
    };
    fetchData();
  }, [bikeId, navigate]);

  const handleReviewSubmitted = (newReview) => {
    setReviews([...reviews, newReview]);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!bike) return <div className="error">Bike not found</div>;

  const avgRating = reviewService.getAverageRating(bike.id);

  return (
    <div className="bike-details container mt-4">
      <div className="row">
        <div className="col-md-6">
          <img src={bike.imageUrl || 'https://via.placeholder.com/400x300?text=Bike+Image'} alt={bike.name} className="img-fluid rounded" />
        </div>
        <div className="col-md-6">
          <h2>{bike.name}</h2>
          <div className="bike-rating mb-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <i key={index} className={`bi ${index < Math.floor(avgRating) ? 'bi-star-fill' : index < avgRating ? 'bi-star-half' : 'bi-star'}`} style={{ color: '#ffc107' }}></i>
            ))}
            <span className="ms-2">{avgRating} ({reviews.length} reviews)</span>
          </div>
          <p className="bike-type badge bg-secondary mb-3">{bike.type}</p>
          <div className="bike-availability mb-3">
            <span className={`badge ${bike.available ? 'bg-success' : 'bg-danger'}`}>{bike.available ? 'Available' : 'Not Available'}</span>
          </div>
          <div className="bike-price mb-3">
            <h4>${bike.hourlyRate}/hour | ${bike.dailyRate}/day</h4>
          </div>
          <div className="bike-description mb-4">
            <h5>Description</h5>
            <p>{bike.description}</p>
          </div>
          {bike.available && <button className="btn btn-primary btn-lg">Rent Now</button>}
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12">
          <h3>Reviews</h3>
          <hr />
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <ReviewsList reviews={reviews} />
        </div>
        <div className="col-md-6">
          {currentUser ? (
            <ReviewForm bikeId={parseInt(bikeId)} userId={currentUser.id} userName={currentUser.name} onReviewSubmitted={handleReviewSubmitted} />
          ) : (
            <div className="alert alert-info">Please <a href="/login">log in</a> to leave a review.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BikeDetails;
