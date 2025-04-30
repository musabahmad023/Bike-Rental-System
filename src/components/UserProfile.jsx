import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    password: '',
    confirmPassword: '',
    role: currentUser?.role || 'customer'
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Profile picture upload handling
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Form input handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Real-time validation
    validateField(name, value);
  };

  // Field validation
  const validateField = (name, value) => {
    let newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (value && value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else {
          delete newErrors.password;
        }
        
        // Check if confirm password matches
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'confirmPassword':
        if (formData.password && value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    validateField('name', formData.name);
    validateField('email', formData.email);
    if (formData.password) {
      validateField('password', formData.password);
      validateField('confirmPassword', formData.confirmPassword);
    }
    
    // Check if there are any errors
    if (Object.keys(errors).length === 0) {
      // Create updated user object
      const updatedUser = {
        ...currentUser,
        name: formData.name,
        email: formData.email,
        profilePicture: previewImage || currentUser.profilePicture
      };
      
      // Only include password if it was changed
      if (formData.password) {
        updatedUser.passwordHash = formData.password;
        
        // If we're using the mock auth service with localStorage, update user in the users array too
        const users = JSON.parse(localStorage.getItem('bikeRentalUsers') || '[]');
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            passwordHash: formData.password
          };
          localStorage.setItem('bikeRentalUsers', JSON.stringify(users));
        }
      }
      
      // Update user profile
      updateUserProfile(updatedUser);
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        setIsEditModalOpen(false);
      }, 2000);
    }
  };

  // Reset form when modal is opened
  const openEditModal = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      password: '',
      confirmPassword: '',
      role: currentUser?.role || 'customer'
    });
    setPreviewImage(null);
    setErrors({});
    setSuccessMessage('');
    setIsEditModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        
        {/* Profile Card */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center">
              {/* Profile Picture */}
              <div className="relative mb-6 md:mb-0 md:mr-8">
                <motion.div 
                  className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-100 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src={currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=random&size=128`} 
                    alt={currentUser?.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentUser?.name}</h2>
                <p className="text-gray-600 mb-1">{currentUser?.email}</p>
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-4">
                  {currentUser?.role === 'admin' ? 'Administrator' : 'Customer'}
                </div>
                <p className="text-gray-500 mb-4">
                  Account created on {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString()}
                </p>
                <motion.button
                  onClick={openEditModal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-md"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Edit Profile
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Rental History Section */}
        <motion.div 
          className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Full Name</h4>
                <p className="text-gray-800">{currentUser?.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Email Address</h4>
                <p className="text-gray-800">{currentUser?.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Account Type</h4>
                <p className="text-gray-800">{currentUser?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Member Since</h4>
                <p className="text-gray-800">{new Date(currentUser?.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {/* Profile Picture Upload */}
                  <div className="mb-6 flex flex-col items-center">
                    <div 
                      className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 shadow-md mb-3 cursor-pointer"
                      onClick={triggerFileInput}
                    >
                      <img 
                        src={previewImage || currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=random&size=128`} 
                        alt={currentUser?.name || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Change Profile Picture
                    </button>
                  </div>
                  
                  {/* Name Field */}
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  
                  {/* Email Field */}
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  {/* Password Field */}
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                  
                  {/* Confirm Password Field */}
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  {/* Success Message */}
                  {successMessage && (
                    <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-lg text-center">
                      {successMessage}
                    </div>
                  )}
                  
                  {/* Form Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-md"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Save Changes
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
