// apps/web/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { appConfig } from '@roost/config';
import ErrorBoundary from './components/ui/ErrorBoundary';
import PublicLayout from './components/layout/PublicLayout';
import Spinner from './components/ui/Spinner';

/**
 * ROOST Application Root Component.
 * Wraps the entire app with providers (Auth, Toast, Router)
 * and configures lazy-loaded routes for optimal performance.
 * Code-splitting via React.lazy ensures each page is loaded
 * only when the user navigates to it.
 */

// ─── Lazy-Loaded Page Components ───
// Each page is a separate chunk loaded on demand
const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const HostDashboard = lazy(() => import('./pages/HostDashboard'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * Full-page loading fallback displayed while lazy-loaded pages are fetched.
 * Uses our custom Spinner component - never shows browser-default loading.
 */
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  }}>
    <Spinner size="lg" color="primary" label="Loading page..." />
  </div>
);

/**
 * Protected route wrapper.
 * Redirects to login if user is not authenticated.
 * Checks for stored token before making the redirect decision.
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('roost_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, verify from stored user data
  if (requiredRole) {
    try {
      const user = JSON.parse(localStorage.getItem('roost_user') || '{}');
      if (user.role !== requiredRole && user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

/**
 * App Component
 * Provider hierarchy: ErrorBoundary > Router > Auth > Toast > Routes
 */
const App = () => {
  return (
    <ErrorBoundary
      fallbackTitle="ROOST encountered an error"
      fallbackMessage="Please refresh the page or try again later."
    >
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <PublicLayout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/listing/:slug" element={<ListingDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Guest routes */}
                  <Route
                    path="/bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Host routes */}
                  <Route
                    path="/host/dashboard"
                    element={
                      <ProtectedRoute requiredRole="HOST">
                        <HostDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/host/listings/new"
                    element={
                      <ProtectedRoute requiredRole="HOST">
                        <CreateListing />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="ADMIN">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 - Must be last */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </PublicLayout>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;