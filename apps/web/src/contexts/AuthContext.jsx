// apps/web/src/contexts/AuthContext.jsx

import { createContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, getStoredUser, isAuthenticated, logoutUser } from '../services/auth';

/**
 * Authentication context providing user state and auth operations
 * to the entire application.
 * 
 * Consumed via useAuth() hook for accessing user data and auth methods
 * from any component in the tree.
 */
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  /**
   * Restore user session from localStorage and verify token validity.
   * Runs once on app mount to persist login across page refreshes.
   */
  const restoreSession = useCallback(async () => {
    // Quick check without API call first
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    // Restore cached user data immediately for fast UI render
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuth(true);
    }

    try {
      // Verify token is still valid with the server
      const response = await getCurrentUser();
      if (response.success) {
        setUser(response.data.user);
        setIsAuth(true);
        localStorage.setItem('roost_user', JSON.stringify(response.data.user));
      }
    } catch {
      // Token expired or invalid - clear everything
      setUser(null);
      setIsAuth(false);
      localStorage.removeItem('roost_token');
      localStorage.removeItem('roost_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Update user state and persist to localStorage.
   * Called after login, register, or profile updates.
   */
  const updateUser = (userData) => {
    setUser(userData);
    setIsAuth(true);
    localStorage.setItem('roost_user', JSON.stringify(userData));
  };

  /**
   * Clear user state and remove stored auth data.
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