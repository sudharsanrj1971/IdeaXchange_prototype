require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const { initFirebase } = require('./config/firebase');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const projectsRouter = require('./routes/projects');
const contributionsRouter = require('./routes/contributions');
const approvalsRouter = require('./routes/approvals');
const reputationRouter = require('./routes/reputation');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/contributions', contributionsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/reputation', reputationRouter);

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
