const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../database');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, 'your-super-secret-jwt-key-change-this-in-production', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// GET /api/users - Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching all users...');
    const users = await db.getAllUsers();
    console.log('✅ Retrieved users:', users.length);
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

module.exports = router;
