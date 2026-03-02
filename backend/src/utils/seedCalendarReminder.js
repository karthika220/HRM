const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create a demo calendar reminder notification
async function createDemoCalendarReminder() {
  try {
    console.log('Creating demo calendar reminder notification...');
    
    // Get the first user for demo
    const user = await prisma.user.findFirst({
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      console.log('No users found. Please create a user first.');
      return;
    }

    console.log(`Creating demo notification for user: ${user.name}`);

    // Create a demo calendar reminder notification
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Event Reminder',
        message: 'Your event "Team Standup Meeting" is starting at 2:30 PM.',
        type: 'CALENDAR_REMINDER',
      }
    });

    console.log('✅ Demo calendar reminder notification created successfully!');
    console.log(`Notification ID: ${notification.id}`);
    console.log(`User: ${user.name}`);
    console.log(`Message: ${notification.message}`);
    console.log(`Created at: ${notification.createdAt}`);

    // Also create a sample calendar event with reminder
    const eventStartTime = new Date();
    eventStartTime.setHours(14, 30, 0, 0); // 2:30 PM today
    
    const reminderTime = new Date(eventStartTime.getTime() - 15 * 60 * 1000); // 15 minutes before

    const calendarEvent = await prisma.calendarEvent.create({
      data: {
        title: 'Team Standup Meeting',
        description: 'Daily team sync to discuss project progress',
        startTime: eventStartTime,
        reminderAt: reminderTime,
        userId: user.id,
      }
    });

    console.log('\n✅ Demo calendar event created successfully!');
    console.log(`Event: ${calendarEvent.title}`);
    console.log(`Start Time: ${calendarEvent.startTime.toLocaleString()}`);
    console.log(`Reminder At: ${calendarEvent.reminderAt.toLocaleString()}`);

  } catch (error) {
    console.error('Error creating demo calendar reminder:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the demo
createDemoCalendarReminder();
