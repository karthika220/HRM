# Workforce HRM & PMS - Quick Preview

## 🎯 Project Summary

**Full-Stack HRM & Project Management System** with comprehensive features for workforce and project management.

---

## 📊 Quick Stats

- **Total Files:** 100+ source files
- **Frontend Pages:** 24 pages
- **Backend Routes:** 24 route files
- **Database Models:** 20+ models
- **API Endpoints:** 50+ endpoints
- **User Roles:** 5 role levels
- **Tech Stack:** React + Node.js + PostgreSQL

---

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↕ HTTP/REST API
Backend (Node.js + Express)
    ↕ Prisma ORM
Database (PostgreSQL/Supabase)
```

---

## 📁 Key Directories

### Backend (`/backend`)
- `src/routes/` - 24 API route files
- `src/middleware/` - Auth & error handling
- `src/utils/` - 33+ utility scripts
- `prisma/schema.prisma` - Database schema
- `prisma/seed.js` - Demo data seeding

### Frontend (`/frontend`)
- `src/pages/` - 24 page components
- `src/components/` - 9 reusable components
- `src/store/` - Zustand state management
- `src/api/` - Axios API client

---

## 🔑 Core Features

### ✅ Project Management
- Create, update, delete projects
- Team member management
- Milestone tracking
- Progress visualization
- Budget tracking

### ✅ Task Management
- Task creation & assignment
- Priority levels (Low/Medium/High/Critical)
- Status tracking (TODO/In Progress/Done)
- Subtask support
- Comments & collaboration

### ✅ Issue Tracking
- Issue reporting
- Priority assignment
- Status workflow
- Comment threads
- Escalation system

### ✅ HR Functions
- Employee management
- Attendance tracking (check-in/check-out)
- Leave management
- Leave balance tracking
- Approval workflows

### ✅ Time Tracking
- Timesheet entries
- Billable/non-billable tracking
- Approval workflow
- Task association

### ✅ Reporting & Analytics
- Project summary reports
- Task completion metrics
- Team performance analytics
- Custom report generation

### ✅ Automation
- Automated task creation
- Rule-based automation
- Scheduled tasks
- Notification triggers

### ✅ Calendar & Scheduling
- Event management
- Task scheduling
- Reminder system
- Calendar integration

---

## 🔐 Authentication

- **Method:** JWT token-based
- **Storage:** localStorage
- **Roles:** Managing Director, HR Manager, Team Lead, Manager, Employee
- **Security:** bcrypt password hashing

---

## 🌐 API Structure

### Main Endpoints
- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/projects` - Project CRUD
- `/api/tasks` - Task management
- `/api/issues` - Issue tracking
- `/api/timesheets` - Time tracking
- `/api/reports` - Reporting
- `/api/attendance` - Attendance
- `/api/leave` - Leave management
- `/api/hr` - HR functions
- `/api/dashboard` - Dashboard data
- `/api/calendar` - Calendar events
- `/api/automation` - Automation rules
- `/api/notifications` - Notifications

---

## 🗄️ Database Models

### Core Models
1. **User** - Employee & user data
2. **Project** - Project information
3. **Task** - Task management
4. **Issue** - Issue tracking
5. **Timesheet** - Time tracking
6. **Report** - Analytics & reports
7. **Notification** - System notifications
8. **CalendarEvent** - Scheduling
9. **AutomationRule** - Automation
10. **AttendanceLog** - Attendance tracking
11. **AttendanceSummary** - Daily summaries
12. **LeaveBalance** - Leave balances
13. **LeaveRequest** - Leave requests
14. **Escalation** - Escalation tracking
15. **Comment** - Task comments
16. **IssueComment** - Issue comments
17. **Milestone** - Project milestones
18. **Activity** - Activity logs
19. **ProjectMember** - Team memberships
20. **NotificationPreferences** - User preferences

---

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL and JWT_SECRET
npx prisma db push
node prisma/seed.js
npm run dev  # Port 3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Port 5173
```

---

## 👤 Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@workforce.io | password | Managing Director |
| sarah@projectflow.io | password | HR Manager |
| mike@projectflow.io | password | Team Lead |
| john@projectflow.io | password | Employee |

---

## 📚 Documentation Files

- `README.md` - Project overview
- `PROJECT_SUMMARY.md` - Complete summary
- `TECHNICAL_DOCUMENTATION.md` - Technical details
- `USER_MANUAL.md` - User guide
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `PROJECT_ANALYSIS.md` - Detailed analysis (this file)

---

## 🛠️ Technology Stack

### Frontend
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.4.21
- Tailwind CSS 3.4.0
- Zustand 4.4.7
- React Router 6.21.1
- Axios 1.13.6

### Backend
- Node.js
- Express.js 4.18.2
- Prisma 5.22.0
- PostgreSQL (Supabase)
- JWT (jsonwebtoken 9.0.2)
- bcryptjs 2.4.3

---

## 📝 File Structure Overview

```
HRM&PMS/
├── backend/
│   ├── src/
│   │   ├── routes/ (24 files)
│   │   ├── middleware/ (4 files)
│   │   ├── utils/ (33+ files)
│   │   └── controllers/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── dev-tools/ (43 files)
│
├── frontend/
│   ├── src/
│   │   ├── pages/ (24 files)
│   │   ├── components/ (9 files)
│   │   ├── store/
│   │   ├── api/
│   │   └── hooks/
│   └── public/
│
└── Documentation/ (8+ markdown files)
```

---

## ✅ Project Status

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** March 2026

---

*For detailed analysis, see `PROJECT_ANALYSIS.md`*
