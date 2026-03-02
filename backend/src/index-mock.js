require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth-mock');
const userRoutes = require('./routes/users-simple');
const attendanceRoutes = require('../modules/attendance');
const peopleRoutes = require('../modules/people');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/people', peopleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'ProjectFlow API is running (mock mode)'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

// Start server without database dependency
app.listen(PORT, () => {
  console.log(`🚀 ProjectFlow API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👥 Users endpoint: http://localhost:${PORT}/api/users`);
  console.log(`⏰ Attendance endpoints: http://localhost:${PORT}/api/attendance`);
  console.log(`👥 People endpoints: http://localhost:${PORT}/api/people`);
  console.log(`⚠️  Running in mock mode - database features disabled`);
});
