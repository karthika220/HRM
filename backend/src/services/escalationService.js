/**
 * HRM & PMS - Task Escalation Service
 * Project: Human Resource Management & Project Management System
 * 
 * Background job service for automatic task escalation
 * Handles overdue tasks, escalation levels, and notifications
 */

const { prisma } = require('../prisma');
const { sendEmailNotification } = require('../utils/emailService');

/**
 * Escalation configuration
 */
const ESCALATION_CONFIG = {
  // Days after which tasks should be escalated
  ESCALATION_THRESHOLDS: [3, 7, 14], // 3 days, 7 days, 14 days
  
  // Maximum escalation level
  MAX_ESCALATION_LEVEL: 3,
  
  // Roles that can receive escalations
  ESCALATION_ROLES: ['MANAGER', 'TEAM_LEAD', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  
  // Priority levels that trigger escalation
  ESCALATION_PRIORITIES: ['HIGH', 'CRITICAL'],
  
  // Statuses that are considered overdue
  OVERDUE_STATUSES: ['TODO', 'IN_PROGRESS', 'REVIEW'],
  
  // Background job interval (in milliseconds)
  JOB_INTERVAL: 60 * 60 * 1000, // 1 hour
};

/**
 * Find appropriate escalation target for a task
 * @param {string} taskId - Task ID
 * @param {string} projectId - Project ID
 * @returns {Object|null} - User to escalate to
 */
const findEscalationTarget = async (taskId, projectId) => {
  try {
    // First, try to find the project owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (project && project.owner && ESCALATION_CONFIG.ESCALATION_ROLES.includes(project.owner.role)) {
      return project.owner;
    }

    // If project owner is not eligible, find team leads or managers
    const eligibleUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          in: ESCALATION_CONFIG.ESCALATION_ROLES
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: [
        { role: 'desc' }, // Prioritize higher roles
        { name: 'asc' }
      ],
      take: 1
    });

    return eligibleUsers[0] || null;
  } catch (error) {
    console.error('Error finding escalation target:', error);
    return null;
  }
};

/**
 * Check if a task should be escalated
 * @param {Object} task - Task object
 * @returns {boolean} - Whether task should be escalated
 */
const shouldEscalateTask = (task) => {
  // Skip tasks without due dates
  if (!task.dueDate) {
    return false;
  }

  // Skip tasks that are already completed
  if (task.status === 'DONE') {
    return false;
  }

  // Skip tasks that are already at max escalation level
  if (task.escalationLevel >= ESCALATION_CONFIG.MAX_ESCALATION_LEVEL) {
    return false;
  }

  // Check if task is overdue
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

  // Check if overdue days match escalation threshold
  return ESCALATION_CONFIG.ESCALATION_THRESHOLDS.includes(daysOverdue);
};

/**
 * Get escalation level based on days overdue
 * @param {Date} dueDate - Task due date
 * @returns {number} - Escalation level
 */
const getEscalationLevel = (dueDate) => {
  const now = new Date();
  const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

  for (let i = 0; i < ESCALATION_CONFIG.ESCALATION_THRESHOLDS.length; i++) {
    if (daysOverdue >= ESCALATION_CONFIG.ESCALATION_THRESHOLDS[i]) {
      return i + 1;
    }
  }

  return 0;
};

/**
 * Send escalation notification
 * @param {Object} task - Task object
 * @param {Object} escalationTarget - User to notify
 * @param {number} escalationLevel - Current escalation level
 */
const sendEscalationNotification = async (task, escalationTarget, escalationLevel) => {
  try {
    const subject = `Task Escalated: ${task.title}`;
    const message = `
Task "${task.title}" has been escalated to level ${escalationLevel}.

Details:
- Task ID: ${task.id}
- Project: ${task.project?.name || 'Unknown'}
- Due Date: ${task.dueDate}
- Current Status: ${task.status}
- Priority: ${task.priority}
- Days Overdue: ${Math.floor((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24))}
- Escalation Level: ${escalationLevel}/${ESCALATION_CONFIG.MAX_ESCALATION_LEVEL}

This task requires immediate attention. Please review and take appropriate action.

Best regards,
HRM & PMS System
    `.trim();

    // Send email notification
    await sendEmailNotification({
      to: escalationTarget.email,
      subject,
      message,
      priority: 'high'
    });

    console.log(`Escalation notification sent to ${escalationTarget.name} (${escalationTarget.email}) for task ${task.id}`);
  } catch (error) {
    console.error('Error sending escalation notification:', error);
  }
};

/**
 * Process task escalation
 * @param {string} taskId - Task ID
 * @returns {Promise<boolean>} - Whether escalation was processed
 */
