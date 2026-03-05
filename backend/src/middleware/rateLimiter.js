/**
 * HRM & PMS - Rate Limiting Middleware
 * Project: Human Resource Management & Project Management System
 * 
 * Rate limiting middleware for protecting authentication endpoints
 * Uses express-rate-limit with configurable windows and limits
 */

const rateLimit = require('express-rate-limit');

/**
 * HRM & PMS - Authentication Rate Limiter
 * 
 * Configuration:
 * - Window: 15 minutes
 * - Max Requests: 100 per window per IP
 * - Applied only to authentication routes
 * - Does not affect other API endpoints
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  },
  
  // Skip successful requests (don't count them towards rate limit)
  skipSuccessfulRequests: false,
  
  // Skip requests that have a "skip-rate-limit" header
  skip: (req) => {
    return req.headers['skip-rate-limit'] === 'true';
  }
});

/**
 * Stricter rate limiter for sensitive authentication actions
 * Used for login attempts to prevent brute force attacks
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Only 20 login attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts detected, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    console.warn(`Login rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts detected, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Rate limiter for password reset and account recovery
 * Very strict limits for security-sensitive operations
 */
const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 password reset attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    console.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts, please try again later.',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Rate limiter for user registration
 * Prevents spam account creation
 */
const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Only 10 registrations per hour per IP
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    console.warn(`Registration rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts, please try again later.',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Middleware to check if request is for authentication routes
 * This helps apply rate limiting only to specific routes
 */
const isAuthRoute = (req) => {
  const authRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/signup',
    '/api/auth/logout',
    '/api/auth/refresh',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email'
  ];
  
  return authRoutes.some(route => req.path.startsWith(route));
};

/**
 * Conditional rate limiter that only applies to authentication routes
 */
const conditionalAuthRateLimiter = (req, res, next) => {
  if (isAuthRoute(req)) {
    // Apply different rate limits based on the specific auth route
    if (req.path.includes('/login') || req.path.includes('/refresh')) {
      return loginRateLimiter(req, res, next);
    } else if (req.path.includes('/register') || req.path.includes('/signup')) {
      return registrationRateLimiter(req, res, next);
    } else if (req.path.includes('/reset-password') || req.path.includes('/forgot-password')) {
      return passwordResetRateLimiter(req, res, next);
    } else {
      return authRateLimiter(req, res, next);
    }
  } else {
    // Skip rate limiting for non-auth routes
    next();
  }
};

/**
 * Rate limiter for API health checks and public endpoints
 * More lenient limits for monitoring and public access
 */
const publicRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute for public endpoints
  message: {
    success: false,
    message: 'Rate limit exceeded for public endpoints.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    console.warn(`Public rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded for public endpoints.',
      retryAfter: '1 minute'
    });
  }
});

module.exports = {
  authRateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
  registrationRateLimiter,
  conditionalAuthRateLimiter,
  publicRateLimiter,
  isAuthRoute
};
