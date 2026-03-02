const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyRestore() {
  try {
    const users = await prisma.user.count();
    const projects = await prisma.project.count();
    const tasks = await prisma.task.count();
    const notifications = await prisma.notification.count();
    const activities = await prisma.activity.count();
    const milestones = await prisma.milestone.count();
    
    console.log('🔍 Data Restoration Verification:');
    console.log('=====================================');
    console.log('Users:', users);
    console.log('Projects:', projects);
    console.log('Tasks:', tasks);
    console.log('Milestones:', milestones);
    console.log('Activities:', activities);
    console.log('Notifications:', notifications);
    
    if (users === 8 && projects === 6 && tasks === 72) {
      console.log('\n✅ Original data successfully restored!');
    } else {
      console.log('\n❌ Data restoration may be incomplete');
    }
    
  } catch (error) {
    console.error('Error verifying restoration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRestore();
