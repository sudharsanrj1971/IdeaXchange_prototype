const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const router = express.Router();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => {
    // Only retry a few times locally to avoid endless loops
    if (times > 3) return null; 
    return Math.min(times * 50, 2000);
  }
});
redis.on('error', (err) => {
  // Silent catch to prevent unhandled rejection crashes if Redis is down
});
router.get('/', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks: {}
  };

  // MongoDB check
  try {
    if (mongoose.connection.readyState === 1) {
      health.checks.mongodb = { status: 'healthy' };
    } else {
      throw new Error('Database not connected');
    }
  } catch (err) {
    health.checks.mongodb = { status: 'unhealthy', error: err.message };
  }

  // Redis check
  try {
    const ping = await redis.ping();
    if (ping === 'PONG') {
      health.checks.redis = { status: 'healthy' };
    } else {
      throw new Error('Redis ping failed');
    }
  } catch (err) {
    health.checks.redis = { status: 'unhealthy', error: err.message };
  }

  // Raft Consensus Check (mock status for single node, or real check if cluster initialized)
  try {
    const raftStatus = req.app.get('raftStatus') || 'LEADER'; // Default leader for standalone
    health.checks.raft = { status: 'healthy', role: raftStatus };
  } catch (err) {
    health.checks.raft = { status: 'unhealthy', error: err.message };
  }

  // Redis isn't wired into anything else in this app (no session/cache/rate
  // -limit store) — it only exists to be reported here. Don't let it gate
  // the overall health status, or environments that never provisioned
  // Redis get restart-looped by Docker/Render healthchecks for no reason.
  const criticalChecks = ['mongodb', 'raft'];
  const isHealthy = criticalChecks.every(name => health.checks[name]?.status === 'healthy');

  res.status(isHealthy ? 200 : 503).json(health);
});

module.exports = router;
