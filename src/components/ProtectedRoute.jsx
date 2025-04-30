import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component to protect routes that require authentication
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, isAdmin, isCustomer, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login page with return URL
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If a specific role is required, check if the user has that role
  if (requiredRole) {
    // Admin route check
    if (requiredRole === 'admin' && !isAdmin()) {
      return <Navigate to="/dashboard" state={{ message: "You don't have admin access" }} replace />;
    }
    
    // Customer route check
    if (requiredRole === 'customer' && !isCustomer()) {
      return <Navigate to="/admin" replace />;
    }
  }

  // If user is authenticated and has the required role (or no role is required), render the children
  return children;
};

export default ProtectedRoute;
