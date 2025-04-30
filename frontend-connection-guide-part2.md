# Bike Rental API - Frontend Connection Guide (Part 2)

## Service Modules (Continued)

#### Booking Service (`src/services/booking.service.js`)

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

#### Profile Service (`src/services/profile.service.js`)

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

#### User Service (Admin) (`src/services/user.service.js`)

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

## Implementing API Calls in Components

Now let's see how to use these services in your React components.

### BikeCard Component

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BikeService from '../services/bike.service';
import BookingService from '../services/booking.service';
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
