import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './backend/routes/authRoutes.js';
import chatRoutes from './backend/routes/chatRoutes.js';
import { createUsersTable, createGameStatsTable } from './backend/models/userModel.js';
import { createMessagesTable } from './backend/models/chatModel.js';
import { setupChatServer } from './backend/websocket/chatServer.js';
import { setupGameServer } from './backend/websocket/gameServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false, // Often needed to be disabled or configured for React apps using inline styles/scripts
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(morgan('combined')); // Logging

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Ensure the tables exist (no-ops when using Supabase — tables managed via SQL Editor)
const initDb = async () => {
  await createUsersTable();
  await createGameStatsTable();
  await createMessagesTable();
};
initDb();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Serve controller HTML (always available)
app.get('/controller', (req, res) => {
  res.sendFile(path.join(__dirname, 'controller.html'));
});

// Serve static frontend in production (if dist exists)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Fallback to React Router for non-API routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
  });
} else {
  // Fallback 404 for dev API
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n======================================');
  console.log(`🚀 BACKEND SERVER STARTED ON PORT ${PORT}`);
  console.log('======================================\n');
});

// Setup WebSocket server for chat
setupChatServer(server);

// Setup WebSocket server for game controller
setupGameServer(server);