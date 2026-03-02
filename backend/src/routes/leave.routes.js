const express = require('express');
const { prisma } = require('../prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Middleware to validate JWT for all routes
router.use(authenticate);

// GET /api/leave/employee/:employeeId
// Get leave data for a specific employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { role, id: loggedInUserId } = req.user;
    const { employeeId } = req.params;

    let whereClause = { employeeId };

    // Role-based filtering
    if (role === "Employee") {
      // Employees can only see their own leave
      if (employeeId !== loggedInUserId) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (role === "Manager") {
      // Managers can see leave of their team members
      const employee = await prisma.user.findUnique({
        where: { id: employeeId, isActive: true },
        select: { reportingManagerId: true }
      });

      if (!employee || employee.reportingManagerId !== loggedInUserId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    // HR and MD can see all leave for the specified employee

    // Get current year leave data
    const currentYear = new Date().getFullYear();

    // Get leave balances (using proper HR structure)
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: currentYear
      }
    });

    // Get leave requests
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        startDate: {
          gte: new Date(currentYear, 0, 1)
        },
        endDate: {
          lte: new Date(currentYear, 11, 31)
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeCode: true
          }
        }
      }
    });

    // Demo data seeding if no records exist
    if ((leaveBalances.length === 0 || leaveRequests.length === 0) && role !== "Employee") {
      try {
        // Create demo leave balances with proper HR structure
        const demoLeaveBalances = [
          {
            employeeId,
            year: currentYear,
            sickTotal: 8,
            sickUsed: 2
          },
          {
            employeeId,
            year: currentYear,
            casualTotal: 8,
            casualUsed: 3
          },
          {
            employeeId,
            year: currentYear,
            lopUsed: 1
          }
        ];

        // Create demo leave requests as specified by user
        const demoLeaveRequests = [
          {
            employeeId,
            leaveType: 'sick',
            startDate: new Date('2026-01-12'),
            endDate: new Date('2026-01-13'),
            totalDays: 2,
            status: 'Approved',
            approvedBy: '7c129f8b-afac-499b-93b4-84678ae0df7d' // HR Manager ID
          },
          {
            employeeId,
            leaveType: 'casual',
            startDate: new Date('2026-02-05'),
            endDate: new Date('2026-02-07'),
            totalDays: 3,
            status: 'Approved',
            approvedBy: '7c129f8b-afac-499b-93b4-84678ae0df7d' // HR Manager ID
          },
          {
            employeeId,
            leaveType: 'sick',
            startDate: new Date('2026-02-25'),
            endDate: new Date('2026-02-25'),
            totalDays: 1,
            status: 'Pending',
            approvedBy: null
          }
        ];

        if (demoLeaveBalances.length > 0) {
          await prisma.leaveBalance.createMany({
            data: demoLeaveBalances,
            skipDuplicates: true
          });
        }

        if (demoLeaveRequests.length > 0) {
          await prisma.leaveRequest.createMany({
            data: demoLeaveRequests,
            skipDuplicates: true
          });
        }

        // Re-fetch the newly created records
        const newLeaveBalances = await prisma.leaveBalance.findMany({
          where: {
            employeeId,
            year: currentYear
          }
        });

        const newLeaveRequests = await prisma.leaveRequest.findMany({
          where: {
            employeeId,
            startDate: {
              gte: new Date(currentYear, 0, 1)
            },
            endDate: {
              lte: new Date(currentYear, 11, 31)
            }
          },
          orderBy: { createdAt: 'desc' },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
                employeeCode: true
              }
            }
          }
        });

        res.json({
          success: true,
          leaveBalances: newLeaveBalances,
          leaveRequests: newLeaveRequests
        });
        return;
      } catch (seedError) {
        console.error('Demo seeding error (non-critical):', seedError);
      }
    }

    res.json({
      success: true,
      leaveBalances,
      leaveRequests
    });

  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
