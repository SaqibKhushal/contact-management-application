import api from './api';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    // Clear ALL user-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear all user profile images (might have multiple users' images cached)
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('userProfileImage')) {
        localStorage.removeItem(key);
      }
    });
    
    // Optionally clear everything to ensure no data leakage
    // localStorage.clear();
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;