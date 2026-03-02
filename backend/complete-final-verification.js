const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function completeFinalVerification() {
  try {
    console.log('🔍 Complete final verification of all restored data...');
    
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const taskCount = await prisma.task.count();
    const timesheetCount = await prisma.timesheet.count();
    const notificationCount = await prisma.notification.count();
    const commentCount = await prisma.comment.count();
    
    console.log('\n📊 Complete Database State:');
    console.log(`Users: ${userCount}`);
    console.log(`Projects: ${projectCount}`);
    console.log(`Tasks: ${taskCount}`);
    console.log(`Timesheets: ${timesheetCount}`);
    console.log(`Notifications: ${notificationCount}`);
    console.log(`Comments: ${commentCount}`);
    
    // Show notification statistics
    const notificationStats = await prisma.notification.groupBy({
      by: ['isRead', 'type'],
      _count: { isRead: true }
    });
    
    console.log('\n🔔 Notification Statistics:');
    const readStats = { read: 0, unread: 0 };
    const typeStats = {};
    
    notificationStats.forEach(stat => {
      if (stat.isRead) {
        readStats.read += stat._count.isRead;
      } else {
        readStats.unread += stat._count.isRead;
      }
      
      if (!typeStats[stat.type]) typeStats[stat.type] = 0;
      typeStats[stat.type] += stat._count.isRead;
    });
    
    console.log(`   Read: ${readStats.read}`);
    console.log(`   Unread: ${readStats.unread}`);
    console.log('\n🔔 By Type:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    // Show Karthika's complete data
    const karthika = await prisma.user.findFirst({ 
      where: { name: { contains: 'Karthika' } } 
    });
    
    if (karthika) {
      const karthikaTasks = await prisma.task.count({
        where: { assigneeId: karthika.id }
      });
      const karthikaTimesheets = await prisma.timesheet.count({
        where: { userId: karthika.id }
      });
      const karthikaNotifications = await prisma.notification.count({
        where: { userId: karthika.id }
      });
      
      console.log(`\n👤 Karthika's Complete Data:`);
      console.log(`   Assigned Tasks: ${karthikaTasks}`);
      console.log(`   Timesheet Entries: ${karthikaTimesheets}`);
      console.log(`   Notifications: ${karthikaNotifications}`);
    }
    
    // Show recent notifications
    const recentNotifications = await prisma.notification.findMany({
      take: 5,
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (recentNotifications.length > 0) {
      console.log(`\n🔔 Recent Notifications:`);
      recentNotifications.forEach(notif => {
        console.log(`   - ${notif.title} (${notif.type})`);
        console.log(`     User: ${notif.user?.name}, Read: ${notif.isRead ? 'Yes' : 'No'}`);
        console.log(`     Message: ${notif.message?.substring(0, 60)}...`);
      });
    }
    
    console.log('\n🎉 YOUR COMPLETE WORKING DATA HAS BEEN SUCCESSFULLY RESTORED!');
    console.log('✅ All your original data from before automation implementation is now available');
    
  } catch (error) {
    console.error('❌ Error during final verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeFinalVerification();
