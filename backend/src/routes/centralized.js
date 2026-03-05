const express = require('express');
const { authenticate } = require('../middleware/auth');
const dataStore = require('../controllers/dataStore');

const router = express.Router();

// Middleware to validate JWT for all routes
router.use(authenticate);

// GET /api/centralized/data - Get all centralized data
router.get('/data', async (req, res) => {
  try {
    const data = await dataStore.getCentralizedData();
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching centralized data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/centralized/employees - Get all employees
router.get('/employees', async (req, res) => {
  try {
    const employees = await dataStore.getEmployees();
    res.json({
      success: true,
      data: employees,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/centralized/projects - Get all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await dataStore.getProjects();
    res.json({
      success: true,
      data: projects,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/centralized/tasks - Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await dataStore.getTasks();
    res.json({
      success: true,
      data: tasks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/centralized/attendance - Get all attendance records
router.get('/attendance', async (req, res) => {
  try {
    const attendance = await dataStore.getAttendance();
    res.json({
      success: true,
      data: attendance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/centralized/leaves - Get all leave requests
router.get('/leaves', async (req, res) => {
  try {
    const leaves = await dataStore.getLeaves();
    res.json({
      success: true,
      data: leaves,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/centralized/refresh - Refresh cache for specific data type
router.post('/refresh', async (req, res) => {
  try {
    const { type } = req.body; // type can be 'employees', 'projects', 'tasks', 'attendance', 'leaves', or 'all'
    
    if (!type || !['employees', 'projects', 'tasks', 'attendance', 'leaves', 'all'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refresh type. Must be one of: employees, projects, tasks, attendance, leaves, all'
      });
    }

    await dataStore.updateCache(type);
    
    res.json({
      success: true,
      message: `Cache refreshed for ${type}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/centralized/invalidate - Invalidate cache for specific data type
router.post('/invalidate', async (req, res) => {
  try {
    const { type } = req.body; // type can be 'employees', 'projects', 'tasks', 'attendance', 'leaves', or 'all'
    
    if (!type || !['employees', 'projects', 'tasks', 'attendance', 'leaves', 'all'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invalidate type. Must be one of: employees, projects, tasks, attendance, leaves, all'
      });
    }

    dataStore.invalidateCache(type);
    
    res.json({
      success: true,
      message: `Cache invalidated for ${type}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
