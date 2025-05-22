import express, { Express } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './src/api/user.js';
import gameRouter from './src/api/game.js';
import {
  startGameCycle,
  stopGameCycle,
} from './src/controllers/gameController.js';

dotenv.config();

const app: Express = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.use(cors());
app.use('/api/user', userRouter);
app.use('/api/game', gameRouter);

const PORT: string | number = process.env.PORT || 8000;

const server = app.listen(PORT, () =>
  console.log(`Server Started On Port ${PORT}`)
);

mongoose
  .connect(process.env.MONGODB_URL || '')
  .then(() => {
    console.log('Starting Game Cycle...');
    startGameCycle();
  })
  .catch((error) => console.log(error.message));

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  stopGameCycle();
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
