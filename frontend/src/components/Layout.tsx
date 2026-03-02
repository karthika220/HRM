import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  BarChart3, Clock, LogOut, Bell, ChevronLeft, ChevronRight, Menu, ChevronDown, User, Settings, Key, BellRing, AlertTriangle, Zap, Calendar, Users2, CalendarDays, FileText
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import { useNotifications } from '../utils/notifications'
import TimerBadge from './TimerBadge'

const NAV_ITEMS = [
  // MAIN
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'MAIN' },
  { to: '/projects', label: 'Projects', icon: FolderKanban, section: 'MAIN' },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare, section: 'MAIN' },
  { to: '/issues', label: 'Issues', icon: AlertTriangle, section: 'MAIN' },
  // MANAGE
  { to: '/timesheets', label: 'Timesheets', icon: Clock, section: 'MANAGE' },
  { to: '/team', label: 'Team', icon: Users, section: 'MANAGE' },
  { to: '/calendar', label: 'Calendar', icon: Calendar, section: 'MANAGE' },
  // PEOPLE
  { to: '/people/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'PEOPLE' },
  { to: '/people/employees', label: 'Employees', icon: Users2, section: 'PEOPLE' },
  { to: '/people/attendance', label: 'Attendance', icon: CalendarDays, section: 'PEOPLE' },
  { to: '/people/leave-management', label: 'Leave Management', icon: FileText, section: 'PEOPLE' },
  // ADMIN
  { to: '/automation', label: 'Automation', icon: Zap, roles: ['MANAGING_DIRECTOR', 'HR'], section: 'ADMIN' },
  { to: '/users', label: 'Admin Settings', icon: Settings, roles: ['MANAGING_DIRECTOR', 'MANAGER'], section: 'ADMIN' },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['MANAGING_DIRECTOR', 'MANAGER'], section: 'ADMIN' },
]

const ROLE_LABELS: Record<string, string> = {
  MANAGING_DIRECTOR: 'Managing Director',
  HR_MANAGER: 'HR Manager',
  TEAM_LEAD: 'Team Lead',
  EMPLOYEE: 'Employee',
}

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const { unreadCount, refreshUnreadCount } = useNotifications()

  useEffect(() => {
    refreshUnreadCount()
    
    // Set up periodic refresh for real-time updates
    const interval = setInterval(refreshUnreadCount, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [refreshUnreadCount])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleProfileAction = (action: string) => {
    setProfileDropdownOpen(false)
    
    switch (action) {
      case 'view-profile':
        navigate('/profile')
        break
      case 'edit-profile':
        navigate('/profile/edit')
        break
      case 'notification-settings':
        navigate('/settings/notifications')
        break
      case 'change-password':
        navigate('/settings/security')
        break
      case 'sign-out':
        logout()
        navigate('/login')
        break
    }
  }

  const visibleNav = NAV_ITEMS.filter(item =>
    !item.roles || item.roles.includes(user?.role || '')
  )

  const groupedNavItems = visibleNav.reduce((acc, item) => {
    const section = item.section || 'OTHER'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(item)
    return acc
  }, {} as Record<string, typeof visibleNav>)

  const renderSection = (section: string, items: typeof visibleNav) => (
    <div key={section} className="sidebar-section">
      {!collapsed && (
        <p className="sidebar-label text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 mt-4">
          {section}
        </p>
      )}
      {items.map(({ to, label, icon: Icon }) => {
        const isIssuesPage = to === '/issues'
        return (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
            {isIssuesPage && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{unreadCount > 99 ? '99+' : unreadCount}</span>
              </span>
            )}
          </NavLink>
        )
      })}
    </div>
  )

  return (
    <div className="flex h-screen bg-app-bg overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 md:z-auto h-full flex flex-col
        bg-surface border-r border-white/10
        transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-teal to-brand-mint flex-shrink-0 flex items-center justify-center">
            <span className="text-black font-bold text-xs">PF</span>
          </div>
          {!collapsed && (
            <div>
              <div className="font-rubik font-bold text-white text-sm leading-tight">ProjectFlow</div>
              <div className="text-[10px] text-zinc-500">Project Management</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {renderSection('MAIN', groupedNavItems.MAIN || [])}
          {renderSection('MANAGE', groupedNavItems.MANAGE || [])}
          {renderSection('PEOPLE', groupedNavItems.PEOPLE || [])}
          {renderSection('ADMIN', groupedNavItems.ADMIN || [])}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/10 relative" ref={profileDropdownRef}>
          {!collapsed ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 flex-1 min-w-0 rounded-xl hover:bg-white/5 transition-all w-full"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-teal to-brand-mint flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                  <div className="text-xs text-zinc-500 truncate">{ROLE_LABELS[user?.role || '']}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Profile Dropdown Menu for Expanded State */}
              {profileDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 bg-surface border border-white/10 rounded-xl shadow-lg animate-fade-in min-w-[220px] z-50">
                  <div className="py-2">
                    <button
                      onClick={() => handleProfileAction('view-profile')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={() => handleProfileAction('edit-profile')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => handleProfileAction('notification-settings')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>Notification Settings</span>
                    </button>
                    <button
                      onClick={() => handleProfileAction('change-password')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                    >
                      <Key className="w-4 h-4" />
                      <span>Change Password</span>
                    </button>
                    <div className="border-t border-white/10 my-2" />
                    <button
                      onClick={() => handleProfileAction('sign-out')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-full flex justify-center p-2 rounded-xl hover:bg-white/5 transition-all"
                title="Profile Menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-teal to-brand-mint flex items-center justify-center">
                  <span className="text-black font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>
              
              {/* Profile Dropdown Menu for Collapsed State */}
              {profileDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 bg-surface border border-white/10 rounded-xl shadow-lg animate-fade-in min-w-[220px] z-50">
                  <div className="py-2">
                    <button
                      onClick={() => handleProfileAction('view-profile')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={() => handleProfileAction('edit-profile')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => handleProfileAction('notification-settings')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>Notification Settings</span>
                    </button>
                    <button
                      onClick={() => handleProfileAction('change-password')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                    >
                      <Key className="w-4 h-4" />
                      <span>Change Password</span>
                    </button>
                    <div className="border-t border-white/10 my-2" />
                    <button
                      onClick={() => handleProfileAction('sign-out')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-surface border border-white/20 rounded-full
            items-center justify-center text-zinc-400 hover:text-white transition-all md:flex"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center px-6 border-b border-white/10 bg-surface/50 backdrop-blur gap-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:bg-white/5"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <TimerBadge />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-teal to-brand-mint flex items-center justify-center">
              <span className="text-black font-bold text-xs">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-white">{user?.name}</div>
            <div className="text-xs text-zinc-500">{ROLE_LABELS[user?.role || '']}</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
