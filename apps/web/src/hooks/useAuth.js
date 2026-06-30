// apps/web/src/hooks/useAuth.js

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access the authentication context.
 * Provides user data and auth operations from any component.
 *
 * @returns {Object} Auth context value containing:
 *   - user: Current user object or null
 *   - isAuth: Whether the user is authenticated
 *   - loading: Whether auth state is being restored
 *   - updateUser: Function to update user data
 *   - logout: Function to log out
 *   - isGuest: Boolean for guest role check
 *   - isHost: Boolean for host role check
 *   - isAdmin: Boolean for admin role check
 *
 * @throws {Error} If used outside of AuthProvider
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your app with <AuthProvider> to use authentication.'
    );
  }

  return context;
};

export default useAuth;