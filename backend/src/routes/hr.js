const express = require('express');
const { prisma } = require('../prisma');
const { authenticate } = require('../middleware/auth');
const { logLeaveApproved } = require('../utils/auditLogger');
const { isSuperAdmin, isTeamLead } = require('../middleware/roles');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/hr/attendance/logs - Get attendance logs for an employee
router.get('/attendance/logs', async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    
    // Build where clause
    let whereClause = {};
    if (employeeId) whereClause.employeeId = employeeId;
    if (startDate && endDate) {
      whereClause.logTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const logs = await prisma.attendanceLog.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { id: true, name: true, email: true, employeeCode: true }
        }
      },
      orderBy: { logTime: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    res.status(500).json({ error: 'Failed to fetch attendance logs' });
  }
});

// POST /api/hr/attendance/logs - Create attendance log
router.post('/attendance/logs', async (req, res) => {
  try {
    const { employeeId, logType, logTime } = req.body;

    if (!employeeId || !logType) {
      return res.status(400).json({ error: 'Employee ID and log type are required' });
    }

    if (!['IN', 'OUT'].includes(logType)) {
      return res.status(400).json({ error: 'Log type must be IN or OUT' });
    }

    const log = await prisma.attendanceLog.create({
      data: {
        employeeId,
        logType,
        logTime: logTime ? new Date(logTime) : new Date()
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true, employeeCode: true }
        }
      }
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating attendance log:', error);
    res.status(500).json({ error: 'Failed to create attendance log' });
  }
});

// GET /api/hr/attendance/summary - Get attendance summary
router.get('/attendance/summary', async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    
    let whereClause = {};
    if (employeeId) whereClause.employeeId = employeeId;
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const summaries = await prisma.attendanceSummary.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { id: true, name: true, email: true, employeeCode: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(summaries);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
});

// GET /api/hr/leave/balance - Get leave balance for employees
router.get('/leave/balance', async (req, res) => {
  try {
    const { employeeId, year } = req.query;
    
    let whereClause = {};
    if (employeeId) whereClause.employeeId = employeeId;
    if (year) whereClause.year = parseInt(year);
    else whereClause.year = new Date().getFullYear();

    const balances = await prisma.leaveBalance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { id: true, name: true, email: true, employeeCode: true }
        }
      }
    });

    res.json(balances);
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
});

// POST /api/hr/leave/balance - Create or update leave balance
router.post('/leave/balance', async (req, res) => {
  try {
    const { employeeId, year, sickTotal, casualTotal } = req.body;

    if (!employeeId || !year) {
      return res.status(400).json({ error: 'Employee ID and year are required' });
    }

    const balance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_year: {
          employeeId,
          year: parseInt(year)
        }
      },
      update: {
        sickTotal: sickTotal || 8,
        casualTotal: casualTotal || 8
      },
      create: {
        employeeId,
        year: parseInt(year),
        sickTotal: sickTotal || 8,
        casualTotal: casualTotal || 8
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true, employeeCode: true }
        }
      }
    });

    res.status(201).json(balance);
  } catch (error) {
    console.error('Error creating leave balance:', error);
    res.status(500).json({ error: 'Failed to create leave balance' });
  }
});

// GET /api/hr/leave/requests - Get leave requests
router.get('/leave/requests', async (req, res) => {
  try {
    const { employeeId, status, year } = req.query;
    
    let whereClause = {};
    if (employeeId) whereClause.employeeId = employeeId;
    if (status) whereClause.status = status;
    if (year) {
      whereClause.startDate = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      };
    }

    const requests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { id: true, name: true, email: true, employeeCode: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// POST /api/hr/leave/requests - Create leave request
router.post('/leave/requests', async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, totalDays } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate || !totalDays) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (!['sick', 'casual', 'lop'].includes(leaveType)) {
      return res.status(400).json({ error: 'Invalid leave type' });
    }

    const request = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays: parseInt(totalDays)
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true, employeeCode: true }
        }
      }
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

// PATCH /api/hr/leave/requests/:id/approve - Approve/Reject leave request
router.patch('/leave/requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    if (!['Approved', 'Rejected', 'LOP'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (!approvedBy) {
      return res.status(400).json({ error: 'Approver ID is required' });
    }

    const request = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedBy
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true, employeeCode: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Audit logging for leave approval (non-blocking)
    if (status === 'Approved') {
      logLeaveApproved(approvedBy, id, {
        employeeId: request.employeeId,
        leaveType: request.leaveType,
        startDate: request.startDate,
        endDate: request.endDate,
        daysRequested: request.totalDays,
      }).catch(error => {
        console.error('Audit logging failed:', error);
        // Don't fail the request if audit logging fails
      });
    }

    res.json(request);
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ error: 'Failed to update leave request' });
  }
});

module.exports = router;
