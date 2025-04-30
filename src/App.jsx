import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserDashboard from './components/Dashboard';
import BikeCatalog from './components/CourseBrowser';
import BikeCard from './components/CourseCard';
import AdminPanel from './components/AdminPanel';
import BikeDetails from './components/BikeDetails';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AllReviews from './components/AllReviews';

function App() {
  const [showAuthForm, setShowAuthForm] = useState('login'); // 'login' or 'signup'
  
  // Sample bike data
  const sampleBikes = [
    {
      id: 1,
      name: 'Mountain Explorer X3',
      type: 'Mountain',
      pricePerHour: 12.99,
      pricePerDay: 49.99,
      description: 'A rugged mountain bike perfect for trail riding with advanced suspension.',
      available: true,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 2,
      name: 'City Cruiser Deluxe',
      type: 'City',
      pricePerHour: 9.99,
      pricePerDay: 39.99,
      description: 'Comfortable city bike with basket, perfect for urban commuting and errands.',
      available: true,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 3,
      name: 'Road Master Pro',
      type: 'Road',
      pricePerHour: 14.99,
      pricePerDay: 59.99,
      description: 'Lightweight road bike designed for speed and long-distance rides on paved roads.',
      available: false,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  // Sample user rental history
  const sampleRentalHistory = [
    {
      id: 'rent-001',
      bikeId: 1,
      bikeName: 'Mountain Explorer X3',
      startDate: '2023-06-15T09:00:00Z',
      endDate: '2023-06-15T17:00:00Z',
      totalCost: 103.92,
      status: 'completed',
      bikeImage: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 'rent-002',
      bikeId: 2,
      bikeName: 'City Cruiser Deluxe',
      startDate: '2023-07-01T10:00:00Z',
      endDate: '2023-07-02T10:00:00Z',
      totalCost: 39.99,
      status: 'completed',
      bikeImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 'rent-003',
      bikeId: 3,
      bikeName: 'Road Master Pro',
      startDate: '2023-08-10T08:00:00Z',
      endDate: '2023-08-10T16:00:00Z',
      totalCost: 119.92,
      status: 'upcoming',
      bikeImage: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  const handleBikeRent = (bikeId) => {
    console.log('Bike rental requested:', bikeId);
    // Here you would typically handle the rental process
    // For example, open a modal to select rental duration
  };

  // Main App component with routing
  const AppContent = () => {
    const { currentUser, login, logout, isAdmin } = useAuth();

    // Handle login
    const handleLogin = (user) => {
      login(user);
    };

    // Handle signup
    const handleSignup = (user) => {
      login(user);
    };

    // Handle logout
    const handleLogout = () => {
      logout();
    };

    // If user is not logged in, show login/signup form
    if (!currentUser) {
      return (
        <>
          {showAuthForm === 'login' ? (
            <Login 
              onLogin={handleLogin} 
              onSwitchToSignup={() => setShowAuthForm('signup')} 
            />
          ) : (
            <Signup 
              onSignup={handleSignup} 
              onSwitchToLogin={() => setShowAuthForm('login')} 
            />
          )}
        </>
      );
    }

    // If user is logged in, show appropriate content based on role
    return (
      <>
        <Navbar onLogout={handleLogout} />
        <Routes>
          <Route 
            path="/" 
            element={
              isAdmin() 
                ? <Navigate to="/admin" /> 
                : <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="customer">
                <UserDashboard rentalHistory={sampleRentalHistory} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bikes" 
            element={
              <ProtectedRoute>
                <BikeCatalog bikes={sampleBikes} onRent={handleBikeRent} />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute requiredRole="customer">
                <AllReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bikes/:bikeId"
            element={
              <ProtectedRoute>
                <BikeDetails currentUser={currentUser} />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </>
    );
  };

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
