import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import reviewService from '../services/review.service';

const BikeCard = ({ bike, onRent }) => {
  const { id, name, type, pricePerHour, pricePerDay, description, available, image } = bike;
  const avgRating = reviewService.getAverageRating(id);
  const reviewCount = reviewService.getReviewsByBikeId(id).length;

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {available ? 'Available' : 'Rented Out'}
          </span>
        </div>
        
        <div className="flex items-center mb-2">
          {Array(5).fill(0).map((_, i) => (
            <span key={i} className={`text-${i < Math.floor(avgRating) ? 'yellow' : 'gray'}-400`}>
              ★
            </span>
          ))}
          <span className="text-sm text-gray-600 ml-1">{avgRating} ({reviewCount})</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{type}</span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-500 text-xs">Hourly Rate</p>
            <p className="text-lg font-bold text-indigo-600">${pricePerHour}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Daily Rate</p>
            <p className="text-lg font-bold text-indigo-600">${pricePerDay}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/bikes/${id}`} className="btn btn-outline-secondary flex-grow">
            View Details
          </Link>
          <button 
            className="btn btn-primary flex-grow"
            onClick={() => available && onRent(id)}
            disabled={!available}
          >
            {available ? 'Rent Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BikeCard;
