import axios from 'axios';

// Base API URL - your backend
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Unauthorized/Forbidden - clear ALL authentication data and redirect to login
      // CRITICAL: This ensures stale tokens don't cause session leakage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear all profile images
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('userProfileImage')) {
          localStorage.removeItem(key);
        }
      });
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;