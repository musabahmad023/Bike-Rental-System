import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/auth.service';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = AuthService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          console.log('User authenticated from stored credentials:', user);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        AuthService.logout();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await AuthService.register(userData);
      
      setCurrentUser(response);
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw error;
    }
  };

  // Login function
  const login = (userData) => {
    try {
      setError(null);
      
      // If userData is already a user object (from mock auth)
      if (userData.email && !userData.password) {
        setCurrentUser(userData);
        return userData;
      }
      
      // Otherwise, call the login method
      const response = AuthService.login(userData.email, userData.password);
      setCurrentUser(response);
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  // Check if user is customer
  const isCustomer = () => {
    return currentUser?.role === 'customer' || (!currentUser?.role && currentUser);
  };

  // Update user profile
  const updateUserProfile = async (userData) => {
    try {
      setError(null);
      // In a real app, you would call an API here
      // For our mock version, we'll just update the local state
      
      // Create a copy of userData without password property if present
      const userToStore = { ...userData };
      
      // Don't store password in user object
      if (userToStore.password) {
        delete userToStore.password;
      }
      
      // Update the user data in localStorage
      const updatedUser = {
        ...currentUser,
        ...userToStore
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return { success: true, data: updatedUser };
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    isAdmin,
    isCustomer,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
