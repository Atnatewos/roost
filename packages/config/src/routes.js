// ROOST Route Configuration
// Every route in the app defined here

const routes = {
  public: [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Search' },
    { path: '/listing/:slug', label: 'Listing' },
    { path: '/become-host', label: 'Become a Host' },
    { path: '/about', label: 'About' },
    { path: '/help', label: 'Help' },
  ],

  auth: [
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
    { path: '/forgot-password', label: 'Forgot Password' },
  ],

  guest: [
    { path: '/bookings', label: 'My Bookings', auth: true },
    { path: '/favorites', label: 'Favorites', auth: true, feature: 'wishlist' },
  ],

  host: [
    { path: '/host/dashboard', label: 'Dashboard', auth: true, role: 'HOST' },
    { path: '/host/listings', label: 'My Listings', auth: true, role: 'HOST' },
    { path: '/host/listings/new', label: 'New Listing', auth: true, role: 'HOST' },
    { path: '/host/earnings', label: 'Earnings', auth: true, role: 'HOST' },
  ],

  admin: [
    { path: '/admin', label: 'Admin Dashboard', auth: true, role: 'ADMIN' },
    { path: '/admin/verify-users', label: 'Verify Users', auth: true, role: 'ADMIN' },
    { path: '/admin/verify-listings', label: 'Verify Listings', auth: true, role: 'ADMIN' },
    { path: '/admin/payments', label: 'Confirm Payments', auth: true, role: 'ADMIN' },
  ],
};

export default routes;
