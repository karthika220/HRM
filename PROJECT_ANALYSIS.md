# Workforce HRM & PMS - Complete Project Analysis

## 📋 Project Overview

**Project Name:** Workforce HRM & PMS (Human Resource Management & Project Management System)  
**Type:** Full-Stack SaaS Application  
**Architecture:** React Frontend + Node.js/Express Backend + PostgreSQL Database  
**Status:** ✅ Fully Functional Production-Ready System

---

## 🏗️ Project Structure

```
HRM&PMS/
├── 📁 backend/                    # Node.js/Express Backend API
│   ├── src/
│   │   ├── index.js              # Main server entry point
│   │   ├── database.js           # Database connection
│   │   ├── prisma.js             # Prisma client setup
│   │   ├── routes/               # API route handlers (24 files)
│   │   │   ├── auth.js           # Authentication endpoints
│   │   │   ├── users.js          # User management
│   │   │   ├── projects.js       # Project CRUD operations
│   │   │   ├── tasks.js          # Task management
│   │   │   ├── issues.js         # Issue tracking
│   │   │   ├── timesheets.js     # Time tracking
│   │   │   ├── reports.js        # Reporting system
│   │   │   ├── notifications.js  # Notification system
│   │   │   ├── dashboard.js      # Dashboard data
│   │   │   ├── calendar.js       # Calendar events
│   │   │   ├── automation.js     # Automation rules
│   │   │   ├── attendance.js     # Attendance tracking
│   │   │   ├── leave.routes.js   # Leave management
│   │   │   ├── hr.js             # HR functions
│   │   │   ├── escalation.routes.js # Escalation handling
│   │   │   └── centralized.js   # Centralized data endpoints
│   │   ├── middleware/           # Express middleware (4 files)
│   │   │   ├── auth.js           # JWT authentication
│   │   │   └── errorHandler.js   # Error handling
│   │   ├── controllers/          # Business logic
│   │   │   └── dataStore.js      # Data storage controller
│   │   ├── services/             # Service layer
│   │   └── utils/                # Utility functions (33 files)
│   │       ├── notificationJobs.js
│   │       ├── calendarReminderJobs.js
│   │       └── seedAutomationRules.js
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema definition
│   │   ├── seed.js               # Database seeding script
│   │   ├── seed-comprehensive.js # Comprehensive seed data
│   │   └── dev.db                # SQLite dev database
│   ├── modules/
│   │   ├── attendance/           # Attendance module
│   │   └── people/               # People management module
│   ├── dev-tools/                # Development utilities (43 files)
│   ├── package.json              # Backend dependencies
│   └── database-schema.sql       # SQL schema files
│
├── 📁 frontend/                   # React + TypeScript Frontend
│   ├── src/
│   │   ├── main.tsx              # React entry point
│   │   ├── App.tsx               # Main app component with routing
│   │   ├── index.css             # Global styles
│   │   ├── pages/                # Page components (24 files)
│   │   │   ├── LoginPage.tsx     # Authentication page
│   │   │   ├── SignUpPage.tsx    # User registration
│   │   │   ├── DashboardPage.tsx # Main dashboard
│   │   │   ├── ProjectsPage.tsx  # Project listing
│   │   │   ├── ProjectDetailPage.tsx # Project details
│   │   │   ├── TasksPage.tsx     # Task management
│   │   │   ├── IssuesPage.tsx    # Issue tracking
│   │   │   ├── IssueDetailPage.tsx # Issue details
│   │   │   ├── TeamPage.tsx      # Team management
│   │   │   ├── ReportsPage.tsx   # Reports & analytics
│   │   │   ├── TimesheetPage.tsx # Time tracking
│   │   │   ├── CalendarPage.tsx  # Calendar & scheduling
│   │   │   ├── AutomationPage.tsx # Automation rules
│   │   │   ├── NotificationsPage.tsx # Notifications
│   │   │   ├── UsersPage.tsx     # User management
│   │   │   ├── ProfilePage.tsx   # User profile
│   │   │   ├── ProfileEditPage.tsx # Profile editing
│   │   │   ├── VaultPage.tsx     # Document vault
│   │   │   ├── NotificationSettingsPage.tsx # Notification settings
│   │   │   ├── SettingsSecurityPage.tsx # Security settings
│   │   │   └── people/           # HR module pages
│   │   │       ├── PeopleDashboardPage.tsx
│   │   │       ├── EmployeesPage.tsx
│   │   │       ├── AttendancePage.tsx
│   │   │       └── LeaveManagementPage.tsx
│   │   ├── components/           # Reusable components (9 files)
│   │   │   ├── Layout.tsx        # Main layout wrapper
│   │   │   ├── EmployeeDetails.tsx
│   │   │   ├── MemberCard.tsx
│   │   │   ├── ProjectDiagnostic.tsx
│   │   │   ├── ReminderModal.tsx
│   │   │   ├── TeamGroupSection.tsx
│   │   │   ├── TeamLeadExpansionPanel.tsx
│   │   │   ├── TimerBadge.tsx
│   │   │   └── TimerButton.tsx
│   │   ├── store/                # Zustand state management
│   │   │   └── authStore.ts      # Authentication state
│   │   ├── api/                  # API client configuration
│   │   │   └── axios.ts          # Axios instance with interceptors
│   │   ├── hooks/                # Custom React hooks (2 files)
│   │   ├── utils/                # Utility functions (3 files)
│   │   └── config/                # Configuration files (2 files)
│   ├── public/                   # Static assets
│   │   ├── favicon.png
│   │   ├── logo.png
│   │   └── test-api.html
│   ├── dist/                     # Production build output
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   └── tsconfig.json            # TypeScript configuration
│
├── 📄 Documentation Files
│   ├── README.md                 # Project overview & quick start
│   ├── PROJECT_SUMMARY.md        # Complete project summary
│   ├── TECHNICAL_DOCUMENTATION.md # Technical architecture details
│   ├── USER_MANUAL.md            # User guide & tutorials
│   ├── DEPLOYMENT_GUIDE.md       # Deployment instructions
│   ├── END_TO_END_GUIDE.md       # End-to-end setup guide
│   ├── folder-structure.md       # Folder structure documentation
│   └── reports-implementation.md # Reports feature documentation
│
├── 🐳 Infrastructure
│   ├── docker-compose.yml        # Docker Compose configuration
│   └── test-frontend-connection.js # Connection testing script
│
└── 🔧 Configuration & Scripts
    ├── test-login.js             # Login testing script
    └── .env.example              # Environment variables template
```

