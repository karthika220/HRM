const { Pool } = require('pg');
const { randomUUID } = require('crypto');

// Create a PostgreSQL connection pool (same as database.js)
const pool = new Pool({
  user: 'postgres.ulapsnjzjtmzdysmello',
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  database: 'postgres',
  password: 'Profitcast@2026',
  port: 5432,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
});

// Database query helper
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Safe seeding function - only inserts if table is empty
async function safeSeed(tableName, seedData, insertQuery) {
  try {
    // Check if table is empty
    const countResult = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
    const count = parseInt(countResult.rows[0].count);
    
    if (count > 0) {
      console.log(`⚠️  ${tableName} already has ${count} records. Skipping seeding.`);
      return;
    }
    
    console.log(`🌱 Seeding ${tableName}...`);
    
    // Insert demo data
    for (const data of seedData) {
      await query(insertQuery, Object.values(data));
    }
    
    console.log(`✅ ${tableName} seeded successfully with ${seedData.length} records.`);
  } catch (error) {
    console.error(`❌ Error seeding ${tableName}:`, error.message);
  }
}

// Demo data for each table
const demoProjects = [
  {
    id: randomUUID(),
    name: 'Website Redesign',
    description: 'Complete website redesign with modern UI/UX',
    status: 'ACTIVE',
    start_date: '2024-01-15',
    end_date: '2024-03-15',
    budget: 25000,
    color: '#00A1C7',
    tags: ['Web Development', 'UI/UX', 'Frontend'],
    services: ['Web Development', 'UI Design', 'SEO', 'Content'],
    member_ids: [randomUUID(), randomUUID(), randomUUID()],
    created_by: randomUUID(),
    owner_ids: [randomUUID()],
    progress: 75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    name: 'Mobile App v2.0',
    description: 'Native mobile application with React Native',
    status: 'IN_PROGRESS',
    start_date: '2024-02-01',
    end_date: '2024-04-15',
    budget: 35000,
    color: '#FF6B6B',
    tags: ['Mobile Development', 'React Native', 'iOS', 'Android'],
    services: ['Mobile Development', 'Backend API', 'Database'],
    member_ids: [randomUUID(), randomUUID(), randomUUID()],
    created_by: randomUUID(),
    owner_ids: [randomUUID()],
    progress: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    name: 'Security Audit',
    description: 'Comprehensive security assessment and recommendations',
    status: 'COMPLETED',
    start_date: '2023-12-01',
    end_date: '2024-01-15',
    budget: 15000,
    color: '#10B981',
    tags: ['Security', 'Audit', 'Compliance', 'Risk Assessment'],
    services: ['Security Testing', 'Penetration Testing', 'Documentation'],
    member_ids: [randomUUID(), randomUUID(), randomUUID()],
    created_by: randomUUID(),
    owner_ids: [randomUUID()],
    progress: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    name: 'Data Migration',
    description: 'Database migration and optimization',
    status: 'ON_HOLD',
    start_date: '2024-03-01',
    end_date: '2024-05-15',
    budget: 20000,
    color: '#F59E0B',
    tags: ['Database', 'Migration', 'Optimization'],
    services: ['Database Design', 'Data Engineering', 'ETL'],
    member_ids: [randomUUID(), randomUUID(), randomUUID()],
    created_by: randomUUID(),
    owner_ids: [randomUUID()],
    progress: 30,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    name: 'API Development',
    description: 'RESTful API development and documentation',
    status: 'ACTIVE',
    start_date: '2024-01-10',
    end_date: '2024-03-10',
    budget: 18000,
    color: '#06B6D4',
    tags: ['Backend', 'API', 'Documentation'],
    services: ['Node.js', 'Express', 'MongoDB'],
    member_ids: [randomUUID(), randomUUID(), randomUUID()],
    created_by: randomUUID(),
    owner_ids: [randomUUID()],
    progress: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const demoTasks = [
  {
    id: randomUUID(),
    title: 'Design landing page mockup',
    description: 'Create high-fidelity mockup for the new landing page design',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due_date: '2024-03-01',
    project_id: demoProjects[0].id,
    assignee_id: randomUUID(),
    assigner_id: randomUUID(),
    owner_id: randomUUID(),
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-20T14:30:00Z',
    comments_count: 3
  },
  {
    id: randomUUID(),
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication system to the mobile app',
    status: 'TODO',
    priority: 'CRITICAL',
    due_date: '2024-02-28',
    project_id: demoProjects[1].id,
    assignee_id: randomUUID(),
    assigner_id: randomUUID(),
    owner_id: randomUUID(),
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-02-18T16:00:00Z',
    comments_count: 5
  },
  {
    id: randomUUID(),
    title: 'Database schema optimization',
    description: 'Optimize database queries and add proper indexing',
    status: 'DONE',
    priority: 'MEDIUM',
    due_date: '2024-02-15',
    project_id: demoProjects[3].id,
    assignee_id: randomUUID(),
    assigner_id: randomUUID(),
    owner_id: randomUUID(),
    created_at: '2024-02-01T11:00:00Z',
    updated_at: '2024-02-14T15:30:00Z',
    comments_count: 2
  },
  {
    id: randomUUID(),
    title: 'Write API documentation',
    description: 'Create comprehensive documentation for all API endpoints',
    status: 'IN_REVIEW',
    priority: 'LOW',
    due_date: '2024-03-05',
    project_id: demoProjects[4].id,
    assignee_id: randomUUID(),
    assigner_id: randomUUID(),
    owner_id: randomUUID(),
    created_at: '2024-02-12T13:00:00Z',
    updated_at: '2024-02-22T10:15:00Z',
    comments_count: 1
  },
  {
    id: randomUUID(),
    title: 'Security vulnerability assessment',
    description: 'Conduct thorough security assessment of the application',
    status: 'TODO',
    priority: 'HIGH',
    due_date: '2024-02-25',
    project_id: demoProjects[2].id,
    assignee_id: randomUUID(),
    assigner_id: randomUUID(),
    owner_id: randomUUID(),
    created_at: '2024-02-08T14:00:00Z',
    updated_at: '2024-02-19T09:45:00Z',
    comments_count: 4
  },
  {
    id: randomUUID(),
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment pipeline',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    due_date: '2024-03-10',
    project_id: demoProjects[0].id,
    assignee_id: randomUUID(),
    assigner_id: randomUUID(),
    owner_id: randomUUID(),
    created_at: '2024-02-14T10:30:00Z',
    updated_at: '2024-02-21T16:20:00Z',
    comments_count: 2
  },
  {
    id: randomUUID(),
    title: 'Performance testing',
    description: 'Run comprehensive performance tests on the application',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: '2024-03-15',
    project_id: demoProjects[1].id,
    assignee_id: randomUUID(),
    assigner_id: randomUUID(),
    owner_id: randomUUID(),
    created_at: '2024-02-16T11:15:00Z',
    updated_at: '2024-02-20T13:45:00Z',
    comments_count: 0
  },
  {
    id: randomUUID(),
    title: 'User acceptance testing',
    description: 'Coordinate UAT sessions with stakeholders',
    status: 'TODO',
    priority: 'LOW',
    due_date: '2024-03-20',
    project_id: demoProjects[2].id,
    assignee_id: randomUUID(),
    assigner_id: randomUUID(),
    owner_id: randomUUID(),
    created_at: '2024-02-18T15:00:00Z',
    updated_at: '2024-02-22T14:10:00Z',
    comments_count: 1
  },
  {
    id: randomUUID(),
    title: 'Data backup strategy',
    description: 'Implement automated backup and recovery procedures',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due_date: '2024-02-27',
    project_id: demoProjects[3].id,
    assignee_id: randomUUID(),
    assigner_id: randomUUID(),
    owner_id: randomUUID(),
    created_at: '2024-02-11T09:30:00Z',
    updated_at: '2024-02-21T11:25:00Z',
    comments_count: 3
  },
  {
    id: randomUUID(),
    title: 'Code review and refactoring',
    description: 'Review existing code and implement refactoring improvements',
    status: 'DONE',
    priority: 'MEDIUM',
    due_date: '2024-02-20',
    project_id: demoProjects[4].id,
    assignee_id: randomUUID(),
    assigner_id: randomUUID(),
    owner_id: randomUUID(),
    created_at: '2024-02-05T12:00:00Z',
    updated_at: '2024-02-19T17:30:00Z',
    comments_count: 6
  }
];

const demoIssues = [
  {
    id: randomUUID(),
    title: 'Critical security vulnerability in authentication',
    description: 'A critical security vulnerability has been discovered in the authentication system that could allow unauthorized access to user accounts.',
    priority: 'CRITICAL',
    status: 'OPEN',
    reporter_id: randomUUID(),
    assigned_to_id: randomUUID(),
    role_level: 'MANAGER',
    project_id: demoProjects[0].id,
    created_at: '2024-02-20T09:00:00Z',
    updated_at: '2024-02-20T09:00:00Z'
  },
  {
    id: randomUUID(),
    title: 'Performance issues with mobile app loading',
    description: 'Users are reporting slow loading times and occasional crashes when using the mobile application on iOS devices.',
    priority: 'HIGH',
    status: 'IN_REVIEW',
    reporter_id: randomUUID(),
    assigned_to_id: randomUUID(),
    role_level: 'TL',
    project_id: demoProjects[1].id,
    created_at: '2024-02-18T14:30:00Z',
    updated_at: '2024-02-22T10:15:00Z'
  },
  {
    id: randomUUID(),
    title: 'UI inconsistency in dashboard components',
    description: 'There are several UI inconsistencies across different dashboard components that need to be standardized for better user experience.',
    priority: 'MEDIUM',
    status: 'OPEN',
    reporter_id: randomUUID(),
    assigned_to_id: randomUUID(),
    role_level: 'EMPLOYEE',
    project_id: demoProjects[2].id,
    created_at: '2024-02-19T11:00:00Z',
    updated_at: '2024-02-19T11:00:00Z'
  },
  {
    id: randomUUID(),
    title: 'Missing documentation for API endpoints',
    description: 'Several API endpoints lack proper documentation, making it difficult for developers to integrate with the system.',
    priority: 'LOW',
    status: 'WAITING_REPLY',
    reporter_id: randomUUID(),
    assigned_to_id: randomUUID(),
    role_level: 'EMPLOYEE',
    project_id: demoProjects[3].id,
    created_at: '2024-02-17T16:45:00Z',
    updated_at: '2024-02-21T09:30:00Z'
  },
  {
    id: randomUUID(),
    title: 'Database connection timeout errors',
    description: 'Intermittent database connection timeout errors are occurring during peak usage hours, affecting system reliability.',
    priority: 'HIGH',
    status: 'RESOLVED',
    reporter_id: randomUUID(),
    assigned_to_id: randomUUID(),
    role_level: 'TL',
    project_id: demoProjects[4].id,
    created_at: '2024-02-15T10:20:00Z',
    updated_at: '2024-02-23T14:00:00Z'
  }
];

const demoTimesheets = [
  {
    id: randomUUID(),
    task_id: demoTasks[0].id,
    date: '2024-02-20',
    start_time: '09:00',
    end_time: '17:00',
    hours: 8,
    work_type: 'BILLABLE',
    notes: 'Completed wireframes and initial design concepts',
    status: 'APPROVED',
    employee_id: randomUUID(),
    created_at: '2024-02-20T17:00:00Z',
    updated_at: '2024-02-20T17:00:00Z'
  },
  {
    id: randomUUID(),
    task_id: demoTasks[1].id,
    date: '2024-02-20',
    start_time: '09:30',
    end_time: '17:30',
    hours: 8,
    work_type: 'BILLABLE',
    notes: 'JWT implementation with refresh tokens',
    status: 'PENDING',
    employee_id: randomUUID(),
    created_at: '2024-02-20T17:30:00Z',
    updated_at: '2024-02-20T17:30:00Z'
  },
  {
    id: randomUUID(),
    task_id: demoTasks[2].id,
    date: '2024-02-19',
    start_time: '10:00',
    end_time: '18:00',
    hours: 8,
    work_type: 'BILLABLE',
    notes: 'Index optimization and query performance improvements',
    status: 'APPROVED',
    employee_id: randomUUID(),
    created_at: '2024-02-19T18:00:00Z',
    updated_at: '2024-02-19T18:00:00Z'
  },
  {
    id: randomUUID(),
    task_id: demoTasks[3].id,
    date: '2024-02-19',
    start_time: '09:00',
    end_time: '13:00',
    hours: 4,
    work_type: 'NON_BILLABLE',
    notes: 'Documentation for REST API endpoints',
    status: 'APPROVED',
    employee_id: randomUUID(),
    created_at: '2024-02-19T13:00:00Z',
    updated_at: '2024-02-19T13:00:00Z'
  },
  {
    id: randomUUID(),
    task_id: demoTasks[4].id,
    date: '2024-02-18',
    start_time: '08:00',
    end_time: '16:00',
    hours: 8,
    work_type: 'BILLABLE',
    notes: 'Comprehensive security audit and recommendations',
    status: 'REJECTED',
    employee_id: randomUUID(),
    created_at: '2024-02-18T16:00:00Z',
    updated_at: '2024-02-18T16:00:00Z'
  }
];

const demoTeamMembers = [
  {
    id: randomUUID(),
    name: 'Emma Davis',
    email: 'emma.davis@company.com',
    role: 'Team Lead',
    department: 'Engineering',
    active_task_count: 8,
    has_direct_reports: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Senior Developer',
    department: 'Engineering',
    active_task_count: 6,
    has_direct_reports: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'Developer',
    department: 'Engineering',
    active_task_count: 4,
    has_direct_reports: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    role: 'Project Manager',
    department: 'Sales',
    active_task_count: 5,
    has_direct_reports: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    name: 'Lisa Brown',
    email: 'lisa.brown@company.com',
    role: 'HR Manager',
    department: 'HR',
    active_task_count: 3,
    has_direct_reports: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    name: 'Robert Taylor',
    email: 'robert.taylor@company.com',
    role: 'Marketing Specialist',
    department: 'Marketing',
    active_task_count: 7,
    has_direct_reports: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const demoCalendarEvents = [
  {
    id: randomUUID(),
    title: 'Team Meeting - Project Kickoff',
    description: 'Initial project kickoff meeting with all stakeholders',
    start_time: '2024-02-28T10:00:00Z',
    end_time: '2024-02-28T11:00:00Z',
    reminder_at: '2024-02-28T09:30:00Z',
    user_id: randomUUID(),
    linked_task_id: demoTasks[0].id,
    linked_issue_id: null,
    created_at: '2024-02-20T09:00:00Z',
    updated_at: '2024-02-20T09:00:00Z'
  },
  {
    id: randomUUID(),
    title: 'Design Review Session',
    description: 'Review and approve landing page design mockups',
    start_time: '2024-02-28T14:00:00Z',
    end_time: '2024-02-28T15:30:00Z',
    reminder_at: '2024-02-28T13:30:00Z',
    user_id: randomUUID(),
    linked_task_id: demoTasks[0].id,
    linked_issue_id: null,
    created_at: '2024-02-21T10:00:00Z',
    updated_at: '2024-02-21T10:00:00Z'
  },
  {
    id: randomUUID(),
    title: 'Sprint Planning',
    description: 'Q1 sprint planning and task allocation',
    start_time: '2024-02-29T09:00:00Z',
    end_time: '2024-02-29T10:30:00Z',
    reminder_at: '2024-02-28T17:00:00Z',
    user_id: randomUUID(),
    linked_task_id: demoTasks[1].id,
    linked_issue_id: null,
    created_at: '2024-02-22T14:00:00Z',
    updated_at: '2024-02-22T14:00:00Z'
  },
  {
    id: randomUUID(),
    title: 'Client Presentation',
    description: 'Present project progress to client',
    start_time: '2024-03-01T15:00:00Z',
    end_time: '2024-03-01T16:30:00Z',
    reminder_at: '2024-03-01T14:00:00Z',
    user_id: randomUUID(),
    linked_task_id: null,
    linked_issue_id: demoIssues[0].id,
    created_at: '2024-02-23T11:00:00Z',
    updated_at: '2024-02-23T11:00:00Z'
  }
];

const demoAutomationRules = [
  {
    id: randomUUID(),
    name: 'Daily Task Status Update',
    trigger: 'Daily at 9:00 AM',
    action: 'Send task status email to team',
    active: true,
    created_by: randomUUID(),
    created_at: '2024-02-20T10:00:00Z',
    updated_at: '2024-02-20T10:00:00Z'
  },
  {
    id: randomUUID(),
    name: 'Weekly Report Generation',
    trigger: 'Every Friday at 5:00 PM',
    action: 'Generate and send weekly progress report',
    active: true,
    created_by: randomUUID(),
    created_at: '2024-02-18T14:00:00Z',
    updated_at: '2024-02-18T14:00:00Z'
  },
  {
    id: randomUUID(),
    name: 'Deadline Reminder',
    trigger: 'Task due date - 1 day',
    action: 'Send reminder notification',
    active: false,
    created_by: randomUUID(),
    created_at: '2024-02-15T11:00:00Z',
    updated_at: '2024-02-15T11:00:00Z'
  }
];

const demoReports = [
  {
    id: randomUUID(),
    project_name: 'Website Redesign',
    total_tasks: 25,
    completed_tasks: 18,
    overdue_tasks: 2,
    progress_percent: 72,
    tasks_by_status: JSON.stringify([
      { status: 'TODO', count: 5 },
      { status: 'IN_PROGRESS', count: 8 },
      { status: 'DONE', count: 18 },
      { status: 'DELAYED', count: 2 }
    ]),
    generated_at: '2024-02-20T17:00:00Z',
    generated_by: 'System',
    type: 'Project Progress',
    created_at: '2024-02-20T17:00:00Z',
    updated_at: '2024-02-20T17:00:00Z'
  },
  {
    id: randomUUID(),
    project_name: 'Mobile App v2.0',
    total_tasks: 30,
    completed_tasks: 12,
    overdue_tasks: 5,
    progress_percent: 40,
    tasks_by_status: JSON.stringify([
      { status: 'TODO', count: 13 },
      { status: 'IN_PROGRESS', count: 10 },
      { status: 'DONE', count: 12 },
      { status: 'DELAYED', count: 5 }
    ]),
    generated_at: '2024-02-19T15:00:00Z',
    generated_by: 'System',
    type: 'Project Progress',
    created_at: '2024-02-19T15:00:00Z',
    updated_at: '2024-02-19T15:00:00Z'
  },
  {
    id: randomUUID(),
    project_name: 'Security Audit',
    total_tasks: 15,
    completed_tasks: 15,
    overdue_tasks: 0,
    progress_percent: 100,
    tasks_by_status: JSON.stringify([
      { status: 'DONE', count: 15 }
    ]),
    generated_at: '2024-02-18T10:00:00Z',
    generated_by: 'System',
    type: 'Project Progress',
    created_at: '2024-02-18T10:00:00Z',
    updated_at: '2024-02-18T10:00:00Z'
  }
];

const demoAdminSettings = [
  {
    id: randomUUID(),
    key: 'system_name',
    value: 'ProjectFlow HRMS',
    description: 'System name displayed in UI',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    key: 'version',
    value: '2.0.0',
    description: 'Current system version',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    key: 'maintenance_mode',
    value: 'false',
    description: 'System maintenance mode status',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    key: 'backup_enabled',
    value: 'true',
    description: 'Automatic backup status',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    key: 'session_timeout',
    value: '30',
    description: 'Session timeout in minutes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    key: 'max_login_attempts',
    value: '5',
    description: 'Maximum login attempts before lockout',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Main seeding function
async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...');
  console.log('⚠️  This script will only seed tables that are empty.');
  console.log('⚠️  People module tables will NOT be touched as per requirements.');
  
  try {
    // First, create tables if they don't exist
    console.log('🔧 Creating tables if they don\'t exist...');
    
    // Create Projects table
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL CHECK (status IN ('ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'ARCHIVED')),
        start_date DATE,
        end_date DATE,
        budget DECIMAL(10, 2),
        color VARCHAR(7),
        tags TEXT[],
        services TEXT[],
        member_ids UUID[],
        created_by UUID,
        owner_ids UUID[],
        progress INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create Tasks table
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'DELAYED', 'CANCELLED')),
        priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        due_date DATE,
        project_id UUID REFERENCES projects(id),
        assignee_id UUID,
        assigner_id UUID,
        owner_id UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        comments_count INTEGER DEFAULT 0
      )
    `);

    // Create Issues table
    await query(`
      CREATE TABLE IF NOT EXISTS issues (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        status VARCHAR(50) NOT NULL CHECK (status IN ('OPEN', 'IN_REVIEW', 'ESCALATED', 'WAITING_REPLY', 'RESOLVED', 'CLOSED')),
        reporter_id UUID,
        assigned_to_id UUID,
        role_level VARCHAR(20) CHECK (role_level IN ('EMPLOYEE', 'TL', 'MANAGER', 'MD')),
        project_id UUID REFERENCES projects(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create Timesheets table
    await query(`
      CREATE TABLE IF NOT EXISTS timesheets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID REFERENCES tasks(id),
        date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        hours DECIMAL(5, 2),
        work_type VARCHAR(20) CHECK (work_type IN ('BILLABLE', 'NON_BILLABLE')),
        notes TEXT,
        status VARCHAR(20) CHECK (status IN ('APPROVED', 'PENDING', 'REJECTED')),
        employee_id UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create Team Members table
    await query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(100),
        department VARCHAR(100),
        active_task_count INTEGER DEFAULT 0,
        has_direct_reports BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create Calendar Events table
    await query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        reminder_at TIMESTAMP,
        user_id UUID,
        linked_task_id UUID REFERENCES tasks(id),
        linked_issue_id UUID REFERENCES issues(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create Automation Rules table
    await query(`
      CREATE TABLE IF NOT EXISTS automation_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        trigger VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_by UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create Reports table
    await query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_name VARCHAR(255),
        total_tasks INTEGER DEFAULT 0,
        completed_tasks INTEGER DEFAULT 0,
        overdue_tasks INTEGER DEFAULT 0,
        progress_percent INTEGER DEFAULT 0,
        tasks_by_status JSONB,
        generated_at TIMESTAMP DEFAULT NOW(),
        generated_by VARCHAR(100),
        type VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create Admin Settings table
    await query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Tables created or verified successfully!');
    
    // Seed Projects
    await safeSeed('projects', demoProjects, `
      INSERT INTO projects (
        id, name, description, status, start_date, end_date, budget, color, tags, 
        services, member_ids, created_by, owner_ids, progress, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `);

    // Seed Tasks
    await safeSeed('tasks', demoTasks, `
      INSERT INTO tasks (
        id, title, description, status, priority, due_date, project_id, assignee_id, 
        assigner_id, owner_id, created_at, updated_at, comments_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `);

    // Seed Issues
    await safeSeed('issues', demoIssues, `
      INSERT INTO issues (
        id, title, description, priority, status, reporter_id, assigned_to_id, 
        role_level, project_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `);

    // Seed Timesheets
    await safeSeed('timesheets', demoTimesheets, `
      INSERT INTO timesheets (
        id, task_id, date, start_time, end_time, hours, work_type, notes, 
        status, employee_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `);

    // Seed Team Members
    await safeSeed('team_members', demoTeamMembers, `
      INSERT INTO team_members (
        id, name, email, role, department, active_task_count, 
        has_direct_reports, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `);

    // Seed Calendar Events
    await safeSeed('calendar_events', demoCalendarEvents, `
      INSERT INTO calendar_events (
        id, title, description, start_time, end_time, reminder_at, 
        user_id, linked_task_id, linked_issue_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `);

    // Seed Automation Rules
    await safeSeed('automation_rules', demoAutomationRules, `
      INSERT INTO automation_rules (
        id, name, trigger, action, active, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `);

    // Seed Reports
    await safeSeed('reports', demoReports, `
      INSERT INTO reports (
        id, project_name, total_tasks, completed_tasks, overdue_tasks, 
        progress_percent, tasks_by_status, generated_at, generated_by, 
        type, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `);

    // Seed Admin Settings
    await safeSeed('admin_settings', demoAdminSettings, `
      INSERT INTO admin_settings (
        id, key, value, description, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `);

    console.log('✅ Demo data seeding completed successfully!');
    console.log('🎉 All tables have been seeded with demo data where they were empty.');
    console.log('📊 Tables seeded: projects, tasks, issues, timesheets, team_members, calendar_events, automation_rules, reports, admin_settings');
    console.log('⚠️  People module tables (employees, attendance, leave) were NOT touched as per requirements.');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the seeding script
if (require.main === module) {
  seedDemoData();
}

module.exports = { seedDemoData };
