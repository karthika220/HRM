const express = require('express');
const { prisma } = require('../prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Middleware to validate JWT for all routes
router.use(authenticate);

// POST /api/escalations
// Only HR, Manager, or MD can create escalations
router.post('/', async (req, res) => {
  try {
    const { role } = req.user;
    
    // Role validation
    if (!["HR", "Manager", "MD", "SUPER_ADMIN"].includes(role)) {
      return res.status(403).json({ message: "Only HR, Manager, MD, or Super Admin can create escalations" });
    }

    const { employeeId, type, severity, description } = req.body;

    // Validate required fields
    if (!employeeId || !type || !severity || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate severity
    if (!["Low", "Medium", "High", "Critical"].includes(severity)) {
      return res.status(400).json({ message: "Invalid severity. Must be Low, Medium, High, or Critical" });
    }

    // Check if employee exists
    const employee = await prisma.user.findUnique({
      where: { id: employeeId, isActive: true }
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Create escalation
    const escalation = await prisma.escalation.create({
      data: {
        employeeId,
        raisedBy: req.user.id,
        type,
        severity,
        description,
        status: "Open"
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeCode: true
          }
        },
        raiser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Escalation created successfully",
      escalation
    });

  } catch (error) {
    console.error('Create escalation error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/escalations/employee/:employeeId
// Role-based access control
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { role, id: loggedInUserId } = req.user;
    const { employeeId } = req.params;

    let whereClause = { employeeId };

    // Role-based filtering
    if (role === "Employee") {
      // Employees can only see their own escalations
      if (employeeId !== loggedInUserId) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (role === "Manager") {
      // Managers can see escalations of their team members
      const employee = await prisma.user.findUnique({
        where: { id: employeeId, isActive: true },
        select: { reportingManagerId: true }
      });

      if (!employee || employee.reportingManagerId !== loggedInUserId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    // HR and MD can see all escalations for the specified employee

    const escalations = await prisma.escalation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeCode: true,
            designation: true
          }
        },
        raiser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Safe demo seeding - only if no escalations exist for this employee
    if (escalations.length === 0 && role !== "Employee") {
      try {
        // Get valid users as raisers for demo data
        const hrManager = await prisma.user.findFirst({
          where: { role: "HR_MANAGER", isActive: true },
          select: { id: true, name: true }
        });

        const engManager = await prisma.user.findFirst({
          where: { role: "MANAGER", isActive: true },
          select: { id: true, name: true }
        });

        const hrUser = await prisma.user.findFirst({
          where: { role: "HR", isActive: true },
          select: { id: true, name: true }
        });

        if (hrManager || engManager || hrUser) {
          const demoEscalations = [
            {
              employeeId,
              raisedBy: hrManager?.id || hrUser?.id,
              type: "Warning",
              severity: "Medium",
              description: "Late submission of monthly performance report.",
              status: "Open",
              createdAt: new Date("2026-02-10T10:00:00Z")
            },
            {
              employeeId,
              raisedBy: engManager?.id || hrManager?.id,
              type: "Performance Issue",
              severity: "High",
              description: "Missed quarterly targets for two consecutive cycles.",
              status: "Closed",
              createdAt: new Date("2026-01-15T14:30:00Z")
            },
            {
              employeeId,
              raisedBy: hrUser?.id || hrManager?.id,
              type: "Policy Violation",
              severity: "Low",
              description: "Did not follow internal documentation guidelines.",
              status: "Open",
              createdAt: new Date("2026-02-18T09:15:00Z")
            }
          ];

          // Insert demo escalations
          await prisma.escalation.createMany({
            data: demoEscalations,
            skipDuplicates: true
          });

          // Fetch the newly created escalations
          const newEscalations = await prisma.escalation.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  employeeCode: true,
                  designation: true
                }
              },
              raiser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          });

          res.json({
            success: true,
            escalations: newEscalations
          });
          return;
        }
      } catch (seedError) {
        console.error('Demo seeding error (non-critical):', seedError);
        // Continue with empty results if seeding fails
      }
    }

    res.json({
      success: true,
      escalations
    });

  } catch (error) {
    console.error('Get escalations error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/escalations/:id
// Only HR, Manager, or MD can update escalations
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;
    const { type, severity, description } = req.body;

    // Role validation
    if (!["HR", "Manager", "MD", "SUPER_ADMIN"].includes(role)) {
      return res.status(403).json({ message: "Only HR, Manager, MD, or Super Admin can update escalations" });
    }

    // Check if escalation exists
    const escalation = await prisma.escalation.findUnique({
      where: { id }
    });

    if (!escalation) {
      return res.status(404).json({ message: "Escalation not found" });
    }

    // Validate severity
    if (severity && !["Low", "Medium", "High", "Critical"].includes(severity)) {
      return res.status(400).json({ message: "Invalid severity. Must be Low, Medium, High, or Critical" });
    }

    // Update escalation
    const updatedEscalation = await prisma.escalation.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(severity && { severity }),
        ...(description && { description })
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeCode: true
          }
        },
        raiser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: "Escalation updated successfully",
      escalation: updatedEscalation
    });

  } catch (error) {
    console.error('Update escalation error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /api/escalations/:id
// Only HR, Manager, or MD can delete escalations
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;

    // Role validation
    if (!["HR", "Manager", "MD", "SUPER_ADMIN"].includes(role)) {
      return res.status(403).json({ message: "Only HR, Manager, MD, or Super Admin can delete escalations" });
    }

    // Check if escalation exists
    const escalation = await prisma.escalation.findUnique({
      where: { id }
    });

    if (!escalation) {
      return res.status(404).json({ message: "Escalation not found" });
    }

    // Delete escalation
    await prisma.escalation.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Escalation deleted successfully"
    });

  } catch (error) {
    console.error('Delete escalation error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/escalations/:id/close
// Only HR or MD can close escalations
router.put('/:id/close', async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;

    // Role validation
    if (!["HR", "MD", "SUPER_ADMIN"].includes(role)) {
      return res.status(403).json({ message: "Only HR, MD, or Super Admin can close escalations" });
    }

    // Check if escalation exists and is open
    const escalation = await prisma.escalation.findUnique({
      where: { id }
    });

    if (!escalation) {
      return res.status(404).json({ message: "Escalation not found" });
    }

    if (escalation.status === "Closed") {
      return res.status(400).json({ message: "Escalation is already closed" });
    }

    // Close escalation
    const updatedEscalation = await prisma.escalation.update({
      where: { id },
      data: { status: "Closed" },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeCode: true
          }
        },
        raiser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: "Escalation closed successfully",
      escalation: updatedEscalation
    });

  } catch (error) {
    console.error('Close escalation error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
