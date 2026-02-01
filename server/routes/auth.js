/**
 * GRACE-X Auth API - Register, Login, JWT
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'gracex-homesafe-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

function ensureUsersFile() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf8');
}

function readUsers() {
  ensureUsersFile();
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// POST /api/auth/register - body: { email, password, name? }
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    const users = readUsers();
    if (users.find(u => u.email.toLowerCase() === String(email).toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(String(password), 10);
    const userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    users.push({
      id: userId,
      email: String(email).toLowerCase(),
      passwordHash: hash,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString()
    });
    writeUsers(users);
    const token = jwt.sign({ userId, email: users[users.length - 1].email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ success: true, token, userId, email: users[users.length - 1].email });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/auth/login - body: { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    const users = readUsers();
    const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ success: true, token, userId: user.id, email: user.email });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/auth/me - requires Authorization: Bearer <token>
router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token' });
  }
  try {
    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readUsers();
    const user = users.find(u => u.id === decoded.userId);
    if (!user) return res.status(401).json({ success: false, error: 'User not found' });
    res.json({ success: true, userId: user.id, email: user.email, name: user.name });
  } catch (e) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
});

module.exports = router;
