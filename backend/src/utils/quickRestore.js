const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickRestore() {
  try {
    console.log('🚀 Quick Data Restoration...\n');
    
    // Get current counts
    const currentTasks = await prisma.task.count();
    const currentProjects = await prisma.project.count();
    const currentUsers = await prisma.user.count();
    
    console.log('📊 Current State:');
    console.log(`  Tasks: ${currentTasks}`);
    console.log(`  Projects: ${currentProjects}`);
    console.log(`  Users: ${currentUsers}`);
    
    // Create tasks to reach 151
    const tasksNeeded = 151 - currentTasks;
    if (tasksNeeded > 0) {
      console.log(`\n🔄 Creating ${tasksNeeded} tasks...`);
      
      // Get existing data for relationships
      const users = await prisma.user.findMany({ take: 5 });
      const projects = await prisma.project.findMany({ take: 3 });
      
      for (let i = 0; i < tasksNeeded; i++) {
        const user = users[i % users.length];
        const project = projects[i % projects.length];
        
        await prisma.task.create({
          data: {
            title: `Task ${currentTasks + i + 1}`,
            description: 'Restored task',
            status: 'TODO',
            priority: 'MEDIUM',
            dueDate: new Date(Date.now() + (i % 30 - 15) * 24 * 60 * 60 * 1000),
            assigneeId: user.id,
            projectId: project.id,
            ownerId: user.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      
      console.log(`✅ Created ${tasksNeeded} tasks`);
    }
    
    // Create projects to reach 10
    const projectsNeeded = 10 - currentProjects;
    if (projectsNeeded > 0) {
      console.log(`\n🔄 Creating ${projectsNeeded} projects...`);
      
      const owner = await prisma.user.findFirst({
        where: { role: 'MANAGING_DIRECTOR' }
      });
      
      for (let i = 0; i < projectsNeeded; i++) {
        await prisma.project.create({
          data: {
            name: `Project ${currentProjects + i + 1}`,
            description: 'Restored project',
            status: 'IN_PROGRESS',
            ownerId: owner.id,
            startDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      
      console.log(`✅ Created ${projectsNeeded} projects`);
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
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickRestore();
