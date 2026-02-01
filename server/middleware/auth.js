/**
 * Auth middleware for Builder/SiteOps
 * - If Authorization: Bearer <token> present, verify JWT and set req.userId from token
 * - Else use X-User-Id header or 'default'
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'gracex-homesafe-secret-change-in-production';

function optionalUser(req, res, next) {
  req.userId = req.headers['x-user-id'] || req.headers['x-userid'] || 'default';
  next();
}

function optionalJwt(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const token = auth.slice(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId || req.userId;
    } catch (e) {
      // invalid token - keep default userId
    }
  }
  if (!req.userId) req.userId = req.headers['x-user-id'] || 'default';
  next();
}

module.exports = { optionalUser, optionalJwt };
