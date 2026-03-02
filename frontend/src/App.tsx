import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import TasksPage from './pages/TasksPage'
import UsersPage from './pages/UsersPage'
import ReportsPage from './pages/ReportsPage'
import TimesheetPage from './pages/TimesheetPage'
import ProfilePage from './pages/ProfilePage'
import ProfileEditPage from './pages/ProfileEditPage'
import NotificationSettingsPage from './pages/NotificationSettingsPage'
import SettingsSecurityPage from './pages/SettingsSecurityPage'
import NotificationsPage from './pages/NotificationsPage'
import IssuesPage from './pages/IssuesPage'
import IssueDetailPage from './pages/IssueDetailPage'
import TeamPage from './pages/TeamPage'
import AutomationPage from './pages/AutomationPage'
import CalendarPage from './pages/CalendarPage'
// People module imports
import PeopleDashboardPage from './pages/people/PeopleDashboardPage'
import EmployeesPage from './pages/people/EmployeesPage'
import AttendancePage from './pages/people/AttendancePage'
import LeaveManagementPage from './pages/people/LeaveManagementPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="issues" element={<IssuesPage />} />
          <Route path="issues/:id" element={<IssueDetailPage />} />
          <Route path="timesheets" element={<TimesheetPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<ProfileEditPage />} />
          <Route path="settings/notifications" element={<NotificationSettingsPage />} />
          <Route path="settings/security" element={<SettingsSecurityPage />} />
          {/* People module routes */}
          <Route path="people/dashboard" element={<PeopleDashboardPage />} />
          <Route path="people/employees" element={<EmployeesPage />} />
          <Route path="people/attendance" element={<AttendancePage />} />
          <Route path="people/leave-management" element={<LeaveManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
