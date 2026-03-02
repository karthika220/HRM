const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreMissingRule() {
  try {
    console.log('=== RESTORING MISSING AUTOMATION RULE ===\n');

    // Check if Task Status Change Alert exists
    const existingRule = await prisma.automationRule.findFirst({
      where: { name: 'Task Status Change Alert' }
    });

    if (!existingRule) {
      console.log('Creating missing Task Status Change Alert rule...');
      
      // Get Managing Director user
      const mdUser = await prisma.user.findFirst({
        where: { role: 'MANAGING_DIRECTOR' }
      });

      if (mdUser) {
        // Create the missing rule
        const newRule = await prisma.automationRule.create({
          data: {
            name: 'Task Status Change Alert',
            trigger: 'TASK_STATUS_CHANGED',
            action: 'SEND_NOTIFICATION',
            active: false, // Keep it inactive as it was originally
            createdBy: mdUser.id
          }
        });

        console.log('✅ Task Status Change Alert rule created:');
        console.log(`   ID: ${newRule.id}`);
        console.log(`   Name: ${newRule.name}`);
        console.log(`   Trigger: ${newRule.trigger}`);
        console.log(`   Action: ${newRule.action}`);
        console.log(`   Active: ${newRule.active}`);
      } else {
        console.log('❌ No Managing Director user found');
      }
    } else {
      console.log('✅ Task Status Change Alert rule already exists');
    }

    // Verify total rules
    const totalRules = await prisma.automationRule.count();
    console.log(`\n📊 Total automation rules in database: ${totalRules}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreMissingRule();
