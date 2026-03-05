const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TaskTimeService {
  /**
   * Start a timer for a specific task and user
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created time log
   */
  async startTimer(taskId, userId) {
    try {
      // Check if user already has an active timer for any task
      const activeTimer = await prisma.taskTimeLog.findFirst({
        where: {
          userId: userId,
          endTime: null
        }
      });

      if (activeTimer) {
        throw new Error('Timer already running for another task');
      }

      // Check if user already has an active timer for this specific task
      const taskActiveTimer = await prisma.taskTimeLog.findFirst({
        where: {
          taskId: taskId,
          userId: userId,
          endTime: null
        }
      });

      if (taskActiveTimer) {
        throw new Error('Timer already running for this task');
      }

      // Verify task exists
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Create new time log
      const timeLog = await prisma.taskTimeLog.create({
        data: {
          taskId: taskId,
          userId: userId,
          startTime: new Date()
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return timeLog;
    } catch (error) {
      console.error('Error starting timer:', error);
      throw error;
    }
  }

  /**
   * Stop a timer for a specific task and user
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated time log with duration
   */
  async stopTimer(taskId, userId) {
    try {
      // Find active timer for this user and task
      const activeTimer = await prisma.taskTimeLog.findFirst({
        where: {
          taskId: taskId,
          userId: userId,
          endTime: null
        }
      });

      if (!activeTimer) {
        throw new Error('No active timer found for this task');
      }

      // Calculate duration in minutes
      const endTime = new Date();
      const startTime = new Date(activeTimer.startTime);
      const durationInMs = endTime.getTime() - startTime.getTime();
      const durationInMinutes = Math.floor(durationInMs / (1000 * 60));

      // Update the time log
      const updatedTimeLog = await prisma.taskTimeLog.update({
        where: { id: activeTimer.id },
        data: {
          endTime: endTime,
          duration: durationInMinutes
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return updatedTimeLog;
    } catch (error) {
      console.error('Error stopping timer:', error);
      throw error;
    }
  }

  /**
   * Get active timer for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Active timer or null
   */
  async getActiveTimer(userId) {
    try {
      const activeTimer = await prisma.taskTimeLog.findFirst({
        where: {
          userId: userId,
          endTime: null
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return activeTimer;
    } catch (error) {
      console.error('Error getting active timer:', error);
      throw error;
    }
  }

  /**
   * Get all time logs for a specific task
   * @param {string} taskId - Task ID
   * @returns {Promise<Array>} Array of time logs with total duration
   */
  async getTaskTimeLogs(taskId) {
    try {
      const timeLogs = await prisma.taskTimeLog.findMany({
        where: { taskId: taskId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate total duration
      const totalDuration = timeLogs.reduce((total, log) => {
        return total + (log.duration || 0);
      }, 0);

      return {
        timeLogs,
        totalDuration,
        totalTimeInHours: (totalDuration / 60).toFixed(2)
      };
    } catch (error) {
      console.error('Error getting task time logs:', error);
      throw error;
    }
  }

  /**
   * Get all time logs for a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of time logs
   */
  async getUserTimeLogs(userId) {
    try {
      const timeLogs = await prisma.taskTimeLog.findMany({
        where: { userId: userId },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return timeLogs;
    } catch (error) {
      console.error('Error getting user time logs:', error);
      throw error;
    }
  }

  /**
   * Get timer status for a specific task and user
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Timer status
   */
  async getTimerStatus(taskId, userId) {
    try {
      const activeTimer = await prisma.taskTimeLog.findFirst({
        where: {
          taskId: taskId,
          userId: userId,
          endTime: null
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true
            }
          }
        }
      });

      return {
        isActive: !!activeTimer,
        timer: activeTimer,
        startTime: activeTimer ? activeTimer.startTime : null
      };
    } catch (error) {
      console.error('Error getting timer status:', error);
      throw error;
    }
  }
}

module.exports = new TaskTimeService();
