import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import kanbanRoutes from './routes/kanban.routes';
import settingsRoutes from './routes/settings.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  logger.info('SERVER', `${req.method} ${req.url}`);
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'flowsync-backend', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  logger.info('SOCKET', `User connected: ${socket.id}`);

  socket.on('join_workspace', (workspaceId: string) => {
    socket.join(workspaceId);
    logger.info('SOCKET', `User ${socket.id} joined workspace: ${workspaceId}`);
  });

  socket.on('disconnect', () => {
    logger.info('SOCKET', `User disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info('SERVER', `FlowSync Backend running on port ${PORT}`);
});
