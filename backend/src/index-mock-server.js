require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { logTaskCreated } = require('./utils/auditLogger');
const morgan = require('morgan');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply request logging middleware
const requestFormat = ':method :url :status :res[content-length] - :response-time ms';
app.use(morgan(requestFormat));

// Import our new middlewares
const errorHandler = require('./middleware/errorHandler');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'workforce-jwt-secret-key-2024';

// Mock user database
const users = [
  {
    id: '1',
    email: 'admin@workforce.io',
    password: '$2a$10$rOzJqQjQjQjQjQjQjQjQuOzJqQjQjQjQjQjQjQjQuOzJqQjQjQjQjQjQjQjQu', // 'password'
    name: 'Admin User',
    role: 'ADMIN',
    isActive: true
  }
];

// Mock refresh token storage
const refreshTokens = new Map(); // token -> { userId, expiryDate }

// Generate refresh token
const generateRefreshToken = () => {
  return require('crypto').randomBytes(64).toString('hex');
};

// Create refresh token
const createRefreshToken = (userId) => {
  const token = generateRefreshToken();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  
  refreshTokens.set(token, { userId, expiryDate });
  return token;
};

// Validate refresh token
const validateRefreshToken = (token) => {
  const tokenData = refreshTokens.get(token);
  
  if (!tokenData) {
    throw new Error('Refresh token not found');
  }
  
  if (tokenData.expiryDate < new Date()) {
    refreshTokens.delete(token);
    throw new Error('Refresh token expired');
  }
  
  const user = users.find(u => u.id === tokenData.userId);
  if (!user || !user.isActive) {
    refreshTokens.delete(token);
    throw new Error('User account is inactive');
  }
  
  return user;
};

// Mock auth middleware for testing
const mockAuth = (req, res, next) => {
  req.user = {
    id: '1',
    email: 'admin@workforce.io',
    role: 'ADMIN',
    isActive: true
  };
  next();
};

// Test routes to demonstrate middleware
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'HRM & PMS Backend is running'
  });
});

// Authentication endpoints
// Apply rate limiting to authentication routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/auth/login', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    const user = users.find(u => u.email === email);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // For mock, accept 'password' as valid
    if (password !== 'password') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate access token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Create refresh token
    const refreshToken = createRefreshToken(user.id);
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      token, 
      refreshToken,
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/refresh', authRateLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Validate refresh token and get user
    const user = validateRefreshToken(refreshToken);
    
    // Generate new access token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    
    if (error.message === 'Refresh token not found' || 
        error.message === 'Refresh token expired' || 
        error.message === 'User account is inactive') {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    
    res.status(500).json({ message: 'Failed to refresh token' });
  }
});

