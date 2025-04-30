# Bike Rental API - Frontend Connection Guide

This guide demonstrates how to connect your React frontend components to the Bike Rental API using Axios. The examples are tailored to work with the existing frontend components: BikeCard, BikeCatalog, UserDashboard, and AdminPanel.

## Setup

### 1. Install Axios

```bash
npm install axios
```

### 2. Create API Service

Create a new file `src/services/api.js` to centralize API calls:

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Service Modules

Let's create separate service modules for each API category:

### Authentication Service (`src/services/auth.service.js`)

```javascript
import api from './api';

const AuthService = {
  register: (userData) => api.post('/auth/register', userData),
  
  login: (email, password) => 
    api.post('/auth/login', { email, password })
      .then(response => {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
      }),
  
  logout: () => {
    api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => !!localStorage.getItem('token'),
  
  isAdmin: () => {
    const user = AuthService.getCurrentUser();
    return user && user.role === 'admin';
  }
};

export default AuthService;
```

### Bike Service (`src/services/bike.service.js`)

```javascript
import api from './api';

const BikeService = {
  getAllBikes: (params = {}) => 
    api.get('/bikes', { params }),
  
  getBikeById: (id) => 
    api.get(`/bikes/${id}`),
  
  createBike: (bikeData) => 
    api.post('/bikes', bikeData),
  
  updateBike: (id, bikeData) => 
    api.put(`/bikes/${id}`, bikeData),
  
  deleteBike: (id) => 
    api.delete(`/bikes/${id}`)
};

export default BikeService;
```

### Booking Service (`src/services/booking.service.js`)

```javascript
import api from './api';

const BookingService = {
  checkAvailability: (bikeId, startDate, endDate) => 
    api.get('/bookings/check-availability', { 
      params: { bikeId, startDate, endDate } 
    }),
  
  createBooking: (bookingData) => 
    api.post('/bookings', bookingData),
  
  getUserBookings: (params = {}) => 
    api.get('/bookings', { params }),
  
  getBookingById: (id) => 
    api.get(`/bookings/${id}`),
  
  updateBookingStatus: (id, statusData) => 
    api.put(`/bookings/${id}/status`, statusData),
  
  // Admin functions
  getAllBookings: (params = {}) => 
    api.get('/bookings/admin', { params }),
  
  updatePaymentStatus: (id, paymentData) => 
    api.put(`/bookings/${id}/payment`, paymentData)
};

export default BookingService;
```

### Profile Service (`src/services/profile.service.js`)

```javascript
import api from './api';

const ProfileService = {
  getProfile: () => 
    api.get('/profile'),
  
  updateProfile: (profileData) => 
    api.put('/profile', profileData),
  
  changePassword: (currentPassword, newPassword) => 
    api.put('/profile/password', { currentPassword, newPassword }),
  
  addPaymentMethod: (paymentData) => 
    api.put('/profile/payment-methods', paymentData),
  
  deletePaymentMethod: (methodId) => 
    api.delete(`/profile/payment-methods/${methodId}`)
};

export default ProfileService;
```

### User Service (Admin) (`src/services/user.service.js`)

```javascript
import api from './api';

const UserService = {
  getAllUsers: (params = {}) => 
    api.get('/users', { params }),
  
  getUserStats: () => 
    api.get('/users/stats'),
  
  getUserById: (id) => 
    api.get(`/users/${id}`),
  
  updateUser: (id, userData) => 
    api.put(`/users/${id}`, userData),
  
  deleteUser: (id) => 
    api.delete(`/users/${id}`)
};

export default UserService;
```

## Component Integration Examples

### BikeCard Component

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BikeService from '../services/bike.service';
import AuthService from '../services/auth.service';

