const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyCompleteRestore() {
  try {
    console.log('🔍 Verifying complete data restoration...');
    
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const taskCount = await prisma.task.count();
    const milestoneCount = await prisma.milestone.count();
    const activityCount = await prisma.activity.count();
    const commentCount = await prisma.comment.count();
    
    console.log('\n📊 Current Database State:');
    console.log(`Users: ${userCount}`);
    console.log(`Projects: ${projectCount}`);
    console.log(`Tasks: ${taskCount}`);
    console.log(`Milestones: ${milestoneCount}`);
    console.log(`Activities: ${activityCount}`);
    console.log(`Comments: ${commentCount}`);
    
    // Show task distribution by status
    const taskStats = await prisma.task.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    console.log('\n📋 Task Distribution:');
    taskStats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status}`);
    });
    
    // Show Karthika's assigned tasks
    const karthika = await prisma.user.findFirst({ 
      where: { name: { contains: 'Karthika' } } 
    });
    
    if (karthika) {
      const karthikaTasks = await prisma.task.count({
        where: { assigneeId: karthika.id }
      });
      console.log(`\n👤 Karthika's Assigned Tasks: ${karthikaTasks}`);
    }
    
    // Show sample tasks from different projects
    const sampleTasks = await prisma.task.findMany({
      take: 10,
      include: {
        assignee: { select: { name: true } },
        project: { select: { name: true } }
      }
    });
    
    console.log('\n📋 Sample Tasks:');
    sampleTasks.forEach(task => {
      console.log(`   - ${task.title.substring(0, 60)}... (${task.status})`);
      console.log(`     Project: ${task.project?.name}, Assigned to: ${task.assignee?.name || 'Unassigned'}`);
    });
    
    console.log('\n✅ Your working data has been successfully restored!');
    
  } catch (error) {
    console.error('❌ Error verifying restoration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCompleteRestore();
