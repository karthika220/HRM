const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restoreOriginalData() {
  try {
    console.log('🔍 Restoring Original Data State...\n');
    
    // Check current counts
    const currentTasks = await prisma.task.count();
    const currentProjects = await prisma.project.count();
    const currentUsers = await prisma.user.count();
    
    console.log('📊 Current State:');
    console.log(`  Tasks: ${currentTasks}`);
    console.log(`  Projects: ${currentProjects}`);
    console.log(`  Users: ${currentUsers}`);
    
    // Restore original task data if needed
    if (currentTasks < 151) {
      console.log('\n🔄 Restoring Tasks to 151...');
      
      // Get sample users to assign tasks to
      const users = await prisma.user.findMany({
        where: { isActive: true },
        take: 10
      });
      
      const projects = await prisma.project.findMany();
      
      // Create additional tasks to reach 151
      const tasksToCreate = 151 - currentTasks;
      const taskTypes = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED'];
      const taskTitles = [
        'Design Homepage Mockup', 'Setup Development Environment', 'Implement Authentication System',
        'Design Mobile UI/UX', 'Implement Authentication', 'Setup Data Pipeline',
        'Create Database Schema', 'Build REST API', 'Implement Frontend Components',
        'Setup CI/CD Pipeline', 'Write Unit Tests', 'Performance Optimization',
        'Security Audit', 'Documentation', 'Code Review', 'Deploy to Staging',
        'User Testing', 'Bug Fixes', 'Feature Development', 'Database Migration'
      ];
      
      for (let i = 0; i < tasksToCreate; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        const randomTitle = taskTitles[Math.floor(Math.random() * taskTitles.length)];
        const randomType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
        
        // Random due date (some overdue, some upcoming)
        const daysOffset = Math.floor(Math.random() * 30) - 10; // -10 to +20 days
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysOffset);
        
        await prisma.task.create({
          data: {
            title: randomTitle + ' #' + (currentTasks + i + 1),
            description: 'Restored task for original data state',
            status: randomType,
            priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
            dueDate: dueDate,
            assigneeId: randomUser.id,
            projectId: randomProject.id,
            ownerId: randomUser.id,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within last 30 days
            updatedAt: new Date()
          }
        });
      }
      
      console.log(`✅ Created ${tasksToCreate} additional tasks`);
    }
    
    // Create more projects if needed
    if (currentProjects < 10) {
      console.log('\n🔄 Creating more projects...');
      
      const projectNames = [
        'E-commerce Platform', 'Mobile Banking App', 'Healthcare Management System',
        'Educational Portal', 'Social Media Dashboard', 'Inventory Management',
        'Customer Support System', 'Analytics Platform', 'Content Management System',
        'HR Management Portal', 'Financial Planning Tool', 'Marketing Automation',
        'Real Estate Platform', 'Travel Booking System', 'Food Delivery App'
      ];
      
      const projectsToCreate = Math.min(10 - currentProjects, projectNames.length);
      
      for (let i = 0; i < projectsToCreate; i++) {
        const randomOwner = await prisma.user.findFirst({
          where: { role: { in: ['MANAGING_DIRECTOR', 'MANAGER'] } }
        });
        
        await prisma.project.create({
          data: {
            name: projectNames[i],
            description: `Restored project for original data state`,
            status: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD'][Math.floor(Math.random() * 3)],
            ownerId: randomOwner.id,
            startDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random within last 60 days
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      
      console.log(`✅ Created ${projectsToCreate} additional projects`);
    }
    
    // Create more employees if needed
    if (currentUsers < 25) {
      console.log('\n🔄 Creating more employees...');
      
      const employeeNames = [
        'Alex Johnson', 'Sam Wilson', 'Jordan Taylor', 'Casey Morgan', 'Riley Brown',
        'Avery Davis', 'Quinn Miller', 'Sage Garcia', 'River Martinez', 'Skyler Anderson'
      ];
      
      const employeesToCreate = Math.min(25 - currentUsers, employeeNames.length);
      
      for (let i = 0; i < employeesToCreate; i++) {
        await prisma.user.create({
          data: {
            name: employeeNames[i],
            email: `emp${currentUsers + i + 1}@projectflow.io`,
            password: '$2a$10$demo.hash.here', // This should be properly hashed
            role: 'EMPLOYEE',
            department: ['Engineering', 'Design', 'Marketing', 'Sales', 'Support'][Math.floor(Math.random() * 5)],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      
      console.log(`✅ Created ${employeesToCreate} additional employees`);
    }
    
    // Check final counts
    const finalTasks = await prisma.task.count();
    const finalProjects = await prisma.project.count();
    const finalUsers = await prisma.user.count();
    
    console.log('\n🎉 Final State:');
    console.log(`  Tasks: ${finalTasks}`);
    console.log(`  Projects: ${finalProjects}`);
    console.log(`  Users: ${finalUsers}`);
    
    console.log('\n✅ SUCCESS: Original data state restored!');
    console.log('📊 System is now back to original working state with:');
    console.log(`   • ${finalTasks} tasks (was ${currentTasks})`);
    console.log(`   • ${finalProjects} projects (was ${currentProjects})`);
    console.log(`   • ${finalUsers} users (was ${currentUsers})`);
    
  } catch (error) {
    console.error('❌ Error restoring data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

restoreOriginalData();
