const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDemoIssues() {
  try {
    console.log('=== ADDING DEMO ISSUES ===\n');

    // Get existing projects and users
    const projects = await prisma.project.findMany({
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    const users = await prisma.user.findMany({
      where: {
        isActive: true
      }
    });

    console.log(`Found ${projects.length} projects and ${users.length} users`);

    if (projects.length === 0 || users.length === 0) {
      console.log('❌ No projects or users found. Please create some first.');
      return;
    }

    // Check if issues already exist
    const existingIssues = await prisma.issue.count();
    console.log(`Current issues count: ${existingIssues}`);

    if (existingIssues > 0) {
      console.log('✅ Issues already exist. Skipping demo issues creation.');
      return;
    }

    // Demo issues data
    const demoIssues = [
      {
        title: "Fix responsive design on mobile devices",
        description: "The website layout breaks on mobile screens smaller than 768px. Need to implement proper responsive design with CSS Grid and Flexbox.",
        status: "OPEN",
        priority: "HIGH",
        projectId: projects[0]?.id,
        assignedTo: users[0]?.id,
        reporterId: users[0]?.id,
        tags: "bug,frontend,mobile"
      },
      {
        title: "Implement user authentication system",
        description: "Need to add JWT-based authentication with login/logout functionality, password hashing, and session management.",
        status: "IN_PROGRESS",
        priority: "CRITICAL",
        projectId: projects[0]?.id,
        assignedTo: users[1]?.id,
        reporterId: users[0]?.id,
        tags: "feature,backend,security"
      },
      {
        title: "Optimize database queries for performance",
        description: "Several API endpoints are slow due to N+1 query problems. Need to implement proper eager loading and query optimization.",
        status: "OPEN",
        priority: "MEDIUM",
        projectId: projects[1]?.id,
        assignedTo: users[2]?.id,
        reporterId: users[1]?.id,
        tags: "performance,backend,database"
      },
      {
        title: "Add dark mode toggle feature",
        description: "Users have requested a dark mode option. Need to implement theme switching with localStorage persistence.",
        status: "TODO",
        priority: "LOW",
        projectId: projects[1]?.id,
        assignedTo: users[3]?.id,
        reporterId: users[2]?.id,
        tags: "feature,frontend,ui"
      },
      {
        title: "Fix memory leak in image upload component",
        description: "Memory usage increases significantly when uploading multiple images. Need to properly clean up event listeners and blob URLs.",
        status: "OPEN",
        priority: "HIGH",
        projectId: projects[2]?.id,
        assignedTo: users[4]?.id,
        reporterId: users[3]?.id,
        tags: "bug,frontend,performance"
      },
      {
        title: "Implement real-time notifications",
        description: "Add WebSocket support for real-time notifications when tasks are updated or comments are added.",
        status: "TODO",
        priority: "MEDIUM",
        projectId: projects[2]?.id,
        assignedTo: users[5]?.id,
        reporterId: users[4]?.id,
        tags: "feature,backend,websocket"
      },
      {
        title: "Update documentation for API endpoints",
        description: "API documentation is outdated. Need to update with new endpoints and add examples for all CRUD operations.",
        status: "IN_PROGRESS",
        priority: "LOW",
        projectId: projects[3]?.id,
        assignedTo: users[6]?.id,
        reporterId: users[5]?.id,
        tags: "documentation,api"
      },
      {
        title: "Add unit tests for critical functions",
        description: "Code coverage is low. Need to add unit tests for core business logic and utility functions.",
        status: "TODO",
        priority: "MEDIUM",
        projectId: projects[3]?.id,
        assignedTo: users[7]?.id,
        reporterId: users[6]?.id,
        tags: "testing,quality"
      },
      {
        title: "Fix CORS issues in development environment",
        description: "Frontend cannot connect to backend in development due to CORS configuration problems.",
        status: "OPEN",
        priority: "HIGH",
        projectId: projects[4]?.id,
        assignedTo: users[8]?.id,
        reporterId: users[7]?.id,
        tags: "bug,backend,devops"
      },
      {
        title: "Implement data export functionality",
        description: "Users need to export project data to CSV and PDF formats. Need to add export buttons and proper formatting.",
        status: "TODO",
        priority: "LOW",
        projectId: projects[4]?.id,
        assignedTo: users[9]?.id,
        reporterId: users[8]?.id,
        tags: "feature,export"
      }
    ];

    // Create issues
    console.log('\n📝 Creating demo issues...');
    const createdIssues = [];

    for (const issueData of demoIssues) {
      try {
        const issue = await prisma.issue.create({
          data: issueData
        });
        createdIssues.push(issue);
        console.log(`✅ Created issue: ${issue.title}`);
      } catch (error) {
        console.error(`❌ Failed to create issue: ${issueData.title}`, error.message);
      }
    }

    // Verify created issues
    const totalIssues = await prisma.issue.count();
    console.log(`\n📊 Total issues in database: ${totalIssues}`);

    if (createdIssues.length > 0) {
      console.log(`\n✅ Successfully created ${createdIssues.length} demo issues!`);
      console.log('\n📋 Issues Summary:');
      createdIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.title} - ${issue.status} (${issue.priority})`);
      });
    }

  } catch (error) {
    console.error('❌ Error adding demo issues:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDemoIssues();
