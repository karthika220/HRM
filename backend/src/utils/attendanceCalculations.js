// Enhanced Attendance Calculation Logic
// Timeline Scale: 9:00 AM to 6:45 PM = 585 minutes total
// Expected Working Time: 525 minutes (8 hours 45 minutes)

const BUSINESS_RULES = {
  STANDARD_START_TIME: '09:00', // 9:00 AM = 540 minutes
  GRACE_PERIOD_MINUTES: 5, // 5 minutes grace period
  STANDARD_END_TIME: '18:45', // 6:45 PM = 1125 minutes
  LATE_CHECKOUT_WARNING_TIME: '22:00' // 10:00 PM
};

// Timeline scale constants
const TIMELINE = {
  START_MINUTES: 9 * 60, // 09:00 = 540 minutes
  END_MINUTES: 18.75 * 60, // 18:45 = 1125 minutes
  TOTAL_MINUTES: 585, // 585 minutes for visual scaling
  OVERTIME_THRESHOLD: 18.75 * 60, // 6:45 PM = 1125 minutes
  EXPECTED_WORKING_TIME: 525 // 8 hours 45 minutes standard
};

// Helper function to convert time string to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to convert minutes to time string
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Helper function to get current time in minutes
function getCurrentTimeMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Enhanced attendance calculation function
function calculateAttendanceSummary(logs, date = new Date()) {
  try {
    // Validate inputs
    if (!Array.isArray(logs)) {
      console.warn('⚠️ Invalid logs array, using empty array');
      logs = [];
    }
    
    const standardStartMinutes = timeToMinutes(BUSINESS_RULES.STANDARD_START_TIME);
    const gracePeriodEnd = standardStartMinutes + BUSINESS_RULES.GRACE_PERIOD_MINUTES;
    const standardEndMinutes = timeToMinutes(BUSINESS_RULES.STANDARD_END_TIME);
    
    // Validate business rules
    if (isNaN(standardStartMinutes) || isNaN(standardEndMinutes)) {
      console.error('❌ Invalid business rules time values');
      return getDefaultAttendanceSummary();
    }
    
    // Sort logs by time with validation
    let sortedLogs = [];
    try {
      sortedLogs = logs.filter(log => log && log.type && log.time).sort((a, b) => {
        const timeA = timeToMinutes(a.time);
        const timeB = timeToMinutes(b.time);
        
        // Validate time values
        if (isNaN(timeA) || isNaN(timeB)) {
          console.warn('⚠️ Invalid time values in logs, skipping comparison');
          return 0;
        }
        
        return timeA - timeB;
      });
    } catch (sortError) {
      console.error('❌ Error sorting logs:', sortError.message);
      sortedLogs = [];
    }

    let totalWorkingMinutes = 0;
    let totalBreakMinutes = 0;
    let overtimeMinutes = 0;
    let isLate = false;
    let currentStatus = 'Not Checked In';
    let canCheckIn = true;
    let canCheckOut = false;
    
    // Track multiple IN/OUT intervals
    let checkInTime = null;
    let lastCheckOutTime = null;
    let workIntervals = [];
    let breakIntervals = [];

    // Process each log entry with validation
    for (const log of sortedLogs) {
      try {
        if (!log || !log.type || !log.time) {
          console.warn('⚠️ Invalid log entry, skipping:', log);
          continue;
        }
        
        const logTimeMinutes = timeToMinutes(log.time);
        
        if (isNaN(logTimeMinutes)) {
          console.warn('⚠️ Invalid log time, skipping:', log.time);
          continue;
        }
        
        if (log.type === 'IN') {
          if (checkInTime === null) {
            // First check-in of the day
            checkInTime = logTimeMinutes;
            
            // Check if late (only for first check-in)
            if (logTimeMinutes > gracePeriodEnd) {
              isLate = true;
            }
          } else if (lastCheckOutTime !== null) {
            // Multiple check-ins (after checkout)
            checkInTime = logTimeMinutes;
          }
          currentStatus = 'Checked In';
          canCheckIn = false;
          canCheckOut = true;
          
        } else if (log.type === 'OUT') {
          if (checkInTime !== null && !isNaN(checkInTime)) {
            // Calculate work interval with validation
            let intervalWorkMinutes = logTimeMinutes - checkInTime;
            
            // Validate interval duration
            if (intervalWorkMinutes < 0) {
              console.warn('⚠️ Negative work interval, skipping:', { checkInTime, logTimeMinutes });
              continue;
            }
            
            // Check for overtime in this interval
            if (logTimeMinutes > standardEndMinutes) {
              const overtimeStart = Math.max(standardEndMinutes, checkInTime);
              const intervalOvertime = logTimeMinutes - overtimeStart;
              
              if (intervalOvertime > 0 && !isNaN(intervalOvertime)) {
                overtimeMinutes += intervalOvertime;
                intervalWorkMinutes -= intervalOvertime;
              }
            }
            
            // Validate work minutes before adding
            if (intervalWorkMinutes > 0 && !isNaN(intervalWorkMinutes)) {
              totalWorkingMinutes += intervalWorkMinutes;
            }
            
            checkInTime = null;
            lastCheckOutTime = logTimeMinutes;
          }
          currentStatus = 'Checked Out';
          canCheckIn = true;
          canCheckOut = false;
        }
      } catch (logError) {
        console.error('❌ Error processing log entry:', logError.message);
        continue;
      }
    }

    // Handle currently checked in (no checkout yet) with validation
    const currentTimeMinutes = getCurrentTimeMinutes();
    if (checkInTime !== null && !isNaN(checkInTime) && !isNaN(currentTimeMinutes)) {
      let currentWorkMinutes = currentTimeMinutes - checkInTime;
      
      // Validate current work minutes
      if (currentWorkMinutes > 0 && !isNaN(currentWorkMinutes)) {
        // Check for current overtime
        if (currentTimeMinutes > standardEndMinutes) {
          const overtimeStart = Math.max(standardEndMinutes, checkInTime);
          const currentOvertime = currentTimeMinutes - overtimeStart;
          
          if (currentOvertime > 0 && !isNaN(currentOvertime)) {
            overtimeMinutes += currentOvertime;
            currentWorkMinutes -= currentOvertime;
          }
        }
        
        totalWorkingMinutes += currentWorkMinutes;
        currentStatus = 'Checked In';
        canCheckIn = false;
        canCheckOut = true;
      }
    }

    // Calculate break times (time between check-out and next check-in) with validation
    try {
      for (let i = 0; i < workIntervals.length - 1; i++) {
        const currentInterval = workIntervals[i];
        const nextInterval = workIntervals[i + 1];
        
        if (currentInterval && currentInterval.end && nextInterval && nextInterval.start) {
          const breakDuration = nextInterval.start - currentInterval.end;
          
          if (breakDuration > 0 && !isNaN(breakDuration)) {
            breakIntervals.push({
              start: currentInterval.end,
              end: nextInterval.start,
              duration: breakDuration
            });
            totalBreakMinutes += breakDuration;
          }
        }
      }
    } catch (breakError) {
      console.error('❌ Error calculating break times:', breakError.message);
    }

    // Net working time calculation with validation
    let netWorkingTime = 0;
    if (!isNaN(totalWorkingMinutes) && !isNaN(totalBreakMinutes)) {
      netWorkingTime = totalWorkingMinutes - totalBreakMinutes;
    }

    // Validate all calculated values
    totalWorkingMinutes = Math.max(0, totalWorkingMinutes || 0);
    totalBreakMinutes = Math.max(0, totalBreakMinutes || 0);
    overtimeMinutes = Math.max(0, overtimeMinutes || 0);
    netWorkingTime = Math.max(0, netWorkingTime || 0);

    return {
      totalWorkingMinutes,
      totalBreakMinutes,
      netWorkingTime,
      overtimeMinutes,
      isLate,
      currentStatus,
      canCheckIn,
      canCheckOut,
      workIntervals,
      breakIntervals,
      summary: {
        totalWorkMinutes,
        lunchDurationMinutes: totalBreakMinutes, // Dynamic break duration
        status: currentStatus,
        overtimeMinutes,
        isLate,
        netWorkingTime,
        expectedWorkingTime: TIMELINE.EXPECTED_WORKING_TIME,
        canCheckIn,
        canCheckOut
      }
    };
  } catch (error) {
    console.error('❌ Critical error in calculateAttendanceSummary:', error.message);
    console.error('Stack trace:', error.stack);
    return getDefaultAttendanceSummary();
  }
}

