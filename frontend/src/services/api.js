import axios from 'axios';
import config from '../config';
import ErrorHandler from '../utils/errorHandler';
import CookieManager from '../utils/cookieManager';

const api = axios.create({
  baseURL: config.API_BASE_URL
});

// Automatically add JWT token to every request
api.interceptors.request.use((config) => {
  const session = CookieManager.getUserSession();
  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
}, (error) => {
  ErrorHandler.logError(error, 'API_REQUEST_ERROR');
  return Promise.reject(error);
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('🚫 401 Unauthorized - clearing session');
      CookieManager.clearUserSession();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    
    // Only log non-auth errors to reduce noise
    if (error.response?.status !== 401) {
      ErrorHandler.handleApiError(error, false);
    }
    
    return Promise.reject(error);
  }
);

export default api;