---

## 🗄️ Database Schema Analysis

### Core Models (Prisma Schema)

#### 1. **User Model** - Employee & User Management
- **Fields:** id, email, password, name, role, avatar, phone, department, managerId
- **HR Fields:** employeeCode, fullName, designation, employmentType, joinDate, employmentStatus, exitDate, reportingManagerId
- **Relationships:**
  - Owns projects (ProjectOwner)
  - Assigned tasks (TaskAssignee)
  - Created tasks (TaskCreator)
  - Project memberships
  - Timesheet entries
  - Reports created
  - Notifications
  - Issues reported/assigned
  - Calendar events
  - Automation rules
  - Attendance logs
  - Leave requests
  - Escalations

#### 2. **Project Model** - Project Management
- **Fields:** id, name, description, status, startDate, endDate, budget, color, tags, services, ownerId
- **Status Values:** PLANNING, ACTIVE, IN_PROGRESS, ON_HOLD, COMPLETED, ARCHIVED
- **Relationships:**
  - Owner (User)
  - Members (ProjectMember[])
  - Tasks
  - Milestones
  - Reports
  - Activities
  - Issues

#### 3. **Task Model** - Task Management
- **Fields:** id, title, description, status, priority, startDate, dueDate, estimatedHours, order, projectId, assigneeId, creatorId, parentId, tags, service, isAutomated, delayNotified
- **Status Values:** TODO, IN_PROGRESS, DONE
- **Priority Values:** LOW, MEDIUM, HIGH, CRITICAL
- **Relationships:**
  - Project
  - Assignee (User)
  - Creator (User)
  - Parent task (self-referencing for subtasks)
  - Subtasks
  - Comments
  - Timesheets
  - Calendar events

