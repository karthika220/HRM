const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreNotifications() {
  try {
    console.log('🔄 Restoring notifications data...');
    
    // Read backup.sql file
    const backupPath = path.join(__dirname, 'backup.sql');
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    
    console.log('📥 Processing notification data...');
    
    // Extract notification data
    const notificationInserts = backupContent.match(/INSERT INTO Notification \([^)]+\) VALUES \([^)]+\);/g) || [];
    
    console.log(`Found ${notificationInserts.length} notification entries`);
    
    // Restore Notifications
    let restoredCount = 0;
    for (const insert of notificationInserts) {
      try {
        const valuesMatch = insert.match(/VALUES \((.*?)\);/);
        if (!valuesMatch) continue;
        
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        
        const notificationData = {
          id: values[0],
          title: values[1] === 'NULL' ? null : values[1],
          message: values[2] === 'NULL' ? null : values[2],
          type: values[3] === 'NULL' ? null : values[3],
          isRead: values[4] === '1',
          userId: values[5] === 'NULL' ? null : values[5],
          createdAt: new Date(parseInt(values[6]))
        };
        
        await prisma.notification.create({ data: notificationData });
        restoredCount++;
        
        if (restoredCount % 100 === 0) {
          console.log(`✅ Restored ${restoredCount} notifications...`);
        }
        
      } catch (error) {
        console.log('⚠️ Skipping notification:', error.message);
      }
    }
    
    console.log(`✅ Notifications restoration finished! Restored ${restoredCount} notifications.`);
    
    // Verify restoration
    const notificationCount = await prisma.notification.count();
    
    console.log(`\n📊 Notification Restoration Summary:`);
    console.log(`Notifications: ${notificationCount}`);
    
    // Show notification statistics by type
    const notificationStats = await prisma.notification.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    
    if (notificationStats.length > 0) {
      console.log(`\n🔔 Notification Types:`);
      notificationStats.forEach(stat => {
        console.log(`   ${stat.type}: ${stat._count.type}`);
      });
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
    
  } catch (error) {
    console.error('❌ Error restoring notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreNotifications();
