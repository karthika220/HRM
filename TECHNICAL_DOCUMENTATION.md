# Workforce HRM & PMS - Technical Documentation

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React SPA)   │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Express.js    │    │ • Supabase      │
│ • TypeScript    │    │ • Prisma ORM    │    │ • PostgreSQL    │
│ • Tailwind CSS  │    │ • JWT Auth      │    │ • Real-time     │
│ • Zustand       │    │ • REST APIs     │    │ • Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow Architecture
```
User Interface → React Components → Zustand Store → API Client → Express Routes → Prisma Client → Database
     ↑                                          ↓
     └─────────────── State Updates ←────────────┘
```

## 📋 Database Schema

### Core Models

#### User Model
```typescript
interface User {
  id: string
  email: string
  password: string
  name: string
  role: 'MANAGING_DIRECTOR' | 'HR_MANAGER' | 'TEAM_LEAD' | 'MANAGER' | 'EMPLOYEE'
  department: string
  avatar?: string
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Project Model
```typescript
interface Project {
  id: string
  name: string
  description: string
  status: 'PLANNING' | 'ACTIVE' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'
  startDate: DateTime
  endDate: DateTime
  budget?: number
  color: string
  tags: string[]
  services: string[]
  ownerId: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Task Model
```typescript
interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  startDate?: DateTime
  dueDate?: DateTime
  estimatedHours?: number
  projectId: string
  assigneeId?: string
  creatorId: string
  parentId?: string
  tags?: string
  service?: string
  isAutomated: boolean
  delayNotified: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Issue Model
```typescript
interface Issue {
  id: string
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  reporterId: string
  assignedTo?: string
  roleLevel: 'EMPLOYEE' | 'TEAM_LEAD' | 'MANAGER' | 'HR_MANAGER' | 'MANAGING_DIRECTOR'
  projectId?: string
  raisedDate: DateTime
  expectedEndDate?: DateTime
  tags?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Relationships
```
User (1) ──── (N) Project (Owner)
User (1) ──── (N) Task (Creator/Assignee)
User (1) ──── (N) Issue (Reporter/Assignee)
Project (1) ──── (N) Task
Project (1) ──── (N) Issue
Task (1) ──── (N) Subtask (Self-referencing)
Task (1) ──── (N) Comment
Issue (1) ──── (N) IssueComment
```

## 🔐 Authentication & Authorization

### JWT Token Structure
```typescript
interface JWTPayload {
  userId: string
  iat: number  // Issued at
  exp: number  // Expiration time
}
```

### Role-Based Access Control (RBAC)
```typescript
const PERMISSIONS = {
  MANAGING_DIRECTOR: [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'projects.create', 'projects.read', 'projects.update', 'projects.delete',
    'reports.create', 'reports.read', 'reports.update', 'reports.delete',
    'system.admin'
  ],
  HR_MANAGER: [
    'users.create', 'users.read', 'users.update',
    'projects.read', 'projects.update',
    'reports.read', 'reports.create',
    'hr.functions'
  ],
  TEAM_LEAD: [
    'users.read', 'users.update',
    'projects.create', 'projects.read', 'projects.update',
    'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete',
    'reports.read'
  ],
  MANAGER: [
    'users.read', 'users.update',
    'projects.read', 'projects.update',
    'tasks.read', 'tasks.update',
    'reports.read'
  ],
  EMPLOYEE: [
    'users.read', 'users.update',
    'projects.read',
    'tasks.read', 'tasks.update',
    'reports.read'
  ]
}
```

### Middleware Implementation
```typescript
// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// Authorization Middleware
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' })
  }
  next()
}
```

## 🌐 API Architecture

### RESTful API Design

#### Authentication Endpoints
```
POST   /api/auth/login          - User login
POST   /api/auth/signup         - User registration
POST   /api/auth/register       - Alternative registration
GET    /api/auth/me             - Get current user
```

#### User Management
```
GET    /api/users               - Get all users
GET    /api/users/:id           - Get specific user
PUT    /api/users/:id           - Update user
DELETE /api/users/:id           - Delete user
```

#### Project Management
```
GET    /api/projects            - Get all projects
POST   /api/projects            - Create project
GET    /api/projects/:id        - Get specific project
PUT    /api/projects/:id        - Update project
DELETE /api/projects/:id        - Delete project
GET    /api/projects/:id/tasks  - Get project tasks
```

#### Task Management
```
GET    /api/tasks                - Get all tasks
POST   /api/tasks                - Create task
GET    /api/tasks/:id            - Get specific task
PUT    /api/tasks/:id            - Update task
DELETE /api/tasks/:id            - Delete task
```

#### Issue Tracking
```
GET    /api/issues               - Get all issues
POST   /api/issues               - Create issue
GET    /api/issues/:id           - Get specific issue
PUT    /api/issues/:id           - Update issue
DELETE /api/issues/:id           - Delete issue
```

### API Response Format
```typescript
interface APIResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
```

### Error Handling
```typescript
interface APIError {
  status: number
  message: string
  code?: string
  details?: any
}
```

## 🎨 Frontend Architecture

### Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main application layout
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── ...
├── pages/               # Page components
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx
│   ├── TasksPage.tsx
│   └── ...
├── store/               # State management
│   ├── authStore.ts     # Authentication state
│   └── ...
├── api/                 # API client
│   ├── axios.ts         # HTTP client configuration
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useCentralizedData.ts
│   └── ...
├── utils/               # Utility functions
│   ├── permissions.ts   # Role-based permissions
│   └── ...
└── types/               # TypeScript type definitions
    └── ...
```

### State Management (Zustand)
```typescript
interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  validateToken: () => boolean
}
```

### Custom Hooks
```typescript
// Centralized data hook
const useCentralizedData = () => {
  const [data, setData] = useState({
    employees: [],
    projects: [],
    tasks: [],
    attendance: [],
    leaves: []
  })
  const [loading, setLoading] = useState(true)
  
  const fetchAllData = useCallback(async () => {
    // Fetch all centralized data
  }, [])
  
  return { data, loading, fetchAllData }
}
```

## 🔧 Configuration Management

### Environment Variables
```env
# Backend Configuration
DATABASE_URL="postgresql://..."
JWT_SECRET="your-jwt-secret"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-key"
NODE_ENV="development"
PORT=3001

# Frontend Configuration
VITE_API_BASE_URL="http://localhost:3001/api"
VITE_APP_NAME="Workforce HRM & PMS"
```

### Prisma Configuration
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 📊 Reporting System

### Report Types
```typescript
interface Report {
  id: string
  title: string
  type: 'PROJECT_SUMMARY' | 'TASK_SUMMARY' | 'TIMESHEET'
  data: string // JSON string
  projectId?: string
  createdById: string
  createdAt: DateTime
}
```

### Report Generation Process
1. **Data Collection** - Gather relevant data from database
2. **Data Processing** - Calculate metrics and aggregations
3. **Report Formatting** - Structure data for presentation
4. **Storage** - Save report in database
5. **Delivery** - Provide API endpoints for access

### Sample Report Data
```typescript
interface ProjectSummaryReport {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
}
```

## 🤖 Automation System

### Automation Rules
```typescript
interface AutomationRule {
  id: string
  name: string
  trigger: 'SCHEDULED' | 'EVENT_BASED' | 'CONDITION_BASED'
  action: 'CREATE_TASK' | 'SEND_NOTIFICATION' | 'UPDATE_STATUS'
  conditions: any
  schedule?: string
  active: boolean
  createdById: string
  createdAt: DateTime
}
```

### Automated Tasks
```typescript
interface AutomatedTask {
  id: string
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isAutomated: true
  schedule: string // Cron expression
  lastRun?: DateTime
  nextRun?: DateTime
}
```

### Automation Examples
- Daily database backup
- Security scans
- Performance monitoring
- Log rotation
- SSL certificate checks
- API health checks

## 📱 Mobile Responsiveness

### Breakpoint System
```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Responsive Design Patterns
- **Mobile-First Approach** - Design for mobile first
- **Flexible Grid** - Use CSS Grid and Flexbox
- **Responsive Images** - Optimize images for different screens
- **Touch-Friendly** - Larger touch targets for mobile

## 🔍 Performance Optimization

### Frontend Optimizations
```typescript
// Code Splitting
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'))
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage'))

// Image Optimization
const optimizedImage = {
  src: '/api/images/optimized',
  loading: 'lazy',
  sizes: '(max-width: 768px) 100vw, 50vw'
}
```

### Backend Optimizations
```typescript
// Database Query Optimization
const projects = await prisma.project.findMany({
  include: {
    tasks: {
      where: { status: 'IN_PROGRESS' },
      take: 10
    },
    members: {
      select: { id: true, name: true, role: true }
    }
  },
  orderBy: { updatedAt: 'desc' }
})

// Connection Pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})
```

## 🧪 Testing Strategy

### Frontend Testing
```typescript
// Component Testing
import { render, screen } from '@testing-library/react'
import { Provider } from 'zustand'

test('renders login form', () => {
  render(
    <Provider>
      <LoginPage />
    </Provider>
  )
  expect(screen.getByLabelText('Email')).toBeInTheDocument()
})
```

### Backend Testing
```typescript
// API Testing
import request from 'supertest'
import app from '../src/app'

test('POST /api/auth/login', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password' })
  
  expect(response.status).toBe(200)
  expect(response.body.token).toBeDefined()
})
```

## 📈 Monitoring & Logging

### Application Monitoring
```typescript
// Error Tracking
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  // Send to monitoring service
  monitoringService.captureException(err, {
    request: req,
    user: req.user
  })
  
  res.status(500).json({ message: 'Internal server error' })
}
```

### Performance Monitoring
```typescript
// API Response Time
const performanceMiddleware = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.path} - ${duration}ms`)
  })
  
  next()
}
```

## 🚀 Deployment Architecture

### Development Environment
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
    
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
    volumes:
      - ./backend:/app
```

### Production Environment
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    image: workforce-frontend:latest
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    
  backend:
    image: workforce-backend:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
```

## 🔒 Security Best Practices

### Input Validation
```typescript
// Request Validation
const validateProject = (req, res, next) => {
  const { name, description, status } = req.body
  
  if (!name || name.length < 3) {
    return res.status(400).json({ message: 'Name must be at least 3 characters' })
  }
  
  if (!['PLANNING', 'ACTIVE', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }
  
  next()
}
```

### SQL Injection Prevention
```typescript
// Using Prisma ORM (parameterized queries)
const projects = await prisma.project.findMany({
  where: {
    status: req.query.status,
    ownerId: req.user.userId
  }
})
```

### XSS Prevention
```typescript
// Input Sanitization
import DOMPurify from 'dompurify'

const sanitizedDescription = DOMPurify.sanitize(req.body.description)
```

---

**Technical Documentation Version:** 1.0.0  
**Last Updated:** March 3, 2026  
**Maintained by:** Development Team
