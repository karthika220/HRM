require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNotifications() {
  try {
    console.log('🔍 Checking all notifications...\n');
    
    // Get calendar event with its user
    const event = await prisma.calendarEvent.findFirst({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!event) {
      console.log('❌ No calendar events found');
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: event.userId }, // Use event.userId
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`📬 Found ${notifications.length} recent notifications for ${event.user.name} (Event Owner):\n`);
    
    notifications.forEach((notif, index) => {
      const isRead = notif.isRead ? '✅ Read' : '🔴 Unread';
      const icon = notif.type === 'CALENDAR_REMINDER' ? '📅⏰' : '📢';
      console.log(`${index + 1}. ${icon} ${isRead}`);
      console.log(`   Title: ${notif.title}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   Created: ${notif.createdAt.toLocaleString()}`);
      console.log('');
    });

    // Count by type
    const typeCounts = await prisma.notification.groupBy({
      by: ['type'],
      where: { userId: event.userId }, // Use event.userId
      _count: { type: true }
    });

    console.log('📊 Notification Types:');
    typeCounts.forEach(group => {
      const icon = group.type === 'CALENDAR_REMINDER' ? '📅⏰' : '📢';
      console.log(`${icon} ${group.type}: ${group._count.type}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();
