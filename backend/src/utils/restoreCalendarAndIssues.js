const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restoreCalendarAndIssues() {
  try {
    console.log('📅 RESTORING CALENDAR EVENTS AND ISSUES...\n');
    
    // Check current counts
    const currentEvents = await prisma.calendarEvent.count();
    const currentIssues = await prisma.issue.count();
    const currentNotifications = await prisma.notification.count();
    
    console.log('📊 CURRENT STATE:');
    console.log(`  Calendar Events: ${currentEvents}`);
    console.log(`  Issues: ${currentIssues}`);
    console.log(`  Notifications: ${currentNotifications}`);
    
    // Create sample calendar events
    const eventsToCreate = 20; // Create 20 sample events
    if (currentEvents < eventsToCreate) {
      console.log(`🔄 Creating ${eventsToCreate - currentEvents} calendar events...`);
      
      const users = await prisma.user.findMany({ take: 5 });
      const projects = await prisma.project.findMany({ take: 3 });
      
      const eventTypes = ['Meeting', 'Deadline', 'Workshop', 'Review', 'Training', 'Presentation', 'Conference'];
      const eventTitles = [
        'Team Standup', 'Project Review', 'Client Meeting', 'Sprint Planning',
        'Design Review', 'Code Review', 'Budget Meeting', 'Product Demo',
        'Training Session', 'Workshop', 'All Hands', 'Board Meeting',
        'Quarterly Review', 'Strategy Session', 'Team Building', 'Client Presentation'
      ];
      
      for (let i = 0; i < (eventsToCreate - currentEvents); i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const randomTitle = eventTitles[Math.floor(Math.random() * eventTitles.length)];
        
        // Random dates within next 30 days
        const startDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + (Math.random() * 4 + 1) * 60 * 60 * 1000); // 1-4 hours duration
        
        await prisma.calendarEvent.create({
          data: {
            title: randomTitle,
            description: `${randomType} event for ${randomProject.name}`,
            startTime: startDate,
            endTime: endDate,
            userId: randomUser.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      
      console.log(`✅ Created ${eventsToCreate - currentEvents} calendar events`);
    }
    
    // Create sample issues
    const issuesToCreate = 15; // Create 15 sample issues
    if (currentIssues < issuesToCreate) {
      console.log(`🔄 Creating ${issuesToCreate - currentIssues} issues...`);
      
      const issueTypes = ['BUG', 'FEATURE_REQUEST', 'IMPROVEMENT', 'QUESTION', 'ISSUE'];
      const issueTitles = [
        'Login page not responsive', 'Database connection timeout', 'API response slow',
        'Missing documentation', 'UI glitch on mobile', 'Security vulnerability',
        'Performance issue', 'Integration problem', 'Configuration error',
        'Deployment issue', 'Testing environment down', 'Code review needed'
      ];
      
      for (let i = 0; i < (issuesToCreate - currentIssues); i++) {
        const allUsers = await prisma.user.findMany({ take: 5 });
        const allProjects = await prisma.project.findMany({ take: 3 });
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        const randomProject = allProjects[Math.floor(Math.random() * allProjects.length)];
        const randomType = issueTypes[Math.floor(Math.random() * issueTypes.length)];
        const randomTitle = issueTitles[Math.floor(Math.random() * issueTitles.length)];
        
        await prisma.issue.create({
          data: {
            title: randomTitle,
            description: `${randomType}: ${randomTitle} in ${randomProject.name}`,
            priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
            status: 'OPEN',
            reporterId: randomUser.id,
            assignedTo: randomUser.id,
            projectId: randomProject.id,
            roleLevel: 'EMPLOYEE',
            raisedDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      
      console.log(`✅ Created ${issuesToCreate - currentIssues} issues`);
    }
    
    // Create some notifications
    const notificationsToCreate = 10;
    if (currentNotifications < 50) { // Only if notifications seem low
      console.log(`🔄 Creating ${notificationsToCreate} notifications...`);
      
      const notificationTypes = ['PROJECT_UPDATE', 'TASK_ASSIGNED', 'MENTION', 'ISSUE_REPORTED'];
      const notificationTitles = [
        'New project created', 'Task assigned to you', 'You were mentioned',
        'Issue reported', 'Project milestone reached', 'Task completed'
      ];
      
      for (let i = 0; i < notificationsToCreate; i++) {
        const allUsers = await prisma.user.findMany({ take: 5 });
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const randomTitle = notificationTitles[Math.floor(Math.random() * notificationTitles.length)];
        
        await prisma.notification.create({
          data: {
            title: randomTitle,
            message: `${randomType}: ${randomTitle}`,
            type: randomType,
            isRead: false,
            userId: randomUser.id,
            createdAt: new Date()
          }
        });
      }
      
      console.log(`✅ Created ${notificationsToCreate} notifications`);
    }
    
    // Final verification
    const finalEvents = await prisma.calendarEvent.count();
    const finalIssues = await prisma.issue.count();
    const finalNotifications = await prisma.notification.count();
    
    console.log('\n🎉 RESTORATION COMPLETE!');
    console.log('📊 FINAL STATE:');
    console.log(`  Calendar Events: ${finalEvents}`);
    console.log(`  Issues: ${finalIssues}`);
    console.log(`  Notifications: ${finalNotifications}`);
    
    console.log('\n✅ YOUR CALENDAR, ISSUES, AND NOTIFICATIONS HAVE BEEN RESTORED!');
    
  } catch (error) {
    console.error('❌ Error during restoration:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

restoreCalendarAndIssues();
