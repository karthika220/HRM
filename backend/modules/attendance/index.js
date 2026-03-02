const express = require('express')
const router = express.Router()

// Mock data for development
const mockAttendanceLogs = []
const mockAttendanceSummary = []

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

// Helper function to calculate work hours from logs
const calculateWorkHours = (logs) => {
  if (!logs || logs.length === 0) return { totalMinutes: 0, lunchMinutes: 0 }
  
  // Sort logs by time
  const sortedLogs = logs.sort((a, b) => new Date(a.log_time) - new Date(b.log_time))
  
  let totalMinutes = 0
  let lunchMinutes = 0
  let inTime = null
  let firstOutTime = null
  let secondInTime = null
  
  for (const log of sortedLogs) {
    if (log.log_type === 'IN') {
      inTime = new Date(log.log_time)
      if (!firstOutTime) {
        // This is the first IN of the day
      } else {
        // This is the second IN (after lunch)
        secondInTime = new Date(log.log_time)
        if (firstOutTime) {
          lunchMinutes = Math.round((secondInTime - firstOutTime) / (1000 * 60))
        }
      }
    } else if (log.log_type === 'OUT' && inTime) {
      const outTime = new Date(log.log_time)
      const sessionMinutes = Math.round((outTime - inTime) / (1000 * 60))
      totalMinutes += sessionMinutes
      
      if (!firstOutTime) {
        firstOutTime = outTime
      }
      
      inTime = null
    }
  }
  
  return { totalMinutes, lunchMinutes }
}

// Helper function to determine attendance status
const getAttendanceStatus = (totalMinutes) => {
  if (totalMinutes === 0) return 'Absent'
  if (totalMinutes < 240) return 'Half Day' // Less than 4 hours
  if (totalMinutes > 480) return 'Overtime' // More than 8 hours
  return 'Present'
}

// GET /api/attendance/status/:employeeId
router.get('/status/:employeeId', (req, res) => {
  try {
    const { employeeId } = req.params
    const today = getTodayDate()
    
    // Get today's logs for this employee
    const todayLogs = mockAttendanceLogs.filter(log => 
      log.employee_id === employeeId && 
      log.log_time.startsWith(today)
    )
    
    // Get today's summary
    const summary = mockAttendanceSummary.find(s => 
      s.employee_id === employeeId && 
      s.date === today
    )
    
    // Determine current status
    let currentStatus = 'Not Checked In'
    let canCheckIn = true
    let canCheckOut = false
    
    if (todayLogs.length > 0) {
      const lastLog = todayLogs[todayLogs.length - 1]
      if (lastLog.log_type === 'IN') {
        currentStatus = 'Checked In'
        canCheckIn = false
        canCheckOut = true
      } else {
        currentStatus = 'Checked Out'
        canCheckIn = true
        canCheckOut = false
      }
    }
    
    // Check if late (first check-in after 9:15 AM)
    const firstInLog = todayLogs.find(log => log.log_type === 'IN')
    const isLate = firstInLog && new Date(firstInLog.log_time).getHours() > 9 || 
                   (new Date(firstInLog.log_time).getHours() === 9 && new Date(firstInLog.log_time).getMinutes() > 15)
    
    res.json({
      success: true,
      data: {
        currentStatus,
        canCheckIn,
        canCheckOut,
        isLate,
        summary: summary || {
          totalWorkMinutes: 0,
          lunchDurationMinutes: 0,
          status: 'Absent'
        },
        todayLogs: todayLogs.map(log => ({
          id: log.id,
          type: log.log_type,
          time: log.log_time
        }))
      }
    })
  } catch (error) {
    console.error('Error getting attendance status:', error)
    res.status(500).json({ success: false, error: 'Failed to get attendance status' })
  }
})

// POST /api/attendance/checkin
router.post('/checkin', (req, res) => {
  try {
    const { employeeId } = req.body
    const today = getTodayDate()
    
    // Get today's logs
    const todayLogs = mockAttendanceLogs.filter(log => 
      log.employee_id === employeeId && 
      log.log_time.startsWith(today)
    )
    
    // Check if can check in
    if (todayLogs.length > 0) {
      const lastLog = todayLogs[todayLogs.length - 1]
      if (lastLog.log_type === 'IN') {
        return res.status(400).json({ 
          success: false, 
          error: 'Already checked in. Please check out first.' 
        })
      }
    }
    
    // Check if late
    const now = new Date()
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)
    
    // Create check-in log
    const newLog = {
      id: Date.now().toString(),
      employee_id: employeeId,
      log_type: 'IN',
      log_time: now.toISOString()
    }
    
    mockAttendanceLogs.push(newLog)
    
    // Update or create summary
    let summary = mockAttendanceSummary.find(s => 
      s.employee_id === employeeId && 
      s.date === today
    )
    
    if (!summary) {
      summary = {
        id: Date.now().toString() + '_summary',
        employee_id: employeeId,
        date: today,
        check_in_time: now.toISOString(),
        total_work_minutes: 0,
        lunch_duration_minutes: 0,
        status: 'Present',
        is_late: isLate,
        is_overtime: false
      }
      mockAttendanceSummary.push(summary)
    } else {
      summary.check_in_time = now.toISOString()
      summary.is_late = isLate
    }
    
    res.json({
      success: true,
      message: isLate ? 'Checked in (Late)' : 'Checked in successfully',
      data: {
        log: newLog,
        isLate
      }
    })
  } catch (error) {
    console.error('Error checking in:', error)
    res.status(500).json({ success: false, error: 'Failed to check in' })
  }
})

