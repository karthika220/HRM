const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/calendar - Root calendar endpoint
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let whereClause = {
      userId: userId
    };

    // Add date range filter if provided
    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) {
        whereClause.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.startTime.lte = new Date(endDate);
      }
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: {
        startTime: 'asc'
      }
    });

    res.json({
      message: "Calendar API is working",
      events: events,
      endpoints: [
        "GET /api/calendar - Get all events",
        "GET /api/calendar/events - Get user's calendar events", 
        "POST /api/calendar/events - Create new calendar event",
        "PUT /api/calendar/events/:id - Update calendar event",
        "DELETE /api/calendar/events/:id - Delete calendar event",
        "GET /api/calendar/tasks - Get user's tasks for calendar",
        "GET /api/calendar/issues - Get user's issues for calendar"
      ]
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
});

// GET /api/calendar/events - Get user's calendar events
router.get('/events', async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let whereClause = {
      userId: userId
    };

    // Add date range filter if provided
    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) {
        whereClause.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.startTime.lte = new Date(endDate);
      }
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: {
        startTime: 'asc'
      }
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// POST /api/calendar/events - Create new calendar event
router.post('/events', async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, startTime } = req.body;

    // Validate required fields
    if (!title || !startTime) {
      return res.status(400).json({ error: 'Title and start time are required' });
    }

    // Simple event creation
    const event = await prisma.calendarEvent.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        startTime: new Date(startTime),
        userId
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// PUT /api/calendar/events/:id - Update calendar event
router.put('/events/:id', async (req, res) => {
  try {
    // Validate req.user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;
    const eventId = req.params.id;
    const {
      title,
      description,
      startTime,
      endTime,
      reminderAt,
      linkedTaskId,
      linkedIssueId
    } = req.body;

    // Parse datetime properly - do NOT accept raw "HH:mm" strings
    const parsedStartTime = new Date(startTime);
    if (isNaN(parsedStartTime.getTime())) {
      return res.status(400).json({ message: "Invalid startTime format" });
    }

    // Safely handle optional fields
    const updateData = {
      title: title || undefined,
      description: description || undefined,
      startTime: parsedStartTime,
      endTime: endTime ? new Date(endTime) : null,
      reminderAt: reminderAt ? new Date(reminderAt) : null,
      linkedTaskId: linkedTaskId || null,
      linkedIssueId: linkedIssueId || null
    };

    // If reminderAt is being updated, reset reminderSentAt so notification can be sent again
    if (reminderAt) {
      updateData.reminderSentAt = null;
    }

    // Use BOTH id + userId in update where clause
    const event = await prisma.calendarEvent.update({
      where: {
        id: eventId,
        userId: userId
      },
      data: updateData
    });

    res.json(event);
  } catch (err) {
    console.error("Calendar update error:", err);
    
    // Return 404 if event not found instead of crashing
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "Event not found" });
    }
    
    return res.status(500).json({ message: "Failed to update calendar event" });
  }
});

// DELETE /api/calendar/events/:id - Delete calendar event
router.delete('/events/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: eventId,
        userId: userId
      }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found or access denied' });
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

// GET /api/calendar/tasks - Get user's tasks for calendar linking
router.get('/tasks', async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: userId },
          { creatorId: userId }
        ],
        status: {
          not: 'COMPLETED'
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for calendar:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/calendar/issues - Get user's issues for calendar linking
router.get('/issues', async (req, res) => {
  try {
    const userId = req.user.id;

    const issues = await prisma.issue.findMany({
      where: {
        OR: [
          { reporterId: userId },
          { assignedTo: userId }
        ]
      },
      select: {
        id: true,
        title: true,
        priority: true,
        status: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues for calendar:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

module.exports = router;
