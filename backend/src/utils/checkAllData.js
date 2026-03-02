const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log('🔍 Checking entire application state...\n');
    
    // Check all core data
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    
    const projects = await prisma.project.findMany({
      select: { id: true, name: true, status: true }
    });
    
    const tasks = await prisma.task.findMany({
      include: {
        assignee: { select: { name: true } },
        project: { select: { name: true } }
      }
    });
    
    const notifications = await prisma.notification.findMany({
      take: 10,
      select: { id: true, title: true, type: true, isRead: true, createdAt: true }
    });
    
    const automationRules = await prisma.automationRule.findMany({
      select: { id: true, name: true, trigger: true, active: true }
    });
    
    console.log('👥 USERS (' + users.length + ')');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`);
    });
    
    console.log('\n📁 PROJECTS (' + projects.length + ')');
    projects.forEach(project => {
      console.log(`  - ${project.name} (${project.status})`);
    });
    
    console.log('\n✅ TASKS (' + tasks.length + ')');
    tasks.forEach(task => {
      console.log(`  - ${task.title} -> ${task.assignee?.name || 'Unassigned'} [${task.project?.name}]`);
    });
    
    console.log('\n🔔 NOTIFICATIONS (Latest 10 of ' + notifications.length + ' total)');
    notifications.forEach(notif => {
      console.log(`  - ${notif.title} [${notif.type}] ${notif.isRead ? '✅' : '🔴'}`);
    });
    
    console.log('\n🤖 AUTOMATION RULES (' + automationRules.length + ')');
    automationRules.forEach(rule => {
      console.log(`  - ${rule.name} (${rule.trigger}) ${rule.active ? '✅' : '❌'}`);
    });
    
    console.log('\n🎉 APPLICATION DATA COMPLETE');
    
  } catch (error) {
    console.error('❌ Error checking system:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();
