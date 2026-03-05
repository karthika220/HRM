const express = require('express');
const { prisma } = require('../prisma');
const { authenticate } = require('../middleware/auth');
const { 
  calculateAttendanceSummary, 
  detectLateCheckIn, 
  calculateOvertime, 
  generateNotifications, 
  generateTimelineData,
  BUSINESS_RULES 
} = require('../utils/attendanceCalculations');

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
    
    // Validate user exists
    if (!req.user || !req.user.id) {
      console.error('❌ Invalid user object in attendance timeline');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid user authentication',
        logs: [],
        summary: getDefaultSummary(),
        timeline: getDefaultTimeline(),
        notifications: []
      });
    }
    
    // Get today's attendance logs for current user
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get real attendance logs for the user with error handling
    let userLogs = [];
    try {
      userLogs = await prisma.attendanceLog.findMany({
        where: {
          userId: req.user.id,
          date: today
        },
        orderBy: {
          timestamp: 'asc'
        }
      });
    } catch (dbError) {
      console.error('❌ Database error fetching attendance logs:', dbError.message);
      // Continue with empty logs instead of crashing
    }

    // Convert database logs to expected format with validation
    let logs = [];
    try {
      logs = userLogs.map(log => {
        // Validate log structure
        if (!log || !log.type || !log.timestamp) {
          console.warn('⚠️ Invalid log entry found, skipping:', log);
          return null;
        }
        
        // Validate timestamp
        const timestamp = new Date(log.timestamp);
        if (isNaN(timestamp.getTime())) {
          console.warn('⚠️ Invalid timestamp found, skipping:', log.timestamp);
          return null;
        }
        
        return {
          type: log.type,
          time: timestamp.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }).replace(' ', '')
        };
      }).filter(log => log !== null); // Remove null entries
    } catch (conversionError) {
      console.error('❌ Error converting logs:', conversionError.message);
      logs = []; // Use empty array as fallback
    }

    // If no logs for today, create empty array
    const logsToProcess = Array.isArray(logs) && logs.length > 0 ? logs : [];
    
    // Calculate enhanced attendance summary with error handling
    let attendanceSummary = null;
    try {
      attendanceSummary = calculateAttendanceSummary(logsToProcess, today);
      
      // Validate summary structure
      if (!attendanceSummary || !attendanceSummary.summary) {
        console.warn('⚠️ Invalid attendance summary, using default');
        attendanceSummary = { summary: getDefaultSummary() };
      }
    } catch (calculationError) {
      console.error('❌ Error calculating attendance summary:', calculationError.message);
      attendanceSummary = { summary: getDefaultSummary() };
    }
    
    // Generate timeline data for visualization with error handling
    let timelineData = null;
    try {
      timelineData = generateTimelineData(logsToProcess);
      
      // Validate timeline structure
      if (!timelineData || !timelineData.segments) {
        console.warn('⚠️ Invalid timeline data, using default');
        timelineData = getDefaultTimeline();
      }
    } catch (timelineError) {
      console.error('❌ Error generating timeline data:', timelineError.message);
      timelineData = getDefaultTimeline();
    }
    
    // Generate notifications if needed with error handling
    let notifications = [];
    try {
      notifications = generateNotifications(attendanceSummary, req.user.name) || [];
    } catch (notificationError) {
      console.error('❌ Error generating notifications:', notificationError.message);
      notifications = [];
    }
    
    // Ensure all response data is valid
    const response = {
      success: true,
      logs: Array.isArray(logsToProcess) ? logsToProcess : [],
      summary: attendanceSummary && attendanceSummary.summary ? attendanceSummary.summary : getDefaultSummary(),
      timeline: timelineData || getDefaultTimeline(),
      notifications: Array.isArray(notifications) ? notifications : [],
      businessRules: {
        STANDARD_START_TIME: BUSINESS_RULES.STANDARD_START_TIME,
        GRACE_PERIOD_MINUTES: BUSINESS_RULES.GRACE_PERIOD_MINUTES,
        STANDARD_END_TIME: BUSINESS_RULES.STANDARD_END_TIME,
        LATE_CHECKOUT_WARNING_TIME: BUSINESS_RULES.LATE_CHECKOUT_WARNING_TIME,
        TIMELINE_SCALE: {
          TOTAL_MINUTES: 585,
          EXPECTED_WORKING_TIME: 525,
          START_TIME: '09:00',
          END_TIME: '18:45'
        }
      }
    };
    
    console.log('✅ Attendance timeline response sent successfully');
    res.json(response);
    
  } catch (error) {
    console.error('❌ Critical error in attendance timeline:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Return safe fallback response instead of crashing
    res.status(500).json({
      success: false,
      message: 'Unable to fetch attendance timeline',
      logs: [],
      summary: getDefaultSummary(),
      timeline: getDefaultTimeline(),
      notifications: [],
      businessRules: {
        STANDARD_START_TIME: '09:00',
        GRACE_PERIOD_MINUTES: 5,
        STANDARD_END_TIME: '18:45',
        TIMELINE_SCALE: {
          TOTAL_MINUTES: 585,
          EXPECTED_WORKING_TIME: 525,
          START_TIME: '09:00',
          END_TIME: '18:45'
        }
      }
    });
  }
});

