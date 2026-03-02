const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Check for calendar event reminders and create notifications
async function checkCalendarReminders() {
  try {
    console.log('Checking for calendar event reminders...');
    
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    // Find events with reminders in the next 5 minutes
    const upcomingEvents = await prisma.calendarEvent.findMany({
      where: {
        reminderAt: {
          gte: now,
          lte: fiveMinutesFromNow
        },
        // Only get events that haven't had reminders sent recently
        OR: [
          { reminderSentAt: null },
          { 
            reminderSentAt: {
              lt: new Date(now.getTime() - 60 * 60 * 1000) // More than 1 hour ago
            }
          }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log(`Found ${upcomingEvents.length} events with upcoming reminders`);

    for (const event of upcomingEvents) {
      if (event.user) {
        // Format event time for display
        const eventTime = new Date(event.startTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        // Create notification for the event owner
        await prisma.notification.create({
          data: {
            userId: event.userId, // Use event.userId - ensures notification goes to event creator
            title: 'Event Reminder',
            message: `Your event "${event.title}" is starting at ${eventTime}.`,
            type: 'CALENDAR_REMINDER',
          }
        });
        
        // Mark reminder as sent
        await prisma.calendarEvent.update({
          where: { id: event.id },
          data: { reminderSentAt: now }
        });
        
        console.log(`Created calendar reminder for ${event.user.name}: "${event.title}" at ${eventTime}`);
      }
    }
  } catch (error) {
    console.error('Error checking calendar reminders:', error);
  }
}

// Run the job
checkCalendarReminders()
  .then(() => {
    console.log('Calendar reminder check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Calendar reminder check failed:', error);
    process.exit(1);
  });
