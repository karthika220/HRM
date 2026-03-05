const express = require('express');
const { prisma } = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { isSuperAdmin, isTeamLead } = require('../middleware/roles');
const { logTaskCreated } = require('../utils/auditLogger');
const { sendTaskNotificationEmail, sendDelayedTaskEmail } = require('../utils/emailService');
const { manualEscalation, getEscalationStats } = require('../services/escalationService');

const router = express.Router();

// GET /api/tasks - list all tasks (with filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId, status, priority, assigneeId, search, ownerId, assignerId, dueDate, overdue, unassigned, unscheduled, following, assignedViaPicklist } = req.query;
    const where = {};

    // Super Admin sees all tasks
    if (isSuperAdmin(req.user.role)) {
      // No filtering - see all tasks
    }
    // Team Lead sees tasks within their projects
    else if (isTeamLead(req.user.role)) {
      where.OR = [
        { creatorId: req.user.id },
        { assigneeId: req.user.id },
        { project: { members: { some: { userId: req.user.id } } } },
      ];
    }
    // Employee sees only their own tasks
    else {
      where.OR = [
        { creatorId: req.user.id },
        { assigneeId: req.user.id },
      ];
    }

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (ownerId) where.creatorId = ownerId;
    if (assignerId) where.creatorId = assignerId;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    // Handle special filters
    if (dueDate === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.dueDate = {
        gte: today,
        lt: tomorrow
      };
    }

    if (overdue === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.dueDate = {
        lt: today
      };
      where.status = {
        not: 'DONE'
      };
    }

    if (unassigned === 'true') {
      where.assigneeId = null;
    }

    if (unscheduled === 'true') {
      where.dueDate = null;
    }

    if (following === 'true') {
      // TODO: Implement following logic (tasks user is following)
      where.assigneeId = req.user.id;
    }

    if (assignedViaPicklist === 'true') {
      // TODO: Implement picklist assignment logic
      where.assigneeId = req.user.id;
    }

    if (req.user.role === 'EMPLOYEE') {
      where.assigneeId = req.user.id;
    }

    // Auto-update overdue tasks to DELAYED status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find tasks that should be marked as delayed (limited to first 3 for demo)
    const tasksToDelay = await prisma.task.findMany({
      where: {
        dueDate: {
          lt: today
        },
        status: {
          notIn: ['DONE', 'CANCELLED', 'DELAYED']
        },
        delayNotified: false
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      take: 3 // Limit to only 3 tasks for demo
    });

    // Update tasks to DELAYED status and send notifications
    for (const task of tasksToDelay) {
      const daysDelayed = Math.floor((today - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));

      // Update task status and mark as notified
      await prisma.task.update({
        where: { id: task.id },
        data: { 
          status: 'DELAYED',
          delayNotified: true
        }
      });

      // Create in-app notification for owner
      if (task.assignee) {
        await prisma.notification.create({
          data: {
            userId: task.assignee.id,
            title: 'Task Delayed',
            message: `Task ${task.title} is delayed by ${daysDelayed} days`,
            type: 'TASK_DELAYED',
          }
        });
      }

      // Create in-app notification for assigner
      if (task.creator && task.creator.id !== task.assignee?.id) {
        await prisma.notification.create({
          data: {
            userId: task.creator.id,
            title: 'Task Delayed',
            message: `Task ${task.title} assigned to ${task.assignee?.name || 'Unassigned'} is delayed by ${daysDelayed} days`,
            type: 'TASK_DELAYED',
          }
        });
      }

      // Send email notification for delayed task
      try {
        await sendDelayedTaskEmail({
          taskTitle: task.title,
          ownerName: task.assignee?.name || 'Unassigned',
          assignerName: task.creator?.name || 'Unknown',
          projectName: task.project?.name || 'No Project',
          dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set',
          daysDelayed: daysDelayed,
          taskId: task.id
        });
      } catch (emailError) {
        console.error('Failed to send delayed task email:', emailError);
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
        _count: { select: { comments: true, subtasks: true } },
      },
      orderBy: { order: 'asc' },
    });

    // Add owner field to each task (using assignee as owner)
    const tasksWithOwner = tasks.map(task => ({
      ...task,
      owner: task.assignee
    }));

    res.json(tasksWithOwner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', authenticate, async (req, res) => {
  if (!isSuperAdmin(req.user.role) && !isTeamLead(req.user.role)) {
    return res.status(403).json({ message: "Task access denied" });
  }
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
        subtasks: {
          include: {
            assignee: { select: { id: true, name: true } },
          },
        },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
        timesheets: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { date: 'desc' },
        },
      },
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks
router.post('/', authenticate, async (req, res) => {
  if (!isSuperAdmin(req.user.role) && !isTeamLead(req.user.role)) {
    return res.status(403).json({ message: "Task access denied" });
  }
  try {
    const { title, description, status, priority, startDate, dueDate, estimatedHours, projectId, assigneeId, parentId, tags, service, isAutomated, creatorId } = req.body;

    console.log("TASK BODY:", req.body);

    // Validate required fields
    if (!title || !status || !priority || !projectId || !creatorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(400).json({ error: "Project not found" });
    }

    // Validate creator exists
    const creator = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!creator) {
      return res.status(400).json({ error: "Creator not found" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        creatorId: req.user.id,
        service: service || null,
        isAutomated: isAutomated || false
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    // Audit logging (non-blocking)
    logTaskCreated(req.user.id, task.id, {
      title: task.title,
      projectId: task.projectId,
      assigneeId: assigneeId || null,
      priority: task.priority,
    }).catch(error => {
      console.error('Audit logging failed:', error);
      // Don't fail the request if audit logging fails
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("TASK CREATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', authenticate, async (req, res) => {
  if (!isSuperAdmin(req.user.role) && !isTeamLead(req.user.role)) {
    return res.status(403).json({ message: "Task access denied" });
  }
  try {
    const { title, description, status, priority, startDate, dueDate, estimatedHours, assigneeId, tags } = req.body;

    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title, description, status, priority, assigneeId,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        estimatedHours: estimatedHours !== undefined ? parseFloat(estimatedHours) : undefined,
        tags,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (status && status !== existing.status) {
      await prisma.activity.create({
        data: {
          action: 'UPDATED',
          entityType: 'TASK',
          entityId: task.id,
          description: `Task "${task.title}" status changed to ${status}`,
          projectId: task.projectId,
          userId: req.user.id,
        },
      });
    }

    // Create notification for new assignee if changed
    if (assigneeId && assigneeId !== existing.assigneeId && assigneeId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'Task Assignment Updated',
          message: `You have been assigned to task "${task.title}" in project "${task.project.name}".`,
          type: 'TASK_ASSIGNED',
        },
      });
    }

    // Send email notification for task update
    try {
      await sendTaskNotificationEmail({
        taskTitle: task.title,
        assignerName: req.user.name,
        ownerName: task.assignee?.name || 'Unassigned',
        action: 'Updated',
        taskId: task.id
      });
    } catch (emailError) {
      console.error('Failed to send task update email:', emailError);
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticate, async (req, res) => {
  if (!isSuperAdmin(req.user.role) && !isTeamLead(req.user.role)) {
    return res.status(403).json({ message: "Task access denied" });
  }
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Comments
router.get('/:id/comments', authenticate, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: req.params.id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Get task details to find project and task members for mention detection
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } }
      }
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await prisma.comment.create({
      data: { content, taskId: req.params.id, userId: req.user.id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // Detect mentions (@username) and create notifications
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);
    
    if (mentions) {
      const mentionedUsernames = mentions.map(mention => mention.substring(1)); // Remove @
      
      // Find users by username/email
      const mentionedUsers = await prisma.user.findMany({
        where: {
          OR: [
            { name: { in: mentionedUsernames } },
            { email: { in: mentionedUsernames.map(u => u.toLowerCase()) } }
          ]
        }
      });

      // Create notifications for mentioned users (excluding commenter)
      for (const mentionedUser of mentionedUsers) {
        if (mentionedUser.id !== req.user.id) {
          await prisma.notification.create({
            data: {
              userId: mentionedUser.id,
              title: 'You were mentioned',
              message: `${req.user.name} mentioned you in a comment: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
              type: 'MENTION',
            },
          });
        }
      }
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id/comments/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.commentId } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.userId !== req.user.id && !['MANAGING_DIRECTOR', 'HR_MANAGER'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await prisma.comment.delete({ where: { id: req.params.commentId } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks/:id/escalate - Manually escalate a task
router.post('/:id/escalate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user has permission to escalate
    if (!isSuperAdmin(req.user.role) && !isTeamLead(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Perform manual escalation
    const success = await manualEscalation(id);
    
    if (success) {
      res.json({ 
        message: 'Task escalated successfully',
        taskId: id
      });
    } else {
      res.status(400).json({ 
        message: 'Task escalation failed. Task may not be eligible for escalation.' 
      });
    }
  } catch (error) {
    console.error('Error escalating task:', error);
    res.status(500).json({ 
      message: 'Failed to escalate task',
      error: error.message 
    });
  }
});

// GET /api/tasks/escalation/stats - Get escalation statistics
router.get('/escalation/stats', authenticate, async (req, res) => {
  try {
    // Check if user has permission to view stats
    if (!isSuperAdmin(req.user.role) && !isTeamLead(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await getEscalationStats();
    
    res.json({
      message: 'Escalation statistics retrieved successfully',
      ...stats
    });
  } catch (error) {
    console.error('Error getting escalation stats:', error);
    res.status(500).json({ 
      message: 'Failed to get escalation statistics',
      error: error.message 
    });
  }
});

module.exports = router;
