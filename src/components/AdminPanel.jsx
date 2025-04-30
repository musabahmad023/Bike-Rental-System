import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BikeService from '../services/bike.service';
import reviewService from '../services/review.service';
import ReviewsList from './ReviewsList';
import UserServiceLocal from '../services/user.service.local';

// UserManagement component for admin tab
const UserManagement = () => {
  const [users, setUsers] = React.useState([]);
  const [refresh, setRefresh] = React.useState(0);

  React.useEffect(() => {
    // Only show customers
    setUsers(UserServiceLocal.getAllUsers().filter(u => u.role === 'customer'));
  }, [refresh]);

  const handleRemoveUser = (userIdOrEmail) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      UserServiceLocal.deleteUser(userIdOrEmail);
      setRefresh(r => r + 1);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active Rentals</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Rentals</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(user => {
            // Get stats for both id and email, sum them (covers all cases)
            const statsById = UserServiceLocal.getUserRentalStats(user.id);
            const statsByEmail = UserServiceLocal.getUserRentalStats(user.email);
            const stats = {
              active: (statsById.active || 0) + (statsByEmail.active || 0),
              total: (statsById.total || 0) + (statsByEmail.total || 0)
            };
            return (
              <tr key={user.id || user.email}>
                <td className="px-4 py-2 whitespace-nowrap">{user.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{user.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{user.role}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center">{stats.active}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center">{stats.total}</td>
                <td className="px-4 py-2 whitespace-nowrap text-right">
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                    onClick={() => handleRemoveUser(user.id || user.email)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


const AdminPanel = () => {
  const [bikes, setBikes] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [rentals, setRentals] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalBikes: 0,
    availableBikes: 0,
    rentedBikes: 0,
    totalRentals: 0,
    activeRentals: 0,
    completedRentals: 0,
    totalRevenue: 0
  });
  
  // Form state for adding/editing bikes
  const [formData, setFormData] = useState({
    name: '',
    type: 'Mountain',
    pricePerHour: 0,
    pricePerDay: 0,
    description: '',
    available: true,
    image: '',
    maintenanceStatus: 'Good',
    lastMaintenance: new Date().toISOString().split('T')[0]
  });
  
  // Fetch bikes and rental data
  const fetchData = () => {
    setBikes(BikeService.getAllBikes());
    setRentals(BikeService.getAllRentals());
    
    // Calculate dashboard metrics
    const allBikes = BikeService.getAllBikes();
    const allRentals = BikeService.getAllRentals();
    
    setDashboardMetrics({
      totalBikes: allBikes.length,
      availableBikes: allBikes.filter(bike => bike.available).length,
      rentedBikes: allBikes.filter(bike => !bike.available).length,
      totalRentals: allRentals.length,
      activeRentals: allRentals.filter(rental => rental.status === 'active').length,
      completedRentals: allRentals.filter(rental => rental.status === 'completed').length,
      totalRevenue: allRentals.reduce((total, rental) => {
        return total + (rental.totalAmount || 0);
      }, 0)
    });
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
    
    // Set up listener for storage events (for cross-tab updates)
    const handleStorageChange = (e) => {
      if (e.key === 'bikeRentalBikes' || e.key === 'bikeRentalHistory') {
        fetchData();
      }
    };
    
    // Add listener for custom event from other components
    const handleRentalUpdate = () => {
      console.log('AdminPanel received bikeRentalUpdated event');
      fetchData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bikeRentalUpdated', handleRentalUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bikeRentalUpdated', handleRentalUpdate);
    };
  }, []);
  
  // Filter bikes based on search query
  const filteredBikes = bikes.filter(bike => 
    bike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bike.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bike.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    });
  };
  
  // Open modal for adding a new bike
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      type: 'Mountain',
      pricePerHour: 0,
      pricePerDay: 0,
      description: '',
      available: true,
      image: '',
      maintenanceStatus: 'Good',
      lastMaintenance: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing an existing bike
  const openEditModal = (bike) => {
    setModalMode('edit');
    setSelectedBike(bike);
    setFormData({
      name: bike.name,
      type: bike.type,
      pricePerHour: bike.pricePerHour,
      pricePerDay: bike.pricePerDay,
      description: bike.description,
      available: bike.available,
      image: bike.image,
      maintenanceStatus: bike.maintenanceStatus || 'Good',
      lastMaintenance: bike.lastMaintenance || new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'add') {
        // Add new bike
        const newBike = BikeService.createBike(formData);
        setBikes([...bikes, newBike]);
      } else {
        // Update existing bike
        const updatedBike = BikeService.updateBike(selectedBike.id, formData);
        setBikes(bikes.map(bike => bike.id === selectedBike.id ? updatedBike : bike));
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving bike:", error);
      alert(`Failed to save bike: ${error.message}`);
    }
  };
  
  // Delete a bike
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this bike?')) {
      try {
        BikeService.deleteBike(id);
        setBikes(bikes.filter(bike => bike.id !== id));
      } catch (error) {
        console.error("Error deleting bike:", error);
        alert(`Failed to delete bike: ${error.message}`);
      }
    }
  };
  
  // Toggle bike availability
  const toggleAvailability = (id) => {
    try {
      const updatedBike = BikeService.toggleAvailability(id);
      setBikes(bikes.map(bike => bike.id === id ? updatedBike : bike));
    } catch (error) {
      console.error("Error toggling availability:", error);
      alert(`Failed to update bike availability: ${error.message}`);
    }
  };
  
  // Get active rentals (bikes currently rented out)
  const activeRentals = rentals.filter(rental => rental.status === 'active');
  
  // Get rental history (completed rentals)
  const rentalHistory = rentals.filter(rental => rental.status === 'completed');
  
  return (
    <div className="bg-gray-50 min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'inventory' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => setActiveTab('inventory')}
            >
              Bike Inventory
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'rentals' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => setActiveTab('rentals')}
            >
              Rental Management
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'users' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'reviews' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>
        </div>
        
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">All Reviews</h2>
            <ReviewsList 
              reviews={reviewService.getAllReviews()} 
              onDeleteReview={(id) => {
                reviewService.deleteReview(id);
                // force re-render
                setBikes([...bikes]);
              }}
            />
          </div>
        )}

        {activeTab === 'inventory' && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search bikes..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center"
                  onClick={openAddModal}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add New Bike
                </motion.button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hourly Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maintenance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Rentals</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBikes.map((bike) => (
                      <motion.tr 
                        key={bike.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover" src={bike.image} alt={bike.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{bike.name}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">{bike.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bike.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${bike.pricePerHour.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${bike.pricePerDay.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              bike.available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {bike.available ? 'Available' : 'Rented Out'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              bike.maintenanceStatus === 'Good'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {bike.maintenanceStatus}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">Last: {bike.lastMaintenance}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bike.totalRentals}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => openEditModal(bike)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDelete(bike.id)}
                            >
                              Delete
                            </button>
                            <button
                              className={`${bike.available ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                              onClick={() => toggleAvailability(bike.id)}
                            >
                              {bike.available ? 'Mark Unavailable' : 'Mark Available'}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Bike Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Bikes</p>
                    <p className="text-2xl font-bold text-indigo-600">{bikes.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Available</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bikes.filter(bike => bike.available).length}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Rented Out</p>
                    <p className="text-2xl font-bold text-red-600">
                      {bikes.filter(bike => !bike.available).length}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Needs Maintenance</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {bikes.filter(bike => bike.maintenanceStatus === 'Needs Maintenance').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bike Types</h3>
                <div className="space-y-4">
                  {['Mountain', 'Road', 'City', 'Electric', 'Hybrid'].map(type => {
                    const count = bikes.filter(bike => bike.type === type).length;
                    const percentage = bikes.length > 0 ? (count / bikes.length) * 100 : 0;
                    
                    return (
                      <div key={type}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">{type}</span>
                          <span className="text-sm font-medium text-gray-900">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Bikes</h3>
                <div className="space-y-4">
                  {bikes
                    .sort((a, b) => b.totalRentals - a.totalRentals)
                    .slice(0, 3)
                    .map(bike => (
                      <div key={bike.id} className="flex items-center">
                        <img src={bike.image} alt={bike.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{bike.name}</p>
                          <p className="text-xs text-gray-500">{bike.totalRentals} rentals</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'rentals' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Rental Management</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Active Rentals</h3>
              {activeRentals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rented By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeRentals.map(rental => {
                        // Find the corresponding bike
                        const bike = bikes.find(b => b.id === rental.bikeId);
                        
                        return (
                          <tr key={rental.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {bike && (
                                  <>
                                    <div className="h-10 w-10 flex-shrink-0">
                                      <img className="h-10 w-10 rounded-full object-cover" src={bike.image} alt={bike.name} />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{bike.name}</div>
                                      <div className="text-sm text-gray-500">{bike.type}</div>
                                    </div>
                                  </>
                                )}
                                {!bike && <span className="text-gray-500">Bike ID: {rental.bikeId}</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {rental.userId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(rental.startDate).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${rental.cost.hourly}/hr - ${rental.cost.daily}/day
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  try {
                                    // Return the bike using the BikeService with the rental ID
                                    BikeService.returnBike(rental.id);
                                    
                                    // Refresh bike data immediately
                                    const updatedBikes = BikeService.getAllBikes();
                                    setBikes(updatedBikes);
                                    
                                    // Refresh rental data immediately
                                    const updatedRentals = BikeService.getAllRentals();
                                    setRentals(updatedRentals);
                                    
                                    // Update dashboard metrics
                                    fetchData();
                                  } catch (error) {
                                    alert(`Error returning bike: ${error.message}`);
                                  }
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Mark as Returned
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No active rentals at the moment</p>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Rental History</h3>
              {rentalHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rented By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rentalHistory.slice(0, 10).map(rental => (
                        <tr key={rental.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{rental.bikeName || `Bike #${rental.bikeId}`}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rental.userId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rentalHistory.length > 10 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">Showing 10 of {rentalHistory.length} completed rentals</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No rental history available</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">User Management</h2>
            <UserManagement />
          </div>
        )}
      </div>
      
      {/* Add/Edit Bike Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-xl p-8 max-w-2xl w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {modalMode === 'add' ? 'Add New Bike' : 'Edit Bike'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bike Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bike Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Mountain">Mountain</option>
                      <option value="Road">Road</option>
                      <option value="City">City</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="pricePerHour"
                      value={formData.pricePerHour}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Rate ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="pricePerDay"
                      value={formData.pricePerDay}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Status
                    </label>
                    <select
                      name="maintenanceStatus"
                      value={formData.maintenanceStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Good">Good</option>
                      <option value="Needs Maintenance">Needs Maintenance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Maintenance Date
                    </label>
                    <input
                      type="date"
                      name="lastMaintenance"
                      value={formData.lastMaintenance}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="available"
                        checked={formData.available}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Available for Rent</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {modalMode === 'add' ? 'Add Bike' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