// Helper function for default attendance summary
function getDefaultAttendanceSummary() {
  return {
    totalWorkingMinutes: 0,
    totalBreakMinutes: 0,
    netWorkingTime: 0,
    overtimeMinutes: 0,
    isLate: false,
    currentStatus: 'Not Checked In',
    canCheckIn: true,
    canCheckOut: false,
    workIntervals: [],
    breakIntervals: [],
    summary: {
      totalWorkMinutes: 0,
      lunchDurationMinutes: 0,
      status: 'Not Checked In',
      overtimeMinutes: 0,
      isLate: false,
      netWorkingTime: 0,
      expectedWorkingTime: TIMELINE.EXPECTED_WORKING_TIME,
      canCheckIn: true,
      canCheckOut: false
    }
  };
}

// Enhanced timeline segment generation
function generateTimelineData(logs) {
  try {
    // Validate inputs
    if (!Array.isArray(logs)) {
      console.warn('⚠️ Invalid logs array in timeline generation, using empty array');
      logs = [];
    }
    
    const timelineStartMinutes = TIMELINE.START_MINUTES;
    const timelineEndMinutes = TIMELINE.END_MINUTES;
    const timelineTotalMinutes = TIMELINE.TOTAL_MINUTES;
    const overtimeThresholdMinutes = TIMELINE.OVERTIME_THRESHOLD;
    
    // Validate timeline constants
    if (isNaN(timelineStartMinutes) || isNaN(timelineEndMinutes) || isNaN(timelineTotalMinutes)) {
      console.error('❌ Invalid timeline constants');
      return getDefaultTimelineData();
    }
    
    // Sort logs by time with validation
    let sortedLogs = [];
    try {
      sortedLogs = logs.filter(log => log && log.type && log.time).sort((a, b) => {
        const timeA = timeToMinutes(a.time);
        const timeB = timeToMinutes(b.time);
        
        // Validate time values
        if (isNaN(timeA) || isNaN(timeB)) {
          console.warn('⚠️ Invalid time values in timeline logs, skipping comparison');
          return 0;
        }
        
        return timeA - timeB;
      });
    } catch (sortError) {
      console.error('❌ Error sorting timeline logs:', sortError.message);
      sortedLogs = [];
    }

    const segments = [];
    let checkInTime = null;
    let lastCheckOutTime = null;

    // Process each log entry for timeline segments with validation
    for (const log of sortedLogs) {
      try {
        if (!log || !log.type || !log.time) {
          console.warn('⚠️ Invalid timeline log entry, skipping:', log);
          continue;
        }
        
        const logTimeMinutes = timeToMinutes(log.time);
        
        if (isNaN(logTimeMinutes)) {
          console.warn('⚠️ Invalid timeline log time, skipping:', log.time);
          continue;
        }
        
        if (log.type === 'IN') {
          if (checkInTime === null) {
            checkInTime = logTimeMinutes;
          } else if (lastCheckOutTime !== null) {
            checkInTime = logTimeMinutes;
          }
        } else if (log.type === 'OUT') {
          if (checkInTime !== null && !isNaN(checkInTime)) {
            // Calculate work segment position using 585 minutes scale with validation
            let startPosition, width;
            
            try {
              startPosition = Math.max(0, (checkInTime - timelineStartMinutes) / timelineTotalMinutes * 100);
              width = Math.min(100, (logTimeMinutes - checkInTime) / timelineTotalMinutes * 100);
              
              // Validate calculated values
              if (isNaN(startPosition) || isNaN(width) || width < 0) {
                console.warn('⚠️ Invalid segment calculations, skipping:', { checkInTime, logTimeMinutes });
                continue;
              }
              
              const workSegment = {
                type: 'work',
                start: startPosition,
                width: width,
                startTime: minutesToTime(checkInTime),
                endTime: minutesToTime(logTimeMinutes)
              };
              
              // Check for overtime and split segment at 6:45 PM threshold with validation
              if (logTimeMinutes > overtimeThresholdMinutes) {
                const overtimeStart = Math.max(overtimeThresholdMinutes, checkInTime);
                const overtimeEnd = logTimeMinutes;
                
                if (!isNaN(overtimeStart) && !isNaN(overtimeEnd) && overtimeEnd > overtimeStart) {
                  if (checkInTime < overtimeThresholdMinutes) {
                    // Regular work portion
                    workSegment.width = (overtimeThresholdMinutes - checkInTime) / timelineTotalMinutes * 100;
                    segments.push(workSegment);
                    
                    // Overtime portion - starts exactly at 6:45 PM
                    const overtimeSegment = {
                      type: 'overtime',
                      start: (overtimeThresholdMinutes - timelineStartMinutes) / timelineTotalMinutes * 100,
                      width: (overtimeEnd - overtimeThresholdMinutes) / timelineTotalMinutes * 100,
                      startTime: minutesToTime(overtimeThresholdMinutes),
                      endTime: minutesToTime(overtimeEnd),
                      duration: overtimeEnd - overtimeThresholdMinutes
                    };
                    
                    // Validate overtime segment
                    if (!isNaN(overtimeSegment.start) && !isNaN(overtimeSegment.width) && overtimeSegment.width > 0) {
                      segments.push(overtimeSegment);
                    }
                  } else {
                    // Entire segment is overtime
                    workSegment.type = 'overtime';
                    workSegment.duration = logTimeMinutes - checkInTime;
                    segments.push(workSegment);
                  }
                }
              } else {
                // Regular work segment
                segments.push(workSegment);
              }
            } catch (segmentError) {
              console.error('❌ Error calculating segment:', segmentError.message);
              continue;
            }
            
            checkInTime = null;
            lastCheckOutTime = logTimeMinutes;
          }
        }
      } catch (logError) {
        console.error('❌ Error processing timeline log entry:', logError.message);
        continue;
      }
    }

    // Handle currently checked in (no checkout yet) with validation
    const currentTimeMinutes = getCurrentTimeMinutes();
    if (checkInTime !== null && !isNaN(checkInTime) && !isNaN(currentTimeMinutes)) {
      try {
        let currentWorkSegment = {
          type: 'work',
          start: Math.max(0, (checkInTime - timelineStartMinutes) / timelineTotalMinutes * 100),
          width: Math.min(100, (currentTimeMinutes - checkInTime) / timelineTotalMinutes * 100),
          startTime: minutesToTime(checkInTime),
          endTime: minutesToTime(currentTimeMinutes),
          isActive: true
        };
        
        // Validate current segment
        if (!isNaN(currentWorkSegment.start) && !isNaN(currentWorkSegment.width) && currentWorkSegment.width > 0) {
          // Check for current overtime
          if (currentTimeMinutes > overtimeThresholdMinutes) {
            const overtimeStart = Math.max(overtimeThresholdMinutes, checkInTime);
            const currentOvertimeEnd = currentTimeMinutes;
            
            if (!isNaN(overtimeStart) && !isNaN(currentOvertimeEnd) && currentOvertimeEnd > overtimeStart) {
              if (checkInTime < overtimeThresholdMinutes) {
                // Regular work portion
                currentWorkSegment.width = (overtimeThresholdMinutes - checkInTime) / timelineTotalMinutes * 100;
                segments.push(currentWorkSegment);
                
                // Overtime portion
                const currentOvertimeSegment = {
                  type: 'overtime',
                  start: (overtimeThresholdMinutes - timelineStartMinutes) / timelineTotalMinutes * 100,
                  width: (currentOvertimeEnd - overtimeThresholdMinutes) / timelineTotalMinutes * 100,
                  startTime: minutesToTime(overtimeThresholdMinutes),
                  endTime: minutesToTime(currentOvertimeEnd),
                  duration: currentOvertimeEnd - overtimeThresholdMinutes,
                  isActive: true
                };
                
                // Validate overtime segment
                if (!isNaN(currentOvertimeSegment.start) && !isNaN(currentOvertimeSegment.width) && currentOvertimeSegment.width > 0) {
                  segments.push(currentOvertimeSegment);
                }
              } else {
                // Entire segment is overtime
                currentWorkSegment.type = 'overtime';
                currentWorkSegment.duration = currentTimeMinutes - checkInTime;
                segments.push(currentWorkSegment);
              }
            }
          } else {
            // Regular work segment
            segments.push(currentWorkSegment);
          }
        }
      } catch (currentSegmentError) {
        console.error('❌ Error calculating current segment:', currentSegmentError.message);
      }
    }

    // Calculate dynamic break segments (OUT → next IN) with validation
    try {
      const workSegments = segments.filter(s => s && s.type === 'work');
      for (let i = 0; i < workSegments.length - 1; i++) {
        const currentSegment = workSegments[i];
        const nextSegment = workSegments[i + 1];
        
        if (currentSegment && nextSegment && currentSegment.endTime && nextSegment.startTime) {
          const breakStart = timeToMinutes(currentSegment.endTime);
          const breakEnd = timeToMinutes(nextSegment.startTime);
          
          if (!isNaN(breakStart) && !isNaN(breakEnd) && breakEnd > breakStart && 
              breakStart >= timelineStartMinutes && breakEnd <= timelineEndMinutes) {
            const breakDuration = breakEnd - breakStart;
            
            if (breakDuration > 0 && !isNaN(breakDuration)) {
              const breakSegment = {
                type: 'break',
                start: (breakStart - timelineStartMinutes) / timelineTotalMinutes * 100,
                width: breakDuration / timelineTotalMinutes * 100,
                startTime: minutesToTime(breakStart),
                endTime: minutesToTime(breakEnd),
                duration: breakDuration
              };
              
              // Validate break segment
              if (!isNaN(breakSegment.start) && !isNaN(breakSegment.width) && breakSegment.width > 0) {
                segments.push(breakSegment);
              }
            }
          }
        }
      }
    } catch (breakError) {
      console.error('❌ Error calculating break segments:', breakError.message);
    }

    // Sort segments by start position with validation
    try {
      segments.sort((a, b) => {
        if (!a || !b || isNaN(a.start) || isNaN(b.start)) {
          return 0;
        }
        return a.start - b.start;
      });
    } catch (sortError) {
      console.error('❌ Error sorting segments:', sortError.message);
    }

    return {
      segments: Array.isArray(segments) ? segments : [],
      dayStart: minutesToTime(timelineStartMinutes),
      dayEnd: minutesToTime(timelineEndMinutes),
      currentTime: minutesToTime(getCurrentTimeMinutes()),
      timelineScale: {
        startMinutes: timelineStartMinutes,
        endMinutes: timelineEndMinutes,
        totalMinutes: timelineTotalMinutes,
        expectedWorkingTime: TIMELINE.EXPECTED_WORKING_TIME
      }
    };
  } catch (error) {
    console.error('❌ Critical error in generateTimelineData:', error.message);
    console.error('Stack trace:', error.stack);
    return getDefaultTimelineData();
  }
}

