# HRM&PMS - Centralized Data Architecture

## Final Folder Structure

```
d:\HRM&PMS/
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 README.md
├── 📄 docker-compose.yml
├── 📁 backend/
│   ├── 📄 .env
│   ├── 📄 .env.demo
│   ├── 📄 .env.example
│   ├── 📄 package.json
│   ├── 📄 package-lock.json
│   ├── 📁 prisma/
│   ├── 📁 src/
│   │   ├── 📄 index.js
│   │   ├── 📁 controllers/
│   │   │   └── 📄 dataStore.js (NEW)
│   │   ├── 📁 routes/
│   │   │   ├── 📄 centralized.js (NEW)
│   │   │   ├── 📄 auth.js
│   │   │   ├── 📄 users.js
│   │   │   ├── 📄 projects.js
│   │   │   ├── 📄 tasks.js
│   │   │   ├── 📄 timesheets.js
│   │   │   ├── 📄 reports.js
│   │   │   ├── 📄 notifications.js
│   │   │   ├── 📄 dashboard.js
│   │   │   ├── 📄 issues.js
│   │   │   ├── 📄 calendar.js
│   │   │   ├── 📄 automation.js
│   │   │   ├── 📄 attendance.js
│   │   │   ├── 📄 leave.routes.js
│   │   │   ├── 📄 hr.js
│   │   │   └── 📄 escalation.routes.js
│   │   ├── 📁 middleware/
│   │   ├── 📁 services/
│   │   └── 📁 utils/
│   │       ├── 📄 serviceWorkflows.js
│   │       └── 📄 seed-demo-data.js
│   ├── 📁 dev-tools/
│   ├── 📁 modules/
│   └── 📁 node_modules/
└── 📁 frontend/
    ├── 📄 index.html
    ├── 📄 package.json
    ├── 📄 package-lock.json
    ├── 📄 vite.config.ts
    ├── 📄 tailwind.config.js
    ├── 📄 postcss.config.js
    ├── 📄 tsconfig.json
    ├── 📄 tsconfig.node.json
    ├── 📁 src/
    │   ├── 📄 main.tsx
    │   ├── 📄 App.tsx
    │   ├── 📄 index.css
    │   ├── 📁 api/
    │   ├── 📁 components/
    │   ├── 📁 hooks/
    │   │   ├── 📄 useCentralizedData.ts (NEW)
    │   │   └── 📄 useCentralizedData.d.ts (NEW)
    │   ├── 📁 pages/
    │   │   ├── 📄 DashboardPage.tsx (UPDATED)
    │   │   ├── 📄 ProjectsPage.tsx (UPDATED)
    │   │   ├── 📄 TasksPage.tsx
    │   │   ├── 📄 UsersPage.tsx
    │   │   ├── 📄 EmployeesPage.tsx
    │   │   ├── 📄 AttendancePage.tsx
    │   │   ├── 📄 LeaveManagementPage.tsx
    │   │   └── 📄 ...other pages
    │   ├── 📁 store/
    │   └── 📁 utils/
    ├── 📁 public/
    ├── 📁 dist/
    └── 📁 node_modules/
```

## New API Endpoints

### Centralized Data API
- `GET /api/centralized/data` - Get all centralized data
- `GET /api/centralized/employees` - Get all employees
- `GET /api/centralized/projects` - Get all projects
- `GET /api/centralized/tasks` - Get all tasks
- `GET /api/centralized/attendance` - Get all attendance records
- `GET /api/centralized/leaves` - Get all leave requests
- `POST /api/centralized/refresh` - Refresh cache for specific data type
- `POST /api/centralized/invalidate` - Invalidate cache for specific data type

### Existing API Endpoints (Unchanged)
- `GET /api/auth/*` - Authentication
- `GET /api/users/*` - User management
- `GET /api/projects/*` - Project management
- `GET /api/tasks/*` - Task management
- `GET /api/timesheets/*` - Timesheet management
- `GET /api/reports/*` - Reports
- `GET /api/notifications/*` - Notifications
- `GET /api/dashboard/*` - Dashboard
- `GET /api/issues/*` - Issues
- `GET /api/calendar/*` - Calendar
- `GET /api/automation/*` - Automation
- `GET /api/attendance/*` - Attendance
- `GET /api/leave/*` - Leave management
- `GET /api/hr/*` - HR management
- `GET /api/escalations/*` - Escalations

## How to Run Project

### Backend Server
```bash
cd d:\HRM&PMS\backend
npm start
```
- Runs on port 3001
- Database: PostgreSQL with Prisma ORM
- Centralized data store with caching

### Frontend Server
```bash
cd d:\HRM&PMS\frontend
node node_modules/vite/bin/vite.js
```
- Runs on port 5173
- React + TypeScript + TailwindCSS
- Centralized data hooks

### Access Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

## Centralized Data Architecture

### Backend Data Store
- **Single Source of Truth:** All data fetched from database
- **Caching System:** 30-second cache timeout for performance
- **Automatic Updates:** Cache invalidated when data changes
- **Live Updates:** Real-time data synchronization

### Frontend Data Hooks
- **useCentralizedData:** Main hook for all centralized data
- **useEmployees:** Employee-specific data
- **useProjects:** Project-specific data
- **useTasks:** Task-specific data
- **useAttendance:** Attendance-specific data
- **useLeaves:** Leave-specific data

### Automatic Updates
- **Project Creation:** Updates dashboard, project lists, task assignments
- **Employee Creation:** Updates dropdowns, attendance, leave modules
- **Task Creation:** Updates project task lists, employee task lists, dashboard stats
- **Cache Invalidation:** Automatic cache refresh after data changes

## Benefits

1. **Single Source of Truth:** No duplicate data arrays
2. **Performance:** Cached data reduces database queries
3. **Consistency:** All modules use same data source
4. **Live Updates:** Real-time data synchronization
5. **Maintainability:** Centralized data management
6. **Scalability:** Efficient caching and data fetching
