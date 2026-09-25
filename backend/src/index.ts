import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import timeout from 'connect-timeout';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { authMiddleware } from './middleware/auth.js';
import { generalRateLimiter, authRateLimiter, aiRateLimiter } from './middleware/rateLimiter.js';
import { SocketEvent } from './constants.js';
import { verifyToken } from './services/auth.service.js';
import { db } from './db/connection.js';
import { users, workspaceMembers } from './db/schema.js';
import { eq, and } from 'drizzle-orm';

const app = express();
const server = http.createServer(app);

// ============================================================
// SOCKET.IO REAL-TIME ENGINE (Initialized early for services)
// ============================================================
const io = new Server(server, {
  cors: {
    origin: [config.allowedOrigin],
    methods: ['GET', 'POST'],
    credentials: true,
  }
});
export { io };

// Timeout Halt Middleware (Fulfills Rule F2 - No 'any')
const haltOnTimeout = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.timedout) next();
};

// Route Imports (Must come AFTER io initialization if services use io)
import authRoutes from './routes/auth.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import kanbanRoutes from './routes/kanban.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import publicRoutes from './routes/public.routes.js';
import aiRoutes from './routes/ai.routes.js';
import commentRoutes from './routes/comment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import contactRoutes from './routes/contact.routes.js';

// ============================================================
// SECURITY & INFRASTRUCTURE GUARDS
// ============================================================
// ============================================================
// SECURITY & INFRASTRUCTURE GUARDS
// ============================================================
app.use((helmet as any)({
  contentSecurityPolicy: false, // Let the Next.js frontend handle CSP for rendering
  frameguard: { action: 'deny' }, // Prevent clickjacking
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // Strict Transport Security
}));
let corsOrigin: string | string[];
if (config.allowedOrigin.includes(',')) {
  corsOrigin = config.allowedOrigin.split(',').map((origin) => origin.trim().replace(/\/+$/, ''));
} else {
  corsOrigin = config.allowedOrigin.trim().replace(/\/+$/, '');
}

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================================
// PARSING & STATE
// ============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'flowsync-backend',
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// SOVEREIGN API GATEWAYS
// ============================================================
app.use('/api/auth', timeout('15s'), haltOnTimeout, authRateLimiter, authRoutes);
app.use('/api/workspaces', timeout('15s'), haltOnTimeout, generalRateLimiter, authMiddleware, workspaceRoutes);
app.use('/api/kanban', timeout('15s'), haltOnTimeout, generalRateLimiter, authMiddleware, kanbanRoutes);
app.use('/api/settings', timeout('15s'), haltOnTimeout, generalRateLimiter, authMiddleware, settingsRoutes);

// AI routes require more time for generative inception
app.use('/api/ai', timeout('60s'), haltOnTimeout, generalRateLimiter, aiRateLimiter, authMiddleware, aiRoutes);
app.use('/api/comments', timeout('15s'), haltOnTimeout, generalRateLimiter, authMiddleware, commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/public', publicRoutes);

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ERR_NOT_FOUND',
      message: 'The requested sanctuary endpoint does not exist.',
    }
  });
});

// ============================================================
// GLOBAL ERROR ORCHESTRATION
// ============================================================
app.use(errorHandler);

// Map to track active collaborative minds
const activeMinds = new Map<string, Set<{ userId: string, name: string, socketId: string }>>();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return next(new Error('Authentication required'));

    const user = await verifyToken(token);
    const userRow = await db.select({ id: users.id, name: users.name })
      .from(users).where(eq(users.id, user.userId)).limit(1);
    if (userRow.length === 0) return next(new Error('Authenticated user not found'));

    socket.data.userId = user.userId;
    socket.data.userName = userRow[0].name;
    next();
  } catch {
    next(new Error('Invalid or expired session'));
  }
});

io.on('connection', (socket) => {
  logger.info('SOCKET', `Intelligence linked: ${socket.id}`);

  socket.on(SocketEvent.JOIN_WORKSPACE, async (data: { workspaceId: string }) => {
    const { workspaceId } = data;
    const userId = socket.data.userId as string;
    const membership = await db.select({ userId: workspaceMembers.user_id })
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.user_id, userId), eq(workspaceMembers.workspace_id, workspaceId)))
      .limit(1);
    if (membership.length === 0) {
      socket.emit('error', { code: 'AUTH_FORBIDDEN', message: 'Workspace membership required' });
      return;
    }

    socket.join(workspaceId);
    socket.data.workspaceId = workspaceId;
    const user = { id: userId, name: socket.data.userName as string };

    // Track active minds (Ensure no duplicates for the same socketId)
    if (!activeMinds.has(workspaceId)) {
      activeMinds.set(workspaceId, new Set());
    }
    const minds = activeMinds.get(workspaceId)!;
    // Remove any existing entry for this specific socketId if it exists (e.g. on re-join)
    for (const mind of minds) {
      if (mind.socketId === socket.id) {
        minds.delete(mind);
        break;
      }
    }
    minds.add({ userId: user.id, name: user.name, socketId: socket.id });

    // Broadcast current presence to everyone in the room (Deduplicate by userId)
    const members = Array.from(new Map(
      Array.from(activeMinds.get(workspaceId)!).map(m => [m.userId, m])
    ).values());
    io.to(workspaceId).emit(SocketEvent.PRESENCE_UPDATED, members);

    logger.info('SOCKET', `User ${user.name} synchronized with workspace: ${workspaceId}`);
  });

  socket.on(SocketEvent.LEAVE_WORKSPACE, () => {
    const wsId = socket.data.workspaceId as string | undefined;
    if (wsId && activeMinds.has(wsId)) {
      const minds = activeMinds.get(wsId)!;
      for (const mind of minds) {
        if (mind.socketId === socket.id) {
          minds.delete(mind);
          break;
        }
      }
      const members = Array.from(new Map(
        Array.from(minds).map(m => [m.userId, m])
      ).values());
      io.to(wsId).emit(SocketEvent.PRESENCE_UPDATED, members);
      socket.leave(wsId);
      logger.info('SOCKET', `Intelligence decoupled (Explicit Leave): ${socket.id}`);
    }
  });

  socket.on('disconnect', () => {
    const wsId = (socket as any).workspaceId;

    if (wsId && activeMinds.has(wsId)) {
      const minds = activeMinds.get(wsId)!;
      for (const mind of minds) {
        if (mind.socketId === socket.id) {
          minds.delete(mind);
          break;
        }
      }

      // Broadcast updated presence (Deduplicate by userId)
      const members = Array.from(new Map(
        Array.from(minds).map(m => [m.userId, m])
      ).values());
      io.to(wsId).emit(SocketEvent.PRESENCE_UPDATED, members);
    }

    logger.info('SOCKET', `Intelligence decoupled: ${socket.id}`);
  });
});

// ============================================================
// SERVER INCEPTION
// ============================================================
const PORT = config.port;
server.listen(PORT, () => {
  logger.info('SERVER', `FlowSync Infrastructure active on port ${PORT}`);
  logger.info('SERVER', `Environment: ${config.nodeEnv}`);
});

export default app;
