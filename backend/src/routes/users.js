const express = require('express');
const bcrypt = require('bcryptjs');
const { prisma } = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/roles');

const router = express.Router();

// GET /api/v1/team
router.get('/team', authenticate, async (req, res) => {  // Restore authentication
  try {
    console.log('Team endpoint called by user:', req.user?.email, 'role:', req.user?.role)
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        // Add new employee fields
        employeeCode: true,
        designation: true,
        employmentType: true,
        joinDate: true,
        employmentStatus: true,
        reportingManagerId: true,
        _count: {
          select: {
            assignedTasks: {
              where: {
                status: {
                  in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW']
                }
              }
            }
          }
        }
      },
      orderBy: { role: 'asc' }
    });

    console.log(`Found ${users.length} users in team endpoint`)

    // Transform data to match frontend expectations
    const teamData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || 'Unassigned',
      activeTaskCount: user._count.assignedTasks
    }));

    console.log('Team data being sent:', teamData)
    res.json(teamData);
  } catch (err) {
    console.error('Team endpoint error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/team/:id/direct-reports
router.get('/team/:id/direct-reports', authenticate, async (req, res) => {  // Restore authentication
  const { id } = req.params;
  const currentUser = req.user;

  console.log('Direct reports called for ID:', id, 'by user:', currentUser?.email, 'role:', currentUser?.role)

  // Role-based access control
  if (!['MANAGING_DIRECTOR', 'MANAGER', 'TEAM_LEAD'].includes(currentUser.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    // Get direct reports of the specified user
    const directReports = await prisma.user.findMany({
      where: {
        managerId: id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        managerId: true,
        _count: {
          select: {
            assignedTasks: {
              where: {
                status: {
                  in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW']
                }
              }
            },
            directReports: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: { role: 'asc' }
    });

    console.log(`Found ${directReports.length} direct reports for user ${id}`)
    console.log('Direct reports:', directReports)

    // Transform data to match frontend expectations
    const reportsData = directReports.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || 'Unassigned',
      activeTaskCount: user._count.assignedTasks,
      hasDirectReports: user._count.directReports > 0,
      managerId: user.managerId
    }));

    console.log('Sending reports data:', reportsData)
    res.json(reportsData);
  } catch (err) {
    console.error('Direct reports endpoint error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/team/:id/members
router.get('/team/:id/members', authenticate, async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  // Role-based access control
  if (!['MANaging_DIRECTOR', 'MANAGER', 'TEAM_LEAD'].includes(currentUser.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Team Leads can only view their own members
  if (currentUser.role === 'TEAM_LEAD' && currentUser.id !== id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    // Find projects owned by this Team Lead
    const projects = await prisma.project.findMany({
      where: {
        ownerId: id,
        status: {
          in: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD']
        }
      },
      select: {
        id: true
      }
    });

    if (projects.length === 0) {
      return res.json([]);
    }

    // Find all unique users assigned to tasks in these projects
    const members = await prisma.user.findMany({
      where: {
        isActive: true,
        assignedTasks: {
          some: {
            projectId: {
              in: projects.map(p => p.id)
            },
            status: {
              in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW']
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        role: true,
        department: true,
        _count: {
          select: {
            assignedTasks: {
              where: {
                projectId: {
                  in: projects.map(p => p.id)
                },
                status: {
                  in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW']
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform data
    const membersData = members.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department || 'Unassigned',
      activeTaskCount: member._count.assignedTasks
    }));

    res.json(membersData);
  } catch (err) {
    console.error('Team members endpoint error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users
router.get('/', authenticate, async (req, res) => {
  // Only Super Admins and Team Leads can view users
  if (!["SUPER_ADMIN", "MANAGING_DIRECTOR","MANAGER","TEAM_LEAD"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, name: true, role: true,
        department: true, isActive: true, createdAt: true, avatar: true,
        // Add new employee fields
        employeeCode: true,
        designation: true,
        employmentType: true,
        joinDate: true,
        employmentStatus: true,
        reportingManagerId: true,
        _count: { select: { assignedTasks: true, ownedProjects: true } }
      },
      orderBy: { name: 'asc' },
    });
    console.log(`Users endpoint called by ${req.user.role}, returning ${users.length} users`);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, name: true, role: true,
        department: true, isActive: true, createdAt: true, avatar: true,
        assignedTasks: { take: 10, orderBy: { createdAt: 'desc' }, include: { project: { select: { name: true } } } },
        _count: { select: { assignedTasks: true, ownedProjects: true } }
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users (create user - Super Admin only)
router.post('/', authenticate, async (req, res) => {
  if (!isSuperAdmin(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const { 
      email, 
      password, 
      name, 
      role, 
      department,
      employeeCode,
      designation,
      employmentType,
      joinDate,
      employmentStatus,
      reportingManagerId
    } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    // Check if employeeCode is unique if provided
    if (employeeCode) {
      const existingCode = await prisma.user.findUnique({ where: { employeeCode } });
      if (existingCode) return res.status(409).json({ message: 'Employee code already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name, 
        role: role || 'EMPLOYEE', 
        department,
        employeeCode,
        designation,
        employmentType,
        joinDate: joinDate ? new Date(joinDate) : null,
        employmentStatus: employmentStatus || 'Active',
        reportingManagerId
      },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        department: true, 
        isActive: true, 
        createdAt: true,
        employeeCode: true,
        designation: true,
        employmentType: true,
        joinDate: true,
        employmentStatus: true,
        reportingManagerId: true
      },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const canEdit = req.user.role === 'MANAGING_DIRECTOR' || req.user.role === 'HR_MANAGER' || req.user.role === 'TEAM_LEAD' || req.user.id === req.params.id;
    if (!canEdit) return res.status(403).json({ message: 'Access denied' });

    const { 
      name, 
      department, 
      role, 
      isActive, 
      password,
      employeeCode,
      designation,
      employmentType,
      joinDate,
      employmentStatus,
      reportingManagerId
    } = req.body;
    
    const data = {};
    if (name) data.name = name;
    if (department !== undefined) data.department = department;
    if (role && isSuperAdmin(req.user.role)) data.role = role;
    if (isActive !== undefined && isSuperAdmin(req.user.role)) data.isActive = isActive;
    if (password) data.password = await bcrypt.hash(password, 10);
    
    // Employee fields (only HR/MD can update these)
    if (['MANAGING_DIRECTOR', 'HR_MANAGER', 'SUPER_ADMIN'].includes(req.user.role)) {
      if (employeeCode !== undefined) data.employeeCode = employeeCode;
      if (designation !== undefined) data.designation = designation;
      if (employmentType !== undefined) data.employmentType = employmentType;
      if (joinDate !== undefined) data.joinDate = joinDate ? new Date(joinDate) : null;
      if (employmentStatus !== undefined) data.employmentStatus = employmentStatus;
      if (reportingManagerId !== undefined) data.reportingManagerId = reportingManagerId;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        department: true, 
        isActive: true, 
        updatedAt: true,
        employeeCode: true,
        designation: true,
        employmentType: true,
        joinDate: true,
        employmentStatus: true,
        reportingManagerId: true
      },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, authorize('MANAGING_DIRECTOR'), async (req, res) => {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
