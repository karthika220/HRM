/**
 * HRM & PMS - Request Logging Middleware
 * Project: Human Resource Management & Project Management System
 * 
 * HTTP request logging middleware using morgan
 * Provides comprehensive request logging with performance metrics
 */

const morgan = require('morgan');

/**
 * Custom morgan format for HRM & PMS application
 * Logs method, URL, status code, response time, and additional context
 */
const customFormat = ':method :url :status :res[content-length] - :response-time ms';

/**
 * Custom token for response time in milliseconds
 */
morgan.token('response-time', (req, res) => {
  if (!req._startAt) return '-';
  const responseTime = Date.now() - req._startAt;
  return responseTime.toFixed(2);
});

/**
 * Custom token for request ID for tracking
 */
morgan.token('request-id', (req) => {
  return req.id || req.headers['x-request-id'] || '-';
});

/**
 * Request logging middleware configuration
 */
const requestLogger = morgan(customFormat, {
  // Stream to write logs to (defaults to stdout)
  stream: process.env.NODE_ENV === 'production' ? process.stdout : process.stderr,
  
  // Skip logging for health checks and static assets in production
  skip: (req, res) => {
    // Skip health check endpoints
    if (req.path === '/api/health' || req.path === '/health') {
      return true;
    }
    
    // Skip static assets in production
    if (process.env.NODE_ENV === 'production') {
      const staticAssetPatterns = [
        /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
        /^\/(public|assets|static|images|fonts)\//,
        /^\/favicon\.ico$/
      ];
      
      return staticAssetPatterns.some(pattern => pattern.test(req.path));
    }
    
    return false;
  },
  
  // Add custom request properties for logging
  immediate: (req, res) => {
    // Add start time for response time calculation
    req._startAt = Date.now();
    
    // Add unique request ID if not present
    if (!req.id && !req.headers['x-request-id']) {
      req.id = generateRequestId();
    }
  }
});

/**
 * Generate unique request ID for tracking
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Enhanced request logging with additional context
 * Logs more detailed information for debugging and monitoring
 */
const enhancedRequestLogger = morgan((tokens, req, res) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    responseTime: tokens['response-time'](req, res),
    requestId: tokens['request-id'](req, res),
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
    userId: req.user?.id || 'anonymous',
    userRole: req.user?.role || 'none'
  };
  
  // Format log entry
  return JSON.stringify(logData);
}, {
  // Stream for enhanced logs
  stream: {
    write: (message) => {
      // Parse JSON and format for better readability
      try {
        const logData = JSON.parse(message);
        const logLevel = getLogLevel(logData.status);
        const logMessage = formatLogMessage(logData);
        
        console.log(`[${logLevel}] ${logMessage}`);
      } catch (error) {
        // Fallback to raw logging if JSON parsing fails
        console.log('[INFO] Request:', message);
      }
    }
  },
  
  // Skip logging for certain requests
  skip: (req, res) => {
    // Skip health checks
    if (req.path === '/api/health' || req.path === '/health') {
      return true;
    }
    
    // Skip static assets
    const staticAssetPatterns = [
      /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
      /^\/(public|assets|static|images|fonts)\//
    ];
    
    return staticAssetPatterns.some(pattern => pattern.test(req.path));
  }
});

/**
 * Determine log level based on HTTP status code
 */
function getLogLevel(status) {
  if (!status) return 'INFO';
  
  const statusCode = parseInt(status);
  
  if (statusCode >= 500) return 'ERROR';
  if (statusCode >= 400) return 'WARN';
  if (statusCode >= 300) return 'INFO';
  if (statusCode >= 200) return 'INFO';
  
  return 'INFO';
}

/**
 * Format log message for better readability
 */
