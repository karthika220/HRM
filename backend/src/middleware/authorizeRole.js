/**
 * HRM & PMS - Role-Based Access Control Middleware
 * Project: Human Resource Management & Project Management System
 * 
 * Provides fine-grained access control based on user roles for the HRM & PMS platform
 * Works with existing authentication middleware to enforce role-based permissions
 * 
 * Features:
 * - Reads role from decoded JWT token (set by auth middleware)
 * - Accepts allowed roles as parameters for flexible access control
 * - Returns 403 status for unauthorized access attempts
 * - Convenience functions for common role combinations
 * - Role hierarchy support (higher roles can access lower role resources)
 * - Custom condition support for complex business logic
 * 
 * Supported Roles: EMPLOYEE, HR_STAFF, HR_MANAGER, MANAGER, ADMIN, SUPER_ADMIN
 * 
 * Usage Examples:
 * - authorizeRole('ADMIN', 'MANAGER') - Only Admin and Manager roles
 * - authorizeAdmin - Admin and Super Admin only
 * - authorizeRoleOrHigher('MANAGER') - Manager level and above
 */

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated and has role information
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has a role
    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'User role not defined'
      });
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions',
        error: {
          requiredRoles: allowedRoles,
          userRole: req.user.role
        }
      });
    }

    // User is authorized, proceed to next middleware/route
    next();
  };
};

// Convenience functions for common role checks
const authorizeAdmin = authorizeRole('ADMIN', 'SUPER_ADMIN');
const authorizeManager = authorizeRole('ADMIN', 'SUPER_ADMIN', 'MANAGER', 'HR_MANAGER');
const authorizeHR = authorizeRole('ADMIN', 'SUPER_ADMIN', 'HR_MANAGER', 'HR_STAFF');
const authorizeEmployee = authorizeRole('ADMIN', 'SUPER_ADMIN', 'MANAGER', 'HR_MANAGER', 'HR_STAFF', 'EMPLOYEE');

// Role hierarchy check (higher roles can access lower role resources)
const authorizeRoleOrHigher = (minimumRole) => {
  const roleHierarchy = {
    'EMPLOYEE': 1,
    'HR_STAFF': 2,
    'HR_MANAGER': 3,
    'MANAGER': 4,
    'ADMIN': 5,
    'SUPER_ADMIN': 6
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'User role not defined'
      });
    }

    const userRoleLevel = roleHierarchy[req.user.role] || 0;
    const requiredRoleLevel = roleHierarchy[minimumRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient role level',
        error: {
          minimumRequiredRole: minimumRole,
          userRole: req.user.role
        }
      });
    }

    next();
  };
};

// Custom role checker with additional conditions
const authorizeWithConditions = (allowedRoles, additionalCondition = null) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions',
        error: {
          requiredRoles: allowedRoles,
          userRole: req.user.role
        }
      });
    }

    // If additional condition is provided, check it
    if (additionalCondition && typeof additionalCondition === 'function') {
      try {
        const conditionResult = additionalCondition(req);
        if (!conditionResult) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: additional conditions not met'
          });
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error checking authorization conditions'
        });
      }
    }

    next();
  };
};

module.exports = {
  authorizeRole,
  authorizeAdmin,
  authorizeManager,
  authorizeHR,
  authorizeEmployee,
  authorizeRoleOrHigher,
  authorizeWithConditions
};
