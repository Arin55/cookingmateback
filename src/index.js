import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './lib/db.js';

import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import workoutRoutes from './routes/workouts.js';
import calorieRoutes from './routes/calories.js';
import dietRoutes from './routes/diets.js';
import chatbotRoutes from './routes/chatbot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const BASE_PORT = Number(process.env.PORT) || 5000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/calories', calorieRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/diets', dietRoutes);

// Serve frontend static files
const clientDir = path.join(__dirname, '..', '..', 'client');
app.use('/client', express.static(clientDir));

// Pretty routes for main pages
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

// Start server after DB connect
connectDB()
  .then(() => {
    // Try the specified port, and if it's busy, try the next few ports.
    const maxAttempts = 5;
    let attempt = 0;
    const tryListen = (port) => {
      const server = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });
      server.on('error', (err) => {
        if (err?.code === 'EADDRINUSE' && attempt < maxAttempts) {
          attempt += 1;
          const nextPort = port + 1;
          console.warn(`Port ${port} in use. Trying ${nextPort}...`);
          tryListen(nextPort);
        } else {
          console.error('Failed to start server:', err);
          process.exit(1);
        }
      });
    };
    tryListen(BASE_PORT);
  })
  .catch((err) => {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  });