app.post('/api/auth/logout', authRateLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Remove refresh token
    const revoked = refreshTokens.delete(refreshToken);
    
    if (revoked) {
      res.json({ message: 'Logged out successfully' });
    } else {
      res.json({ message: 'Already logged out or token not found' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Failed to logout' });
  }
});

// Protected route with mock auth
app.get('/api/user/profile', mockAuth, (req, res) => {
  res.json({ 
    success: true,
    user: req.user,
    message: 'User profile accessed successfully'
  });
});

// GET /api/reports/advanced-summary
app.get('/api/reports/advanced-summary', mockAuth, (req, res) => {
  try {
    const advancedSummary = {
      timestamp: new Date().toISOString(),
      period: {
        projects: 'Last 6 months',
        tasks: 'Last 3 months',
        attendance: 'Last 30 days'
      },
      projects: {
        total: 15,
        byStatus: [
          { status: 'PLANNING', count: 3 },
          { status: 'IN_PROGRESS', count: 7 },
          { status: 'COMPLETED', count: 4 },
          { status: 'ON_HOLD', count: 1 }
        ]
      },
      tasks: {
        total: 125,
        completionPercentage: 78,
        byStatus: [
          { status: 'TODO', count: 28, percentage: 22 },
          { status: 'IN_PROGRESS', count: 35, percentage: 28 },
          { status: 'REVIEW', count: 15, percentage: 12 },
          { status: 'DONE', count: 47, percentage: 38 }
        ]
      },
      team: {
        totalMembers: 12,
        topPerformers: [
          {
            id: '1',
            name: 'Admin User',
            email: 'admin@workforce.io',
            role: 'ADMIN',
            department: 'IT',
            tasksCreated: 25,
            tasksAssigned: 30,
            productivity: 83
          },
          {
            id: '2',
            name: 'John Developer',
            email: 'john@workforce.io',
            role: 'EMPLOYEE',
            department: 'IT',
            tasksCreated: 18,
            tasksAssigned: 22,
            productivity: 82
          }
        ],
        averageProductivity: 75
      },
      attendance: {
        totalRecords: 1000,
        presentPercentage: 85,
        latePercentage: 10,
        absentPercentage: 5,
        summary: {
          present: 850,
          late: 100,
          absent: 50
        },
        note: 'Mock data - attendance schema not available'
      }
    };
    
    res.json(advancedSummary);
  } catch (error) {
    console.error('Error generating advanced summary:', error);
    res.status(500).json({ 
      message: 'Failed to generate advanced summary',
      error: error.message 
    });
  }
});

// GET /api/reports (basic reports list)
app.get('/api/reports', mockAuth, (req, res) => {
  try {
    const mockReports = [
      {
        id: '1',
        title: 'Monthly Project Summary',
        type: 'PROJECT_SUMMARY',
        createdAt: new Date().toISOString(),
        createdBy: { id: '1', name: 'Admin User' },
        project: { id: '1', name: 'Sample Project' }
      },
      {
        id: '2',
        title: 'Task Completion Report',
        type: 'TASK_SUMMARY',
        createdAt: new Date().toISOString(),
        createdBy: { id: '1', name: 'Admin User' },
        project: { id: '2', name: 'Another Project' }
      }
    ];
    
    res.json(mockReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Mock tasks for testing escalation
const mockTasks = [
  {
    id: 'task-1',
    title: 'Overdue Task 1',
    description: 'This task is 5 days overdue',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    projectId: 'project-1',
    assigneeId: '1',
    creatorId: '1',
    escalationLevel: 0,
    escalatedToUserId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Overdue Task 2',
    description: 'This task is 10 days overdue',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    projectId: 'project-1',
    assigneeId: '1',
    creatorId: '1',
    escalationLevel: 1,
    escalatedToUserId: '1',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/tasks
app.get('/api/tasks', mockAuth, (req, res) => {
  try {
    res.json(mockTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
app.post('/api/tasks', authRateLimiter, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId, creatorId } = req.body;
    
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description: description || '',
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      projectId: projectId || 'default-project',
      assigneeId: req.body.assigneeId || null,
      creatorId: creatorId || '1',
      escalationLevel: 0,
      escalatedToUserId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockTasks.push(newTask);
    
    // Audit logging (non-blocking)
    logTaskCreated(creatorId || '1', newTask.id, {
      title: newTask.title,
      projectId: newTask.projectId,
      assigneeId: newTask.assigneeId,
      priority: newTask.priority,
    }).catch(error => {
      console.error('Audit logging failed:', error);
    });
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// POST /api/tasks/:id/escalate
app.post('/api/tasks/:id/escalate', mockAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the task
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Simulate escalation
    const task = mockTasks[taskIndex];
    task.escalationLevel = (task.escalationLevel || 0) + 1;
    task.escalatedToUserId = '1'; // Admin user
    task.updatedAt = new Date().toISOString();
    
    console.log(`Task ${id} escalated to level ${task.escalationLevel}`);
    
    res.json({ 
      message: 'Task escalated successfully',
      taskId: id,
      escalationLevel: task.escalationLevel,
      escalatedToUserId: task.escalatedToUserId
    });
  } catch (error) {
    console.error('Error escalating task:', error);
    res.status(500).json({ 
      message: 'Failed to escalate task',
      error: error.message 
    });
  }
});

// GET /api/tasks/escalation/stats
app.get('/api/tasks/escalation/stats', mockAuth, (req, res) => {
  try {
    const escalatedTasks = mockTasks.filter(task => task.escalationLevel > 0);
    const totalEscalated = escalatedTasks.length;
    
    const escalationBreakdown = {};
    escalatedTasks.forEach(task => {
      const level = task.escalationLevel;
      escalationBreakdown[level] = (escalationBreakdown[level] || 0) + 1;
    });
    
    const stats = {
      totalEscalated,
      escalationBreakdown: Object.entries(escalationBreakdown).map(([level, count]) => ({
        level: parseInt(level),
        count,
        percentage: totalEscalated > 0 ? Math.round((count / totalEscalated) * 100) : 0
      }))
    };
    
    res.json({
      message: 'Escalation statistics retrieved successfully',
      ...stats
    });
  } catch (error) {
    console.error('Error getting escalation stats:', error);
    res.status(500).json({ 
      message: 'Failed to get escalation statistics',
      error: error.message 
    });
  }
});

// Test error handling
app.get('/api/test/error', (req, res, next) => {
  const error = new Error('Test error for HRM & PMS');
  error.statusCode = 400;
  next(error);
});

// Centralized Error Handling Middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 HRM & PMS Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👤 Profile test: http://localhost:${PORT}/api/user/profile`);
  console.log(`❌ Error test: http://localhost:${PORT}/api/test/error`);
  console.log(`🔗 Frontend should be: http://localhost:5173`);
});
