import { io } from 'socket.io-client';
import config from '../config';
import CookieManager from '../utils/cookieManager';

// Get auth token for socket connection
const getAuthToken = () => {
  const session = CookieManager.getUserSession();
  return session.token;
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

// Only connect if user is authenticated
const token = getAuthToken();
if (token) {
  socket.connect();
}

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
  
  // If authentication failed, try to reconnect with fresh token
  if (error.message.includes('Authentication')) {
    const newToken = getAuthToken();
    if (newToken) {
      socket.auth.token = newToken;
      socket.connect();
    }
  }
});

// Handle socket errors
socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

export default socket;