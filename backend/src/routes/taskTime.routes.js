const express = require('express');
const router = express.Router();
const taskTimeController = require('../controllers/taskTime.controller');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/task-time/start/:taskId
 * @desc    Start timer for a specific task
 * @access  Private
 */
router.post('/start/:taskId', taskTimeController.startTimer);

/**
 * @route   POST /api/task-time/stop/:taskId
 * @desc    Stop timer for a specific task
 * @access  Private
 */
router.post('/stop/:taskId', taskTimeController.stopTimer);

/**
 * @route   GET /api/task-time/active
 * @desc    Get active timer for current user
 * @access  Private
 */
router.get('/active', taskTimeController.getActiveTimer);

/**
 * @route   GET /api/task-time/status/:taskId
 * @desc    Get timer status for a specific task
 * @access  Private
 */
router.get('/status/:taskId', taskTimeController.getTimerStatus);

/**
 * @route   GET /api/task-time/task/:taskId
 * @desc    Get all time logs for a specific task
 * @access  Private
 */
router.get('/task/:taskId', taskTimeController.getTaskTimeLogs);

/**
 * @route   GET /api/task-time/user
 * @desc    Get all time logs for current user
 * @access  Private
 */
router.get('/user', taskTimeController.getUserTimeLogs);

module.exports = router;
