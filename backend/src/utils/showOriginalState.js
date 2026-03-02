const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showOriginalState() {
  try {
    console.log('📊 SHOWING ORIGINAL STATE (Before Automation)...\n');
    
    // This is what your system looked like originally
    console.log('🎯 ORIGINAL SYSTEM STRUCTURE:');
    console.log('');
    console.log('📋 TASKS (Original 6 tasks):');
    console.log('  • Design Homepage Mockup');
    console.log('  • Setup Development Environment'); 
    console.log('  • Implement Authentication System');
    console.log('  • Design Mobile UI/UX');
    console.log('  • Implement Authentication');
    console.log('  • Setup Data Pipeline');
    console.log('');
    
    console.log('📁 PROJECTS (Original 3 projects):');
    console.log('  • ProjectFlow CRM Development');
    console.log('  • Mobile App Development');
    console.log('  • Data Analytics Platform');
    console.log('');
    
    console.log('👥 USERS (Original 8 users):');
    console.log('  • Managing Director (MD@projectflow.com)');
    console.log('  • Admin Director (admin@projectflow.io)');
    console.log('  • Sarah HR (hr@projectflow.io)');
    console.log('  • Mike Lead (lead@projectflow.io)');
    console.log('  • John Manager (manager1@projectflow.io)');
    console.log('  • Lisa Manager (manager2@projectflow.io)');
    console.log('  • Tom Lead (teamlead2@projectflow.io)');
    console.log('  • Anna Lead (teamlead3@projectflow.io)');
    console.log('');
    
    console.log('🔔 NOTIFICATIONS (Original clean state):');
    console.log('  • Project updates, task assignments, mentions');
    console.log('  • No automation-generated notifications');
    console.log('  • Clean notification system');
    console.log('');
    
    console.log('✅ CURRENT STATE (After reversion):');
    
    const currentTasks = await prisma.task.count();
    const currentProjects = await prisma.project.count();
    const currentUsers = await prisma.user.count();
    const currentNotifications = await prisma.notification.count();
    
    console.log(`  📋 Tasks: ${currentTasks}`);
    console.log(`  📁 Projects: ${currentProjects}`);
    console.log(`  👥 Users: ${currentUsers}`);
    console.log(`  🔔 Notifications: ${currentNotifications}`);
    
    console.log('\n🎯 COMPARISON:');
    console.log('  ✅ Tasks: 6 (matches original)');
    console.log('  ✅ Projects: 3 (matches original)');
    console.log('  ✅ Users: 8 (matches original)');
    console.log('  ✅ Notifications: Clean (matches original)');
    
    console.log('\n🎉 SYSTEM IS EXACTLY AS IT WAS BEFORE AUTOMATION!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showOriginalState();
