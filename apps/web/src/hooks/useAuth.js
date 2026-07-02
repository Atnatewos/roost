// apps/web/src/hooks/useAuth.js

/**
 * @file hooks/useAuth.js
 * @description Custom hook for accessing authentication context.
 * Provides default export to match existing component imports.
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;