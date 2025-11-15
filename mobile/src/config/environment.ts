export const ENV = {
  // API Configuration
  API_BASE_URL: __DEV__
    ? 'http://localhost:3000/api'
    : 'https://api.adventure-platform.com/api',

  API_GATEWAY_URL: __DEV__
    ? 'http://localhost:3000'
    : 'https://api.adventure-platform.com',

  // Map Configuration
  GOOGLE_MAPS_API_KEY: __DEV__
    ? 'YOUR_DEV_GOOGLE_MAPS_API_KEY'
    : 'YOUR_PROD_GOOGLE_MAPS_API_KEY',

  // Feature Flags
  ENABLE_ANALYTICS: !__DEV__,
  ENABLE_CRASH_REPORTING: !__DEV__,
  ENABLE_DEBUG_MENU: __DEV__,

  // App Configuration
  APP_NAME: 'Adventure Platform',
  APP_VERSION: '1.0.0',
  BUNDLE_ID: 'com.adventureplatform.app',

  // Storage Keys
  AUTH_TOKEN_KEY: '@auth_token',
  USER_DATA_KEY: '@user_data',
  ONBOARDING_KEY: '@onboarding_complete',

  // Timeouts (milliseconds)
  API_TIMEOUT: 15000,
  REQUEST_TIMEOUT: 10000,

  // Location
  CHECKPOINT_RADIUS: 50, // meters
  LOCATION_UPDATE_INTERVAL: 5000, // 5 seconds
  LOCATION_ACCURACY: 'high' as const,

  // Media
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_QUALITY: 0.8,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,

  // Cache
  CACHE_EXPIRY: 60 * 60 * 1000, // 1 hour
};

export default ENV;
