import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BikeService from '../services/bike.service';
import { useAuth } from '../context/AuthContext';
import ReceiptModal from './ReceiptModal';

const BikeCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [availableBikes, setAvailableBikes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [rentalMessage, setRentalMessage] = useState({ show: false, text: '', type: '' });
  const { currentUser } = useAuth();
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);

  // Initialize bikes data from BikeService
  useEffect(() => {
    const fetchBikes = () => {
      try {
        const bikes = BikeService.getAllBikes();
        setAvailableBikes(bikes);
        setSearchResults(bikes);
      } catch (error) {
        console.error("Failed to fetch bikes:", error);
      }
    };

    fetchBikes();

    // Set up event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'bikeRentalBikes') {
        fetchBikes();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle search query changes
  useEffect(() => {
    filterBikes();
  }, [searchQuery, activeFilter, priceRange, availableBikes]);

  // Filter bikes based on search query, type filter, and price range
  const filterBikes = () => {
    const filtered = availableBikes.filter(bike => {
      const matchesSearch = 
        bike.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        bike.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = activeFilter === 'all' || bike.type === activeFilter;

      const matchesPriceRange = bike.pricePerDay >= priceRange[0] && bike.pricePerDay <= priceRange[1] * 2;

      return matchesSearch && matchesType && matchesPriceRange;
    });

    setSearchResults(filtered);
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setPriceRange([0, 50]);
  };

  // Open receipt modal instead of renting directly
  const handleRentBike = (bikeId) => {
    if (!currentUser) {
      setRentalMessage({
        show: true,
        text: 'Please log in to rent a bike',
        type: 'error'
      });
      return;
    }
    const bike = availableBikes.find(b => b.id === bikeId);
    setSelectedBike(bike);
    setShowReceipt(true);
  };

  // Complete rental after payment
  const completeRentalAfterPayment = () => {
    try {
      const userId = currentUser.email;
      BikeService.rentBike(selectedBike.id, userId);
      const updatedBikes = BikeService.getAllBikes();
      setAvailableBikes(updatedBikes);
      filterBikes();
      window.dispatchEvent(new CustomEvent('bikeRentalUpdated'));
      setRentalMessage({
        show: true,
        text: 'Bike rented successfully! Check your dashboard for details.',
        type: 'success'
      });
      setTimeout(() => setRentalMessage({ show: false, text: '', type: '' }), 5000);
    } catch (error) {
      setRentalMessage({
        show: true,
        text: `Failed to rent bike: ${error.message}`,
        type: 'error'
      });
      setTimeout(() => setRentalMessage({ show: false, text: '', type: '' }), 5000);
    }
  };

  // Bike type filters
  const bikeTypes = ['all', 'Mountain', 'City', 'Road', 'Electric', 'Kids', 'Specialty'];

  return (
    <div className="pt-20 p-6 bg-gray-50 max-w-7xl mx-auto mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Bike Catalog</h1>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search bikes..."
            className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Rental Message */}
      {rentalMessage.show && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-4 rounded-lg ${
            rentalMessage.type === 'success' 
              ? 'bg-green-100 border-green-200 text-green-800' 
              : 'bg-red-100 border-red-200 text-red-800'
          }`}
        >
          {rentalMessage.text}
        </motion.div>
      )}

      {/* Search info and quick tips */}
      {searchQuery && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-700">
            Searching for: <span className="font-medium">"{searchQuery}"</span>
            {searchResults.length === 0 && (
              <span> - No results found. Try different keywords or <button onClick={resetFilters} className="text-indigo-600 font-medium hover:underline">reset filters</button>.</span>
            )}
          </p>
        </div>
      )}

      {/* Filters section */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Bike Type</h3>
            <div className="flex flex-wrap gap-2">
              {bikeTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === type 
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200 border' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent border'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Daily Price Range (${priceRange[0]} - ${priceRange[1] * 2})</h3>
            <input
              type="range"
              min="0"
              max="50"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          
          <div className="w-full md:w-auto flex items-end">
            <button 
              onClick={resetFilters}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bike Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.length > 0 ? (
          searchResults.map(bike => (
            <motion.div
              key={bike.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={bike.image} 
                  alt={bike.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {!bike.available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Currently Rented
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{bike.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bike.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {bike.available ? 'Available' : 'Rented'}
                  </span>
                </div>
                
                <p className="text-sm font-medium text-indigo-600 mb-2">{bike.type}</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{bike.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Hourly Rate</p>
                    <p className="text-lg font-bold text-gray-800">${bike.pricePerHour.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Daily Rate</p>
                    <p className="text-lg font-bold text-gray-800">${bike.pricePerDay.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <div className="flex items-center">
                      <span className="text-md font-bold text-gray-800 mr-1">{bike.rating.toFixed(1)}</span>
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRentBike(bike.id)}
                  disabled={!bike.available}
                  className={`w-full py-2 rounded-lg font-medium ${
                    bike.available
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {bike.available ? 'Rent Now' : 'Currently Unavailable'}
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No bikes found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-indigo-600 font-medium border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors duration-200"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Receipt Modal for Payment Flow */}
      <ReceiptModal
        show={showReceipt}
        bike={selectedBike}
        onClose={() => setShowReceipt(false)}
        onPay={completeRentalAfterPayment}
      />
    </div>
  );
};

export default BikeCatalog;