const BikeCard = ({ bike, onRent, refreshBikes }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isAdmin = AuthService.isAdmin();

  const handleRentClick = () => {
    if (AuthService.isAuthenticated()) {
      onRent(bike);
    } else {
      navigate('/login', { state: { from: '/bikes', bikeId: bike._id } });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bike?')) {
      try {
        setLoading(true);
        await BikeService.deleteBike(bike._id);
        refreshBikes();
      } catch (error) {
        console.error('Error deleting bike:', error);
        alert('Failed to delete bike. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/admin/bikes/edit/${bike._id}`);
  };

  return (
    <div className="bike-card">
      <img src={bike.images[0]} alt={bike.name} />
      <h3>{bike.name}</h3>
      <p className="bike-type">{bike.type}</p>
      <p className="bike-description">{bike.description}</p>
      <div className="bike-status">
        <span className={`status-badge ${bike.availability.status}`}>
          {bike.availability.status}
        </span>
      </div>
      <div className="bike-pricing">
        <p>${bike.pricing.hourlyRate}/hour</p>
        <p>${bike.pricing.dailyRate}/day</p>
      </div>
      <div className="bike-rating">
        <span>★ {bike.rating || '4.5'}</span>
      </div>
      <button 
        className="rent-button" 
        onClick={handleRentClick}
        disabled={bike.availability.status !== 'available' || loading}
      >
        Rent Now
      </button>
      
      {isAdmin && (
        <div className="admin-actions">
          <button onClick={handleEdit} disabled={loading}>Edit</button>
          <button onClick={handleDelete} disabled={loading}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default BikeCard;
```

### BikeCatalog Component

```jsx
import React, { useState, useEffect } from 'react';
import BikeCard from './BikeCard';
import BikeService from '../services/bike.service';
import { useNavigate } from 'react-router-dom';

const BikeCatalog = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    sort: 'name',
    order: 'asc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBikes();
  }, [filters, pagination.page, pagination.limit]);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        type: filters.type || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        sort: filters.sort,
        order: filters.order
      };
      
      const response = await BikeService.getAllBikes(params);
      setBikes(response.data.bikes);
      setPagination({
        ...pagination,
        total: response.data.totalBikes
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching bikes:', err);
      setError('Failed to load bikes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    // Reset to first page when filters change
    setPagination({
      ...pagination,
      page: 1
    });
  };

  const handleRent = (bike) => {
    navigate(`/bikes/${bike._id}/book`);
  };

  const handlePageChange = (newPage) => {
    setPagination({
      ...pagination,
      page: newPage
    });
  };

  const refreshBikes = () => {
    fetchBikes();
  };

  return (
    <div className="bike-catalog">
      <h2>Available Bikes</h2>
      
      <div className="filters">
        <input
          type="text"
          name="search"
          placeholder="Search bikes..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="mountain">Mountain</option>
          <option value="road">Road</option>
          <option value="city">City</option>
          <option value="electric">Electric</option>
        </select>
        
        <div className="price-filters">
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="sort-options">
          <select name="sort" value={filters.sort} onChange={handleFilterChange}>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
          
          <select name="order" value={filters.order} onChange={handleFilterChange}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
      
      {loading && <div className="loading">Loading bikes...</div>}
      {error && <div className="error">{error}</div>}
      
      <div className="bikes-grid">
        {bikes.map(bike => (
          <BikeCard 
            key={bike._id} 
            bike={bike} 
            onRent={handleRent}
            refreshBikes={refreshBikes}
          />
        ))}
      </div>
      
      {!loading && bikes.length === 0 && (
        <div className="no-bikes">No bikes found matching your criteria.</div>
      )}
      
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Previous
        </button>
        
        <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}</span>
        
        <button 
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BikeCatalog;
```

### UserDashboard Component

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfileService from '../services/profile.service';
import BookingService from '../services/booking.service';
import AuthService from '../services/auth.service';

const UserDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await ProfileService.getProfile();
      setProfile(profileResponse.data);
      
      // Fetch user bookings
      const bookingsResponse = await BookingService.getUserBookings();
      setBookings(bookingsResponse.data.bookings);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load your profile information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await BookingService.updateBookingStatus(bookingId, {
          status: 'cancelled',
          cancellationReason: 'User cancelled'
        });
        
        // Refresh bookings after cancellation
        const bookingsResponse = await BookingService.getUserBookings();
        setBookings(bookingsResponse.data.bookings);
      } catch (err) {
        console.error('Error cancelling booking:', err);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

  if (loading) return <div className="loading">Loading your dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>My Dashboard</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''} 
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''} 
          onClick={() => setActiveTab('bookings')}
        >
          My Rentals
        </button>
      </div>
      
      {activeTab === 'profile' && profile && (
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="profile-details">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phoneNumber}</p>
            
            {profile.address && (
              <div className="address">
                <h4>Address</h4>
                <p>{profile.address.street}</p>
                <p>{profile.address.city}, {profile.address.state} {profile.address.zipCode}</p>
                <p>{profile.address.country}</p>
              </div>
            )}
            
            <div className="payment-methods">
              <h4>Payment Methods</h4>
              {profile.paymentMethods && profile.paymentMethods.length > 0 ? (
                <ul>
                  {profile.paymentMethods.map((method, index) => (
                    <li key={index}>
                      {method.type} ending in {method.lastFour}
                      {method.isDefault && <span className="default-badge">Default</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No payment methods added yet.</p>
              )}
            </div>
          </div>
          
          <div className="profile-actions">
            <Link to="/profile/edit" className="edit-profile-button">Edit Profile</Link>
            <Link to="/profile/password" className="change-password-button">Change Password</Link>
            <Link to="/profile/payment-methods" className="manage-payment-button">Manage Payment Methods</Link>
          </div>
        </div>
      )}
      
      {activeTab === 'bookings' && (
        <div className="bookings-section">
          <h3>My Rentals</h3>
          
          {bookings.length === 0 ? (
            <p>You don't have any rentals yet.</p>
          ) : (
            <div className="bookings-list">
              {bookings.map(booking => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <h4>{booking.bike.name}</h4>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="booking-details">
                    <p><strong>Booking ID:</strong> {booking._id}</p>
                    <p><strong>Dates:</strong> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                    <p><strong>Total Cost:</strong> ${booking.totalCost}</p>
                    <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
                  </div>
                  
                  <div className="booking-actions">
                    <Link to={`/bookings/${booking._id}`} className="view-details-button">
                      View Details
                    </Link>
                    
                    {booking.status === 'pending' || booking.status === 'confirmed' ? (
                      <button 
                        onClick={() => handleCancelBooking(booking._id)}
                        className="cancel-booking-button"
                      >
                        Cancel Booking
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
```

## Conclusion

This guide demonstrates how to connect your React frontend components to the Bike Rental API using Axios. The examples provided cover the main functionality needed for the BikeCard, BikeCatalog, UserDashboard, and AdminPanel components.

Key points to remember:

1. Use the centralized API service to manage base URL, authentication, and error handling
2. Create separate service modules for each API category (auth, bikes, bookings, profile, users)
3. Implement proper error handling in components
4. Use React hooks (useState, useEffect) to manage API data and component state
5. Implement loading states to improve user experience
6. Use proper authentication checks to protect routes and features

For more detailed API documentation, refer to the Swagger documentation available at `/api-docs` when the server is running.

For testing API endpoints, you can use the provided Postman collection.
