import { io } from 'socket.io-client';
import config from '../config';

// Connect to backend Socket.io server
const socket = io(config.SOCKET_URL, {
  transports: ['websocket'],
  reconnection: true,
});

export default socket;