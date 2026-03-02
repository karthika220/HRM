const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentState() {
  try {
    console.log('🔍 CHECKING CURRENT STATE...\n');
    
    const currentTasks = await prisma.task.count();
    const currentProjects = await prisma.project.count();
    const currentUsers = await prisma.user.count();
    const currentNotifications = await prisma.notification.count();
    
    console.log('📊 CURRENT COUNTS:');
    console.log(`  Tasks: ${currentTasks}`);
    console.log(`  Projects: ${currentProjects}`);
    console.log(`  Users: ${currentUsers}`);
    console.log(`  Notifications: ${currentNotifications}`);
    
    console.log('\n📋 SAMPLE TASKS:');
    const sampleTasks = await prisma.task.findMany({
      take: 5,
      select: { title: true, assignee: { select: { name: true } } }
    });
    
    sampleTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.title} -> ${task.assignee?.name || 'Unassigned'}`);
    });
    
    console.log('\n📁 SAMPLE PROJECTS:');
    const sampleProjects = await prisma.project.findMany({
      take: 3,
      select: { name: true, status: true }
    });
    
    sampleProjects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.name} [${project.status}]`);
    });
    
    console.log('\n👥 SAMPLE USERS:');
    const sampleUsers = await prisma.user.findMany({
      take: 5,
      select: { name: true, email: true, role: true }
    });
    
    sampleUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) [${user.role}]`);
    });
    
    console.log('\n🎯 ISSUE ANALYSIS:');
    console.log('❗ You should have 72 tasks but only showing', currentTasks);
    console.log('❗ You should have 6 projects but only showing', currentProjects);
    console.log('❗ You should have 8 users but only showing', currentUsers);
    
    if (currentTasks < 50) {
      console.log('\n🚨 PROBLEM: Data appears incomplete!');
      console.log('💡 SOLUTION: Run comprehensive seed again');
      console.log('🔧 COMMAND: npm run db:seed && node prisma/seed-comprehensive.js');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentState();
