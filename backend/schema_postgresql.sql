-- PostgreSQL Schema for ProjectFlow
-- Generated on: 2026-02-23T06:30:13.660Z


-- Drop tables if they exist (for clean import)
DROP TABLE IF EXISTS Notification CASCADE;
DROP TABLE IF EXISTS Activity CASCADE;
DROP TABLE IF EXISTS Report CASCADE;
DROP TABLE IF EXISTS Timesheet CASCADE;
DROP TABLE IF EXISTS Comment CASCADE;
DROP TABLE IF EXISTS Task CASCADE;
DROP TABLE IF EXISTS Milestone CASCADE;
DROP TABLE IF EXISTS ProjectMember CASCADE;
DROP TABLE IF EXISTS Project CASCADE;
DROP TABLE IF EXISTS NotificationPreferences CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Create User table
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'EMPLOYEE',
  avatar TEXT,
  avatarUrl TEXT,
  phone TEXT,
  department TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create NotificationPreferences table
CREATE TABLE NotificationPreferences (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  emailEnabled BOOLEAN DEFAULT TRUE,
  pushEnabled BOOLEAN DEFAULT TRUE,
  taskReminders BOOLEAN DEFAULT TRUE,
  projectUpdates BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create Project table
CREATE TABLE Project (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PLANNING',
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  budget DECIMAL,
  color TEXT DEFAULT '#00A1C7',
  tags TEXT,
  ownerId TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES "User"(id)
);

-- Create ProjectMember table
CREATE TABLE ProjectMember (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  userId TEXT NOT NULL,
  roleInProject TEXT DEFAULT 'CONTRIBUTOR',
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE(projectId, userId)
);

-- Create Milestone table
CREATE TABLE Milestone (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  targetDate TIMESTAMP NOT NULL,
  isCompleted BOOLEAN DEFAULT FALSE,
  projectId TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);

-- Create Task table
CREATE TABLE Task (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO',
  priority TEXT DEFAULT 'MEDIUM',
  startDate TIMESTAMP,
  dueDate TIMESTAMP,
  estimatedHours DECIMAL,
  projectId TEXT NOT NULL,
  assigneeId TEXT,
  creatorId TEXT NOT NULL,
  parentId TEXT,
  tags TEXT,
  delayNotified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
  FOREIGN KEY (assigneeId) REFERENCES "User"(id),
  FOREIGN KEY (creatorId) REFERENCES "User"(id),
  FOREIGN KEY (parentId) REFERENCES Task(id)
);

-- Create Comment table
CREATE TABLE Comment (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  taskId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taskId) REFERENCES Task(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES "User"(id)
);

-- Create Timesheet table
CREATE TABLE Timesheet (
  id TEXT PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  hours DECIMAL NOT NULL,
  workType TEXT DEFAULT 'BILLABLE',
  notes TEXT,
  isApproved BOOLEAN,
  taskId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taskId) REFERENCES Task(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES "User"(id)
);

-- Create Report table
CREATE TABLE Report (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  data TEXT,
  projectId TEXT,
  createdById TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES Project(id),
  FOREIGN KEY (createdById) REFERENCES "User"(id)
);

-- Create Activity table
CREATE TABLE Activity (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  description TEXT NOT NULL,
  projectId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);

-- Create Notification table
CREATE TABLE Notification (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO',
  isRead BOOLEAN DEFAULT FALSE,
  userId TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_project_owner ON Project(ownerId);
CREATE INDEX idx_project_status ON Project(status);
CREATE INDEX idx_projectmember_project ON ProjectMember(projectId);
CREATE INDEX idx_projectmember_user ON ProjectMember(userId);
CREATE INDEX idx_task_project ON Task(projectId);
CREATE INDEX idx_task_assignee ON Task(assigneeId);
CREATE INDEX idx_task_creator ON Task(creatorId);
CREATE INDEX idx_task_status ON Task(status);
CREATE INDEX idx_comment_task ON Comment(taskId);
CREATE INDEX idx_comment_user ON Comment(userId);
CREATE INDEX idx_timesheet_task ON Timesheet(taskId);
CREATE INDEX idx_timesheet_user ON Timesheet(userId);
CREATE INDEX idx_timesheet_date ON Timesheet(date);
CREATE INDEX idx_report_project ON Report(projectId);
CREATE INDEX idx_report_creator ON Report(createdById);
CREATE INDEX idx_activity_project ON Activity(projectId);
CREATE INDEX idx_activity_user ON Activity(userId);
CREATE INDEX idx_notification_user ON Notification(userId);
CREATE INDEX idx_notification_read ON Notification(isRead);