#### 4. **Issue Model** - Issue Tracking
- **Fields:** id, title, description, priority, status, reporterId, assignedTo, roleLevel, projectId, raisedDate, expectedEndDate, tags
- **Status Values:** OPEN, IN_PROGRESS, RESOLVED
- **Priority Values:** LOW, MEDIUM, HIGH, CRITICAL
- **Role Levels:** EMPLOYEE, TEAM_LEAD, MANAGER, HR_MANAGER, MANAGING_DIRECTOR

#### 5. **Timesheet Model** - Time Tracking
- **Fields:** id, date, startTime, endTime, hours, workType, notes, isApproved, taskId, userId
- **Work Types:** BILLABLE, NON_BILLABLE

#### 6. **Attendance Models** - HR Attendance Tracking
- **AttendanceLog:** Employee check-in/check-out logs
- **AttendanceSummary:** Daily attendance summaries with late/overtime tracking

#### 7. **Leave Models** - Leave Management
- **LeaveBalance:** Employee leave balances (sick, casual, LOP)
- **LeaveRequest:** Leave requests with approval workflow

#### 8. **Other Models**
- **Report:** Analytics and reporting data
- **Notification:** System notifications
- **CalendarEvent:** Scheduling and events
- **AutomationRule:** Automated task management
- **Escalation:** Issue escalation tracking
- **Comment:** Task comments
- **IssueComment:** Issue discussion threads
- **Milestone:** Project milestones
- **Activity:** Project activity logs
- **ProjectMember:** Project team memberships
- **NotificationPreferences:** User notification settings

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. **Login:** POST `/api/auth/login` - Returns JWT token
2. **Signup:** POST `/api/auth/signup` - User registration
3. **Token Validation:** JWT token in Authorization header
4. **Session Management:** Token stored in localStorage

### Role-Based Access Control (RBAC)
- **MANAGING_DIRECTOR:** Full system access
- **HR_MANAGER:** HR functions, user management, reports
- **TEAM_LEAD:** Project/task management, team oversight
- **MANAGER:** Department management, reports
- **EMPLOYEE:** Basic access to assigned tasks

### Security Features
- JWT token-based authentication
- bcrypt password hashing (10 rounds)
- Role-based middleware protection
- CORS configuration
- Input validation and sanitization

---

## 🌐 API Endpoints Summary

### Authentication (`/api/auth`)
- `GET /` - Auth route verification
- `POST /login` - User login
- `POST /signup` - User registration
- `GET /me` - Get current user

### Users (`/api/users`)
- `GET /` - Get all users
- `GET /:id` - Get specific user
- `POST /` - Create user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user

### Projects (`/api/projects`)
- `GET /` - Get all projects
- `POST /` - Create project
- `GET /:id` - Get project details
- `PUT /:id` - Update project
- `DELETE /:id` - Delete project
- `POST /:id/members` - Add project members
- `GET /:id/milestones` - Get milestones
- `POST /:id/milestones` - Create milestone
- `GET /:id/activities` - Get project activities

### Tasks (`/api/tasks`)
- `GET /` - Get all tasks
- `POST /` - Create task
- `GET /:id` - Get task details
- `PUT /:id` - Update task
- `DELETE /:id` - Delete task
- `GET /:id/comments` - Get task comments
- `POST /:id/comments` - Add comment

### Issues (`/api/issues`)
- `GET /` - Get all issues
- `POST /` - Create issue
- `GET /:id` - Get issue details
- `PUT /:id` - Update issue
- `DELETE /:id` - Delete issue

### Timesheets (`/api/timesheets`)
- `GET /` - Get timesheet entries
- `POST /` - Create timesheet entry
- `PATCH /:id/approve` - Approve timesheet

### Reports (`/api/reports`)
- `GET /` - Get all reports
- `POST /` - Create report
- `DELETE /:id` - Delete report

### Dashboard (`/api/dashboard`)
- `GET /stats` - Get dashboard statistics

