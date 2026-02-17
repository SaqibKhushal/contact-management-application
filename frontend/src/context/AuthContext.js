import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        setIsAuthenticated(true);
        try {
          const userData = await userService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Don't logout here - token might still be valid
          // Just log the error and continue
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setIsAuthenticated(true);
      
      // CRITICAL: Fetch current user's profile immediately after login
      // This ensures we have the correct user data before navigating
      try {
        const userData = await userService.getProfile();
        setUser(userData);
      } catch (profileError) {
        console.error('Could not fetch profile, but login successful');
        // Set basic user data from token if profile fetch fails
        setUser({ email: credentials.username });
      }
      
      return response;
    } catch (error) {
      // Clear any stale authentication state on login failure
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    return response;
  };

  const logout = () => {
    // CRITICAL: Clear authentication data FIRST
    authService.logout();
    
    // Then clear React state
    setUser(null);
    setIsAuthenticated(false);
    
    // Note: Navigation to /login is handled by ProtectedRoute
    // when isAuthenticated becomes false
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};