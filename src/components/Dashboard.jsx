import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import BikeService from '../services/bike.service';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [upcomingRentals, setUpcomingRentals] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [completedRentals, setCompletedRentals] = useState([]);

  // Fetch user data and rental history
  // Always fetch the latest rental data from BikeService
  const updateRentalData = () => {
    if (currentUser) {
      try {
        const allRentals = JSON.parse(localStorage.getItem('bikeRentalHistory') || '[]');
        // Match if rental.userId or rental.userEmail matches currentUser.id or currentUser.email
        const rentals = allRentals.filter(
          r => (
            (r.userId && (r.userId === currentUser.id || r.userId === currentUser.email)) ||
            (r.userEmail && (r.userEmail === currentUser.id || r.userEmail === currentUser.email))
          )
        );
        if (rentals.length === 0) {
          console.log('No rentals found for user:', currentUser.id, currentUser.email, allRentals);
        }
        const processedRentals = rentals.map(rental => {
          const bike = BikeService.getBikeById(rental.bikeId);
          return {
            id: rental.id,
            bikeName: bike ? bike.name : `Bike #${rental.bikeId}`,
            bikeType: bike ? bike.type : 'Unknown',
            startDate: rental.startDate,
            endDate: rental.endDate || null,
            duration: rental.duration || calculateDuration(rental.startDate, rental.endDate),
            totalCost: rental.totalAmount || (bike ? calculateCost(bike, rental) : 0),
            status: rental.status,
            rating: rental.rating || null
          };
        });
        setRentalHistory(processedRentals);
        setActiveRentals(processedRentals.filter(rental => rental.status === 'active'));
        setCompletedRentals(processedRentals.filter(rental => rental.status === 'completed'));
      } catch (error) {
        setRentalHistory([]);
        setActiveRentals([]);
        setCompletedRentals([]);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      setUserData({
        name: currentUser.name || 'User',
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || '',
        memberSince: new Date(currentUser.createdAt || Date.now()).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long'
        }),
        address: currentUser.address || '',
        paymentMethods: [
          { id: 1, type: 'credit', last4: '****', expiry: '**/**', default: true }
        ]
      });
      updateRentalData();
    }
  }, [currentUser]);

  // Set up storage event listener to update when rentals change
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bikeRentalHistory' && currentUser) {
        updateRentalData();
      }
    };
    // Add listener for custom event from BikeCatalog component
    const handleRentalUpdate = () => {
      updateRentalData();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bikeRentalUpdated', handleRentalUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bikeRentalUpdated', handleRentalUpdate);
    };
  }, [currentUser]);

  // Helper function to calculate rental duration
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hours = Math.round((end - start) / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days} day${days !== 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}` : ''}`;
    }
  };

  // Helper function to calculate rental cost
  const calculateCost = (bike, rental) => {
    if (!bike || !rental.startDate) return 0;
    
    const start = new Date(rental.startDate);
    const end = rental.endDate ? new Date(rental.endDate) : new Date();
    const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
    
    if (hours <= 24) {
      return hours * bike.pricePerHour;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return (days * bike.pricePerDay) + (remainingHours * bike.pricePerHour);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Render stars for ratings
  const renderStars = (rating) => {
    if (!rating) return 'Not rated';
    
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
    ));
  };

  // Handler to finish a rental
  const handleFinishRental = (rentalId) => {
    // Update rental status in localStorage
    const allRentals = JSON.parse(localStorage.getItem('bikeRentalHistory') || '[]');
    const updatedAllRentals = allRentals.map(rental =>
      rental.id === rentalId ? { ...rental, status: 'completed', endDate: new Date().toISOString() } : rental
    );
    localStorage.setItem('bikeRentalHistory', JSON.stringify(updatedAllRentals));
    // Optionally update bike status here if needed
    // Refresh dashboard from storage
    updateRentalData();
    // Optionally, trigger a custom event for other listeners
    window.dispatchEvent(new CustomEvent('bikeRentalUpdated'));
  };

  // If user data is not loaded yet, show loading state
  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
        <div className="mt-4 md:mt-0">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Book a New Bike
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with user profile */}
        <div className="lg:col-span-1">
          <motion.div 
            className="bg-white rounded-xl shadow-sm overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 text-center border-b">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 bg-gray-200 flex items-center justify-center">
                {currentUser?.profilePicture ? (
                  <img 
                    src={currentUser.profilePicture} 
                    alt={userData.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-400">
                    {userData.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold">{userData.name}</h2>
              <p className="text-gray-500 text-sm">Member since {userData.memberSince}</p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'overview' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Dashboard Overview
                </button>
                <button 
                  onClick={() => setActiveTab('rentals')}
                  className={`text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'rentals' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Rental History
                </button>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'profile' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Profile Settings
                </button>
                <button 
                  onClick={() => setActiveTab('payment')}
                  className={`text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'payment' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Payment Methods
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-3">
          {activeTab === 'overview' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Active Rentals</p>
                      <p className="text-3xl font-bold text-indigo-600">{activeRentals.length}</p>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Total Rentals</p>
                      <p className="text-3xl font-bold text-purple-600">{rentalHistory.length}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Active rentals */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Active Rentals</h2>
                {activeRentals.length > 0 ? (
                  <div className="space-y-4">
                    {activeRentals.map(rental => (
                      <div key={rental.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{rental.bikeName}</h3>
                          <p className="text-sm text-gray-500">{rental.bikeType} Bike</p>
                          <div className="text-xs text-gray-500 mt-1">
                            Return by: {formatDate(rental.endDate)}
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Active
                          </span>
                          <button
                            className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                            onClick={() => handleFinishRental(rental.id)}
                          >
                            Mark as Finished
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No active rentals at the moment.</p>
                )}
              </div>
              
              {/* Upcoming rentals */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Upcoming Rentals</h2>
                {upcomingRentals.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingRentals.map(rental => (
                      <div key={rental.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{rental.bikeName}</h3>
                          <p className="text-sm text-gray-500">{rental.bikeType} Bike</p>
                          <div className="text-xs text-gray-500 mt-1">
                            Pickup: {formatDate(rental.startDate)}
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Upcoming
                          </span>
                          <button className="text-xs text-red-600 hover:text-red-800">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No upcoming rentals scheduled.</p>
                )}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'rentals' && (
            <motion.div 
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Rental History</h2>
                <p className="text-gray-500">View all your past and upcoming bike rentals</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rental ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bike
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rentalHistory.map(rental => (
                      <tr key={rental.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rental.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <p className="font-medium text-gray-900">{rental.bikeName}</p>
                            <p className="text-xs">{rental.bikeType}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(rental.startDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rental.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${rental.totalCost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            rental.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            rental.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rental.status === 'completed' ? (
                            <div className="flex">
                              {renderStars(rental.rating)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'profile' && (
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      defaultValue={userData.name}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      defaultValue={userData.email}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      defaultValue={userData.phone}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      defaultValue={userData.address}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                      <img 
                        src={userData.profileImage} 
                        alt={userData.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button type="button" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Change Photo
                    </button>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          
          {activeTab === 'payment' && (
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-6">Payment Methods</h2>
              
              <div className="space-y-4 mb-6">
                {userData.paymentMethods.map(method => (
                  <div key={method.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex items-center">
                      {method.type === 'credit' ? (
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full mr-4">
                          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 rounded-full mr-4">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {method.type === 'credit' ? `Credit Card ending in ${method.last4}` : `PayPal (${method.email})`}
                        </p>
                        {method.type === 'credit' && (
                          <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.default && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Default
                        </span>
                      )}
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="flex items-center text-indigo-600 hover:text-indigo-800">
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Payment Method
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