function formatLogMessage(logData) {
  const {
    timestamp,
    method,
    url,
    status,
    responseTime,
    requestId,
    userId,
    userRole,
    ip
  } = logData;
  
  // Format: [TIMESTAMP] METHOD URL STATUS - RESPONSE_TIME ms - USER:userId(IP)
  let message = `${timestamp} ${method} ${url} ${status} - ${responseTime}ms`;
  
  // Add user information if available
  if (userId && userId !== 'anonymous') {
    message += ` - USER:${userId}`;
    if (userRole && userRole !== 'none') {
      message += `(${userRole})`;
    }
  }
  
  // Add IP address
  if (ip) {
    message += `(${ip})`;
  }
  
  // Add request ID for tracking
  if (requestId && requestId !== '-') {
    message += ` [${requestId}]`;
  }
  
  return message;
}

/**
 * Error logging middleware for request errors
 */
const errorLogger = morgan('dev', {
  skip: (req, res) => res.statusCode < 400,
  stream: {
    write: (message) => {
      console.error('[ERROR] Request Error:', message);
    }
  }
});

/**
 * Performance monitoring middleware
 * Logs slow requests and performance metrics
 */
const performanceLogger = morgan((tokens, req, res) => {
  const responseTime = parseFloat(tokens['response-time'](req, res));
  const status = parseInt(tokens.status(req, res));
  
  // Log slow requests (> 1 second)
  if (responseTime > 1000) {
    const logData = {
      timestamp: new Date().toISOString(),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: status,
      responseTime: responseTime,
      requestId: tokens['request-id'](req, res),
      ip: req.ip || req.connection.remoteAddress,
      warning: 'SLOW_REQUEST'
    };
    
    console.warn('[PERF] Slow Request Detected:', JSON.stringify(logData, null, 2));
  }
  
  // Log error responses
  if (status >= 400) {
    const logData = {
      timestamp: new Date().toISOString(),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: status,
      responseTime: responseTime,
      requestId: tokens['request-id'](req, res),
      ip: req.ip || req.connection.remoteAddress,
      warning: 'ERROR_RESPONSE'
    };
    
    console.error('[ERROR] Error Response:', JSON.stringify(logData, null, 2));
  }
  
  // Return null to suppress default morgan logging
  return null;
}, {
  stream: {
    write: () => {} // Suppress default output
  }
});

/**
 * Request statistics collector
 * Collects request statistics for monitoring
 */
class RequestStats {
  constructor() {
    this.requests = 0;
    this.errors = 0;
    this.slowRequests = 0;
    this.totalResponseTime = 0;
    this.startTimestamp = Date.now();
  }
  
  record(statusCode, responseTime) {
    this.requests++;
    this.totalResponseTime += responseTime;
    
    if (statusCode >= 400) {
      this.errors++;
    }
    
    if (responseTime > 1000) {
      this.slowRequests++;
    }
  }
  
  getStats() {
    const uptime = Date.now() - this.startTimestamp;
    const avgResponseTime = this.requests > 0 ? this.totalResponseTime / this.requests : 0;
    
    return {
      uptime: uptime,
      requests: this.requests,
      errors: this.errors,
      slowRequests: this.slowRequests,
      avgResponseTime: avgResponseTime.toFixed(2),
      errorRate: this.requests > 0 ? ((this.errors / this.requests) * 100).toFixed(2) : '0.00',
      slowRequestRate: this.requests > 0 ? ((this.slowRequests / this.requests) * 100).toFixed(2) : '0.00'
    };
  }
}

// Global stats instance
const requestStats = new RequestStats();

/**
 * Statistics logging middleware
 * Logs periodic request statistics
 */
const statsLogger = morgan((tokens, req, res) => {
  const statusCode = parseInt(tokens.status(req, res));
  const responseTime = parseFloat(tokens['response-time'](req, res));
  
  // Record request in stats
  requestStats.record(statusCode, responseTime);
  
  // Log stats every 100 requests
  if (requestStats.requests % 100 === 0) {
    const stats = requestStats.getStats();
    console.log('[STATS] Request Statistics:', JSON.stringify(stats, null, 2));
  }
  
  return null; // Suppress default output
}, {
  stream: {
    write: () => {} // Suppress default output
  }
});

module.exports = {
  requestLogger,
  enhancedRequestLogger,
  errorLogger,
  performanceLogger,
  statsLogger,
  requestStats
};
