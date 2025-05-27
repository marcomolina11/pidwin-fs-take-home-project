import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRouter from './routes/user.js';
import gameRouter from './routes/game.js';

// Create express app without starting it
const app = express();

// Middleware
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(cors());

// Routes
app.use('/api/user', userRouter);
app.use('/api/game', gameRouter);

export default app;
