import express, { Express } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './src/api/user.js';
import gameRouter from './src/api/game.js';
import http from 'http';
import { Server } from 'socket.io';
import { startGameCycle, stopGameCycle } from './src/services/gameService.js';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Export io to use in other files
export { io };

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.use(cors());
app.use('/api/user', userRouter);
app.use('/api/game', gameRouter);

const PORT: string | number = process.env.PORT || 8000;

server.listen(PORT, () => console.log(`Server Started On Port ${PORT}`));

mongoose
  .connect(process.env.MONGODB_URL || '')
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
    mongoose.connection
      .close(false)
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
