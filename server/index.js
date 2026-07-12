require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());
connectDB();

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('client connected:', socket.id);
});

const PORT = process.env.SERVER_PORT || 5000;
server.listen(PORT, () => console.log(Server running on port ));
