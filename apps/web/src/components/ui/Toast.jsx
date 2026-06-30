// apps/web/src/components/ui/Toast.jsx

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import cn from '../../utils/cn';

/**
 * Toast notification context for triggering toasts from anywhere in the app.
 */
const ToastContext = createContext(null);

/**
 * Custom hook to access toast functionality.
 * Returns a showToast function for displaying notifications.
 *
 * @returns {Function} showToast(message, type)
 * @example
 * const showToast = useToast();
 * showToast('Listing created!', 'success');
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }
  return context;
};

// Toast icons mapped to notification types
const TOAST_ICONS = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

/**
 * Individual toast notification item.
 * Auto-dismisses after a configurable duration.
 */
const ToastItem = ({ id, message, type, onDismiss, duration = 4000 }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation slightly before removal
    const exitTimer = setTimeout(() => setIsExiting(true), duration - 300);
    const dismissTimer = setTimeout(() => onDismiss(id), duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [id, duration, onDismiss]);

  return (
    <div
      className={cn(
        'toast',
        `toast--${type}`,
        isExiting && 'toast--exit'
      )}
      role="alert"
      aria-live="polite"
    >
      <span className="toast__icon" aria-hidden="true">
        {TOAST_ICONS[type] || TOAST_ICONS.info}
      </span>
      <p className="toast__message">{message}</p>
      <button
        className="toast__close"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Toast provider component.
 * Wraps the application to provide toast notification functionality.
 * All toasts are custom-styled - never falls back to browser alerts.
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  let toastCounter = 0;

  /**
   * Display a toast notification.
   *
   * @param {string} message - Notification text
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'
   * @param {number} duration - Display duration in milliseconds
   */
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  /**
   * Remove a toast by ID.
   */
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      {/* Toast container - fixed position overlay */}
      <div className="toast-container" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;