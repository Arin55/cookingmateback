import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import workoutRoutes from './routes/workouts.js';
import calorieRoutes from './routes/calories.js';
import dietRoutes from './routes/diets.js';
import chatbotRoutes from './routes/chatbot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/calories', calorieRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/diets', dietRoutes);

// Static client (optional for local dev)
const clientDir = path.join(__dirname, '..', '..', 'client');
app.use('/client', express.static(clientDir));

// Pretty routes
app.get('/', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(clientDir, 'login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(clientDir, 'signup.html'));
});
app.get('/profile', (req, res) => {
  res.sendFile(path.join(clientDir, 'profile.html'));
});

export default app;
