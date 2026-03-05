const express = require('express');
const { prisma } = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { isSuperAdmin, isTeamLead } = require('../middleware/roles');
const { SERVICE_WORKFLOWS } = require('../utils/serviceWorkflows');
const dataStore = require('../controllers/dataStore');
const { logProjectCreated } = require('../utils/auditLogger');

const router = express.Router();

// Helper function to create automated tasks for services
async function createAutomatedTasksForServices(services, projectId, creatorId) {
  console.log("🔧 Creating automated tasks for services:", services);
  console.log("🔧 Project ID:", projectId);
  console.log("🔧 Creator ID:", creatorId);
  
  if (!services || !Array.isArray(services)) {
    console.log("❌ No services or not an array");
    return [];
  }

  const createdTasks = [];
  
  for (const serviceName of services) {
    console.log(`🔍 Looking for tasks for service: "${serviceName}"`);
    
    // Get service workflow from new structure
    const serviceWorkflow = SERVICE_WORKFLOWS[serviceName];
    
    if (!serviceWorkflow) {
      console.log(`❌ No workflow found for service: "${serviceName}"`);
      console.log(`🔍 Available services:`, Object.keys(SERVICE_WORKFLOWS));
      continue;
    }

    console.log(`✅ Found ${serviceWorkflow.tasks.length} tasks for service: "${serviceName}"`);
    
    // Check if tasks for this service already exist
    const existingTasks = await prisma.task.findMany({
      where: {
        projectId,
        service: serviceName,
        isAutomated: true
      }
    });
    
    console.log(`🔍 Existing automated tasks for "${serviceName}": ${existingTasks.length}`);
    
    // Only create tasks if they don't already exist for this service
    if (existingTasks.length === 0) {
      for (const [index, task] of serviceWorkflow.tasks.entries()) {
        try {
          console.log(`🔨 Creating task: "${task.title}" with order: ${index}`);
          
          const createdTask = await prisma.task.create({
            data: {
              title: task.title,
              description: task.description || `Automated task for ${serviceName} service`,
              status: "TODO",
              priority: task.priority || "MEDIUM",
              order: index,
              projectId,
              creatorId,
              service: serviceName,
              isAutomated: true
            }
          });
          
          createdTasks.push(createdTask);
          console.log(`✅ Created task: ${createdTask.id}`);
        } catch (error) {
          console.error(`❌ Error creating task "${task.title}":`, error);
          // Continue with other tasks even if one fails
        }
      }
    } else {
      console.log(`⚠️ Automated tasks already exist for service: "${serviceName}"`);
    }
  }
  
  console.log(`🎉 Total tasks created: ${createdTasks.length}`);
  return createdTasks;
}

