// Simple demo notification creator
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDemo() {
  try {
    console.log('Creating demo calendar reminder...');
    
    // Get a calendar event with its user
    const event = await prisma.calendarEvent.findFirst({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!event) {
      console.log('❌ No calendar events found. Creating one first...');
      
      // Create a demo calendar event first
      const user = await prisma.user.findFirst();
      if (!user) {
        console.log('❌ No users found. Please run npm run db:seed first.');
        return;
      }

      const demoEvent = await prisma.calendarEvent.create({
        data: {
          title: 'Team Standup Meeting',
          description: 'Daily team sync to discuss project progress',
          startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
          reminderAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
          userId: user.id,
        }
      });

      console.log('✅ Demo calendar event created!');
      console.log(`Event: ${demoEvent.title} for user: ${user.name}`);
      return;
    }

    // Create demo notification for the event's owner
    const notification = await prisma.notification.create({
      data: {
        userId: event.userId, // Use event.userId - NOT hardcoded
        title: 'Event Reminder',
        message: `Your event "${event.title}" is starting at ${new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}.`,
        type: 'CALENDAR_REMINDER',
      }
    });

    console.log('✅ Demo notification created!');
    console.log(`User: ${event.user.name}`);
    console.log(`Message: ${notification.message}`);
    console.log(`Type: ${notification.type}`);
    console.log(`Event Owner ID: ${event.userId}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createDemo();
