const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addReports() {
  try {
    console.log('📊 Adding sample reports...');
    
    // Get existing data
    const users = await prisma.user.findMany();
    const projects = await prisma.project.findMany();
    const tasks = await prisma.task.findMany();
    
    // Create sample reports
    const reports = await Promise.all([
      prisma.report.create({
        data: {
          title: 'Q1 2024 Project Summary',
          type: 'PROJECT_SUMMARY',
          data: JSON.stringify({
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
            completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
            planningProjects: projects.filter(p => p.status === 'PLANNING').length,
            onHoldProjects: projects.filter(p => p.status === 'ON_HOLD').length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'DONE').length,
            inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
            overdueTasks: tasks.filter(t => {
              return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';
            }).length,
          }),
          createdById: users[0].id,
        },
      }),
      prisma.report.create({
        data: {
          title: 'Task Completion Analysis - E-commerce Platform',
          type: 'TASK_SUMMARY',
          projectId: projects[0]?.id,
          data: JSON.stringify({
            projectName: projects[0]?.name || 'E-commerce Platform',
            totalTasks: 15,
            completedTasks: 8,
            inProgressTasks: 4,
            todoTasks: 3,
            overdueTasks: 2,
            completionRate: 53.3,
            averageTaskDuration: 5.2,
          }),
          createdById: users[0].id,
        },
      }),
      prisma.report.create({
        data: {
          title: 'Team Performance Report - Cloud Migration',
          type: 'TIMESHEET',
          projectId: projects[1]?.id,
          data: JSON.stringify({
            projectName: projects[1]?.name || 'Cloud Migration',
            totalHours: 320,
            billableHours: 280,
            nonBillableHours: 40,
            averageHoursPerTask: 8.5,
            topPerformer: users[1]?.name || 'Team Lead',
            tasksCompleted: 12,
          }),
          createdById: users[1]?.id || users[0].id,
        },
      }),
      prisma.report.create({
        data: {
          title: 'Monthly Progress Overview - All Projects',
          type: 'PROJECT_SUMMARY',
          data: JSON.stringify({
            period: 'March 2024',
            totalProjects: projects.length,
            newProjects: 2,
            completedProjects: 1,
            totalTasks: tasks.length,
            tasksCompletedThisMonth: 25,
            productivityIncrease: 15.5,
            teamUtilization: 78.3,
          }),
          createdById: users[0].id,
        },
      }),
    ]);

    console.log(`✅ Created ${reports.length} reports`);
    
    // Display current stats
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    
    console.log('\n📊 Current Database Summary:');
    console.log(`   Projects: ${totalProjects} (${activeProjects} active, ${completedProjects} completed)`);
    console.log(`   Tasks: ${totalTasks} total (${completedTasks} completed)`);
    console.log(`   Reports: ${reports.length} sample reports created`);
    
  } catch (error) {
    console.error('❌ Error adding reports:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addReports();
