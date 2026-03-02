const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDemoRules() {
  try {
    // Get a Managing Director user
    const managingDirector = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' }
    });

    if (!managingDirector) {
      console.log('No Managing Director found. Creating one first...');
      const md = await prisma.user.create({
        data: {
          email: 'md@projectflow.com',
          password: 'password123',
          name: 'Managing Director',
          role: 'MANAGING_DIRECTOR'
        }
      });
      console.log('Created Managing Director:', md.name);
    }

    const creator = managingDirector || (await prisma.user.findFirst({ where: { role: 'MANAGING_DIRECTOR' } }));

    // Demo automation rules
    const demoRules = [
      {
        name: 'Overdue Task Notification',
        trigger: 'TASK_OVERDUE',
        action: 'SEND_NOTIFICATION',
        active: true,
        createdBy: creator.id
      },
      {
        name: 'New Task Assignment Alert',
        trigger: 'TASK_ASSIGNED',
        action: 'SEND_NOTIFICATION',
        active: true,
        createdBy: creator.id
      },
      {
        name: 'Weekly Status Report Reminder',
        trigger: 'SCHEDULED',
        action: 'SEND_NOTIFICATION',
        active: false,
        createdBy: creator.id
      },
      {
        name: 'Milestone Completion Notification',
        trigger: 'MILESTONE_REACHED',
        action: 'SEND_NOTIFICATION',
        active: true,
        createdBy: creator.id
      },
      {
        name: 'Task Status Change Alert',
        trigger: 'TASK_STATUS_CHANGED',
        action: 'SEND_NOTIFICATION',
        active: false,
        createdBy: creator.id
      }
    ];

    // Check if rules already exist
    const existingRules = await prisma.automationRule.findMany();
    if (existingRules.length > 0) {
      console.log(`Found ${existingRules.length} existing automation rules. Skipping demo data creation.`);
      return;
    }

    // Create demo rules
    for (const rule of demoRules) {
      await prisma.automationRule.create({ data: rule });
      console.log(`Created demo rule: ${rule.name}`);
    }

    console.log('Successfully created demo automation rules!');
  } catch (error) {
    console.error('Error creating demo rules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDemoRules();
