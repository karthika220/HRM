/**
 * HRM & PMS - Audit Logging System
 * Project: Human Resource Management & Project Management System
 * 
 * Comprehensive audit logging utility for tracking important system actions
 * Provides non-blocking audit logging with error resilience
 */

const { prisma } = require('../prisma');

/**
 * Audit action types for consistent logging
 */
const AUDIT_ACTIONS = {
  // Project actions
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_DELETED: 'PROJECT_DELETED',
  
  // Task actions
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_DELETED: 'TASK_DELETED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  
  // User actions
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  
  // Leave actions
  LEAVE_REQUESTED: 'LEAVE_REQUESTED',
  LEAVE_APPROVED: 'LEAVE_APPROVED',
  LEAVE_REJECTED: 'LEAVE_REJECTED',
  LEAVE_CANCELLED: 'LEAVE_CANCELLED',
  
  // Authentication actions
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  
  // System actions
  SYSTEM_BACKUP: 'SYSTEM_BACKUP',
  SYSTEM_RESTORE: 'SYSTEM_RESTORE',
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_IMPORT: 'DATA_IMPORT',
  
  // Issue actions
  ISSUE_CREATED: 'ISSUE_CREATED',
  ISSUE_UPDATED: 'ISSUE_UPDATED',
  ISSUE_RESOLVED: 'ISSUE_RESOLVED',
  ISSUE_CLOSED: 'ISSUE_CLOSED',
  
  // Report actions
  REPORT_GENERATED: 'REPORT_GENERATED',
  REPORT_VIEWED: 'REPORT_VIEWED',
  REPORT_EXPORTED: 'REPORT_EXPORTED',
};

/**
 * Entity types for audit logging
 */
const ENTITY_TYPES = {
  PROJECT: 'PROJECT',
  TASK: 'TASK',
  USER: 'USER',
  LEAVE: 'LEAVE',
  ISSUE: 'ISSUE',
  REPORT: 'REPORT',
  SYSTEM: 'SYSTEM',
  AUTHENTICATION: 'AUTHENTICATION',
  TIMESHEET: 'TIMESHEET',
  ATTENDANCE: 'ATTENDANCE',
  NOTIFICATION: 'NOTIFICATION',
};

/**
 * Log an audit action
 * @param {Object} auditData - Audit log data
 * @param {string} auditData.userId - User ID who performed the action
 * @param {string} auditData.action - Action performed
 * @param {string} auditData.entityType - Type of entity affected
 * @param {string} auditData.entityId - ID of entity affected (optional)
 * @param {Object} auditData.metadata - Additional context data (optional)
 * @returns {Promise<void>}
 */
const logAudit = async (auditData) => {
  try {
    const { userId, action, entityType, entityId, metadata } = auditData;
    
    // Validate required fields
    if (!action || !entityType) {
      console.warn('Audit logging: Missing required fields', { action, entityType });
      return;
    }
    
    // Prepare audit log entry
    const auditEntry = {
      userId: userId || null, // Allow null for system actions
      action,
      entityType,
      entityId: entityId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    };
    
    // Asynchronously log to database (non-blocking)
    prisma.auditLog.create({
      data: auditEntry,
    }).catch(error => {
      // Log error but don't throw - audit logging should never interrupt main flow
      console.error('Audit logging failed:', error);
    });
    
  } catch (error) {
    // Catch any synchronous errors and log them
    console.error('Audit logging error:', error);
    // Don't re-throw - audit logging failures should not affect main application flow
  }
};

/**
 * Log project creation
 * @param {string} userId - User ID who created the project
 * @param {string} projectId - Project ID
 * @param {Object} projectData - Project data for context
 */
const logProjectCreated = async (userId, projectId, projectData) => {
  await logAudit({
    userId,
    action: AUDIT_ACTIONS.PROJECT_CREATED,
    entityType: ENTITY_TYPES.PROJECT,
    entityId: projectId,
    metadata: {
      projectName: projectData.name,
      projectStatus: projectData.status,
      budget: projectData.budget,
    },
  });
};

/**
 * Log task creation
 * @param {string} userId - User ID who created the task
 * @param {string} taskId - Task ID
 * @param {Object} taskData - Task data for context
 */
const logTaskCreated = async (userId, taskId, taskData) => {
  await logAudit({
    userId,
    action: AUDIT_ACTIONS.TASK_CREATED,
    entityType: ENTITY_TYPES.TASK,
    entityId: taskId,
    metadata: {
      taskTitle: taskData.title,
      projectId: taskData.projectId,
      assignedTo: taskData.assigneeId,
      priority: taskData.priority,
    },
  });
};

/**
 * Log leave approval
 * @param {string} userId - User ID who approved the leave
 * @param {string} leaveRequestId - Leave request ID
 * @param {Object} leaveData - Leave data for context
 */
const logLeaveApproved = async (userId, leaveRequestId, leaveData) => {
  await logAudit({
    userId,
    action: AUDIT_ACTIONS.LEAVE_APPROVED,
    entityType: ENTITY_TYPES.LEAVE,
    entityId: leaveRequestId,
    metadata: {
      employeeId: leaveData.employeeId,
      leaveType: leaveData.leaveType,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      daysRequested: leaveData.daysRequested,
    },
  });
};

/**
 * Log user update
 * @param {string} userId - User ID who performed the update
 * @param {string} targetUserId - User ID being updated
 * @param {Object} updateData - Updated fields
 * @param {Object} previousData - Previous user data
 */
const logUserUpdated = async (userId, targetUserId, updateData, previousData) => {
  await logAudit({
    userId,
    action: AUDIT_ACTIONS.USER_UPDATED,
    entityType: ENTITY_TYPES.USER,
    entityId: targetUserId,
    metadata: {
      updatedFields: Object.keys(updateData),
      previousValues: previousData,
      newValues: updateData,
    },
  });
};

/**
 * Log authentication events
 * @param {string} userId - User ID
 * @param {string} action - Auth action
 * @param {Object} metadata - Additional context
 */
const logAuthEvent = async (userId, action, metadata = {}) => {
  await logAudit({
    userId,
    action,
    entityType: ENTITY_TYPES.AUTHENTICATION,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  });
};

/**
 * Get audit logs for a specific entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @param {number} limit - Maximum number of logs to return
 * @returns {Promise<Array>} - Array of audit logs
 */
const getEntityAuditLogs = async (entityType, entityId, limit = 50) => {
  try {
    return await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

/**
 * Get audit logs for a specific user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of logs to return
 * @returns {Promise<Array>} - Array of audit logs
 */
const getUserAuditLogs = async (userId, limit = 50) => {
  try {
    return await prisma.auditLog.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    return [];
  }
};

/**
 * Clean up old audit logs (maintenance function)
 * @param {number} daysToKeep - Number of days to keep logs
 * @returns {Promise<number>} - Number of logs cleaned up
 */
const cleanupOldAuditLogs = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });
    
    return result.count;
  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    return 0;
  }
};

module.exports = {
  // Main logging function
  logAudit,
  
  // Specific logging functions
  logProjectCreated,
  logTaskCreated,
  logLeaveApproved,
  logUserUpdated,
  logAuthEvent,
  
  // Query functions
  getEntityAuditLogs,
  getUserAuditLogs,
  
  // Maintenance
  cleanupOldAuditLogs,
  
  // Constants
  AUDIT_ACTIONS,
  ENTITY_TYPES,
};
