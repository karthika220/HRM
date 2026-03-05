# Workforce HRM & PMS

A comprehensive Human Resource Management and Project Management System built with modern web technologies. This full-stack SaaS application combines HR operations with project management capabilities to streamline business processes and enhance team collaboration.

## 📋 Project Overview

**Workforce HRM & PMS** is a complete workforce management solution that includes:
- 🏢 **Human Resource Management** - Employee management, attendance, leave tracking
- 📊 **Project Management** - Project tracking, task management, progress monitoring
- 🐛 **Issue Tracking** - Bug reporting, feature requests, issue resolution
- 📈 **Analytics & Reporting** - Comprehensive reports and business insights
- 🤖 **Automation** - Automated task management and workflow optimization
- 📅 **Calendar & Scheduling** - Event management and deadline tracking

## 🗂 Project Structure

```
workforce/
├── 📁 frontend/                    # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/                  # All application pages
│   │   ├── components/             # Reusable UI components
│   │   ├── store/                  # Zustand state management
│   │   ├── api/                    # Axios configuration
│   │   ├── hooks/                  # Custom React hooks
│   │   └── utils/                  # Utility functions
│   └── public/                     # Static assets
├── 📁 backend/                     # Express API
│   ├── src/
│   │   ├── routes/                 # API endpoints
│   │   ├── middleware/             # Authentication & authorization
│   │   └── controllers/           # Business logic
│   ├── prisma/                     # Database schema & migrations
│   └── scripts/                    # Utility scripts
├── 📁 docs/                        # Documentation
│   ├── PROJECT_SUMMARY.md          # Complete project overview
│   ├── TECHNICAL_DOCUMENTATION.md  # Technical architecture
│   ├── USER_MANUAL.md              # User guide
│   └── DEPLOYMENT_GUIDE.md        # Deployment instructions
└── 📄 README.md                    # This file
```

## 🗂 Project Structure

```
workforce/
  frontend/          # React + Vite + Tailwind
    src/
      pages/         # LoginPage, DashboardPage, ProjectsPage, ...
      components/    # Layout, Sidebar
      store/         # Zustand auth store
      api/           # Axios instance
  backend/           # Express API
    src/
      routes/        # auth, users, projects, tasks, timesheets, reports, dashboard
      middleware/    # JWT auth middleware
    prisma/          # Schema + seed
  .env.example
  README.md
```

## 🔐 Roles

| Role | Access |
|------|--------|
| Managing Director | Full access to all features |
| HR Manager | Manage users, projects, reports |
| Team Lead | Create/manage projects and tasks |
| Employee | View assigned tasks, log timesheets |

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Copy environment files
cp .env.example backend/.env
# Edit backend/.env with your database URL and JWT secret
```

### 2. Setup Database (PostgreSQL / Supabase)

```bash
cd backend
npm install

# Push schema to database
npx prisma db push

# Seed with demo data
node prisma/seed.js
```

### 3. Start Backend

```bash
cd backend
npm run dev
# API runs at http://localhost:3001
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
# UI runs at http://localhost:5173
```

## 🔑 Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@workforce.io | password | Managing Director |
| sarah@projectflow.io | password | HR Manager |
| mike@projectflow.io | password | Team Lead |
| john@projectflow.io | password | Employee |

## 📚 Documentation

### 📖 [Project Summary](./PROJECT_SUMMARY.md)
- Complete project overview and architecture
- Feature descriptions and capabilities
- Technology stack details
- Demo data information

### 🔧 [Technical Documentation](./TECHNICAL_DOCUMENTATION.md)
- System architecture and design
- Database schema and relationships
- API documentation
- Security implementation
- Performance optimization

### 👤 [User Manual](./USER_MANUAL.md)
- Step-by-step user guide
- Feature tutorials
- Troubleshooting guide
- Best practices

### 🚀 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- Production deployment instructions
- Docker configuration
- Cloud deployment options
- Security and monitoring setup

## 🌐 API Endpoints

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

GET    /api/dashboard/stats

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
GET    /api/projects/:id/milestones
POST   /api/projects/:id/milestones
GET    /api/projects/:id/activities

GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/tasks/:id/comments
POST   /api/tasks/:id/comments

GET    /api/timesheets
POST   /api/timesheets
PATCH  /api/timesheets/:id/approve

GET    /api/reports
POST   /api/reports
DELETE /api/reports/:id

GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id

GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
```

## 🗄️ Database Setup with Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to Settings → Database → Connection String (URI)
3. Set `DATABASE_URL` in `backend/.env`
4. Run `npx prisma db push` to create tables

## 🎨 Design System

Uses the Profitcast dark design system:
- Background: `#02040A`
- Surface: `#09090B`  
- Brand Teal: `#00A1C7`
- Brand Mint: `#00FFAA`
- Font: Rubik (headings), Inter (body), JetBrains Mono (data)

## 🏗️ Tech Stack

**Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Zustand, Axios, React Router v6, date-fns, Lucide React

**Backend:** Node.js, Express, Prisma ORM, PostgreSQL, JWT, bcryptjs
