// Configuration file for the Car Rental System frontend
const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  
  // Socket Configuration
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000',
  
  // App Configuration
  APP_NAME: 'Car Rental System',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: true,
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_PAYMENTS: true,
};

export default config;
