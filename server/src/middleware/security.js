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
    // Frontend (Vercel) and backend (Render) live on different origins, so
    // this is a cross-site request from the browser's point of view.
    // SameSite=Strict (and even Lax) means the cookie is never attached to
    // cross-site requests, which made every CSRF-protected route
    // (login/session exchange, contributions, votes, approvals...) fail in
    // production. SameSite=None is required for cross-site cookies, and
    // requires Secure=true (already set below).
    sameSite: "none",
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
