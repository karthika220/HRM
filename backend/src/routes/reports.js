const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/roles');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports
router.get('/', authenticate, async (req, res) => {
  if (!isSuperAdmin(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const reports = await prisma.report.findMany({
      include: {
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reports
router.post('/', authenticate, authorize('MANAGING_DIRECTOR', 'HR_MANAGER'), async (req, res) => {
  console.log('POST /api/reports - Request body:', req.body);
  console.log('POST /api/reports - User:', req.user);
  
  try {
    const { title, type, projectId } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Report title is required' });
    }
    
    if (!type) {
      return res.status(400).json({ error: 'Report type is required' });
    }
    
    if (!['PROJECT_SUMMARY', 'TASK_SUMMARY', 'TIMESHEET'].includes(type)) {
      return res.status(400).json({ error: 'Invalid report type' });
    }
    
    let data = {};
    
    if (type === 'PROJECT_SUMMARY') {
      console.log('Generating PROJECT_SUMMARY report...');
      const projects = await prisma.project.findMany({
        include: { _count: { select: { tasks: true, members: true } } },
      });
      data = { projects: projects.map(p => ({ id: p.id, name: p.name, status: p.status, taskCount: p._count.tasks, memberCount: p._count.members })) };
      console.log('PROJECT_SUMMARY data generated:', data);
    } else if (type === 'TASK_SUMMARY') {
      console.log('Generating TASK_SUMMARY report...');
      const tasks = await prisma.task.groupBy({
        by: ['status'],
        _count: { id: true },
      });
      data = { tasksByStatus: tasks };
      console.log('TASK_SUMMARY data generated:', data);
    } else if (type === 'TIMESHEET') {
      console.log('Generating TIMESHEET report...');
      const timesheets = await prisma.timesheet.aggregate({
        _sum: { hours: true },
        _count: { id: true },
      });
      data = { totalHours: timesheets._sum.hours, totalEntries: timesheets._count.id };
      console.log('TIMESHEET data generated:', data);
    }

    const reportData = {
      title: title.trim(),
      type,
      data: JSON.stringify(data),
      projectId: projectId || null,
      createdById: req.user.id
    };
    
    console.log('Creating report with data:', reportData);
    
    const report = await prisma.report.create({
      data: reportData,
      include: { createdBy: { select: { id: true, name: true } } },
    });
    
    console.log('Report created successfully:', report);
    
    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error('Error in POST /api/reports:', err);
    console.error('Error stack:', err.stack);
    
    // Handle specific database errors
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Database constraint violation' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', authenticate, authorize('MANAGING_DIRECTOR', 'HR_MANAGER'), async (req, res) => {
  try {
    await prisma.report.delete({ where: { id: req.params.id } });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/task-status
router.get('/task-status', async (req, res) => {
  try {
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    
    const result = tasksByStatus.map(group => ({
      status: group.status,
      count: group._count.id
    }));
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/project-status
router.get('/project-status', async (req, res) => {
  try {
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    
    const result = projectsByStatus.map(group => ({
      status: group.status,
      count: group._count.id
    }));
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/project/:id
router.get('/project/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true }
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const [totalTasks, completedTasks, overdueTasks, tasksByStatus] = await Promise.all([
      prisma.task.count({ where: { projectId } }),
      prisma.task.count({ where: { projectId, status: 'DONE' } }),
      prisma.task.count({
        where: { 
          projectId, 
          dueDate: { lt: new Date() }, 
          status: { not: 'DONE' } 
        }
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { projectId },
        _count: { id: true },
      })
    ]);
    
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const tasksByStatusFormatted = tasksByStatus.map(group => ({
      status: group.status,
      count: group._count.id
    }));
    
    res.json({
      projectName: project.name,
      totalTasks,
      completedTasks,
      overdueTasks,
      progressPercent,
      tasksByStatus: tasksByStatusFormatted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/advanced-summary
router.get('/advanced-summary', authenticate, async (req, res) => {
  if (!isSuperAdmin(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  
  try {
    // Execute all queries in parallel for better performance
    const [
      projectsByStatus,
      taskStats,
      teamPerformance,
      attendanceSummary
    ] = await Promise.all([
      // Total projects by status
      prisma.project.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) // Last 6 months
          }
        }
      }),
      
      // Task completion percentage
      prisma.task.aggregate({
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 3)) // Last 3 months
          }
        }
      }),
      
      // Task completion stats
      prisma.task.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
          }
        }
      }),
      
      // Team performance metrics
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          _count: {
            select: {
              tasksCreated: {
                where: {
                  createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
                  }
                }
              },
              tasksAssigned: {
                where: {
                  assigneeId: { not: null },
                  createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
                  }
                }
              }
            }
          }
        },
        where: {
          isActive: true,
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        },
        take: 50 // Limit to top 50 performers
      }),
      
      // Attendance summary (mock data for now, as attendance schema may vary)
      (async () => {
        try {
          // Try to get attendance data if the schema exists
          const attendanceRecords = await prisma.attendanceLog.findMany({
            where: {
              date: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
              }
            },
            select: {
              date: true,
              status: true,
              userId: true
            }
          });
          
          // Calculate attendance summary
          const totalDays = attendanceRecords.length;
          const presentDays = attendanceRecords.filter(record => record.status === 'PRESENT').length;
          const lateDays = attendanceRecords.filter(record => record.status === 'LATE').length;
          const absentDays = attendanceRecords.filter(record => record.status === 'ABSENT').length;
          
          return {
            totalRecords: totalDays,
            presentPercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
            latePercentage: totalDays > 0 ? Math.round((lateDays / totalDays) * 100) : 0,
            absentPercentage: totalDays > 0 ? Math.round((absentDays / totalDays) * 100) : 0,
            summary: {
              present: presentDays,
              late: lateDays,
              absent: absentDays
            }
          };
        } catch (error) {
          // Return mock data if attendance schema doesn't exist
          return {
            totalRecords: 1000,
            presentPercentage: 85,
            latePercentage: 10,
            absentPercentage: 5,
            summary: {
              present: 850,
              late: 100,
              absent: 50
            },
            note: 'Mock data - attendance schema not available'
          };
        }
      })()
    ]);
    
    // Process projects by status
    const projectsByStatusFormatted = projectsByStatus.map(group => ({
      status: group.status,
      count: group._count.id
    }));
    
    // Calculate task completion percentage
    const completedTasks = taskStats._count.id;
    const taskStatusCounts = taskStats._count.id;
    const completedTaskCount = taskStats.find(stat => stat.status === 'DONE')?._count.id || 0;
    const completionPercentage = taskStatusCounts > 0 ? Math.round((completedTaskCount / taskStatusCounts) * 100) : 0;
    
    // Process team performance metrics
    const teamPerformanceFormatted = teamPerformance.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      tasksCreated: member._count.tasksCreated,
      tasksAssigned: member._count.tasksAssigned,
      productivity: member._count.tasksAssigned > 0 
        ? Math.round((member._count.tasksCreated / member._count.tasksAssigned) * 100)
        : 0
    })).sort((a, b) => b.productivity - a.productivity); // Sort by productivity
    
    // Format the final response
    const advancedSummary = {
      timestamp: new Date().toISOString(),
      period: {
        projects: 'Last 6 months',
        tasks: 'Last 3 months',
        attendance: 'Last 30 days'
      },
      projects: {
        total: projectsByStatusFormatted.reduce((sum, item) => sum + item.count, 0),
        byStatus: projectsByStatusFormatted
      },
      tasks: {
        total: taskStats._count.id,
        completionPercentage,
        byStatus: taskStats.map(stat => ({
          status: stat.status,
          count: stat._count.id,
          percentage: taskStats._count.id > 0 ? Math.round((stat._count.id / taskStats._count.id) * 100) : 0
        }))
      },
      team: {
        totalMembers: teamPerformance.length,
        topPerformers: teamPerformanceFormatted.slice(0, 10), // Top 10 performers
        averageProductivity: teamPerformanceFormatted.length > 0
          ? Math.round(teamPerformanceFormatted.reduce((sum, member) => sum + member.productivity, 0) / teamPerformanceFormatted.length)
          : 0
      },
      attendance: attendanceSummary
    };
    
    res.json(advancedSummary);
    
  } catch (error) {
    console.error('Error generating advanced summary:', error);
    res.status(500).json({ 
      message: 'Failed to generate advanced summary',
      error: error.message 
    });
  }
});

module.exports = router;
