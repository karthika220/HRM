const express = require('express');
const { prisma } = require('../prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/attendance - Root attendance endpoint
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('Attendance root - User:', { id: req.user.id, role: req.user.role, name: req.user.name });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all active users
    const totalEmployees = await prisma.user.count({ 
      where: { isActive: true } 
    });
    
    // Mock attendance data for now - in real implementation this would come from attendance table
    const presentToday = Math.floor(totalEmployees * 0.89); // 89% attendance
    const absentToday = Math.floor(totalEmployees * 0.072); // 7.2% absent
    const lateArrivals = Math.floor(totalEmployees * 0.036); // 3.6% late
    
    res.json({
      message: "Attendance API is working",
      stats: {
        totalEmployees,
        presentToday,
        absentToday,
        lateArrivals,
        presentPercentage: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
        absentPercentage: totalEmployees > 0 ? Math.round((absentToday / totalEmployees) * 100) : 0,
        latePercentage: totalEmployees > 0 ? Math.round((lateArrivals / totalEmployees) * 100) : 0
      },
      endpoints: [
        "GET /api/attendance - Get attendance overview",
        "GET /api/attendance/dashboard - Get attendance dashboard stats",
        "GET /api/attendance/team-status - Get team attendance status",
        "GET /api/attendance/activity - Get recent attendance activity",
        "GET /api/attendance/my-timeline - Get current user's attendance timeline"
      ]
    });
  } catch (err) {
    console.error('Attendance root error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/dashboard - Get attendance dashboard stats
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    console.log('Attendance dashboard - User:', { id: req.user.id, role: req.user.role, name: req.user.name });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all active users
    const totalEmployees = await prisma.user.count({ 
      where: { isActive: true } 
    });
    
    // Mock attendance data for now - in real implementation this would come from attendance table
    const presentToday = Math.floor(totalEmployees * 0.89); // 89% attendance
    const absentToday = Math.floor(totalEmployees * 0.072); // 7.2% absent
    const lateArrivals = Math.floor(totalEmployees * 0.036); // 3.6% late
    
    res.json({
      totalEmployees,
      presentToday,
      absentToday,
      lateArrivals,
      presentPercentage: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
      absentPercentage: totalEmployees > 0 ? Math.round((absentToday / totalEmployees) * 100) : 0,
      latePercentage: totalEmployees > 0 ? Math.round((lateArrivals / totalEmployees) * 100) : 0
    });
  } catch (err) {
    console.error('Attendance dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/team-status - Get team attendance status
router.get('/team-status', authenticate, async (req, res) => {
  try {
    console.log('Team attendance status - User:', { id: req.user.id, role: req.user.role });
    
    // Get team members with their current status
    const teamMembers = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true
      },
      orderBy: { name: 'asc' },
      take: 10 // Limit to 10 for dashboard
    });
    
    // Mock current attendance status - in real implementation this would be dynamic
    const teamStatus = teamMembers.map((member, index) => {
      const statuses = ['working', 'lunch', 'overtime', 'checked_out'];
      const status = statuses[index % statuses.length];
      
      const now = new Date();
      const checkinTime = new Date(now);
      checkinTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0, 0);
      
      let lunchStart = null;
      let lunchEnd = null;
      let checkout = null;
      
      if (status === 'lunch') {
        lunchStart = new Date(now);
        lunchStart.setHours(13, Math.floor(Math.random() * 30), 0, 0);
      } else if (status === 'checked_out') {
        lunchStart = new Date(now);
        lunchStart.setHours(13, 0, 0, 0);
        lunchEnd = new Date(now);
        lunchEnd.setHours(13, 45, 0, 0);
        checkout = new Date(now);
        checkout.setHours(17, 30, 0, 0);
      } else if (status === 'overtime') {
        lunchStart = new Date(now);
        lunchStart.setHours(12, 30, 0, 0);
        lunchEnd = new Date(now);
        lunchEnd.setHours(13, 15, 0, 0);
      }
      
      return {
        id: member.id,
        name: member.name,
        status,
        checkin: checkinTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        lunchStart: lunchStart ? lunchStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
        lunchEnd: lunchEnd ? lunchEnd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
        checkout: checkout ? checkout.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null
      };
    });
    
    res.json(teamStatus);
  } catch (err) {
    console.error('Team attendance status error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/activity - Get recent attendance activity
router.get('/activity', authenticate, async (req, res) => {
  try {
    console.log('Attendance activity - User:', { id: req.user.id, role: req.user.role });
    
    // Mock activity data - in real implementation this would come from attendance logs
    const activities = [
      { name: "Sarah Johnson", action: "Checked in", time: "09:02 AM", type: "checkin" },
      { name: "Mike Chen", action: "Started lunch", time: "01:05 PM", type: "lunch_start" },
      { name: "Emma Davis", action: "Checked in", time: "09:15 AM", type: "checkin" },
      { name: "James Wilson", action: "Started overtime", time: "06:50 PM", type: "overtime" },
      { name: "Lisa Brown", action: "Checked out", time: "05:30 PM", type: "checkout" }
    ];
    
    res.json(activities);
  } catch (err) {
    console.error('Attendance activity error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/my-timeline - Get current user's attendance timeline
router.get('/my-timeline', authenticate, async (req, res) => {
  try {
    console.log('My attendance timeline - User:', { id: req.user.id, name: req.user.name });
    
    // Mock timeline events for current user - in real implementation this would be dynamic
    const attendanceEvents = [
      { type: "checkin", time: "09:02" },
      { type: "lunch_start", time: "13:47" },
      { type: "lunch_end", time: "14:32" },
      { type: "checkout", time: null }
    ];
    
    res.json(attendanceEvents);
  } catch (err) {
    console.error('My attendance timeline error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
