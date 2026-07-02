// apps/web/src/contexts/AuthContext.jsx

/**
 * @file contexts/AuthContext.jsx
 * @description Authentication context using HttpOnly cookies (no localStorage).
 * Exports AuthContext, AuthProvider, and useAuth for flexible imports.
 */

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as authService from '../services/auth';

export const AuthContext = createContext(null);

/**
 * Custom hook to access authentication context
 * Can be imported from here OR from hooks/useAuth.js
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check authentication status
   * Wrapped in useCallback to prevent unnecessary re-renders
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      setError(null);
      // getCurrentUser now returns null if the user is not logged in (no 401 thrown)
      const response = await authService.getCurrentUser();
      
      if (response && response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // This will only catch unexpected network errors now
      console.error('Auth check failed:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Run auth check only once on mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  /**
   * Login handler
   */
  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
      
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  }, []);

  /**
   * Register handler
   */
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
      
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  }, []);

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout failed:', err);
      // Still clear user state even if API call fails
      setUser(null);
    }
  }, []);

  /**
   * Directly update user state (used by Login/Register after successful API call)
   */
  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};