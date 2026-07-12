require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const { initFirebase } = require('./config/firebase');

const usersRouter = require('./routes/users');
const projectsRouter = require('./routes/projects');
const contributionsRouter = require('./routes/contributions');
const approvalsRouter = require('./routes/approvals');
const reputationRouter = require('./routes/reputation');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/contributions', contributionsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/reputation', reputationRouter);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

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
