const express = require('express')
const { prisma } = require('../prisma')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// Get all active users for dropdowns
router.get('/active-users', authenticate, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        email: true
      },
      orderBy: { name: 'asc' }
    })
    res.json(users)
  } catch (error) {
    console.error('Get active users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Get all issues with filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      status,
      assignedTo,
      roleLevel,
      search,
      page = 1,
      limit = 10
    } = req.query

    const where = {}
    
    if (status) where.status = status
    if (assignedTo) where.assignedTo = assignedTo
    if (roleLevel) where.roleLevel = roleLevel
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const issues = await prisma.issue.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    })

    const total = await prisma.issue.count({ where })

    // Transform assignee to assignedTo for frontend compatibility
    const transformedIssues = issues.map(issue => ({
      ...issue,
      assignedTo: issue.assignee
    })).map(issue => {
      delete issue.assignee
      return issue
    })

    res.json({
      issues: transformedIssues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Get issues error:', error)
    res.status(500).json({ error: 'Failed to fetch issues' })
  }
})

// Get single issue by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignee: { 
          select: { id: true, name: true, email: true } 
        },
        project: { select: { id: true, name: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' })
    }

    // Transform assignee to assignedTo for frontend compatibility
    const transformedIssue = {
      ...issue,
      assignedTo: issue.assignee
    }
    delete transformedIssue.assignee

    res.json(transformedIssue)
  } catch (error) {
    console.error('Get issue error:', error)
    res.status(500).json({ error: 'Failed to fetch issue' })
  }
})

// Create new issue
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      assignedTo, 
      projectId, 
      raisedDate, 
      expectedEndDate, 
      tags 
    } = req.body

    // Validation
    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project is required' })
    }
    
    if (!raisedDate) {
      return res.status(400).json({ error: 'Raised date is required' })
    }
    
    if (expectedEndDate && new Date(expectedEndDate) < new Date(raisedDate)) {
      return res.status(400).json({ error: 'Expected end date must be after raised date' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        reporterId: req.user.id,
        assignedTo: assignedTo || null,
        roleLevel: user.role,
        projectId: projectId,
        raisedDate: new Date(raisedDate),
        expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : null,
        tags: tags || null
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      }
    })

    // Transform assignee to assignedTo for frontend compatibility
    const transformedIssue = {
      ...issue,
      assignedTo: issue.assignee
    }
    delete transformedIssue.assignee

    // Create notification for assignee with reporter name
    if (assignedTo && assignedTo !== req.user.id) {
      await prisma.notification.create({
        data: {
          title: 'New Issue Assigned',
          message: `${user.name} assigned you an issue: ${title}`,
          type: 'ISSUE_ASSIGNED',
          userId: assignedTo,
          issueId: issue.id
        }
      })
    }

    res.status(201).json(transformedIssue)
  } catch (error) {
    console.error('Create issue error:', error)
    res.status(500).json({ error: 'Failed to create issue' })
  }
})

// Update issue
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      status, 
      assignedTo, 
      projectId, 
      expectedEndDate, 
      tags 
    } = req.body
    const issueId = req.params.id

    // Check permissions based on role
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    const issue = await prisma.issue.findUnique({
      where: { id: issueId }
    })

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' })
    }

    // Permission checks - ALL users can edit issues
    const canEdit = 
      issue.reporterId === req.user.id ||  // Can edit own issues
      issue.assignedTo === req.user.id ||  // Can edit assigned issues
      ['MANAGER', 'MANAGING_DIRECTOR'].includes(user.role)  // Managers/MD can edit any

    if (!canEdit) {
      return res.status(403).json({ error: 'You can only edit your own or assigned issues' })
    }

    // Only Manager or MD can close issues
    if (status === 'CLOSED' && !['MANAGER', 'MANAGING_DIRECTOR'].includes(user.role)) {
      return res.status(403).json({ error: 'Only Managers or MD can close issues' })
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        title,
        description,
        priority,
        status,
        assignedTo,
        projectId,
        expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : null,
        tags,
        updatedAt: new Date()
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      }
    })

    // Transform assignee to assignedTo for frontend compatibility
    const transformedIssue = {
      ...updatedIssue,
      assignedTo: updatedIssue.assignee
    }
    delete transformedIssue.assignee

    // Create notifications for assignment changes
    if (assignedTo && assignedTo !== issue.assignedTo) {
      await prisma.notification.create({
        data: {
          title: 'Issue Reassigned',
          message: `${user.name} reassigned you to issue: ${title}`,
          type: 'ISSUE_ASSIGNED',
          userId: assignedTo,
          issueId: issueId
        }
      })
    }

    // Create notifications for status changes (notify assigned user and reporter)
    if (status && status !== issue.status) {
      // Notify assigned user (if different from current user AND if they're assigned to this issue)
      if (assignedTo && assignedTo !== req.user.id && assignedTo === issue.assignedTo) {
        await prisma.notification.create({
          data: {
            title: 'Issue Status Updated',
            message: `Issue status updated to ${status}: ${title}`,
            type: 'INFO',
            userId: assignedTo,
            issueId: issueId
          }
        })
      }
      
      // Notify reporter (if different from current user)
      if (issue.reporterId !== req.user.id) {
        await prisma.notification.create({
          data: {
            title: 'Issue Status Updated',
            message: `Issue status updated to ${status}: ${title}`,
            type: 'INFO',
            userId: issue.reporterId,
            issueId: issueId
          }
        })
      }
    }

    res.json(transformedIssue)
  } catch (error) {
    console.error('Update issue error:', error)
    res.status(500).json({ error: 'Failed to update issue' })
  }
})

// Add comment to issue
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { message } = req.body
    const issueId = req.params.id

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const comment = await prisma.issueComment.create({
      data: {
        message,
        issueId,
        userId: req.user.id
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        issue: { select: { id: true, title: true, reporterId: true, assignedTo: true } }
      }
    })

    // Create notifications
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { reporterId: true, assignedTo: true }
    })

    if (issue) {
      // Notify reporter
      if (issue.reporterId !== req.user.id) {
        await prisma.notification.create({
          data: {
            title: 'New Comment on Issue',
            message: `A new comment was added to your issue`,
            type: 'INFO',
            userId: issue.reporterId
          }
        })
      }

      // Notify assignee
      if (issue.assignedTo && issue.assignedTo !== req.user.id && issue.assignedTo !== issue.reporterId) {
        await prisma.notification.create({
          data: {
            title: 'New Comment on Assigned Issue',
            message: `A new comment was added to an issue assigned to you`,
            type: 'INFO',
            userId: issue.assignedTo
          }
        })
      }
    }

    res.status(201).json(comment)
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

// Delete issue
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const issueId = req.params.id
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    const issue = await prisma.issue.findUnique({
      where: { id: issueId }
    })

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' })
    }

    // Permission check: Managers/MD can delete any issue, users can only delete their own
    const canDelete = 
      ['MANAGER', 'MANAGING_DIRECTOR'].includes(user.role) ||
      issue.reporterId === req.user.id

    if (!canDelete) {
      return res.status(403).json({ error: 'You can only delete your own issues' })
    }

    await prisma.issue.delete({
      where: { id: issueId }
    })

    res.json({ message: 'Issue deleted successfully' })
  } catch (error) {
    console.error('Delete issue error:', error)
    res.status(500).json({ error: 'Failed to delete issue' })
  }
})

// Get users for assignment dropdown
router.get('/assignable-users', authenticate, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' }
    })

    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

module.exports = router
