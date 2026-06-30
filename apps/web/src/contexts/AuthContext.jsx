// apps/web/src/contexts/AuthContext.jsx

import { createContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, getStoredUser, getStoredToken, logoutUser } from '../services/auth';

/**
 * Authentication Context
 * 
 * Provides user state and authentication operations to the entire application.
 * Uses sessionStorage for token persistence - each browser tab maintains
 * its own isolated session. This enables multi-account workflows where
 * a host can be logged in on one tab while a guest uses another.
 * 
 * Session Restoration Flow:
 * 1. On mount, check sessionStorage for existing token
 * 2. If token exists, verify with the server
 * 3. If valid, restore the user session
 * 4. If invalid/expired, clear session data
 */

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  /**
   * Restore user session from sessionStorage.
   * 
   * Runs once on component mount to persist login across page refreshes
   * within the same tab. Does NOT restore across tabs - each tab
   * requires its own authentication.
   * 
   * Flow:
   * 1. Check for cached user data in sessionStorage (instant UI)
   * 2. Verify token validity with the server (background)
   * 3. Update or clear state based on server response
   */
  const restoreSession = useCallback(async () => {
    const token = getStoredToken();
    
    // No token in this tab - user is not authenticated
    if (!token) {
      setLoading(false);
      return;
    }

    // Restore cached user data immediately for fast UI rendering
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuth(true);
    }

    try {
      // Verify the token is still valid with the server
      const response = await getCurrentUser();
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuth(true);
        
        // Update cached user data with fresh server response
        try {
          sessionStorage.setItem('roost_user', JSON.stringify(response.data.user));
        } catch {
          // sessionStorage write failed - non-critical, user is still authenticated
        }
      }
    } catch {
      // Token expired or invalid - clear everything from this tab
      setUser(null);
      setIsAuth(false);
      
      try {
        sessionStorage.removeItem('roost_token');
        sessionStorage.removeItem('roost_user');
      } catch {
        // Cleanup failed - user state is already cleared
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Update user state and persist to sessionStorage.
   * Called after successful login, registration, or profile updates.
   * 
   * @param {Object} userData - Fresh user data from the server
   */
  const updateUser = (userData) => {
    setUser(userData);
    setIsAuth(true);
    
    try {
      sessionStorage.setItem('roost_user', JSON.stringify(userData));
    } catch {
      // Non-critical - user is still authenticated in memory
    }
  };

  /**
   * Clear user state and remove stored session data.
   * Logs out only the current tab - other tabs are unaffected.
   */
  const logout = () => {
    setUser(null);
    setIsAuth(false);
    logoutUser();
  };

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = {
    user,
    isAuth,
    loading,
    updateUser,
    logout,
    isGuest: user?.role === 'GUEST',
    isHost: user?.role === 'HOST',
    isAdmin: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};