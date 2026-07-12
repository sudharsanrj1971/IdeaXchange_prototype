const express = require('express');
const User = require('../models/user');
const { verifyFirebaseToken } = require('../middleware/auth');

const router = express.Router();

const PUBLIC_FIELDS = 'name email role reputationScore createdAt';

router.get('/me', verifyFirebaseToken, (req, res) => {
  res.json(req.user);
});

router.patch('/me', verifyFirebaseToken, async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }) },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(PUBLIC_FIELDS);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
