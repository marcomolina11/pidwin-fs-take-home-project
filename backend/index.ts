import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './src/app.js';
import { startGameCycle, stopGameCycle } from './src/services/gameService.js';
import MongoDbService from './src/services/mongoDbService.js';

dotenv.config();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT: string | number = process.env.PORT || 8000;

server.listen(PORT, () => console.log(`Server Started On Port ${PORT}`));

// Handling dependency through some IOC container would be ideal
const dbService = new MongoDbService();
const dbConnectionString = process.env.MONGODB_URL || '';

dbService
  .connect(dbConnectionString)
  .then(() => {
    console.log('Starting Game Cycle...');
    startGameCycle();
  })
  .catch((error) => console.log(error.message));

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');

  // Stop the game cycle
  stopGameCycle();

  // Close all Socket.io connections
  io.close(() => {
    console.log('Socket.io connections closed');

    // Close MongoDB connection
    dbService
      .closeConnection()
      .then(() => {
        console.log('MongoDB connection closed');

        // Close the HTTP server with a timeout
        const serverCloseTimeout = setTimeout(() => {
          console.log('Server close timed out, forcing exit');
          process.exit(1);
        }, 3000);

        server.close(() => {
          clearTimeout(serverCloseTimeout);
          console.log('Server closed');
          process.exit(0);
        });
      })
      .catch((err) => {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      });
  });
});

// Backup force exit handler for SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received, forcing exit');
  process.exit(1);
});

export { app, server, io };
