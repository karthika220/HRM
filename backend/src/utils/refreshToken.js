/**
 * HRM & PMS - Refresh Token Utility
 * Project: Human Resource Management & Project Management System
 * 
 * Utility functions for managing refresh tokens
 * Provides secure token generation, validation, and cleanup
 */

const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma');
const crypto = require('crypto');

// JWT Secrets
const JWT_SECRET = process.env.JWT_SECRET || 'workforce-jwt-secret-key-2024';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'workforce-refresh-secret-key-2024';

// Token Expiry Times
const ACCESS_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

/**
 * Generate a secure refresh token
 * @returns {string} - Cryptographically secure random token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Create and store a refresh token for a user
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Refresh token
 */
const createRefreshToken = async (userId) => {
  try {
    // Generate secure refresh token
    const refreshToken = generateRefreshToken();
    
    // Calculate expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    
    // Remove any existing refresh tokens for this user (optional - uncomment if you want one token per user)
    // await prisma.refreshToken.deleteMany({ where: { userId } });
    
    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiryDate,
      },
    });
    
    return refreshToken;
  } catch (error) {
    console.error('Error creating refresh token:', error);
    throw new Error('Failed to create refresh token');
  }
};

/**
 * Validate refresh token and get user
 * @param {string} token - Refresh token
 * @returns {Promise<object>} - User object if valid
 */
const validateRefreshToken = async (token) => {
  try {
    // Find refresh token in database
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
    
    if (!refreshTokenRecord) {
      throw new Error('Refresh token not found');
    }
    
    // Check if token has expired
    if (refreshTokenRecord.expiryDate < new Date()) {
      // Remove expired token
      await prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } });
      throw new Error('Refresh token expired');
    }
    
    // Check if user is still active
    if (!refreshTokenRecord.user.isActive) {
      // Remove token for inactive user
      await prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } });
      throw new Error('User account is inactive');
    }
    
    return refreshTokenRecord.user;
  } catch (error) {
    console.error('Error validating refresh token:', error);
    throw error;
  }
};

/**
 * Generate new access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<object>} - New access token and user info
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Validate refresh token and get user
    const user = await validateRefreshToken(refreshToken);
    
    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    return {
      token: accessToken,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

/**
 * Remove refresh token (logout)
 * @param {string} token - Refresh token
 * @returns {Promise<boolean>} - Success status
 */
const revokeRefreshToken = async (token) => {
  try {
    const deleted = await prisma.refreshToken.deleteMany({
      where: { token },
    });
    
    return deleted.count > 0;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    return false;
  }
};

/**
 * Remove all refresh tokens for a user (logout all devices)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Success status
 */
const revokeAllUserTokens = async (userId) => {
  try {
    const deleted = await prisma.refreshToken.deleteMany({
      where: { userId },
    });
    
    return deleted.count > 0;
  } catch (error) {
    console.error('Error revoking all user tokens:', error);
    return false;
  }
};

/**
 * Clean up expired refresh tokens
 * @returns {Promise<number>} - Number of tokens cleaned up
 */
const cleanupExpiredTokens = async () => {
  try {
    const deleted = await prisma.refreshToken.deleteMany({
      where: {
        expiryDate: {
          lt: new Date(),
        },
      },
    });
    
    return deleted.count;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  }
};

module.exports = {
  generateRefreshToken,
  createRefreshToken,
  validateRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  REFRESH_TOKEN_EXPIRY_DAYS,
};
