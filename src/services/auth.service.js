// Mock Auth Service using localStorage
const AuthService = {
  register: async (userData) => {
    try {
      // Create user object with necessary fields
      const user = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role || 'customer',
        phoneNumber: userData.phoneNumber || '',
        profilePicture: userData.profilePicture || '',
        createdAt: new Date().toISOString(),
        // Store password hash (in a real app, this would be hashed)
        passwordHash: userData.password
      };
      
      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem('bikeRentalUsers') || '[]');
      
      // Check if user with this email already exists
      if (existingUsers.some(u => u.email === userData.email)) {
        throw new Error('User with this email already exists');
      }
      
      // Add new user to the list
      existingUsers.push(user);
      localStorage.setItem('bikeRentalUsers', JSON.stringify(existingUsers));
      
      // Generate a mock token
      const token = `mock_token_${Math.random().toString(36).substring(2)}`;
      
      // Create a user object without the password hash for client storage
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.passwordHash;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Return mock response similar to what the API would return
      return {
        success: true,
        message: 'User registered successfully',
        token,
        ...userWithoutPassword
      };
    } catch (error) {
      console.error('Registration service error:', error);
      throw error;
    }
  },
  
  login: async (email, password) => {
    try {
      console.log(`Attempting login with email: ${email}`);
      
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('bikeRentalUsers') || '[]');
      
      // Find user with matching email
      const user = users.find(u => u.email === email);
      
      if (!user) {
        console.error('Login failed: User not found');
        throw new Error('Invalid email or password');
      }
      
      // Verify password (in a real app, this would compare hashed passwords)
      if (user.passwordHash !== password) {
        console.error('Login failed: Password mismatch');
        throw new Error('Invalid email or password');
      }
      
      console.log('Password verified successfully');
      
      // Generate a mock token
      const token = `mock_token_${Math.random().toString(36).substring(2)}`;
      
      // Create a user object without the password hash for client storage
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.passwordHash;
      
      // Store auth data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Return mock response
      return {
        success: true,
        message: 'Login successful',
        token,
        ...userWithoutPassword
      };
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  },
  
  logout: () => {
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
  },
  
  // Helper method to create demo users if none exist
  createDemoUsers: () => {
    const existingUsers = JSON.parse(localStorage.getItem('bikeRentalUsers') || '[]');
    
    if (existingUsers.length === 0) {
      const demoUsers = [
        {
          id: 1,
          name: 'Demo Customer',
          email: 'customer@bikerental.com',
          role: 'customer',
          phoneNumber: '555-123-4567',
          profilePicture: '',
          createdAt: new Date().toISOString(),
          passwordHash: 'password123'
        },
        {
          id: 2,
          name: 'Demo Admin',
          email: 'admin@bikerental.com',
          role: 'admin',
          phoneNumber: '555-987-6543',
          profilePicture: '',
          createdAt: new Date().toISOString(),
          passwordHash: 'password123'
        }
      ];
      
      localStorage.setItem('bikeRentalUsers', JSON.stringify(demoUsers));
      console.log('Demo users created');
    }
  }
};

// Create demo users when the service is first loaded
AuthService.createDemoUsers();

export default AuthService;
