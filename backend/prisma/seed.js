const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.fIUHOiqkQSzl_6k_KH2n3g_2kbFWCgB@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
    }
  }
});

async function main() {
  console.log('Seeding database...');

  // Create admin/Managing Director
  const hashedPassword = await bcrypt.hash('password', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@projectflow.io' },
    update: {},
    create: {
      email: 'admin@projectflow.io',
      password: hashedPassword,
      name: 'Admin Director',
      role: 'MANAGING_DIRECTOR',
      department: 'Executive',
    },
  });

  const hrManager = await prisma.user.upsert({
    where: { email: 'hr@projectflow.io' },
    update: {},
    create: {
      email: 'hr@projectflow.io',
      password: hashedPassword,
      name: 'Sarah HR',
      role: 'HR_MANAGER',
      department: 'Human Resources',
    },
  });

  const teamLead = await prisma.user.upsert({
    where: { email: 'lead@projectflow.io' },
    update: {},
    create: {
      email: 'lead@projectflow.io',
      password: hashedPassword,
      name: 'Mike Lead',
      role: 'TEAM_LEAD',
      department: 'Engineering',
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@projectflow.io' },
    update: {},
    create: {
      email: 'employee@projectflow.io',
      password: hashedPassword,
      name: 'Jane Employee',
      role: 'EMPLOYEE',
      department: 'Engineering',
    },
  });

  // Create additional Managers
  const manager1 = await prisma.user.upsert({
    where: { email: 'manager1@projectflow.io' },
    update: {},
    create: {
      email: 'manager1@projectflow.io',
      password: hashedPassword,
      name: 'John Manager',
      role: 'MANAGER',
      department: 'Sales',
    },
  });

  const manager2 = await prisma.user.upsert({
    where: { email: 'manager2@projectflow.io' },
    update: {},
    create: {
      email: 'manager2@projectflow.io',
      password: hashedPassword,
      name: 'Lisa Manager',
      role: 'MANAGER',
      department: 'Marketing',
    },
  });

  // Create additional Team Leads
  const teamLead2 = await prisma.user.upsert({
    where: { email: 'teamlead2@projectflow.io' },
    update: {},
    create: {
      email: 'teamlead2@projectflow.io',
      password: hashedPassword,
      name: 'Tom Lead',
      role: 'TEAM_LEAD',
      department: 'Design',
    },
  });

  const teamLead3 = await prisma.user.upsert({
    where: { email: 'teamlead3@projectflow.io' },
    update: {},
    create: {
      email: 'teamlead3@projectflow.io',
      password: hashedPassword,
      name: 'Anna Lead',
      role: 'TEAM_LEAD',
      department: 'Quality Assurance',
    },
  });

  // Create more Employees
  const employees = [
    { email: 'emp1@projectflow.io', name: 'Robert Employee', department: 'Engineering' },
    { email: 'emp2@projectflow.io', name: 'Maria Employee', department: 'Engineering' },
    { email: 'emp3@projectflow.io', name: 'David Employee', department: 'Sales' },
    { email: 'emp4@projectflow.io', name: 'Emma Employee', department: 'Marketing' },
    { email: 'emp5@projectflow.io', name: 'James Employee', department: 'Design' },
    { email: 'emp6@projectflow.io', name: 'Sophia Employee', department: 'Quality Assurance' },
    { email: 'emp7@projectflow.io', name: 'Oliver Employee', department: 'Engineering' },
    { email: 'emp8@projectflow.io', name: 'Isabella Employee', department: 'Sales' },
  ];

  for (const emp of employees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email: emp.email,
        password: hashedPassword,
        name: emp.name,
        role: emp.role || 'MANAGER', // Default to "Manager" if no role specified
        department: emp.department,
      },
    });
  }

  // Create a sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      name: 'ProjectFlow CRM Development',
      description: 'Development of comprehensive CRM system with customer management, sales tracking, and analytics dashboard.',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      budget: 50000,
      color: '#00A1C7',
      tags: 'crm,backend,frontend,database',
      ownerId: admin.id,
    },
  });

  // Add project members
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: teamLead.id } },
    update: {},
    create: { projectId: project.id, userId: teamLead.id, roleInProject: 'LEAD' },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: employee.id } },
    update: {},
    create: { projectId: project.id, userId: employee.id, roleInProject: 'CONTRIBUTOR' },
  });

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Design Homepage Mockup',
      description: 'Create wireframes and high-fidelity mockups for the homepage.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2024-06-30'),
      estimatedHours: 20,
      projectId: project.id,
      assigneeId: employee.id,
      creatorId: teamLead.id,
      tags: 'design,ui',
    },
  });

  await prisma.task.create({
    data: {
      title: 'Setup Development Environment',
      description: 'Configure dev environment with all required tools and dependencies.',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: new Date('2024-05-15'),
      estimatedHours: 8,
      projectId: project.id,
      assigneeId: employee.id,
      creatorId: teamLead.id,
      tags: 'setup',
    },
  });

  await prisma.task.create({
    data: {
      title: 'Implement Authentication System',
      description: 'Build login, registration, and JWT-based auth.',
      status: 'TODO',
      priority: 'CRITICAL',
      dueDate: new Date('2024-07-15'),
      estimatedHours: 40,
      projectId: project.id,
      assigneeId: employee.id,
      creatorId: teamLead.id,
      tags: 'backend,security',
    },
  });

  // Create milestone
  await prisma.milestone.create({
    data: {
      name: 'Phase 1 Launch',
      targetDate: new Date('2024-06-30'),
      projectId: project.id,
    },
  });

  // Create additional demo projects
  const project2 = await prisma.project.upsert({
    where: { id: 'sample-project-2' },
    update: {},
    create: {
      id: 'sample-project-2',
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android platforms with real-time synchronization.',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-11-30'),
      budget: 75000,
      color: '#FF6826',
      tags: 'mobile,ios,android,react-native',
      ownerId: manager1.id,
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: 'sample-project-3' },
    update: {},
    create: {
      id: 'sample-project-3',
      name: 'Data Analytics Platform',
      description: 'Advanced analytics platform with machine learning capabilities and real-time data processing.',
      status: 'PLANNING',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-10-31'),
      budget: 120000,
      color: '#8B5CF6',
      tags: 'analytics,machine-learning,data-science',
      ownerId: manager2.id,
    },
  });

  // Add tasks for additional projects
  await prisma.task.create({
    data: {
      title: 'Design Mobile UI/UX',
      description: 'Create wireframes and mockups for mobile application interface.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2024-08-15'),
      estimatedHours: 40,
      projectId: project2.id,
      assigneeId: teamLead2.id,
      creatorId: manager1.id,
      tags: 'design,ui,ux',
    },
  });

  await prisma.task.create({
    data: {
      title: 'Implement Authentication',
      description: 'Build secure authentication system with biometric support.',
      status: 'TODO',
      priority: 'CRITICAL',
      dueDate: new Date('2024-09-01'),
      estimatedHours: 60,
      projectId: project2.id,
      assigneeId: employee.id,
      creatorId: teamLead2.id,
      tags: 'authentication,security,mobile',
    },
  });

  await prisma.task.create({
    data: {
      title: 'Setup Data Pipeline',
      description: 'Configure ETL pipeline for data processing and analysis.',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date('2024-09-15'),
      estimatedHours: 80,
      projectId: project3.id,
      assigneeId: teamLead3.id,
      creatorId: manager2.id,
      tags: 'data,pipeline,analytics',
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      title: 'Welcome to ProjectFlow!',
      message: 'Your account has been set up. Start exploring projects.',
      type: 'INFO',
      userId: admin.id,
    },
  });

  console.log('Seed completed!');
  console.log('Accounts:');
  console.log('  admin@projectflow.io / password (Managing Director)');
  console.log('  hr@projectflow.io / password (HR Manager)');
  console.log('  manager1@projectflow.io / password (Manager - Sales)');
  console.log('  manager2@projectflow.io / password (Manager - Marketing)');
  console.log('  lead@projectflow.io / password (Team Lead - Engineering)');
  console.log('  teamlead2@projectflow.io / password (Team Lead - Design)');
  console.log('  teamlead3@projectflow.io / password (Team Lead - QA)');
  console.log('  employee@projectflow.io / password (Employee - Engineering)');
  console.log('  emp1@projectflow.io / password (Employee - Engineering)');
  console.log('  emp2@projectflow.io / password (Employee - Engineering)');
  console.log('  emp3@projectflow.io / password (Employee - Sales)');
  console.log('  emp4@projectflow.io / password (Employee - Marketing)');
  console.log('  emp5@projectflow.io / password (Employee - Design)');
  console.log('  emp6@projectflow.io / password (Employee - QA)');
  console.log('  emp7@projectflow.io / password (Employee - Engineering)');
  console.log('  emp8@projectflow.io / password (Employee - Sales)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
