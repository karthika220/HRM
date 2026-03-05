const taskTimeService = require('../services/taskTime.service');

class TaskTimeController {
  /**
   * Start timer for a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async startTimer(req, res) {
    try {
      const { taskId } = req.params;
      const userId = req.user.id; // Assuming user is attached to request from auth middleware

      // Validate taskId
      if (!taskId) {
        return res.status(400).json({
          success: false,
          message: 'Task ID is required'
        });
      }

      // Start the timer
      const timeLog = await taskTimeService.startTimer(taskId, userId);

      res.status(201).json({
        success: true,
        message: 'Timer started successfully',
        data: timeLog
      });
    } catch (error) {
      console.error('Error in startTimer controller:', error);
      
      // Handle specific errors
      if (error.message === 'Timer already running for another task') {
        return res.status(400).json({
          success: false,
          message: 'You already have a timer running for another task. Please stop it first.'
        });
      }
      
      if (error.message === 'Timer already running for this task') {
        return res.status(400).json({
          success: false,
          message: 'Timer is already running for this task.'
        });
      }
      
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: 'Task not found.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to start timer',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Stop timer for a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async stopTimer(req, res) {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;

      // Validate taskId
      if (!taskId) {
        return res.status(400).json({
          success: false,
          message: 'Task ID is required'
        });
      }

      // Stop the timer
      const timeLog = await taskTimeService.stopTimer(taskId, userId);

      res.status(200).json({
        success: true,
        message: 'Timer stopped successfully',
        data: timeLog
      });
    } catch (error) {
      console.error('Error in stopTimer controller:', error);
      
      // Handle specific errors
      if (error.message === 'No active timer found for this task') {
        return res.status(400).json({
          success: false,
          message: 'No active timer found for this task.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to stop timer',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get active timer for current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getActiveTimer(req, res) {
    try {
      const userId = req.user.id;

      const activeTimer = await taskTimeService.getActiveTimer(userId);

      res.status(200).json({
        success: true,
        data: activeTimer
      });
    } catch (error) {
      console.error('Error in getActiveTimer controller:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to get active timer',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get timer status for a specific task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTimerStatus(req, res) {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;

      // Validate taskId
      if (!taskId) {
        return res.status(400).json({
          success: false,
          message: 'Task ID is required'
        });
      }

      const timerStatus = await taskTimeService.getTimerStatus(taskId, userId);

      res.status(200).json({
        success: true,
        data: timerStatus
      });
    } catch (error) {
      console.error('Error in getTimerStatus controller:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to get timer status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get all time logs for a specific task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTaskTimeLogs(req, res) {
    try {
      const { taskId } = req.params;

      // Validate taskId
      if (!taskId) {
        return res.status(400).json({
          success: false,
          message: 'Task ID is required'
        });
      }

      const timeLogsData = await taskTimeService.getTaskTimeLogs(taskId);

      res.status(200).json({
        success: true,
        data: timeLogsData
      });
    } catch (error) {
      console.error('Error in getTaskTimeLogs controller:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to get task time logs',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get all time logs for current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserTimeLogs(req, res) {
    try {
      const userId = req.user.id;

      const timeLogs = await taskTimeService.getUserTimeLogs(userId);

      res.status(200).json({
        success: true,
        data: timeLogs
      });
    } catch (error) {
      console.error('Error in getUserTimeLogs controller:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to get user time logs',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new TaskTimeController();
