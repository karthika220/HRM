const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function revertToOriginal() {
  try {
    console.log('🔄 REVERTING TO ORIGINAL STATE (Before Automation)...\n');
    
    // Delete all automation rules
    const deletedRules = await prisma.automationRule.deleteMany({});
    console.log(`❌ Deleted ${deletedRules.count} automation rules`);
    
    // Delete all automation-related notifications
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        type: {
          in: ['INFO'] // Remove automation-generated notifications
        }
      }
    });
    console.log(`❌ Deleted ${deletedNotifications.count} automation notifications`);
    
    // Delete extra users created after automation
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'emp' // Remove demo employees
        }
      }
    });
    console.log(`❌ Deleted ${deletedUsers.count} demo users`);
    
    // Delete extra tasks created after automation
    const deletedTasks = await prisma.task.deleteMany({
      where: {
        description: {
          contains: 'Restored task'
        }
      }
    });
    console.log(`❌ Deleted ${deletedTasks.count} restored tasks`);
    
    console.log('\n✅ REVERSION COMPLETE!');
    console.log('🔄 System reverted to original state');
    
  } catch (error) {
    console.error('❌ Error during reversion:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

revertToOriginal();
