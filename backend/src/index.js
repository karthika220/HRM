require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./prisma');
const { 
  requestLogger, 
  enhancedRequestLogger, 
  performanceLogger, 
  statsLogger 
} = require('./middleware/requestLogger');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:51355', 'http://127.0.0.1:52673', 'http://10.98.81.39:5175', 'http://127.0.0.1:54589'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply request logging middleware globally
app.use(requestLogger);
app.use(enhancedRequestLogger);
app.use(performanceLogger);
app.use(statsLogger);

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/user');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const timesheetRoutes = require('./routes/timesheets');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const issueRoutes = require('./routes/issues');
const calendarRoutes = require('./routes/calendar');
const automationRoutes = require('./routes/automation');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave.routes');
const hrRoutes = require('./routes/hr');
const escalationRoutes = require('./routes/escalation.routes');
const centralizedRoutes = require('./routes/centralized');
const taskTimeRoutes = require('./routes/taskTime.routes');
const errorHandler = require('./middleware/errorHandler');

// Import escalation service
const { startEscalationScheduler } = require('./services/escalationService');
const holidayRoutes = require('./routes/holidays');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/centralized', centralizedRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/task-time', taskTimeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// HRM & PMS - Centralized Error Handling Middleware (must be last)
// Project: Human Resource Management & Project Management System
// Provides consistent error handling for all API endpoints
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Test database connection
    console.log('🔍 Testing Prisma database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Start escalation background job
    console.log('🔄 Starting task escalation background job...');
    startEscalationScheduler();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Workforce API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`👥 Users endpoint: http://localhost:${PORT}/api/users`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
