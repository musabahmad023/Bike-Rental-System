# Bike Rental API - Frontend Connection Guide (Part 3)

## Implementing API Calls in Components (Continued)

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
