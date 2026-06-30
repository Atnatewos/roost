// ROOST Feature Flags
// Turn features ON/OFF from one place

const features = {
  // Core
  guestBooking: true,
  hostListing: true,
  messaging: true,
  reviews: true,

  // Payments
  chapaGateway: false,       // Set true when Chapa API is integrated
  manualScreenshot: true,    // Accept payment screenshots
  telebirr: true,
  cbeBirr: true,

  // Verification
  faydaId: true,             // Ethiopian National ID
  phoneVerification: true,
  videoSelfie: false,        // Future feature

  // Search
  mapView: false,            // Future feature
  instantBook: false,
  datePicker: true,

  // AI (All disabled for now)
  aiSearch: false,
  aiRecommendations: false,
  aiPricing: false,
  aiTranslation: false,
};

export default features;
