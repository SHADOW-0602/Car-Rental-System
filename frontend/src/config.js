// Configuration file for the Car Rental System frontend
const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'),
  
  // Socket Configuration
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000'),
  
  // App Configuration
  APP_NAME: 'UrbanFleet',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: true,
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_PAYMENTS: true,
};

export default config;
