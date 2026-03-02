const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreCompleteData() {
  try {
    console.log('🔄 Restoring complete working data...');
    
    // Read the backup.sql file
    const backupPath = path.join(__dirname, 'backup.sql');
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    
    console.log('📥 Processing backup data...');
    
    // Extract all data types
    const taskInserts = backupContent.match(/INSERT INTO Task \([^)]+\) VALUES \([^)]+\);/g) || [];
    const milestoneInserts = backupContent.match(/INSERT INTO Milestone \([^)]+\) VALUES \([^)]+\);/g) || [];
    const activityInserts = backupContent.match(/INSERT INTO Activity \([^)]+\) VALUES \([^)]+\);/g) || [];
    const timesheetInserts = backupContent.match(/INSERT INTO Timesheet \([^)]+\) VALUES \([^)]+\);/g) || [];
    const commentInserts = backupContent.match(/INSERT INTO Comment \([^)]+\) VALUES \([^)]+\);/g) || [];
    const notificationPrefInserts = backupContent.match(/INSERT INTO NotificationPreferences \([^)]+\) VALUES \([^)]+\);/g) || [];
    
    console.log(`Found:`);
    console.log(`- Tasks: ${taskInserts.length}`);
    console.log(`- Milestones: ${milestoneInserts.length}`);
    console.log(`- Activities: ${activityInserts.length}`);
    console.log(`- Timesheets: ${timesheetInserts.length}`);
    console.log(`- Comments: ${commentInserts.length}`);
    console.log(`- Notification Preferences: ${notificationPrefInserts.length}`);
    
    // Restore Notification Preferences first
    for (const insert of notificationPrefInserts) {
      try {
        const valuesMatch = insert.match(/VALUES \((.*?)\);/);
        if (!valuesMatch) continue;
        
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        
        const prefData = {
          id: values[0],
          userId: values[1] === 'NULL' ? null : values[1],
          emailEnabled: values[2] === '1',
          pushEnabled: values[3] === '1',
          taskReminders: values[4] === '1',
          projectUpdates: values[5] === '1',
          createdAt: new Date(parseInt(values[6])),
          updatedAt: new Date(parseInt(values[7]))
        };
        
        await prisma.notificationPreferences.create({ data: prefData });
        console.log(`✅ Created notification preference for user: ${prefData.userId}`);
        
      } catch (error) {
        console.log('⚠️ Skipping notification preference:', error.message);
      }
    }
    
    // Restore Milestones
    for (const insert of milestoneInserts) {
      try {
        const valuesMatch = insert.match(/VALUES \((.*?)\);/);
        if (!valuesMatch) continue;
        
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        
        const milestoneData = {
          id: values[0],
          name: values[1] === 'NULL' ? null : values[1],
          description: values[2] === 'NULL' ? null : values[2],
          projectId: values[3] === 'NULL' ? null : values[3],
          status: values[4] === 'NULL' ? null : values[4],
          dueDate: values[5] === 'NULL' ? null : new Date(parseInt(values[5])),
          createdAt: new Date(parseInt(values[6])),
          updatedAt: new Date(parseInt(values[7]))
        };
        
        await prisma.milestone.create({ data: milestoneData });
        console.log(`✅ Created milestone: ${milestoneData.name}`);
        
      } catch (error) {
        console.log('⚠️ Skipping milestone:', error.message);
      }
    }
    
    // Restore Tasks
    for (const insert of taskInserts) {
      try {
        const valuesMatch = insert.match(/VALUES \((.*?)\);/);
        if (!valuesMatch) continue;
        
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        
        const taskData = {
          id: values[0],
          title: values[1] === 'NULL' ? null : values[1],
          description: values[2] === 'NULL' ? null : values[2],
          status: values[3] === 'NULL' ? null : values[3],
          priority: values[4] === 'NULL' ? null : values[4],
          projectId: values[5] === 'NULL' ? null : values[5],
          assigneeId: values[6] === 'NULL' ? null : values[6],
          creatorId: values[7] === 'NULL' ? null : values[7],
          dueDate: values[8] === 'NULL' ? null : new Date(parseInt(values[8])),
          createdAt: new Date(parseInt(values[9])),
          updatedAt: new Date(parseInt(values[10])),
          estimatedHours: values[11] === 'NULL' ? null : parseFloat(values[11]),
          actualHours: values[12] === 'NULL' ? null : parseFloat(values[12]),
          milestoneId: values[13] === 'NULL' ? null : values[13],
          tags: values[14] === 'NULL' ? null : values[14]
        };
        
        await prisma.task.create({ data: taskData });
        console.log(`✅ Created task: ${taskData.title}`);
        
      } catch (error) {
        console.log('⚠️ Skipping task:', error.message);
      }
    }
    
    // Restore Comments
    for (const insert of commentInserts) {
      try {
        const valuesMatch = insert.match(/VALUES \((.*?)\);/);
        if (!valuesMatch) continue;
        
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        
        const commentData = {
          id: values[0],
          content: values[1] === 'NULL' ? null : values[1],
          taskId: values[2] === 'NULL' ? null : values[2],
          authorId: values[3] === 'NULL' ? null : values[3],
          createdAt: new Date(parseInt(values[4])),
          updatedAt: new Date(parseInt(values[5]))
        };
        
        await prisma.comment.create({ data: commentData });
        console.log(`✅ Created comment for task: ${commentData.taskId}`);
        
      } catch (error) {
        console.log('⚠️ Skipping comment:', error.message);
      }
    }
    
    // Restore Activities
    for (const insert of activityInserts) {
      try {
        const valuesMatch = insert.match(/VALUES \((.*?)\);/);
        if (!valuesMatch) continue;
        
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        
        const activityData = {
          id: values[0],
          type: values[1] === 'NULL' ? null : values[1],
          description: values[2] === 'NULL' ? null : values[2],
          userId: values[3] === 'NULL' ? null : values[3],
          projectId: values[4] === 'NULL' ? null : values[4],
          taskId: values[5] === 'NULL' ? null : values[5],
          createdAt: new Date(parseInt(values[6])),
          updatedAt: new Date(parseInt(values[7]))
        };
        
        await prisma.activity.create({ data: activityData });
        console.log(`✅ Created activity: ${activityData.type}`);
        
      } catch (error) {
        console.log('⚠️ Skipping activity:', error.message);
      }
    }
    
    // Restore Timesheets
    for (const insert of timesheetInserts) {
      try {
        const valuesMatch = insert.match(/VALUES \((.*?)\);/);
        if (!valuesMatch) continue;
        
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        
        const timesheetData = {
          id: values[0],
          userId: values[1] === 'NULL' ? null : values[1],
          projectId: values[2] === 'NULL' ? null : values[2],
          taskId: values[3] === 'NULL' ? null : values[3],
          date: new Date(parseInt(values[4])),
          hours: parseFloat(values[5]),
          description: values[6] === 'NULL' ? null : values[6],
          createdAt: new Date(parseInt(values[7])),
          updatedAt: new Date(parseInt(values[8]))
        };
        
        await prisma.timesheet.create({ data: timesheetData });
        console.log(`✅ Created timesheet entry`);
        
      } catch (error) {
        console.log('⚠️ Skipping timesheet:', error.message);
      }
    }
    
    console.log('✅ Complete data restoration finished!');
    
    // Verify restoration
    const taskCount = await prisma.task.count();
    const milestoneCount = await prisma.milestone.count();
    const activityCount = await prisma.activity.count();
    const timesheetCount = await prisma.timesheet.count();
    const commentCount = await prisma.comment.count();
    
    console.log(`\n📊 Final Restoration Summary:`);
    console.log(`Tasks: ${taskCount}`);
    console.log(`Milestones: ${milestoneCount}`);
    console.log(`Activities: ${activityCount}`);
    console.log(`Timesheets: ${timesheetCount}`);
    console.log(`Comments: ${commentCount}`);
    
  } catch (error) {
    console.error('❌ Error restoring complete data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreCompleteData();