// Helper function for default summary
function getDefaultSummary() {
  return {
    totalWorkMinutes: 0,
    lunchDurationMinutes: 0,
    status: 'Not Checked In',
    overtimeMinutes: 0,
    isLate: false,
    canCheckIn: true,
    canCheckOut: false,
    netWorkingTime: 0,
    expectedWorkingTime: 525
  };
}

// Helper function for default timeline
function getDefaultTimeline() {
  return {
    segments: [],
    dayStart: '09:00',
    dayEnd: '18:45',
    currentTime: new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace(' ', ''),
    timelineScale: {
      startMinutes: 540,
      endMinutes: 1125,
      totalMinutes: 585,
      expectedWorkingTime: 525
    }
  };
}

// POST /api/attendance/checkin - Handle check-in with business rules
router.post('/checkin', authenticate, async (req, res) => {
  try {
    console.log('Check-in attempt - User:', { id: req.user.id, name: req.user.name });
    
    const currentTime = new Date();
    const timeStr = currentTime.toTimeString().slice(0, 5); // HH:MM format
    
    // Check late arrival
    const lateCheckIn = detectLateCheckIn(timeStr);
    
    // In real implementation, save to database
    const checkInRecord = {
      userId: req.user.id,
      type: 'IN',
      time: timeStr,
      timestamp: currentTime,
      isLate: lateCheckIn.isLate,
      lateByMinutes: lateCheckIn.lateByMinutes
    };
    
    // Generate notifications for late arrival
    let notifications = [];
    if (lateCheckIn.isLate) {
      notifications = [{
        type: 'LATE_CHECK_IN',
        message: `${req.user.name} checked in late at ${timeStr}.`,
        timestamp: currentTime.toISOString(),
        recipients: ['EMPLOYEE', 'HR_MANAGER'],
        priority: 'MEDIUM'
      }];
    }
    
    res.json({
      success: true,
      checkIn: checkInRecord,
      notifications: notifications,
      message: lateCheckIn.isLate 
        ? `Checked in at ${timeStr} (Late by ${lateCheckIn.lateByMinutes} minutes)`
        : `Checked in at ${timeStr} (On time)`
    });
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/attendance/checkout - Handle check-out
router.post('/checkout', authenticate, async (req, res) => {
  try {
    console.log('Check-out attempt - User:', { id: req.user.id, name: req.user.name });
    
    const currentTime = new Date();
    const timeStr = currentTime.toTimeString().slice(0, 5); // HH:MM format
    
    // In real implementation, save to database
    const checkOutRecord = {
      userId: req.user.id,
      type: 'OUT',
      time: timeStr,
      timestamp: currentTime
    };
    
    // Check for overtime
    const standardEndMinutes = timeToMinutes(BUSINESS_RULES.STANDARD_END_TIME);
    const currentMinutes = timeToMinutes(timeStr);
    const isOvertime = currentMinutes > standardEndMinutes;
    const overtimeMinutes = isOvertime ? currentMinutes - standardEndMinutes : 0;
    
    res.json({
      success: true,
      checkOut: checkOutRecord,
      overtime: {
        isOvertime,
        overtimeMinutes,
        overtimeTime: isOvertime ? minutesToTime(standardEndMinutes) : null
      },
      message: `Checked out at ${timeStr}${isOvertime ? ` (Overtime: ${overtimeMinutes} minutes)` : ''}`
    });
  } catch (err) {
    console.error('Check-out error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Helper functions for time conversion
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

module.exports = router;
