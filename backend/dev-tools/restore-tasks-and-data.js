const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreTasksAndData() {
  try {
    console.log('🔄 Restoring tasks and complete data...');
    
    // Read the backup.sql file
    const backupPath = path.join(__dirname, 'backup.sql');
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    
    console.log('📥 Processing backup data...');
    
    // Extract all data types with correct patterns
    const taskInserts = backupContent.match(/INSERT INTO Task \([^)]+\) VALUES \([^)]+\);/g) || [];
    const milestoneInserts = backupContent.match(/INSERT INTO Milestone \([^)]+\) VALUES \([^)]+\);/g) || [];
    const activityInserts = backupContent.match(/INSERT INTO Activity \([^)]+\) VALUES \([^)]+\);/g) || [];
    const timesheetInserts = backupContent.match(/INSERT INTO Timesheet \([^)]+\) VALUES \([^)]+\);/g) || [];
    const commentInserts = backupContent.match(/INSERT INTO Comment \([^)]+\) VALUES \([^)]+\);/g) || [];
    
    console.log(`Found:`);
    console.log(`- Tasks: ${taskInserts.length}`);
    console.log(`- Milestones: ${milestoneInserts.length}`);
    console.log(`- Activities: ${activityInserts.length}`);
    console.log(`- Timesheets: ${timesheetInserts.length}`);
    console.log(`- Comments: ${commentInserts.length}`);
    
    // Restore Milestones first
    for (const insert of milestoneInserts) {
      try {
        const valuesMatch = insert.match(/VALUES \((.*?)\);/);
        if (!valuesMatch) continue;
        
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        
        const milestoneData = {
          id: values[0],
          name: values[1] === 'NULL' ? null : values[1],
          targetDate: values[2] === 'NULL' ? null : new Date(parseInt(values[2])),
          isCompleted: values[3] === '1',
          projectId: values[4] === 'NULL' ? null : values[4],
          createdAt: new Date(parseInt(values[5])),
          updatedAt: new Date(parseInt(values[5]))
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
          startDate: values[5] === 'NULL' ? null : new Date(parseInt(values[5])),
          dueDate: values[6] === 'NULL' ? null : new Date(parseInt(values[6])),
          estimatedHours: values[7] === 'NULL' ? null : parseFloat(values[7]),
          projectId: values[8] === 'NULL' ? null : values[8],
          assigneeId: values[9] === 'NULL' ? null : values[9],
          creatorId: values[10] === 'NULL' ? null : values[10],
          parentId: values[11] === 'NULL' ? null : values[11],
          tags: values[12] === 'NULL' ? null : values[12],
          delayNotified: values[13] === '1',
          createdAt: new Date(parseInt(values[14])),
          updatedAt: new Date(parseInt(values[15]))
        };
        
        await prisma.task.create({ data: taskData });
        console.log(`✅ Created task: ${taskData.title.substring(0, 50)}...`);
        
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
    
    console.log('✅ Tasks and data restoration finished!');
    
    // Verify restoration
    const taskCount = await prisma.task.count();
    const milestoneCount = await prisma.milestone.count();
    const activityCount = await prisma.activity.count();
    const commentCount = await prisma.comment.count();
    
    console.log(`\n📊 Final Restoration Summary:`);
    console.log(`Tasks: ${taskCount}`);
    console.log(`Milestones: ${milestoneCount}`);
    console.log(`Activities: ${activityCount}`);
    console.log(`Comments: ${commentCount}`);
    
    // Show some task examples
    const sampleTasks = await prisma.task.findMany({ 
      take: 5, 
      select: { title: true, status: true, assignee: { select: { name: true } } } 
    });
    
    if (sampleTasks.length > 0) {
      console.log(`\n📋 Sample Tasks:`);
      sampleTasks.forEach(t => console.log(`   - ${t.title} (${t.status}) - ${t.assignee?.name || 'Unassigned'}`));
    }
    
  } catch (error) {
    console.error('❌ Error restoring tasks and data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreTasksAndData();
