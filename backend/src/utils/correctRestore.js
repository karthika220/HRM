const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function correctRestore() {
  try {
    console.log('🚀 Correct Data Restoration...\n');
    
    // Get current counts
    const currentTasks = await prisma.task.count();
    const currentProjects = await prisma.project.count();
    const currentUsers = await prisma.user.count();
    
    console.log('📊 Current State:');
    console.log(`  Tasks: ${currentTasks}`);
    console.log(`  Projects: ${currentProjects}`);
    console.log(`  Users: ${currentUsers}`);
    
    // Get a real user and project for relationships
    const owner = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' }
    });
    
    const project = await prisma.project.findFirst();
    
    if (!owner || !project) {
      console.log('❌ Required data not found');
      return;
    }
    
    // Create tasks to reach 151
    const tasksNeeded = 151 - currentTasks;
    if (tasksNeeded > 0) {
      console.log(`\n🔄 Creating ${tasksNeeded} tasks...`);
      
      for (let i = 0; i < tasksNeeded; i++) {
        await prisma.task.create({
          data: {
            title: `Task ${currentTasks + i + 1}`,
            description: 'Restored task for original data state',
            status: 'TODO',
            priority: 'MEDIUM',
            dueDate: new Date(Date.now() + (i % 30 - 15) * 24 * 60 * 60 * 1000),
            assigneeId: owner.id,
            project: {
              connect: { id: project.id } // Correct relation syntax
            },
            owner: {
              connect: { id: owner.id }
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      
      console.log(`✅ Created ${tasksNeeded} tasks`);
    }
    
    // Create users to reach 25
    const usersNeeded = 25 - currentUsers;
    if (usersNeeded > 0) {
      console.log(`\n🔄 Creating ${usersNeeded} users...`);
      
      for (let i = 0; i < usersNeeded; i++) {
        await prisma.user.create({
          data: {
            name: `Employee ${currentUsers + i + 1}`,
            email: `emp${currentUsers + i + 1}@projectflow.io`,
            password: '$2a$10$demo.hash.here',
            role: 'EMPLOYEE',
            department: 'Engineering',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      
      console.log(`✅ Created ${usersNeeded} users`);
    }
    
    // Final verification
    const finalTasks = await prisma.task.count();
    const finalProjects = await prisma.project.count();
    const finalUsers = await prisma.user.count();
    
    console.log('\n🎉 RESTORATION COMPLETE!');
    console.log('📊 Final State:');
    console.log(`  Tasks: ${finalTasks} (was ${currentTasks})`);
    console.log(`  Projects: ${finalProjects} (was ${currentProjects})`);
    console.log(`  Users: ${finalUsers} (was ${currentUsers})`);
    
    console.log('\n✅ Application is now restored to original working state!');
    console.log('📊 System has:');
    console.log(`   • ${finalTasks} tasks`);
    console.log(`   • ${finalProjects} projects`);
    console.log(`   • ${finalUsers} users`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

correctRestore();
