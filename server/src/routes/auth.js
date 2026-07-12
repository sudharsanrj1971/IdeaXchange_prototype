const express = require('express');
const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebase');
const User = require('../models/user');

const router = express.Router();

const JWT_EXPIRES_IN = '7d';

// POST /api/auth/session
// Body: { idToken }  — Firebase ID token obtained on the client after sign-in.
// Verifies the Firebase token, finds-or-creates the matching User, and
// returns a signed backend JWT that the client uses for all subsequent
// API and Socket.io requests.
router.post('/session', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);

    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name || decoded.email || 'Unnamed User',
        email: decoded.email,
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set');
    }

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({ token });
  } catch (err) {
    console.error('Session exchange failed:', err.message);
    res.status(401).json({ error: 'Could not establish session' });
  }
});

module.exports = router;