// Helper function for default timeline data
function getDefaultTimelineData() {
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
      startMinutes: TIMELINE.START_MINUTES || 540,
      endMinutes: TIMELINE.END_MINUTES || 1125,
      totalMinutes: TIMELINE.TOTAL_MINUTES || 585,
      expectedWorkingTime: TIMELINE.EXPECTED_WORKING_TIME || 525
    }
  };
}

// Late detection logic
function detectLateCheckIn(checkInTime) {
  const standardStartMinutes = timeToMinutes(BUSINESS_RULES.STANDARD_START_TIME);
  const gracePeriodEnd = standardStartMinutes + BUSINESS_RULES.GRACE_PERIOD_MINUTES;
  const checkInMinutes = timeToMinutes(checkInTime);
  
  return {
    isLate: checkInMinutes > gracePeriodEnd,
    lateByMinutes: Math.max(0, checkInMinutes - gracePeriodEnd),
    gracePeriodUsed: checkInMinutes <= gracePeriodEnd
  };
}

// Overtime calculation logic
function calculateOvertime(workIntervals, standardEndTime = BUSINESS_RULES.STANDARD_END_TIME) {
  const standardEndMinutes = timeToMinutes(standardEndTime);
  let totalOvertimeMinutes = 0;
  let overtimeIntervals = [];

  for (const interval of workIntervals) {
    if (interval.end && interval.end > standardEndMinutes) {
      const overtimeStart = Math.max(standardEndMinutes, interval.start);
      const overtimeEnd = interval.end;
      const overtimeDuration = overtimeEnd - overtimeStart;
      
      totalOvertimeMinutes += overtimeDuration;
      overtimeIntervals.push({
        start: overtimeStart,
        end: overtimeEnd,
        duration: overtimeDuration
      });
    }
  }

  // Handle currently active overtime
  const currentTimeMinutes = getCurrentTimeMinutes();
  const lastInterval = workIntervals[workIntervals.length - 1];
  
  if (lastInterval && !lastInterval.end && currentTimeMinutes > standardEndMinutes) {
    const overtimeStart = Math.max(standardEndMinutes, lastInterval.start);
    const currentOvertimeDuration = currentTimeMinutes - overtimeStart;
    
    totalOvertimeMinutes += currentOvertimeDuration;
    overtimeIntervals.push({
      start: overtimeStart,
      end: null, // Still active
      duration: currentOvertimeDuration,
      isActive: true
    });
  }

  return {
    totalOvertimeMinutes,
    overtimeIntervals,
    isActiveOvertime: overtimeIntervals.some(interval => interval.isActive)
  };
}

