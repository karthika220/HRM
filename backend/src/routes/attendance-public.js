const express = require('express');

const router = express.Router();

// GET /api/attendance/dashboard - Get attendance dashboard stats (no auth required for demo)
router.get('/dashboard', async (req, res) => {
  try {
    console.log('Attendance dashboard - Public access');
    
    // Mock data for demonstration - in real implementation this would come from database
    const totalEmployees = 248;
    const presentToday = 221;
    const absentToday = 18;
    const lateArrivals = 9;
    
    res.json({
      totalEmployees,
      presentToday,
      absentToday,
      lateArrivals,
      presentPercentage: 89,
      absentPercentage: 7,
      latePercentage: 4
    });
  } catch (err) {
    console.error('Attendance dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/team-status - Get team attendance status (no auth required for demo)
router.get('/team-status', async (req, res) => {
  try {
    console.log('Team attendance status - Public access');
    
    // Mock team status data - in real implementation this would be dynamic
    const teamStatus = [
      { id: 1, name: "Sarah Johnson", status: "working", checkin: "09:02", lunchStart: "13:47", lunchEnd: "14:32" },
      { id: 2, name: "Mike Chen", status: "lunch", checkin: "08:58", lunchStart: "13:15", lunchEnd: null },
      { id: 3, name: "Emma Davis", status: "working", checkin: "09:15", lunchStart: null, lunchEnd: null },
      { id: 4, name: "James Wilson", status: "overtime", checkin: "08:45", lunchStart: "12:30", lunchEnd: "13:15" },
      { id: 5, name: "Lisa Brown", status: "checked_out", checkin: "09:00", lunchStart: "13:00", lunchEnd: "13:45", checkout: "17:30" }
    ];
    
    res.json(teamStatus);
  } catch (err) {
    console.error('Team attendance status error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/activity - Get recent attendance activity (no auth required for demo)
router.get('/activity', async (req, res) => {
  try {
    console.log('Attendance activity - Public access');
    
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

// GET /api/attendance/my-timeline - Get current user's attendance timeline (no auth required for demo)
router.get('/my-timeline', async (req, res) => {
  try {
    console.log('My attendance timeline - Public access');
    
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
