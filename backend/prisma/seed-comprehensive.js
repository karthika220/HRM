const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating comprehensive dummy data...');
  
  // Clear existing data in correct order to respect foreign key constraints
  await prisma.activity.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.issueComment.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.automationRule.deleteMany();
  await prisma.escalation.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.attendanceSummary.deleteMany();
  await prisma.attendanceLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.notificationPreferences.deleteMany();
  await prisma.user.deleteMany();
  
  const hashedPassword = await bcrypt.hash('password', 10);
  
  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@workforce.io',
        password: hashedPassword,
        name: 'Alex Johnson',
        role: 'MANAGING_DIRECTOR',
        department: 'Executive',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah@projectflow.io',
        password: hashedPassword,
        name: 'Sarah Chen',
        role: 'HR_MANAGER',
        department: 'Human Resources',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike@projectflow.io',
        password: hashedPassword,
        name: 'Mike Rodriguez',
        role: 'TEAM_LEAD',
        department: 'Engineering',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa@projectflow.io',
        password: hashedPassword,
        name: 'Lisa Wang',
        role: 'EMPLOYEE',
        department: 'Design',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'john@projectflow.io',
        password: hashedPassword,
        name: 'John Smith',
        role: 'EMPLOYEE',
        department: 'Engineering',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma@projectflow.io',
        password: hashedPassword,
        name: 'Emma Davis',
        role: 'EMPLOYEE',
        department: 'Marketing',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'david@projectflow.io',
        password: hashedPassword,
        name: 'David Kim',
        role: 'EMPLOYEE',
        department: 'Engineering',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'anna@projectflow.io',
        password: hashedPassword,
        name: 'Anna Martinez',
        role: 'EMPLOYEE',
        department: 'QA',
        isActive: true,
      },
    }),
  ]);

  console.log(`👥 Created ${users.length} users`);

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'E-commerce Platform Redesign',
        description: 'Complete overhaul of the online shopping experience',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-30'),
        color: '#00A1C7',
        ownerId: users[0].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Cloud Migration',
        description: 'Migrate infrastructure to AWS cloud platform',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        color: '#FF6B6B',
        ownerId: users[1].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Marketing Dashboard',
        description: 'Real-time analytics dashboard for marketing team',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-05-01'),
        color: '#8B5CF6',
        ownerId: users[2].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'AI Customer Service',
        description: 'Implement AI-powered customer support system',
        status: 'PLANNING',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-06-30'),
        color: '#FFD700',
        ownerId: users[0].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Security Audit 2024',
        description: 'Annual security assessment and improvements',
        status: 'COMPLETED',
        startDate: new Date('2023-11-01'),
        endDate: new Date('2024-01-15'),
        color: '#4ECDC4',
        ownerId: users[0].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile Banking App',
        description: 'Native iOS and Android banking application',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-15'),
        color: '#00FFAA',
        ownerId: users[1].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'HR System Upgrade',
        description: 'Upgrade legacy HR management system',
        status: 'PLANNING',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-06-30'),
        color: '#FFB347',
        ownerId: users[2].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Customer Portal Development',
        description: 'Build self-service customer portal for account management',
        status: 'COMPLETED',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-12-15'),
        color: '#10B981',
        ownerId: users[0].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'API Gateway Implementation',
        description: 'Implement centralized API gateway for microservices',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-04-20'),
        color: '#F59E0B',
        ownerId: users[1].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Data Analytics Platform',
        description: 'Build comprehensive data analytics and BI platform',
        status: 'PLANNING',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-09-30'),
        color: '#EF4444',
        ownerId: users[2].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Payment Gateway Integration',
        description: 'Integrate multiple payment providers',
        status: 'ON_HOLD',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-05-30'),
        color: '#8B5A2B',
        ownerId: users[0].id,
      },
    }),
  ]);

  console.log(`📁 Created ${projects.length} projects`);

  // Create project members
  const projectMembers = [];
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const memberUsers = users.slice(1, 5); // Add members to each project
    
    for (const user of memberUsers) {
      projectMembers.push(
        await prisma.projectMember.create({
          data: {
            projectId: project.id,
            userId: user.id,
            roleInProject: Math.random() > 0.5 ? 'LEAD' : 'CONTRIBUTOR',
          },
        })
      );
    }
  }

  // Create milestones
  const milestones = await Promise.all([
    prisma.milestone.create({
      data: {
        name: 'Design Phase Complete',
        targetDate: new Date('2024-02-15'),
        isCompleted: true,
        projectId: projects[0].id,
      },
    }),
    prisma.milestone.create({
      data: {
        name: 'Beta Testing',
        targetDate: new Date('2024-03-20'),
        isCompleted: false,
        projectId: projects[0].id,
      },
    }),
    prisma.milestone.create({
      data: {
        name: 'Production Release',
        targetDate: new Date('2024-04-30'),
        isCompleted: false,
        projectId: projects[0].id,
      },
    }),
    prisma.milestone.create({
      data: {
        name: 'API Integration Complete',
        targetDate: new Date('2024-03-10'),
        isCompleted: false,
        projectId: projects[2].id,
      },
    }),
    prisma.milestone.create({
      data: {
        name: 'Cloud Migration Phase 1',
        targetDate: new Date('2024-02-28'),
        isCompleted: true,
        projectId: projects[3].id,
      },
    }),
    prisma.milestone.create({
      data: {
        name: 'Security Testing Complete',
        targetDate: new Date('2024-03-15'),
        isCompleted: false,
        projectId: projects[3].id,
      },
    }),
    prisma.milestone.create({
      data: {
        name: 'Dashboard MVP',
        targetDate: new Date('2024-03-25'),
        isCompleted: false,
        projectId: projects[5].id,
      },
    }),
  ]);

  console.log(`🎯 Created ${milestones.length} milestones`);

  // Create tasks with varied statuses and dates
  const taskTemplates = [
    { title: 'Setup development environment', priority: 'HIGH', status: 'DONE', isAutomated: false },
    { title: 'Create wireframes and mockups', priority: 'MEDIUM', status: 'DONE', isAutomated: false },
    { title: 'Implement user authentication', priority: 'HIGH', status: 'DONE', isAutomated: false },
    { title: 'Design database schema', priority: 'HIGH', status: 'DONE', isAutomated: false },
    { title: 'Build REST API endpoints', priority: 'HIGH', status: 'IN_PROGRESS', isAutomated: false },
    { title: 'Create responsive UI components', priority: 'MEDIUM', status: 'IN_PROGRESS', isAutomated: false },
    { title: 'Implement payment gateway', priority: 'CRITICAL', status: 'IN_PROGRESS', isAutomated: false },
    { title: 'Write unit tests', priority: 'MEDIUM', status: 'TODO', isAutomated: false },
    { title: 'Performance optimization', priority: 'HIGH', status: 'TODO', isAutomated: false },
    { title: 'Security audit', priority: 'CRITICAL', status: 'TODO', isAutomated: false },
    { title: 'Documentation', priority: 'LOW', status: 'TODO', isAutomated: false },
    { title: 'User acceptance testing', priority: 'MEDIUM', status: 'TODO', isAutomated: false },
    // Additional tasks for comprehensive reporting
    { title: 'Requirements gathering', priority: 'HIGH', status: 'DONE', isAutomated: false },
    { title: 'Stakeholder meetings', priority: 'MEDIUM', status: 'DONE', isAutomated: false },
    { title: 'Risk assessment', priority: 'HIGH', status: 'DONE', isAutomated: false },
    { title: 'Budget planning', priority: 'MEDIUM', status: 'DONE', isAutomated: false },
    { title: 'Resource allocation', priority: 'HIGH', status: 'IN_PROGRESS', isAutomated: false },
    { title: 'Quality assurance testing', priority: 'HIGH', status: 'TODO', isAutomated: false },
    { title: 'Code review', priority: 'MEDIUM', status: 'TODO', isAutomated: false },
    { title: 'Performance monitoring setup', priority: 'MEDIUM', status: 'TODO', isAutomated: false },
    { title: 'Backup strategy implementation', priority: 'HIGH', status: 'DONE', isAutomated: false },
    { title: 'Disaster recovery planning', priority: 'MEDIUM', status: 'TODO', isAutomated: false },
    { title: 'Training documentation', priority: 'LOW', status: 'TODO', isAutomated: false },
    { title: 'Integration testing', priority: 'HIGH', status: 'TODO', isAutomated: false },
    { title: 'Load testing', priority: 'MEDIUM', status: 'TODO', isAutomated: false },
    { title: 'Security penetration testing', priority: 'CRITICAL', status: 'TODO', isAutomated: false },
    { title: 'Deployment pipeline setup', priority: 'HIGH', status: 'DONE', isAutomated: false },
    { title: 'Monitoring and alerting', priority: 'MEDIUM', status: 'TODO', isAutomated: false },
    { title: 'Data migration planning', priority: 'HIGH', status: 'TODO', isAutomated: false },
    { title: 'User training sessions', priority: 'MEDIUM', status: 'TODO', isAutomated: false },
  ];

  // Automated task templates for recurring tasks
  const automatedTaskTemplates = [
    { title: 'Daily Database Backup', priority: 'HIGH', isAutomated: true },
    { title: 'Security Scan', priority: 'CRITICAL', isAutomated: true },
    { title: 'Performance Monitoring', priority: 'MEDIUM', isAutomated: true },
    { title: 'Log Rotation and Cleanup', priority: 'MEDIUM', isAutomated: true },
    { title: 'API Health Check', priority: 'HIGH', isAutomated: true },
    { title: 'SSL Certificate Renewal Check', priority: 'CRITICAL', isAutomated: true },
    { title: 'Cache Cleanup', priority: 'LOW', isAutomated: true },
    { title: 'Email Queue Processing', priority: 'MEDIUM', isAutomated: true },
    { title: 'Data Synchronization', priority: 'HIGH', isAutomated: true },
    { title: 'Weekly Security Patch Update', priority: 'HIGH', isAutomated: true },
  ];

  const tasks = [];
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    
    // Add regular tasks
    for (let j = 0; j < taskTemplates.length; j++) {
      const template = taskTemplates[j];
      const assignee = users[Math.floor(Math.random() * (users.length - 1)) + 1]; // Random assignee (not admin)
      const creator = users[Math.floor(Math.random() * users.length)];
      
      // Create varied due dates
      const daysOffset = Math.floor(Math.random() * 60) - 10; // -10 to 50 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysOffset);
      
      // Create varied creation dates
      const createdDaysAgo = Math.floor(Math.random() * 30); // 0 to 30 days ago
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - createdDaysAgo);
      
      const task = await prisma.task.create({
        data: {
          title: `${template.title} - ${project.name}`,
          description: `Detailed task for ${template.title.toLowerCase()} in the ${project.name} project`,
          status: template.status,
          priority: template.priority,
          projectId: project.id,
          assigneeId: assignee.id,
          creatorId: creator.id,
          dueDate: dueDate,
          startDate: createdAt,
          isAutomated: template.isAutomated,
          createdAt: createdAt,
          updatedAt: template.status === 'DONE' ? new Date() : createdAt,
        },
      });
      
      tasks.push(task);
    }
    
    // Add automated tasks for each project (2-3 automated tasks per project)
    const numAutomatedTasks = Math.floor(Math.random() * 2) + 2; // 2-3 automated tasks
    for (let j = 0; j < numAutomatedTasks; j++) {
      const template = automatedTaskTemplates[Math.floor(Math.random() * automatedTaskTemplates.length)];
      const creator = users[0]; // Admin creates automated tasks
      
      // Automated tasks typically run daily or weekly
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1); // Due tomorrow
      
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 7)); // Created sometime in the past week
      
      const automatedTask = await prisma.task.create({
        data: {
          title: `${template.title} - ${project.name}`,
          description: `Automated task for ${template.title.toLowerCase()} in the ${project.name} project. This task runs automatically on a schedule.`,
          status: 'TODO', // Automated tasks typically reset to TODO
          priority: template.priority,
          projectId: project.id,
          creatorId: creator.id,
          dueDate: dueDate,
          startDate: createdAt,
          isAutomated: template.isAutomated,
          createdAt: createdAt,
          updatedAt: createdAt,
        },
      });
      
      tasks.push(automatedTask);
    }
  }

  console.log(`✅ Created ${tasks.length} tasks`);

  // Create activities
  const activities = [];
  const activityTemplates = [
    { action: 'CREATED', entity: 'PROJECT', description: 'Created new project' },
    { action: 'UPDATED', entity: 'PROJECT', description: 'Updated project status' },
    { action: 'COMPLETED', entity: 'TASK', description: 'Completed task' },
    { action: 'UPDATED', entity: 'TASK', description: 'Updated task status' },
    { action: 'CREATED', entity: 'TASK', description: 'Created new task' },
    { action: 'COMPLETED', entity: 'MILESTONE', description: 'Completed milestone' },
  ];

  for (let i = 0; i < 25; i++) {
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    
    const daysAgo = Math.floor(Math.random() * 14); // 0 to 14 days ago
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    const activity = await prisma.activity.create({
      data: {
        action: template.action,
        entityType: template.entity,
        entityId: template.entity === 'PROJECT' ? project.id : task.id,
        description: `${template.description}: "${template.entity === 'PROJECT' ? project.name : task.title}"`,
        projectId: project.id,
        userId: user.id,
        createdAt: createdAt,
      },
    });
    
    activities.push(activity);
  }

  console.log(`📝 Created ${activities.length} activities`);

  // Create some timesheets
  const timesheets = [];
  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * (users.length - 1)) + 1]; // Not admin
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    
    const daysAgo = Math.floor(Math.random() * 7); // 0 to 7 days ago
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    const hours = Math.random() * 6 + 1; // 1 to 7 hours
    
    const timesheet = await prisma.timesheet.create({
      data: {
        date: date,
        startTime: '09:00',
        endTime: `${String(9 + Math.floor(hours)).padStart(2, '0')}:00`,
        hours: Math.round(hours * 10) / 10,
        workType: 'BILLABLE',
        notes: `Work on ${task.title}`,
        taskId: task.id,
        userId: user.id,
        isApproved: Math.random() > 0.3,
      },
    });
    
    timesheets.push(timesheet);
  }

  console.log(`⏰ Created ${timesheets.length} timesheets`);

  // Create automation rules
  const automationRules = await Promise.all([
    prisma.automationRule.create({
      data: {
        name: 'Daily Backup Automation',
        trigger: 'SCHEDULED',
        action: 'SEND_NOTIFICATION',
        active: true,
        createdBy: users[0].id,
      },
    }),
    prisma.automationRule.create({
      data: {
        name: 'Task Overdue Notifications',
        trigger: 'TASK_OVERDUE',
        action: 'SEND_NOTIFICATION',
        active: true,
        createdBy: users[0].id,
      },
    }),
    prisma.automationRule.create({
      data: {
        name: 'Security Scan Automation',
        trigger: 'SCHEDULED',
        action: 'SEND_NOTIFICATION',
        active: true,
        createdBy: users[0].id,
      },
    }),
    prisma.automationRule.create({
      data: {
        name: 'Performance Monitoring',
        trigger: 'SCHEDULED',
        action: 'SEND_NOTIFICATION',
        active: true,
        createdBy: users[0].id,
      },
    }),
  ]);

  console.log(`🤖 Created ${automationRules.length} automation rules`);

  // Create notifications for automated tasks
  const notifications = [];
  for (const task of tasks.filter(t => t.isAutomated)) {
    const notification = await prisma.notification.create({
      data: {
        title: `Automated Task: ${task.title}`,
        message: `This is an automated task that runs on a schedule. Task ID: ${task.id}`,
        type: 'INFO',
        userId: users[0].id, // Admin gets notifications for automated tasks
      },
    });
    notifications.push(notification);
  }

  console.log(`🔔 Created ${notifications.length} notifications`);

  // Create demo issues
  const issueTemplates = [
    {
      title: 'Login page not loading on mobile devices',
      description: 'Users report that the login page fails to load completely on iOS and Android mobile browsers. The page appears to get stuck during authentication.',
      priority: 'HIGH',
      status: 'OPEN',
      roleLevel: 'EMPLOYEE',
      tags: 'bug, mobile, urgent'
    },
    {
      title: 'Database connection timeout during peak hours',
      description: 'Database connections are timing out between 2 PM - 4 PM when user traffic is highest. This is affecting all critical operations.',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      roleLevel: 'TEAM_LEAD',
      tags: 'performance, database, critical'
    },
    {
      title: 'Email notifications not being sent for task assignments',
      description: 'Team members are not receiving email notifications when new tasks are assigned to them. This has been happening for the past 3 days.',
      priority: 'MEDIUM',
      status: 'OPEN',
      roleLevel: 'EMPLOYEE',
      tags: 'email, notifications, bug'
    },
    {
      title: 'UI/UX: Dashboard charts are not responsive',
      description: 'The analytics charts on the dashboard do not resize properly on smaller screens, making them difficult to read on tablets and mobile devices.',
      priority: 'MEDIUM',
      status: 'OPEN',
      roleLevel: 'EMPLOYEE',
      tags: 'ui, responsive, dashboard'
    },
    {
      title: 'Security: Password reset tokens not expiring',
      description: 'Password reset tokens remain valid indefinitely, which poses a security risk. Tokens should expire after 24 hours.',
      priority: 'HIGH',
      status: 'RESOLVED',
      roleLevel: 'MANAGER',
      tags: 'security, authentication, resolved'
    },
    {
      title: 'Feature request: Bulk task assignment',
      description: 'It would be helpful to have the ability to assign multiple tasks to team members at once instead of doing it individually.',
      priority: 'LOW',
      status: 'OPEN',
      roleLevel: 'EMPLOYEE',
      tags: 'feature-request, enhancement'
    },
    {
      title: 'API rate limiting not working properly',
      description: 'The API rate limiting is not functioning as expected, allowing potential abuse. Some users are making thousands of requests per minute.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      roleLevel: 'TEAM_LEAD',
      tags: 'api, security, performance'
    },
    {
      title: 'File upload fails for files larger than 10MB',
      description: 'Users cannot upload files larger than 10MB, even though the system should support up to 50MB according to specifications.',
      priority: 'MEDIUM',
      status: 'OPEN',
      roleLevel: 'EMPLOYEE',
      tags: 'file-upload, bug, limit'
    },
    {
      title: 'Weekly reports are missing data from Monday',
      description: 'The automated weekly reports are not including data from Mondays, causing incomplete reporting for management.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      roleLevel: 'MANAGER',
      tags: 'reports, automation, resolved'
    },
    {
      title: 'Search functionality is slow with large datasets',
      description: 'The search feature takes more than 10 seconds to return results when searching through large project datasets.',
      priority: 'HIGH',
      status: 'OPEN',
      roleLevel: 'EMPLOYEE',
      tags: 'performance, search, optimization'
    },
    {
      title: 'User profile pictures are not displaying correctly',
      description: 'Profile pictures appear as broken images or do not load at all for some users, particularly those who recently uploaded new avatars.',
      priority: 'LOW',
      status: 'OPEN',
      roleLevel: 'EMPLOYEE',
      tags: 'ui, profile, bug'
    },
    {
      title: 'Critical: Data loss during concurrent edits',
      description: 'When multiple users edit the same task simultaneously, changes are being overwritten leading to data loss.',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      roleLevel: 'MANAGING_DIRECTOR',
      tags: 'critical, data-loss, concurrency'
    }
  ];

  const issues = [];
  for (let i = 0; i < issueTemplates.length; i++) {
    const template = issueTemplates[i];
    const reporter = users[Math.floor(Math.random() * users.length)];
    const assignee = Math.random() > 0.3 ? users[Math.floor(Math.random() * users.length)] : null;
    const project = Math.random() > 0.5 ? projects[Math.floor(Math.random() * projects.length)] : null;
    
    // Create varied raised dates
    const daysAgo = Math.floor(Math.random() * 30) + 1; // 1 to 30 days ago
    const raisedDate = new Date();
    raisedDate.setDate(raisedDate.getDate() - daysAgo);
    
    // Create expected end dates
    const expectedEndDate = new Date(raisedDate);
    expectedEndDate.setDate(expectedEndDate.getDate() + Math.floor(Math.random() * 14) + 1); // 1 to 14 days from raised date
    
    const issue = await prisma.issue.create({
      data: {
        title: template.title,
        description: template.description,
        priority: template.priority,
        status: template.status,
        reporterId: reporter.id,
        assignedTo: assignee?.id,
        roleLevel: template.roleLevel,
        projectId: project?.id,
        raisedDate: raisedDate,
        expectedEndDate: template.status === 'RESOLVED' ? null : expectedEndDate,
        tags: template.tags,
        createdAt: raisedDate,
        updatedAt: template.status === 'RESOLVED' ? new Date() : raisedDate,
      },
    });
    
    issues.push(issue);
  }

  console.log(`🐛 Created ${issues.length} issues`);

  // Create issue comments for realism
  const issueComments = [];
  const commentTemplates = [
    'I can reproduce this issue on my device.',
    'Working on a fix for this problem.',
    'This has been resolved in the latest deployment.',
    'Need more information about the environment where this occurs.',
    'Assigning to the development team for investigation.',
    'This is a high priority issue, please escalate.',
    'I have tested the fix and it works correctly.',
    'Adding more details to help with troubleshooting.',
    'This issue affects multiple users, needs immediate attention.',
    'Temporary workaround has been implemented.',
  ];

  for (const issue of issues) {
    if (Math.random() > 0.4) { // 60% of issues have comments
      const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments per issue
      
      for (let i = 0; i < numComments; i++) {
        const commenter = users[Math.floor(Math.random() * users.length)];
        const commentText = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
        
        // Create comment dates after the issue was raised
        const commentDate = new Date(issue.raisedDate);
        commentDate.setDate(commentDate.getDate() + Math.floor(Math.random() * 7) + 1);
        
        const comment = await prisma.issueComment.create({
          data: {
            message: commentText,
            issueId: issue.id,
            userId: commenter.id,
            createdAt: commentDate,
          },
        });
        
        issueComments.push(comment);
      }
    }
  }

  console.log(`💬 Created ${issueComments.length} issue comments`);

  // Summary statistics
  const totalTasks = await prisma.task.count();
  const completedTasks = await prisma.task.count({ where: { status: 'DONE' } });
  const inProgressTasks = await prisma.task.count({ where: { status: 'IN_PROGRESS' } });
  const todoTasks = await prisma.task.count({ where: { status: 'TODO' } });
  const overdueTasks = await prisma.task.count({
    where: { 
      dueDate: { lt: new Date() }, 
      status: { not: 'DONE' } 
    }
  });
  const automatedTasks = await prisma.task.count({ where: { isAutomated: true } });
  const openIssues = await prisma.issue.count({ where: { status: 'OPEN' } });
  const inProgressIssues = await prisma.issue.count({ where: { status: 'IN_PROGRESS' } });
  const resolvedIssues = await prisma.issue.count({ where: { status: 'RESOLVED' } });

  console.log('\n📊 Database Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Projects: ${projects.length} (${projects.filter(p => p.status === 'IN_PROGRESS').length} active, ${projects.filter(p => p.status === 'COMPLETED').length} completed, ${projects.filter(p => p.status === 'PLANNING').length} planning, ${projects.filter(p => p.status === 'ON_HOLD').length} on hold)`);
  console.log(`   Tasks: ${totalTasks} total`);
  console.log(`   - Completed: ${completedTasks} (${Math.round(completedTasks/totalTasks*100)}%)`);
  console.log(`   - In Progress: ${inProgressTasks} (${Math.round(inProgressTasks/totalTasks*100)}%)`);
  console.log(`   - TODO: ${todoTasks} (${Math.round(todoTasks/totalTasks*100)}%)`);
  console.log(`   - Overdue: ${overdueTasks}`);
  console.log(`   - Automated: ${automatedTasks} (${Math.round(automatedTasks/totalTasks*100)}%)`);
  console.log(`   Issues: ${issues.length} total`);
  console.log(`   - Open: ${openIssues} (${Math.round(openIssues/issues.length*100)}%)`);
  console.log(`   - In Progress: ${inProgressIssues} (${Math.round(inProgressIssues/issues.length*100)}%)`);
  console.log(`   - Resolved: ${resolvedIssues} (${Math.round(resolvedIssues/issues.length*100)}%)`);
  console.log(`   - Comments: ${issueComments.length}`);
  console.log(`   Milestones: ${milestones.length}`);
  console.log(`   Activities: ${activities.length}`);
  console.log(`   Timesheets: ${timesheets.length}`);
  console.log(`   Automation Rules: ${automationRules.length}`);
  console.log(`   Notifications: ${notifications.length}`);
  console.log(`   Reports: ${reports.length} (4 sample reports for testing)`);
  
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
        projectId: projects[0].id,
        data: JSON.stringify({
          projectName: projects[0].name,
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
        projectId: projects[1].id,
        data: JSON.stringify({
          projectName: projects[1].name,
          totalHours: 320,
          billableHours: 280,
          nonBillableHours: 40,
          averageHoursPerTask: 8.5,
          topPerformer: users[1].name,
          tasksCompleted: 12,
        }),
        createdById: users[1].id,
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

  console.log(`📊 Created ${reports.length} reports`);

  console.log('\n🎉 Dummy data creation complete!');
  console.log('\n🔐 Login credentials:');
  console.log('   Email: admin@workforce.io');
  console.log('   Password: password');
}

main()
  .catch((e) => {
    console.error('❌ Error creating dummy data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
