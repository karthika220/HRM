/**
 * HRM & PMS - Centralized Error Handling Middleware
 * Project: Human Resource Management & Project Management System
 * 
 * Provides consistent error response format across the application
 * Handles Prisma errors, JWT errors, validation errors, and custom application errors
 * 
 * Features:
 * - Standardized error response format: { success: false, message: string, error?: details }
 * - Prisma database error handling (P2002, P2025, P2003, P2014)
 * - JWT authentication error handling (JsonWebTokenError, TokenExpiredError, NotBeforeError)
 * - Development vs production error details
 * - Proper HTTP status code mapping
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Prisma Error Handling
  if (err.code === 'P2002') {
    statusCode = 400;
    message = 'Unique constraint violation';
    details = err.meta?.target || 'A record with this value already exists';
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
    details = err.meta?.cause || 'The requested resource does not exist';
  }

  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Foreign key constraint violation';
    details = err.meta?.field_name || 'Invalid reference to related record';
  }

  if (err.code === 'P2014') {
    statusCode = 400;
    message = 'Invalid relation violation';
    details = err.meta?.reason || 'Cannot perform this operation due to existing relations';
  }

  // JWT Error Handling
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    details = 'The provided token is malformed or invalid';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    details = 'The provided token has expired';
  }

  if (err.name === 'NotBeforeError') {
    statusCode = 401;
    message = 'Token not active';
    details = 'The provided token is not active yet';
  }

  // Validation Error Handling
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = err.details || 'Invalid input data';
  }

  // Syntax Error Handling (JSON parsing)
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON format';
    details = 'Request body contains invalid JSON';
  }

  // Cast Error Handling (Mongoose/Prisma type casting)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    details = `Invalid ${err.path}: ${err.value}`;
  }

  // Custom App Errors
  if (err.isOperational) {
    statusCode = err.statusCode || 400;
    message = err.message;
    details = err.details || null;
  }

  // Handle known HTTP errors
  if (err.status) {
    statusCode = err.status;
    message = err.message || 'Request failed';
  }

  // Build error response
  const errorResponse = {
    success: false,
    message: message
  };

  // Add error details only in development environment
  if (process.env.NODE_ENV === 'development' && details) {
    errorResponse.error = details;
  }

  // Add stack trace only in development environment
  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