const processTaskEscalation = async (taskId) => {
  try {
    // Get task with related data
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!task) {
      console.log(`Task ${taskId} not found for escalation`);
      return false;
    }

    // Check if task should be escalated
    if (!shouldEscalateTask(task)) {
      return false;
    }

    // Calculate new escalation level
    const newEscalationLevel = getEscalationLevel(task.dueDate);

    // Find escalation target
    const escalationTarget = await findEscalationTarget(task.id, task.projectId);
    
    if (!escalationTarget) {
      console.log(`No escalation target found for task ${taskId}`);
      return false;
    }

    // Update task with escalation information
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        escalationLevel: newEscalationLevel,
        escalatedToUserId: escalationTarget.id,
        updatedAt: new Date()
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        escalatedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Send notification
    await sendEscalationNotification(updatedTask, escalationTarget, newEscalationLevel);

    // Log the escalation
    console.log(`Task ${taskId} escalated to level ${newEscalationLevel} and assigned to ${escalationTarget.name}`);

    return true;
  } catch (error) {
    console.error(`Error processing escalation for task ${taskId}:`, error);
    return false;
  }
};

/**
 * Find all tasks that need escalation
 * @returns {Promise<Array>} - Array of task IDs that need escalation
 */
const findTasksNeedingEscalation = async () => {
  try {
    const now = new Date();
    
    // Find tasks that are overdue and need escalation
    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          lt: now
        },
        status: {
          in: ESCALATION_CONFIG.OVERDUE_STATUSES
        },
        escalationLevel: {
          lt: ESCALATION_CONFIG.MAX_ESCALATION_LEVEL
        }
      },
      select: {
        id: true,
        dueDate: true,
        escalationLevel: true
      }
    });

    // Filter tasks that should be escalated based on overdue days
    const tasksToEscalate = overdueTasks.filter(task => {
      const escalationLevel = getEscalationLevel(task.dueDate);
      return escalationLevel > task.escalationLevel;
    });

    return tasksToEscalate.map(task => task.id);
  } catch (error) {
    console.error('Error finding tasks needing escalation:', error);
    return [];
  }
};

/**
 * Main escalation background job
 * Runs periodically to check and escalate overdue tasks
 */
const runEscalationJob = async () => {
  try {
    console.log('🔄 Starting task escalation background job...');
    
    const startTime = Date.now();
    
    // Find tasks that need escalation
    const tasksToEscalate = await findTasksNeedingEscalation();
    
    console.log(`📋 Found ${tasksToEscalate.length} tasks needing escalation`);
    
    // Process each escalation
    let successCount = 0;
    for (const taskId of tasksToEscalate) {
      const success = await processTaskEscalation(taskId);
      if (success) {
        successCount++;
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Escalation job completed in ${duration}ms`);
    console.log(`📊 Processed ${successCount}/${tasksToEscalate.length} escalations successfully`);
    
    return {
      totalTasks: tasksToEscalate.length,
      successfulEscalations: successCount,
      duration: duration
    };
  } catch (error) {
    console.error('❌ Escalation job failed:', error);
    return {
      totalTasks: 0,
      successfulEscalations: 0,
      duration: 0,
      error: error.message
    };
  }
};

/**
 * Start escalation background job scheduler
 */
const startEscalationScheduler = () => {
  console.log('⏰ Starting task escalation scheduler...');
  
  // Run immediately on start
  runEscalationJob();
  
  // Then run periodically
  setInterval(runEscalationJob, ESCALATION_CONFIG.JOB_INTERVAL);
  
  console.log(`📅 Escalation job scheduled to run every ${ESCALATION_CONFIG.JOB_INTERVAL / 1000 / 60} minutes`);
};

/**
 * Manual escalation trigger for testing
 * @param {string} taskId - Task ID to escalate
 * @returns {Promise<boolean>} - Whether escalation was successful
 */
const manualEscalation = async (taskId) => {
  console.log(`🔨 Manual escalation triggered for task ${taskId}`);
  return await processTaskEscalation(taskId);
};

/**
 * Get escalation statistics
 * @returns {Promise<Object>} - Escalation statistics
 */
const getEscalationStats = async () => {
  try {
    const stats = await prisma.task.groupBy({
      by: ['escalationLevel'],
      _count: {
        id: true
      },
      where: {
        escalationLevel: {
          gt: 0
        }
      }
    });

    const totalEscalated = stats.reduce((sum, stat) => sum + stat._count.id, 0);

    return {
      totalEscalated,
      escalationBreakdown: stats.map(stat => ({
        level: stat.escalationLevel,
        count: stat._count.id,
        percentage: totalEscalated > 0 ? Math.round((stat._count.id / totalEscalated) * 100) : 0
      }))
    };
  } catch (error) {
    console.error('Error getting escalation stats:', error);
    return {
      totalEscalated: 0,
      escalationBreakdown: []
    };
  }
};

module.exports = {
  runEscalationJob,
  startEscalationScheduler,
  manualEscalation,
  getEscalationStats,
  findTasksNeedingEscalation,
  processTaskEscalation,
  ESCALATION_CONFIG
};
