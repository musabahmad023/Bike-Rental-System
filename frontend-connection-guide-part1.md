# Bike Rental API - Frontend Connection Guide (Part 1)

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

### 3. Create Service Modules

Let's create separate service modules for each API category:

#### Authentication Service (`src/services/auth.service.js`)

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

#### Bike Service (`src/services/bike.service.js`)

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
