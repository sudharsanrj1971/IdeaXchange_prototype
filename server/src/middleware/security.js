const helmet = require('helmet');
const { doubleCsrf } = require('csrf-csrf');
const rateLimit = require('express-rate-limit');

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  referrerPolicy: { policy: 'same-origin' },
});

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.JWT_SECRET,
  cookieName: "__Host-ps-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many authentication attempts, please try again after 15 minutes' }
});

module.exports = {
  helmetConfig,
  doubleCsrfProtection,
  generateToken,
  apiLimiter,
  authLimiter
};
