import { io } from 'socket.io-client';
import config from '../config';
import CookieManager from '../utils/cookieManager';

// Validate token by checking if user exists
const validateToken = async (token) => {
  if (!token) return false;
  try {
    const response = await fetch(`${config.API_URL}/users/validate-token`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Get auth token for socket connection
const getAuthToken = () => {
  try {
    const session = CookieManager.getUserSession();
    return session?.token || null;
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return null;
  }
};

// Create socket instance but don't connect immediately
const socket = io(config.SOCKET_URL || 'http://localhost:5000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false,
  auth: {
    token: getAuthToken()
  }
});

// Only connect if user is authenticated and token is valid
const initializeSocket = async () => {
  const token = getAuthToken();
  if (token && await validateToken(token)) {
    socket.auth.token = token;
    socket.connect();
  } else if (token) {
    // Invalid token, clear session
    console.warn('Invalid token detected, clearing session');
    try {
      await fetch(`${config.API_URL}/users/cleanup-session`, { method: 'POST' });
    } catch (error) {
      console.warn('Failed to cleanup server session:', error);
    }
    CookieManager.clearUserSession();
  }
};

// Initialize socket connection
initializeSocket();

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
  
  // If user not found or authentication failed, clear invalid session
  if (error.message.includes('User not found') || error.message.includes('Authentication')) {
    console.warn('Invalid token detected, clearing session');
    CookieManager.clearUserSession();
    socket.disconnect();
    // Redirect to login if needed
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
});

// Handle socket errors
socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

export default socket;