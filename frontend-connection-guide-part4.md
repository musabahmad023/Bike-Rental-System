# Bike Rental API - Frontend Connection Guide (Part 4)

## Implementing API Calls in Components (Continued)

### AdminPanel Component

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BikeService from '../services/bike.service';
import UserService from '../services/user.service';
import BookingService from '../services/booking.service';
import AuthService from '../services/auth.service';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('bikes');
  const [bikes, setBikes] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!AuthService.isAdmin()) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [activeTab, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch data based on active tab
      if (activeTab === 'bikes') {
        const response = await BikeService.getAllBikes({ limit: 10 });
        setBikes(response.data.bikes);
      } 
      else if (activeTab === 'users') {
        const response = await UserService.getAllUsers({ limit: 10 });
        setUsers(response.data.users);
      } 
      else if (activeTab === 'bookings') {
        const response = await BookingService.getAllBookings({ limit: 10 });
        setBookings(response.data.bookings);
      } 
      else if (activeTab === 'stats') {
        // Fetch user stats
        const userStatsResponse = await UserService.getUserStats();
        
        // You would typically also fetch bike and booking stats here
        // For this example, we're just using user stats
        
        setStats({
          users: userStatsResponse.data,
          // Add other stats as needed
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBike = async (bikeId) => {
    if (window.confirm('Are you sure you want to delete this bike?')) {
      try {
        await BikeService.deleteBike(bikeId);
        // Refresh bikes list
        const response = await BikeService.getAllBikes({ limit: 10 });
        setBikes(response.data.bikes);
      } catch (err) {
        console.error('Error deleting bike:', err);
        alert('Failed to delete bike. Please try again.');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await UserService.deleteUser(userId);
        // Refresh users list
        const response = await UserService.getAllUsers({ limit: 10 });
        setUsers(response.data.users);
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await BookingService.updateBookingStatus(bookingId, { status });
      // Refresh bookings list
      const response = await BookingService.getAllBookings({ limit: 10 });
      setBookings(response.data.bookings);
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status. Please try again.');
    }
  };

  if (loading && !activeTab) return <div className="loading">Loading admin panel...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'bikes' ? 'active' : ''} 
          onClick={() => setActiveTab('bikes')}
        >
          Bikes
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''} 
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''} 
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </div>
      
      {/* Bikes Management */}
      {activeTab === 'bikes' && (
        <div className="bikes-management">
          <div className="section-header">
            <h3>Bike Inventory</h3>
            <Link to="/admin/bikes/add" className="add-button">Add New Bike</Link>
          </div>
          
          {loading ? (
            <div className="loading">Loading bikes...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Hourly Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bikes.map(bike => (
                  <tr key={bike._id}>
                    <td>
                      <img 
                        src={bike.images[0]} 
                        alt={bike.name} 
                        className="thumbnail" 
                      />
                    </td>
                    <td>{bike.name}</td>
                    <td>{bike.type}</td>
                    <td>
                      <span className={`status-badge ${bike.availability.status}`}>
                        {bike.availability.status}
                      </span>
                    </td>
                    <td>${bike.pricing.hourlyRate}</td>
                    <td className="actions">
                      <Link to={`/admin/bikes/edit/${bike._id}`} className="edit-button">
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDeleteBike(bike._id)} 
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && bikes.length === 0 && (
            <p>No bikes found in the inventory.</p>
          )}
        </div>
      )}
      
      {/* Users Management */}
      {activeTab === 'users' && (
        <div className="users-management">
          <div className="section-header">
            <h3>User Management</h3>
          </div>
          
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <Link to={`/admin/users/${user._id}`} className="view-button">
                        View
                      </Link>
                      <Link to={`/admin/users/edit/${user._id}`} className="edit-button">
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDeleteUser(user._id)} 
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && users.length === 0 && (
            <p>No users found.</p>
          )}
        </div>
      )}
      
      {/* Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="bookings-management">
          <div className="section-header">
            <h3>Booking Management</h3>
          </div>
          
          {loading ? (
            <div className="loading">Loading bookings...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User</th>
                  <th>Bike</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id}>
                    <td>{booking._id}</td>
                    <td>{booking.user.name}</td>
                    <td>{booking.bike.name}</td>
                    <td>
                      {new Date(booking.startDate).toLocaleDateString()} - 
                      {new Date(booking.endDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{booking.paymentStatus}</td>
                    <td className="actions">
                      <Link to={`/admin/bookings/${booking._id}`} className="view-button">
                        View
                      </Link>
                      <select 
                        value={booking.status}
                        onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && bookings.length === 0 && (
            <p>No bookings found.</p>
          )}
        </div>
      )}
      
      {/* Statistics */}
      {activeTab === 'stats' && stats && (
        <div className="statistics">
          <h3>System Statistics</h3>
          
          {loading ? (
            <div className="loading">Loading statistics...</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <h4>User Statistics</h4>
                <p><strong>Total Users:</strong> {stats.users.totalUsers}</p>
                <p><strong>New Users (Last 30 days):</strong> {stats.users.newUsersLast30Days}</p>
                <p><strong>Active Users:</strong> {stats.users.activeUsers}</p>
                <p><strong>Admin Users:</strong> {stats.users.adminUsers}</p>
              </div>
              
              {/* Add more stat cards as needed */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
```

## Form Examples

### Login Form

```jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/auth.service';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const { email, password } = formData;
      await AuthService.login(email, password);
      
      // Redirect to the page the user was trying to access or dashboard
      navigate(from);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="form-footer">
        <p>Don't have an account? <a href="/register">Register</a></p>
      </div>
    </div>
  );
};

export default LoginForm;
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
