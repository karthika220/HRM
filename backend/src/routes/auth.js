const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma');
const { authenticate } = require('../middleware/auth');
const { createRefreshToken, refreshAccessToken, revokeRefreshToken, cleanupExpiredTokens } = require('../utils/refreshToken');
const { conditionalAuthRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to all authentication routes
router.use(conditionalAuthRateLimiter);

// Ensure JWT_SECRET is consistent
const JWT_SECRET = process.env.JWT_SECRET || 'workforce-jwt-secret-key-2024';

// GET /api/auth - Simple route to verify auth module is working
router.get('/', (req, res) => {
  res.json({
    message: "Auth route is working"
  });
});

// POST /api/auth/signup - Register new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validation
    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Prevent Managing Director role selection
    if (role === 'MANAGING_DIRECTOR') {
      return res.status(400).json({ message: 'Invalid role selection' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        department,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create refresh token
    const refreshToken = await createRefreshToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      refreshToken, // Add refresh token as additional field
      user
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Create refresh token (temporarily disabled for debugging)
    // const refreshToken = await createRefreshToken(user.id);

    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      token, 
      // refreshToken, // Add refresh token as additional field
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, department } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: role || 'EMPLOYEE', department },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Create refresh token
    const refreshToken = await createRefreshToken(user.id);
    
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ 
      token, 
      refreshToken, // Add refresh token as additional field
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Generate new access token using refresh token
    const result = await refreshAccessToken(refreshToken);
    
    res.json(result);
  } catch (error) {
    console.error('Refresh token error:', error.message);
    
    if (error.message === 'Refresh token not found' || 
        error.message === 'Refresh token expired' || 
        error.message === 'User account is inactive') {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    
    res.status(500).json({ message: 'Failed to refresh token' });
  }
});

// POST /api/auth/logout - Logout user (revoke refresh token)
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Revoke the refresh token
    const revoked = await revokeRefreshToken(refreshToken);
    
    if (revoked) {
      res.json({ message: 'Logged out successfully' });
    } else {
      res.json({ message: 'Already logged out or token not found' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Failed to logout' });
  }
});

// POST /api/auth/logout-all - Logout from all devices
router.post('/logout-all', authenticate, async (req, res) => {
  try {
    // Revoke all refresh tokens for this user
    const revoked = await revokeAllUserTokens(req.user.id);
    
    res.json({ 
      message: 'Logged out from all devices successfully',
      tokensRevoked: revoked
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ message: 'Failed to logout from all devices' });
  }
});

// GET /api/auth/cleanup - Clean up expired tokens (admin only)
router.get('/cleanup', authenticate, async (req, res) => {
  try {
    // Only allow admins to cleanup tokens
    if (!['ADMIN', 'SUPER_ADMIN', 'MANAGING_DIRECTOR'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const cleanedUp = await cleanupExpiredTokens();
    
    res.json({ 
      message: 'Token cleanup completed',
      expiredTokensRemoved: cleanedUp
    });
  } catch (error) {
    console.error('Token cleanup error:', error);
    res.status(500).json({ message: 'Failed to cleanup tokens' });
  }
});

module.exports = router;
