/**
 * HRM & PMS - API Configuration
 * Project: Human Resource Management & Project Management System
 * 
 * Centralized API configuration for the HRM & PMS frontend application
 * Provides consistent base URL and configuration for all API calls
 * 
 * Environment-specific configuration:
 * - Development: http://localhost:3002/api
 * - Production: Configured via environment variable
 */

// API Base URL Configuration
export const API_BASE_URL: string = "http://localhost:3002/api";

// Alternative production-ready configuration
// Uncomment for production deployment
// export const API_BASE_URL: string = process.env.REACT_APP_API_URL || "http://localhost:3002/api";

// API Configuration Object
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
};

// Development vs Production Environment Detection
export const isDevelopment: boolean = process.env.NODE_ENV === 'development';
export const isProduction: boolean = process.env.NODE_ENV === 'production';

// API Endpoints (for reference)
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  // User Management
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    SETTINGS: '/user/settings',
  },
  // System
  SYSTEM: {
    HEALTH: '/health',
  },
  // Projects
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    UPDATE: '/projects/:id',
    DELETE: '/projects/:id',
  },
  // Attendance
  ATTENDANCE: {
    LIST: '/attendance',
    CHECK_IN: '/attendance/check-in',
    CHECK_OUT: '/attendance/check-out',
  },
};

export default API_CONFIG;
