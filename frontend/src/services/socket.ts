import { io } from 'socket.io-client';

// Connect to backend WebSocket server
const socket = io('http://localhost:8000');

socket.on('connect', () => {
  console.log('Connected to socket.io server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from socket.io server');
});

export default socket;
