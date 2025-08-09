import { io } from 'socket.io-client';

// Connect to backend Socket.io server
const socket = io(process.env.REACT_APP_API_URL, {
  transports: ['websocket'],
  reconnection: true
});

export default socket;