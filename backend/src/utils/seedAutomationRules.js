const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Seed default automation rules
async function seedAutomationRules() {
  try {
    console.log('🌱 Seeding automation rules...');

    // Get or create a Managing Director for rule creation
    let managingDirector = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' }
    });

    if (!managingDirector) {
      console.log('⚠️ No Managing Director found. Creating one for demo...');
      
      // Create a demo Managing Director
      managingDirector = await prisma.user.create({
        data: {
          email: 'md@projectflow.com',
          password: '$2a$10$demo.hash.here', // This should be properly hashed
          name: 'Managing Director',
          role: 'MANAGING_DIRECTOR',
          isActive: true
        }
      });
    }

    // Check if rules already exist
    const existingRules = await prisma.automationRule.count();
    if (existingRules > 0) {
      console.log('✅ Automation rules already exist. Skipping seeding.');
      return;
    }

    // Create the 2 default automation rules
    const rules = [
      {
        name: '🔴 Overdue Task Alert',
        trigger: 'TASK_OVERDUE',
        action: 'SEND_NOTIFICATION',
        active: true,
        createdBy: managingDirector.id
      },
      {
        name: '⏰ Friday Timesheet Reminder',
        trigger: 'SCHEDULED',
        action: 'SEND_NOTIFICATION',
        active: true,
        createdBy: managingDirector.id
      }
    ];

    for (const ruleData of rules) {
      await prisma.automationRule.create({
        data: ruleData
      });
      console.log(`✅ Created rule: ${ruleData.name}`);
    }

    console.log('🎉 Automation rules seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding automation rules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding
seedAutomationRules();