// POST /api/attendance/checkout
router.post('/checkout', (req, res) => {
  try {
    const { employeeId } = req.body
    const today = getTodayDate()
    
    // Get today's logs
    const todayLogs = mockAttendanceLogs.filter(log => 
      log.employee_id === employeeId && 
      log.log_time.startsWith(today)
    )
    
    // Check if can check out
    if (todayLogs.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No check-in found for today.' 
      })
    }
    
    const lastLog = todayLogs[todayLogs.length - 1]
    if (lastLog.log_type === 'OUT') {
      return res.status(400).json({ 
        success: false, 
        error: 'Already checked out. Please check in first.' 
      })
    }
    
    // Check if overtime
    const now = new Date()
    const isOvertime = now.getHours() > 18 || (now.getHours() === 18 && now.getMinutes() > 45)
    
    // Create check-out log
    const newLog = {
      id: Date.now().toString(),
      employee_id: employeeId,
      log_type: 'OUT',
      log_time: now.toISOString()
    }
    
    mockAttendanceLogs.push(newLog)
    
    // Calculate work hours and update summary
    const { totalMinutes, lunchMinutes } = calculateWorkHours(todayLogs.concat(newLog))
    const status = getAttendanceStatus(totalMinutes)
    
    let summary = mockAttendanceSummary.find(s => 
      s.employee_id === employeeId && 
      s.date === today
    )
    
    if (summary) {
      summary.check_out_time = now.toISOString()
      summary.total_work_minutes = totalMinutes
      summary.lunch_duration_minutes = lunchMinutes
      summary.status = status
      summary.is_overtime = isOvertime
    }
    
    res.json({
      success: true,
      message: isOvertime ? 'Checked out (Overtime)' : 'Checked out successfully',
      data: {
        log: newLog,
        totalWorkMinutes: totalMinutes,
        lunchDurationMinutes: lunchMinutes,
        status,
        isOvertime
      }
    })
  } catch (error) {
    console.error('Error checking out:', error)
    res.status(500).json({ success: false, error: 'Failed to check out' })
  }
})

// GET /api/attendance/logs/:employeeId/:date?
router.get('/logs/:employeeId/:date?', (req, res) => {
  try {
    const { employeeId, date = getTodayDate() } = req.params
    
    const logs = mockAttendanceLogs.filter(log => 
      log.employee_id === employeeId && 
      log.log_time.startsWith(date)
    ).sort((a, b) => new Date(a.log_time) - new Date(b.log_time))
    
    // Calculate work hours for the day
    const { totalMinutes, lunchMinutes } = calculateWorkHours(logs)
    
    res.json({
      success: true,
      data: {
        date,
        logs: logs.map(log => ({
          id: log.id,
          type: log.log_type,
          time: log.log_time
        })),
        summary: {
          totalWorkMinutes: totalMinutes,
          lunchDurationMinutes: lunchMinutes,
          status: getAttendanceStatus(totalMinutes)
        }
      }
    })
  } catch (error) {
    console.error('Error getting attendance logs:', error)
    res.status(500).json({ success: false, error: 'Failed to get attendance logs' })
  }
})

// GET /api/attendance/dashboard
router.get('/dashboard', (req, res) => {
  try {
    const today = getTodayDate()
    
    // Mock dashboard data
    const dashboardData = {
      todayStats: {
        totalEmployees: 4,
        present: 3,
        absent: 1,
        late: 1,
        onBreak: 0
      },
      recentLogs: mockAttendanceLogs
        .filter(log => log.log_time.startsWith(today))
        .sort((a, b) => new Date(b.log_time) - new Date(a.log_time))
        .slice(0, 10)
        .map(log => ({
          id: log.id,
          employeeId: log.employee_id,
          type: log.log_type,
          time: log.log_time
        }))
    }
    
    res.json({
      success: true,
      data: dashboardData
    })
  } catch (error) {
    console.error('Error getting dashboard data:', error)
    res.status(500).json({ success: false, error: 'Failed to get dashboard data' })
  }
})

module.exports = router
