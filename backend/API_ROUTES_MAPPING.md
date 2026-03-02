# ProjectFlow API Routes Mapping

## 📁 Complete Route Structure

### **🔐 Authentication Routes** (`/api/auth`)
**File**: `src/routes/auth.js`
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### **👥 User Management Routes**

#### **Users Routes** (`/api/users`)
**File**: `src/routes/users.js`
- `GET /api/users/team` - Get team members with task counts
- `GET /api/users` - Get all users (with pagination/filters)
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### **User Profile Routes** (`/api/user`)
**File**: `src/routes/user.js`
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/me` - Update current user profile
- `PUT /api/user/password` - Change password
- `PUT /api/user/avatar` - Update avatar

### **🚀 Project Management Routes** (`/api/projects`)
**File**: `src/routes/projects.js`
- `GET /api/projects` - List all projects (with filters)
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add project member
- `DELETE /api/projects/:id/members/:userId` - Remove project member
- `GET /api/projects/:id/milestones` - Get project milestones
- `POST /api/projects/:id/milestones` - Create milestone
- `PUT /api/projects/:id/milestones/:id` - Update milestone
- `DELETE /api/projects/:id/milestones/:id` - Delete milestone
- `GET /api/projects/:id/activities` - Get project activities

### **📋 Task Management Routes** (`/api/tasks`)
**File**: `src/routes/tasks.js`
- `GET /api/tasks` - List all tasks (with filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/:id/comments` - Get task comments
- `POST /api/tasks/:id/comments` - Add task comment
- `PUT /api/tasks/:id/comments/:id` - Update comment
- `DELETE /api/tasks/:id/comments/:id` - Delete comment

### **⏰ Timesheet Routes** (`/api/timesheets`)
**File**: `src/routes/timesheets.js`
- `GET /api/timesheets` - List timesheets (with filters)
- `POST /api/timesheets` - Create timesheet entry
- `GET /api/timesheets/:id` - Get timesheet by ID
- `PUT /api/timesheets/:id` - Update timesheet
- `DELETE /api/timesheets/:id` - Delete timesheet
- `PATCH /api/timesheets/:id/approve` - Approve timesheet

### **📊 Report Routes** (`/api/reports`)
**File**: `src/routes/reports.js`
- `GET /api/reports` - List all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get report by ID
- `DELETE /api/reports/:id` - Delete report

### **📈 Dashboard Routes** (`/api/dashboard`)
**File**: `src/routes/dashboard.js`
- `GET /api/dashboard/stats` - Get dashboard statistics

### **🐛 Issue Management Routes** (`/api/issues`)
**File**: `src/routes/issues.js`
- `GET /api/issues/active-users` - Get active users for dropdowns
- `GET /api/issues` - List all issues (with filters)
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue by ID
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `GET /api/issues/:id/comments` - Get issue comments
- `POST /api/issues/:id/comments` - Add issue comment
- `PUT /api/issues/:id/comments/:id` - Update comment
- `DELETE /api/issues/:id/comments/:id` - Delete comment

### **🔔 Notification Routes** (`/api/notifications`)
**File**: `src/routes/notifications.js`
- `POST /api/notifications` - Create notification
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

### **📅 Calendar Routes** (`/api/calendar`)
**File**: `src/routes/calendar.js`
- `GET /api/calendar/events` - Get user's calendar events
- `POST /api/calendar/events` - Create calendar event
- `GET /api/calendar/events/:id` - Get event by ID
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event

### **🤖 Automation Routes** (`/api/automation`)
**File**: `src/routes/automation.js`
- `GET /api/automation` - Get all automation rules
- `POST /api/automation` - Create automation rule
- `PUT /api/automation/:id` - Update automation rule
- `DELETE /api/automation/:id` - Delete automation rule

### **🏥 Health Check**
**File**: `src/index.js`
- `GET /api/health` - API health check

---

## 🔗 **Route to File Mapping**

| Route Prefix | File | Status |
|-------------|------|--------|
| `/api/auth` | `routes/auth.js` | ✅ Using Prisma |
| `/api/users` | `routes/users.js` | ✅ Using Prisma |
| `/api/user` | `routes/user.js` | ✅ Using Prisma |
| `/api/projects` | `routes/projects.js` | ✅ Using Prisma |
| `/api/tasks` | `routes/tasks.js` | ✅ Using Prisma |
| `/api/timesheets` | `routes/timesheets.js` | ✅ Using Prisma |
| `/api/reports` | `routes/reports.js` | ✅ Using Prisma |
| `/api/dashboard` | `routes/dashboard.js` | ✅ Using Prisma |
| `/api/issues` | `routes/issues.js` | ✅ Using Prisma |
| `/api/notifications` | `routes/notifications.js` | ✅ Using Prisma |
| `/api/calendar` | `routes/calendar.js` | ✅ Using Prisma |
| `/api/automation` | `routes/automation.js` | ✅ Using Service |

---

## ⚠️ **Current Status**

### **✅ Working Routes (Simple DB)**
- `/api/auth` → Using `auth-simple.js` with PostgreSQL
- `/api/users` → Using `users-simple.js` with PostgreSQL

### **🔄 Need Migration to Simple DB**
- All other routes still using Prisma with connection issues
- Need to update to use direct PostgreSQL connection like auth-simple

### **🎯 Next Steps**
1. Update all route files to use direct PostgreSQL connection
2. Test all API endpoints
3. Ensure database schema compatibility
4. Update frontend to use working APIs