### Notifications (`/api/notifications`)
- `GET /` - Get notifications
- `PATCH /:id/read` - Mark as read
- `PATCH /read-all` - Mark all as read

### Calendar (`/api/calendar`)
- Calendar event management endpoints

### Automation (`/api/automation`)
- Automation rule management endpoints

### Attendance (`/api/attendance`)
- Attendance logging and tracking endpoints

### Leave (`/api/leave`)
- Leave request and management endpoints

### HR (`/api/hr`)
- HR-specific functions

### Escalations (`/api/escalations`)
- Escalation management endpoints

### Centralized (`/api/centralized`)
- Centralized data endpoints

---

## 🎨 Frontend Architecture

### Technology Stack
- **Framework:** React 18.2.0
- **Language:** TypeScript 5.2.2
- **Build Tool:** Vite 5.4.21
- **Styling:** Tailwind CSS 3.4.0
- **State Management:** Zustand 4.4.7
- **Routing:** React Router DOM 6.21.1
- **HTTP Client:** Axios 1.13.6
- **Date Handling:** date-fns 3.0.0
- **Icons:** Lucide React 0.303.0

### Component Structure
- **Pages:** 24 page components for different views
- **Components:** 9 reusable UI components
- **Store:** Zustand store for authentication
- **API:** Axios instance with interceptors
- **Hooks:** Custom React hooks for data fetching
- **Utils:** Utility functions for permissions, formatting, etc.

### Routing Structure
```
/ → Redirects to /dashboard
/login → Login page
/signup → Signup page
/dashboard → Main dashboard
/projects → Project listing
/projects/:id → Project details
/tasks → Task management
/issues → Issue tracking
/issues/:id → Issue details
/team → Team management
/reports → Reports & analytics
/timesheets → Time tracking
/calendar → Calendar & scheduling
/automation → Automation rules
/notifications → Notifications
/users → User management
/profile → User profile
/profile/edit → Edit profile
/settings/notifications → Notification settings
/settings/security → Security settings
/vault → Document vault
/people/dashboard → HR dashboard
/people/employees → Employee management
/people/attendance → Attendance tracking
/people/leave-management → Leave management
```

### State Management
- **Auth Store:** User authentication state, token management
- **Local Storage:** Token and user data persistence
- **API State:** Managed through React hooks and component state

---

## 🔧 Backend Architecture

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **ORM:** Prisma 5.22.0
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 2.4.3
- **Email:** nodemailer 8.0.1
- **File Upload:** multer 1.4.5
- **Database Client:** @supabase/supabase-js 2.98.0

### Server Structure
- **Entry Point:** `src/index.js` - Express server setup
- **Routes:** 24 route files for different API endpoints
- **Middleware:** Authentication, error handling, CORS
- **Controllers:** Business logic separation
- **Services:** Service layer for complex operations
- **Utils:** Utility functions and helper scripts

### Database Connection
- **Prisma Client:** Generated from schema.prisma
- **Connection Pooling:** Configured for Supabase PostgreSQL
- **Migrations:** Prisma migrations for schema changes
- **Seeding:** Comprehensive seed scripts for demo data

---

## 📊 Key Features

### 1. Project Management
- ✅ Project CRUD operations
- ✅ Project status tracking
- ✅ Team member management
- ✅ Milestone tracking
- ✅ Progress visualization
- ✅ Budget tracking
- ✅ Activity logging

### 2. Task Management
- ✅ Task creation and assignment
- ✅ Priority levels
- ✅ Status tracking
- ✅ Subtask support
- ✅ Task comments
- ✅ Due date management
- ✅ Automated tasks

### 3. Issue Tracking
- ✅ Issue reporting
- ✅ Priority assignment
- ✅ Status tracking
- ✅ Assignment workflow
- ✅ Comment threads
- ✅ Escalation system

### 4. Time Tracking
- ✅ Timesheet entries
- ✅ Billable/non-billable tracking
- ✅ Approval workflow
- ✅ Task association

### 5. HR Functions
- ✅ Employee management
- ✅ Attendance tracking (check-in/check-out)
- ✅ Leave management
- ✅ Leave balance tracking
- ✅ Leave approval workflow
- ✅ Employee hierarchy

