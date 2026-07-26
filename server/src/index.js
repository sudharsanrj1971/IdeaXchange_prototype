require('dotenv').config();
const { validateEnv } = require('./config/envValidator');
validateEnv();

const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const { initFirebase } = require('./config/firebase');

const {
  helmetConfig,
  doubleCsrfProtection,
  generateToken,
  apiLimiter,
  authLimiter
} = require('./middleware/security');
const globalErrorHandler = require('./middleware/globalErrorHandler');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const projectsRouter = require('./routes/projects');
const contributionsRouter = require('./routes/contributions');
const approvalsRouter = require('./routes/approvals');
const reputationRouter = require('./routes/reputation');
const healthRouter = require('./routes/health');

const app = express();

app.use(helmetConfig);
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Rate limit all API routes
app.use('/api', apiLimiter);

// CSRF Token retrieval endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: generateToken(req, res) });
});

// Protect all state-changing endpoints with CSRF token checks
app.use(doubleCsrfProtection);

// Routers
app.use('/api/health', healthRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/contributions', contributionsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/reputation', reputationRouter);

// Sentry error handler (must be placed before other error handlers)
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Global error handler
app.use(globalErrorHandler);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

// Reject socket connections that don't present a valid backend JWT.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token || !process.env.JWT_SECRET) {
      return next(new Error('Unauthorized'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log('client connected:', socket.id);

  socket.on('joinProject', (projectId) => {
    socket.join(`project:${projectId}`);
  });

  socket.on('leaveProject', (projectId) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('client disconnected:', socket.id);
  });
});

const PORT = process.env.SERVER_PORT || 5000;

const start = async () => {
  await connectDB();
  initFirebase();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();

module.exports = { app, server };