// GET /api/projects
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, search, ownerId } = req.query;
    let whereClause = {};

    // Validate ownerId if provided
    if (ownerId && ownerId !== '') {
      console.log("OWNER FILTER RECEIVED:", ownerId);
      // Check if ownerId is valid (exists in users table)
      const ownerExists = await prisma.user.findUnique({
        where: { id: ownerId },
        select: { id: true }
      });
      
      if (!ownerExists) {
        console.log("OWNER NOT FOUND:", ownerId);
        return res.status(400).json({ message: "Invalid owner ID" });
      }
      
      console.log("OWNER FOUND, applying filter");
      // Build owner filter condition
      whereClause = {
        OR: [
          { ownerId: ownerId },
          {
           members: {
          some: { userId: ownerId }
            }
          }
        ]
      };
    } else {
      console.log("NO OWNER FILTER, applying role-based filtering");
      // Apply role-based filtering when no owner filter
      // Super Admin sees all projects
      if (isSuperAdmin(req.user.role)) {
        // No filtering - see all projects
      }
      // Team Lead sees only assigned projects
      else if (isTeamLead(req.user.role)) {
        whereClause = {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ]
        };
      }
      // Employee sees only projects they're members of or own
      else {
        whereClause = {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ]
        };
      }
    }

    // Apply additional filters
    if (status) whereClause.status = status;
    if (search) whereClause.name = { contains: search, mode: 'insensitive' };

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        tasks: {
          select: { 
            id: true, 
            status: true 
          }
        },
        _count: { select: { tasks: true, milestones: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate progress for each project
    const projectsWithProgress = projects.map(project => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(task => task.status === 'DONE').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Remove tasks from response to avoid sending unnecessary data
      const { tasks, ...projectWithoutTasks } = project;
      
      return {
        ...projectWithoutTasks,
  progress,
  tags: project.tags ? JSON.parse(project.tags) : [],
   services: project.services ? JSON.parse(project.services) : []
};
    });

    // DEBUG: Log actual response structure
    console.log("=== BACKEND PROJECTS RESPONSE DEBUG ===");
    console.log("Raw projects count:", projects.length);
    console.log("ProjectsWithProgress count:", projectsWithProgress.length);
    console.log("Type of projectsWithProgress:", typeof projectsWithProgress);
    console.log("Is projectsWithProgress an array?", Array.isArray(projectsWithProgress));
    console.log("First project structure:", projectsWithProgress[0]);
    console.log("Response type: Direct array (not wrapped in success object)");
    console.log("==========================================");

    res.json(projectsWithProgress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } },
        },
        milestones: { orderBy: { targetDate: 'asc' } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            creator: { select: { id: true, name: true } },
            _count: { select: { comments: true, subtasks: true } },
          },
          orderBy: { order: 'asc' },
        },
        _count: { select: { tasks: true, members: true } },
      },
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Calculate progress for the project
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'DONE').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Add progress to project object
    const projectWithProgress = {
      ...project,
      progress,
      tags: project.tags ? JSON.parse(project.tags) : [],
      services: project.services ? (typeof project.services === 'string' ? JSON.parse(project.services) : project.services) : []
    };

    res.json(projectWithProgress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects
router.post('/', authenticate, async (req, res) => {
  if (!isSuperAdmin(req.user.role)) {
    return res.status(403).json({ message: "Project access denied" });
  }
  try {
    console.log("Incoming Project Data:", req.body);
    const { name, description, status, startDate, endDate, budget, color, tags, services, memberIds } = req.body;

   const projectData = {
  name,
  description,
  status: status || 'PLANNING',
  startDate: new Date(startDate),
  endDate: new Date(endDate),
  budget: budget ? parseFloat(budget) : null,
  color: color || '#00A1C7',
  tags: tags ? JSON.stringify(tags) : null,
  services: Array.isArray(services) ? JSON.stringify(services) : services || null,
  ownerId: req.user.id,
}

// Only add members if they actually exist
if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
  projectData.members = {
    create: memberIds.map(userId => ({
      userId,
      roleInProject: 'CONTRIBUTOR'
    }))
  }
}

    const project = await prisma.project.create({
      data: projectData,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true } } } }
      }
    });

    // Create automated tasks for services
    if (services && Array.isArray(services)) {
      console.log("🚀 Services found in request:", services);
      console.log("🚀 Services type:", typeof services);
      console.log("🚀 Services is array:", Array.isArray(services));
      try {
        const servicesArray = Array.isArray(services) ? services : JSON.parse(services || '[]');
        console.log("🚀 Final services array:", servicesArray);
        await createAutomatedTasksForServices(servicesArray, project.id, req.user.id);
      } catch (taskError) {
        console.error('Error creating automated tasks:', taskError);
        // Don't fail project creation if automated task creation fails
      }
    } else {
      console.log("❌ No services found or not array");
      console.log("❌ Services value:", services);
      console.log("❌ Services type:", typeof services);
    }

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'CREATED',
        entityType: 'PROJECT',
        entityId: project.id,
        description: `Project "${name}" was created`,
        projectId: project.id,
        userId: req.user.id,
      },
    });

    // Audit logging (non-blocking)
    logProjectCreated(req.user.id, project.id, {
      name: project.name,
      status: project.status,
      budget: project.budget,
    }).catch(error => {
      console.error('Audit logging failed:', error);
      // Don't fail the request if audit logging fails
    });

    // Update centralized data cache
    await dataStore.updateCache('projects');
    await dataStore.updateCache('tasks');

    res.status(201).json(project);
  } catch (err) {
    console.error(" FULL PRISMA ERROR:", err);
    res.status(500).json({
      message: err.message,
      stack: err.stack
    });
  }
});

// PUT /api/projects/:id
router.put('/:id', authenticate, async (req, res) => {
  if (!isSuperAdmin(req.user.role)) {
    return res.status(403).json({ message: "Project access denied" });
  }
  try {
    const { name, description, status, startDate, endDate, budget, color, tags, services } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name, description, status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        budget: budget !== undefined ? parseFloat(budget) : undefined,
        color,
        tags: tags ? JSON.stringify(tags) : undefined,
        services: services ? JSON.stringify(services) : undefined,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    // Create automated tasks for newly added services
    if (services && Array.isArray(services)) {
      try {
        // Get existing services before update
        const existingProject = await prisma.project.findUnique({
          where: { id: req.params.id },
          select: { services: true }
        });

        const existingServices = existingProject.services ?
          (typeof existingProject.services === 'string' ? JSON.parse(existingProject.services) : existingProject.services) : [];

        // Find newly added services
        const newServices = services.filter(service => !existingServices.includes(service));

        if (newServices.length > 0) {
          await createAutomatedTasksForServices(newServices, req.params.id, req.user.id);
        }
      } catch (taskError) {
        console.error('Error creating automated tasks for new services:', taskError);
        // Don't fail project update if automated task creation fails
      }
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', authenticate, async (req, res) => {
  if (!isSuperAdmin(req.user.role)) {
    return res.status(403).json({ message: "Project access denied" });
  }
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/members
router.post('/:id/members', authenticate, async (req, res) => {
  try {
    const { userId, roleInProject } = req.body;
    const member = await prisma.projectMember.create({
      data: { projectId: req.params.id, userId, roleInProject: roleInProject || 'CONTRIBUTOR' },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', authenticate, async (req, res) => {
  try {
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } },
    });
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:id/activities
router.get('/:id/activities', authenticate, async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { projectId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Milestones
router.get('/:id/milestones', authenticate, async (req, res) => {
  try {
    const milestones = await prisma.milestone.findMany({
      where: { projectId: req.params.id },
      orderBy: { targetDate: 'asc' },
    });
    res.json(milestones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/milestones', authenticate, async (req, res) => {
  try {
    const { name, targetDate } = req.body;
    const milestone = await prisma.milestone.create({
      data: { name, targetDate: new Date(targetDate), projectId: req.params.id },
    });
    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/milestones/:milestoneId', authenticate, async (req, res) => {
  try {
    const { isCompleted } = req.body;
    const milestone = await prisma.milestone.update({
      where: { id: req.params.milestoneId },
      data: { isCompleted }
    });
    res.json(milestone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