// Notification triggers
function generateNotifications(attendanceData, employeeName) {
  const notifications = [];
  const currentTimeMinutes = getCurrentTimeMinutes();
  const lateCheckoutWarning = timeToMinutes(BUSINESS_RULES.LATE_CHECKOUT_WARNING_TIME);

  // Late check-in notification
  if (attendanceData.isLate) {
    notifications.push({
      type: 'LATE_CHECK_IN',
      message: `${employeeName} checked in late at ${attendanceData.firstCheckInTime}.`,
      timestamp: new Date().toISOString(),
      recipients: ['EMPLOYEE', 'HR_MANAGER'],
      priority: 'MEDIUM'
    });
  }

  // Missing checkout notification
  if (attendanceData.currentStatus === 'Checked In' && currentTimeMinutes > lateCheckoutWarning) {
    notifications.push({
      type: 'LATE_CHECKOUT_WARNING',
      message: `${employeeName} is still checked in after 10:00 PM. Please check out.`,
      timestamp: new Date().toISOString(),
      recipients: ['EMPLOYEE', 'HR_MANAGER'],
      priority: 'HIGH'
    });
  }

  return notifications;
}

// Timeline visualization data
function generateTimelineData(workIntervals, breakIntervals, overtimeIntervals) {
  const dayStartMinutes = timeToMinutes('08:00'); // Start timeline at 8 AM
  const dayEndMinutes = timeToMinutes('22:00'); // End timeline at 10 PM
  const totalDayMinutes = dayEndMinutes - dayStartMinutes;

  const segments = [];

  // Add work intervals
  workIntervals.forEach((interval, index) => {
    const startPercent = ((interval.start - dayStartMinutes) / totalDayMinutes) * 100;
    const endPercent = interval.end ? ((interval.end - dayStartMinutes) / totalDayMinutes) * 100 : ((getCurrentTimeMinutes() - dayStartMinutes) / totalDayMinutes) * 100;
    const widthPercent = endPercent - startPercent;

    segments.push({
      type: 'work',
      start: startPercent,
      width: widthPercent,
      startTime: minutesToTime(interval.start),
      endTime: interval.end ? minutesToTime(interval.end) : 'Current',
      isActive: !interval.end
    });
  });

  // Add break intervals
  breakIntervals.forEach((interval) => {
    const startPercent = ((interval.start - dayStartMinutes) / totalDayMinutes) * 100;
    const widthPercent = (interval.duration / totalDayMinutes) * 100;

    segments.push({
      type: 'break',
      start: startPercent,
      width: widthPercent,
      startTime: minutesToTime(interval.start),
      endTime: minutesToTime(interval.end),
      duration: interval.duration
    });
  });

  // Add overtime intervals
  overtimeIntervals.forEach((interval) => {
    const startPercent = ((interval.start - dayStartMinutes) / totalDayMinutes) * 100;
    const endPercent = interval.end ? ((interval.end - dayStartMinutes) / totalDayMinutes) * 100 : ((getCurrentTimeMinutes() - dayStartMinutes) / totalDayMinutes) * 100;
    const widthPercent = endPercent - startPercent;

    segments.push({
      type: 'overtime',
      start: startPercent,
      width: widthPercent,
      startTime: minutesToTime(interval.start),
      endTime: interval.end ? minutesToTime(interval.end) : 'Current',
      isActive: !interval.end,
      duration: interval.duration
    });
  });

  return {
    segments: segments.sort((a, b) => a.start - b.start),
    dayStart: minutesToTime(dayStartMinutes),
    dayEnd: minutesToTime(dayEndMinutes),
    currentTime: minutesToTime(getCurrentTimeMinutes())
  };
}

module.exports = {
  BUSINESS_RULES,
  calculateAttendanceSummary,
  detectLateCheckIn,
  calculateOvertime,
  generateNotifications,
  generateTimelineData,
  timeToMinutes,
  minutesToTime,
  getCurrentTimeMinutes
};
