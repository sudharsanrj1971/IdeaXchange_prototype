const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth');
const ReputationLog = require('../models/reputationLog');
const User = require('../models/user');

const router = express.Router();

router.get('/:userId/log', verifyFirebaseToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const logs = await ReputationLog.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId/score', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('reputationScore');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ userId: req.params.userId, score: user.reputationScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