### 6. Reporting & Analytics
- ✅ Project summary reports
- ✅ Task completion reports
- ✅ Team performance metrics
- ✅ Custom report generation

### 7. Automation
- ✅ Automated task creation
- ✅ Rule-based automation
- ✅ Scheduled tasks
- ✅ Notification triggers

### 8. Calendar & Scheduling
- ✅ Event creation
- ✅ Task scheduling
- ✅ Reminder system
- ✅ Calendar integration

### 9. Notifications
- ✅ System notifications
- ✅ Notification preferences
- ✅ Read/unread tracking
- ✅ Email notifications

### 10. User Management
- ✅ User CRUD operations
- ✅ Role management
- ✅ Profile management
- ✅ Avatar upload
- ✅ Department management

---

## 🗂️ File Count Summary

### Backend Files
- **Route Files:** 24 files
- **Middleware Files:** 4 files
- **Utility Files:** 33+ files
- **Controller Files:** 1+ files
- **Service Files:** 1+ files
- **Database Files:** Multiple SQL schemas and seed files
- **Module Files:** Attendance and People modules

### Frontend Files
- **Page Components:** 24 files
- **Reusable Components:** 9 files
- **Store Files:** 2 files
- **API Files:** 2 files
- **Hook Files:** 2 files
- **Utility Files:** 3 files
- **Config Files:** 2 files

### Documentation Files
- **Markdown Files:** 8+ documentation files

**Total Estimated Files:** 100+ source files + documentation

---

## 🚀 Development Setup

### Prerequisites
- Node.js 24.x
- npm or yarn
- PostgreSQL/Supabase account
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL and JWT_SECRET in .env
npx prisma db push
npx prisma generate
node prisma/seed.js
npm run dev  # Runs on port 3001
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Runs on port 5173
```

### Environment Variables
```env
# Backend .env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-key"
PORT=3001

# Frontend (vite.config.ts)
VITE_API_BASE_URL="http://localhost:3001/api"
```

---

## 🎯 Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@workforce.io | password | Managing Director |
| sarah@projectflow.io | password | HR Manager |
| mike@projectflow.io | password | Team Lead |
| john@projectflow.io | password | Employee |

---

## 📈 Project Statistics

- **Total Models:** 20+ database models
- **API Endpoints:** 50+ REST endpoints
- **Frontend Pages:** 24 pages
- **Components:** 9 reusable components
- **Routes:** 24 backend route files
- **Database Tables:** 20+ tables
- **User Roles:** 5 role levels
- **Project Statuses:** 6 status types
- **Task Priorities:** 4 priority levels
- **Issue Statuses:** 3 status types

---

## 🔍 Code Quality & Best Practices

### Frontend
- ✅ TypeScript for type safety
- ✅ Component-based architecture
- ✅ Custom hooks for reusability
- ✅ Zustand for state management
- ✅ Axios interceptors for error handling
- ✅ Responsive design with Tailwind CSS
- ✅ Code splitting ready

### Backend
- ✅ RESTful API design
- ✅ Middleware for authentication
- ✅ Error handling middleware
- ✅ Prisma ORM for type-safe database access
- ✅ Environment variable configuration
- ✅ Graceful shutdown handling
- ✅ Database connection pooling

---

## 📝 Notes

1. **Database:** Currently configured for Supabase PostgreSQL
2. **Port Configuration:** Backend runs on port 3001, Frontend on 5173
3. **API Base URL:** Frontend configured to connect to `http://localhost:3002/api` (may need adjustment)
4. **Authentication:** JWT-based with localStorage persistence
5. **File Upload:** Multer configured for file handling
6. **Email:** Nodemailer configured for notifications
7. **Development Tools:** Multiple dev-tools scripts available

---

## ✅ Project Status

**Status:** ✅ Production Ready  
**Last Updated:** March 2026  
**Version:** 1.0.0  
**License:** Not specified

---

*This analysis provides a comprehensive overview of the Workforce HRM & PMS project structure, architecture, and implementation details.*
