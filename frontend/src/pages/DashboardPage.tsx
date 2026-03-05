import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, CheckSquare, AlertTriangle, TrendingUp, Clock, Target, Activity } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import { format } from 'date-fns'
import { useCentralizedData } from '../hooks/useCentralizedData'
// Recharts imports
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Demo data fallback
const DEMO_DASHBOARD_STATS: DashboardStats = {
  activeProjects: 12,
  completedTasks: 156,
  overdueTasks: 8,
  teamMembers: 24,
  totalProjects: 15
}

const DEMO_TASK_WEEKLY: TaskWeekly[] = [
  { day: 'Mon', created: 12, completed: 8 },
  { day: 'Tue', created: 15, completed: 12 },
  { day: 'Wed', created: 18, completed: 15 },
  { day: 'Thu', created: 14, completed: 11 },
  { day: 'Fri', created: 16, completed: 14 }
]

const DEMO_TEAM_UTILIZATION: TeamUtilization = {
  inUse: 18,
  available: 6
}

const DEMO_ACTIVITY: Activity[] = [
  { id: 1, type: 'task_completed', user: 'Sarah Johnson', action: 'completed task "Design landing page"', time: '2 hours ago', project: 'Website Redesign', createdAt: '2024-02-28T10:00:00Z' },
  { id: 2, type: 'project_created', user: 'Michael Chen', action: 'created project "Mobile App v2.0"', time: '4 hours ago', project: 'Mobile Development', createdAt: '2024-02-28T08:00:00Z' },
  { id: 3, type: 'task_assigned', user: 'Emma Davis', action: 'assigned task "Content strategy"', time: '6 hours ago', project: 'Marketing Campaign', createdAt: '2024-02-28T06:00:00Z' },
  { id: 4, type: 'milestone_reached', user: 'James Wilson', action: 'reached milestone "Q1 Goals"', time: '1 day ago', project: 'Sales Target', createdAt: '2024-02-27T12:00:00Z' },
  { id: 5, type: 'task_completed', user: 'Lisa Brown', action: 'completed task "HR policy update"', time: '2 days ago', project: 'HR System', createdAt: '2024-02-26T14:00:00Z' }
]

const DEMO_TASK_COMPLETION = {
  totalTasks: 100,
  breakdown: [
    { status: 'DONE', count: 40, percentage: 40 },
    { status: 'IN_PROGRESS', count: 25, percentage: 25 },
    { status: 'TODO', count: 20, percentage: 20 },
    { status: 'DELAYED', count: 15, percentage: 15 }
  ],
  weekly: [
    { week: 'This Week', planned: 20, completed: 16, percentage: 80 },
    { week: 'Last Week', planned: 18, completed: 14, percentage: 78 }
  ],
  monthly: [
    { month: 'January', planned: 80, completed: 65, percentage: 81 },
    { month: 'February', planned: 75, completed: 58, percentage: 77 }
  ]
}

// CSS for scrollable tasks container
const styles = `
.my-open-tasks {
  max-height: 260px;
  overflow-y: auto;
}
`

// Centralized task status colors
const STATUS_COLORS: Record<string, string> = {
  DELAYED: "#ef4444",
  DONE: "#10b981",
  IN_PROGRESS: "#06b6d4",
  IN_REVIEW: "#f59e0b",
  TODO: "#6b7280"
}

// Normalize status names for consistent color mapping
const normalizeStatus = (status: string) =>
  status.trim().toUpperCase().replace(' ', '_');

// Fixed status order for consistent rendering
const STATUS_ORDER = ['DELAYED', 'DONE', 'IN_PROGRESS', 'IN_REVIEW', 'TODO']

interface DashboardStats {
  activeProjects: number
  completedTasks: number
  overdueTasks: number
  teamMembers: number
  totalProjects: number
}

interface TaskWeekly {
  day: string
  created: number
  completed: number
}

interface TeamUtilization {
  inUse: number
  available: number
}

interface ProjectHealth {
  name: string
  progress: number
}

interface MyTask {
  id: string
  title: string
  status: string
  priority: string
  dueDate?: string
  createdAt: string
  project: {
    name: string
    color: string
  }
}

interface Milestone {
  id: string
  name: string
  targetDate: string
  isCompleted: boolean
  project: {
    name: string
    color: string
  }
}

interface TaskCompletion {
  totalTasks: number;
  breakdown: {
    status: string;
    count: number;
    percentage: number;
  }[];
  weekly: {
    week: string;
    planned: number;
    completed: number;
    percentage: number;
  }[];
  monthly: {
    month: string;
    planned: number;
    completed: number;
    percentage: number;
  }[];
}

interface Activity {
  id: number
  type: string
  user: string
  action: string
  description?: string
  time: string
  project: string
  createdAt: string
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-zinc-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-brand-orange',
  CRITICAL: 'text-red-400',
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: centralizedData, loading: centralizedLoading, error: centralizedError } = useCentralizedData()
  const [loading, setLoading] = useState(true)
  
  // State for all API data
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [taskWeekly, setTaskWeekly] = useState<TaskWeekly[]>([])
  const [teamUtilization, setTeamUtilization] = useState<TeamUtilization | null>(null)
  const [projectHealth, setProjectHealth] = useState<ProjectHealth[]>([])
  const [myTasks, setMyTasks] = useState<MyTask[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [taskCompletion, setTaskCompletion] = useState<TaskCompletion | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Use centralized data to calculate dashboard stats
        if (centralizedData && !centralizedLoading) {
          // Calculate stats from centralized data
          const activeProjects = centralizedData.projects.filter((p: any) => p.status !== 'COMPLETED').length
          const completedTasks = centralizedData.tasks.filter((t: any) => t.status === 'DONE').length
          const overdueTasks = centralizedData.tasks.filter((t: any) => 
            t.status !== 'DONE' && new Date(t.dueDate) < new Date()
          ).length
          const teamMembers = centralizedData.employees.filter((e: any) => e.isActive).length
          const totalProjects = centralizedData.projects.length

          setStats({
            activeProjects,
            completedTasks,
            overdueTasks,
            teamMembers,
            totalProjects
          })

          // Calculate project health
          const projectHealthData = centralizedData.projects.map((p: any) => ({
            name: p.name,
            progress: p.progress || 0
          }))
          setProjectHealth(projectHealthData)

          // Set my tasks (tasks assigned to current user)
          const userTasks = centralizedData.tasks.filter((t: any) => t.assigneeId === user?.id)
          setMyTasks(userTasks)

          // Keep existing demo data for other metrics
          setTaskWeekly(DEMO_TASK_WEEKLY)
          setTeamUtilization(DEMO_TEAM_UTILIZATION)
          setMilestones([])
          setActivity(DEMO_ACTIVITY)
          setTaskCompletion(DEMO_TASK_COMPLETION)
        } else {
          // Fallback to API calls if centralized data not available
          const [
            statsRes,
            taskWeeklyRes,
            teamUtilizationRes,
            projectHealthRes,
            myTasksRes,
            milestonesRes,
            activityRes,
            taskCompletionRes
          ] = await Promise.all([
            api.get('/dashboard/stats'),
            api.get('/dashboard/task-weekly'),
            api.get('/dashboard/team-utilization'),
            api.get('/dashboard/project-health'),
            api.get('/dashboard/my-tasks'),
            api.get('/dashboard/milestones'),
            api.get('/dashboard/activity'),
            api.get('/dashboard/task-completion')
          ])

          setStats(statsRes.data || DEMO_DASHBOARD_STATS)
          setTaskWeekly(taskWeeklyRes.data || DEMO_TASK_WEEKLY)
          setTeamUtilization(teamUtilizationRes.data || DEMO_TEAM_UTILIZATION)
          setProjectHealth(projectHealthRes.data || [])
          setMyTasks(myTasksRes.data || [])
          setMilestones(milestonesRes.data || [])
          setActivity(activityRes.data || DEMO_ACTIVITY)
          setTaskCompletion(taskCompletionRes.data || DEMO_TASK_COMPLETION)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        
        // Fallback to demo data on error
        setStats(DEMO_DASHBOARD_STATS)
        setTaskWeekly(DEMO_TASK_WEEKLY)
        setTeamUtilization(DEMO_TEAM_UTILIZATION)
        setProjectHealth([])
        setMyTasks([])
        setMilestones([])
        setActivity(DEMO_ACTIVITY)
        setTaskCompletion(DEMO_TASK_COMPLETION)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    
    // Set up periodic refresh for live updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Filter tasks by open statuses and sort by latest first
  const openTasks = myTasks.filter(task => 
    task.status !== 'DONE' && task.status !== 'COMPLETED'
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Chart data preparation
  const projectStatusData = [
    { name: 'Planning', value: centralizedData?.projects.filter((p: any) => p.status === 'PLANNING').length || 3, color: '#6b7280' },
    { name: 'In Progress', value: centralizedData?.projects.filter((p: any) => p.status === 'IN_PROGRESS').length || 7, color: '#06b6d4' },
    { name: 'Completed', value: centralizedData?.projects.filter((p: any) => p.status === 'COMPLETED').length || 4, color: '#10b981' },
    { name: 'On Hold', value: centralizedData?.projects.filter((p: any) => p.status === 'ON_HOLD').length || 1, color: '#f59e0b' }
  ]

  const taskCompletionData = [
    { name: 'Todo', value: centralizedData?.tasks.filter((t: any) => t.status === 'TODO' || t.status === 'TODO').length || 20, color: '#6b7280' },
    { name: 'In Progress', value: centralizedData?.tasks.filter((t: any) => t.status === 'IN_PROGRESS').length || 25, color: '#06b6d4' },
    { name: 'Review', value: centralizedData?.tasks.filter((t: any) => t.status === 'IN_REVIEW').length || 15, color: '#f59e0b' },
    { name: 'Done', value: centralizedData?.tasks.filter((t: any) => t.status === 'DONE').length || 40, color: '#10b981' }
  ]

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#09090B] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-brand-teal font-mono">
            {payload[0].value}
          </p>
        </div>
      )
    }
    return null
  }

  // Debug: Log myTasks data
  console.log('My Tasks Data:', myTasks);
  console.log('Open Tasks:', openTasks);

  // Show fallback UI instead of blank screen
  if (!stats && !loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl text-zinc-400 mb-2">No data available</h2>
          <p className="text-zinc-600">Please check your connection and try again</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-rubik font-bold text-2xl text-white">
          Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Here's what's happening across your projects today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Projects', value: stats?.activeProjects || 0, icon: TrendingUp, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
          { label: 'Tasks Completed', value: stats?.completedTasks || 0, icon: CheckSquare, color: 'text-brand-mint', bg: 'bg-brand-mint/10' },
          { label: 'Overdue Tasks', value: stats?.overdueTasks || 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Team Members', value: stats?.teamMembers || 0, icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#09090B] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <div className={`font-mono font-bold text-3xl ${color}`}>{value}</div>
            <div className="text-zinc-500 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task Completion Trend */}
        <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-brand-teal" />
            <h2 className="font-rubik font-semibold text-white">Task Completion - Last 7 Days</h2>
          </div>
          <div className="space-y-2">
            {taskWeekly.length === 0 && (
              <div className="text-center py-8 text-zinc-600 text-sm">No task completions in last 7 days</div>
            )}
            {taskWeekly.map((trend, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">{trend.day}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-teal to-brand-mint rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((trend.completed / 10) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-brand-teal font-bold">{trend.completed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Utilization Donut */}
        <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-brand-mint" />
            <h2 className="font-rubik font-semibold text-white">Team Utilization</h2>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="url(#utilGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - (teamUtilization?.inUse || 0) / 100)}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="utilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00A1C7" />
                    <stop offset="100%" stopColor="#00FFAA" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono font-bold text-2xl text-white">{teamUtilization?.inUse || 0}%</span>
                <span className="text-zinc-500 text-xs">utilized</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">In Use</span>
              <span className="font-mono text-brand-mint font-bold">{teamUtilization?.inUse || 0}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Available</span>
              <span className="font-mono text-zinc-400 font-bold">{teamUtilization?.available || 0}%</span>
            </div>
          </div>
        </div>

        {/* Project Health Bars */}
        <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5 flex flex-col" style={{ height: '320px' }}>
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <Target className="w-5 h-5 text-brand-orange" />
            <h2 className="font-rubik font-semibold text-white">Project Health</h2>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3">
            {projectHealth.length === 0 && (
              <div className="text-center py-8 text-zinc-600 text-sm">No projects to display</div>
            )}
            {projectHealth.map((project) => {
              const healthColor = project.progress >= 80 ? 'bg-brand-mint' : 
                               project.progress >= 50 ? 'bg-yellow-400' : 
                               'bg-red-400';
              
              return (
                <div key={project.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300 truncate max-w-[120px]">{project.name}</span>
                    <span className={`font-mono text-xs ${healthColor}`}>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${healthColor} rounded-full transition-all duration-500`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Middle row - Task Completion Donut Chart & My Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task Completion Donut Chart */}
        <div className="bg-[#09090B] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-brand-teal" />
            <h2 className="font-rubik font-semibold text-white">Task Completion</h2>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="none" 
                  stroke="transparent" 
                  strokeWidth="0" 
                />
                
                {/* Aggregated and sorted data */}
                {taskCompletion?.breakdown && (() => {
                  // Aggregate by status and sort by fixed order
                  const aggregatedData = STATUS_ORDER.map(status => {
                    const items = taskCompletion.breakdown.filter(b => b.status === status);
                    const totalCount = items.reduce((sum, item) => sum + item.count, 0);
                    return totalCount > 0 ? { status, count: totalCount, percentage: Math.round((totalCount / taskCompletion.totalTasks) * 100) } : null;
                  }).filter(item => item !== null);
                  
                  let currentAngle = -90; // Start from top (12 o'clock)
                  const radius = 50;
                  const strokeWidth = 12;
                  const paddingAngle = 2; // Small gap between segments
                  
                  return aggregatedData.map((segment: any, index: number) => {
                    const percentage = segment.percentage / 100;
                    const angle = percentage * 360;
                    const adjustedAngle = angle - paddingAngle; // Account for padding
                    
                    // Calculate path for donut segment
                    const startAngle = (currentAngle * Math.PI) / 180;
                    const endAngle = ((currentAngle + adjustedAngle) * Math.PI) / 180;
                    
                    const innerRadius = radius - strokeWidth / 2;
                    const outerRadius = radius + strokeWidth / 2;
                    
                    // Calculate path coordinates
                    const x1 = 60 + innerRadius * Math.cos(startAngle);
                    const y1 = 60 + innerRadius * Math.sin(startAngle);
                    const x2 = 60 + outerRadius * Math.cos(startAngle);
                    const y2 = 60 + outerRadius * Math.sin(startAngle);
                    const x3 = 60 + innerRadius * Math.cos(endAngle);
                    const y3 = 60 + innerRadius * Math.sin(endAngle);
                    const x4 = 60 + outerRadius * Math.cos(endAngle);
                    const y4 = 60 + outerRadius * Math.sin(endAngle);
                    
                    // Create path for donut segment
                    const largeArcFlag = adjustedAngle > 180 ? 1 : 0;
                    const path = `
                      M ${x2} ${y2}
                      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x4} ${y4}
                      L ${x3} ${y3}
                      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
                      Z
                    `;
                    
                    currentAngle += adjustedAngle + paddingAngle; // Add padding for next segment
                    
                    return (
                      <path
                        key={segment.status}
                        d={path}
                        fill={STATUS_COLORS[normalizeStatus(segment.status)] || "#6b7280"}
                        className="transition-all duration-1000"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono font-bold text-2xl text-white">
                  {taskCompletion?.breakdown?.find(b => b.status === 'DONE')?.percentage || 0}%
                </span>
                <span className="text-zinc-500 text-xs">completed</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {taskCompletion?.breakdown && (() => {
              // Aggregate by status for legend
              const aggregatedData = STATUS_ORDER.map(status => {
                const items = taskCompletion.breakdown.filter(b => b.status === status);
                const totalCount = items.reduce((sum, item) => sum + item.count, 0);
                return totalCount > 0 ? { status, count: totalCount } : null;
              }).filter(item => item !== null);
              
              return aggregatedData.map((segment: any) => (
                <div key={segment.status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[normalizeStatus(segment.status)] || "#6b7280" }}
                    />
                    <span className="text-zinc-400">{segment.status.replace('_', ' ')}</span>
                  </div>
                  <span className="font-mono text-zinc-300 font-bold">{segment.count}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* My Tasks */}
        <div className="lg:col-span-2 bg-[#09090B] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-brand-teal" />
              <h2 className="font-rubik font-semibold text-white">My Open Tasks</h2>
            </div>
            <Link to="/tasks" className="text-xs text-brand-teal hover:text-brand-mint transition-colors">
              View all →
            </Link>
          </div>
          <div className="my-open-tasks space-y-3" style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {openTasks.length === 0 ? (
              <p className="text-center py-8 text-zinc-600">No open tasks assigned to you</p>
            ) : (
              openTasks.map(task => (
                <Link 
                  key={task.id} 
                  to={`/tasks/${task.id}`}
                  className="task-row flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-all group cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.status === 'TODO' ? 'bg-zinc-400' :
                    task.status === 'IN_PROGRESS' ? 'bg-brand-teal' :
                    task.status === 'IN_REVIEW' ? 'bg-yellow-400' :
                    'bg-brand-teal'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{task.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500">{task.project?.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.status === 'TODO' ? 'bg-zinc-500/20 text-zinc-400' :
                        task.status === 'IN_PROGRESS' ? 'bg-brand-teal/20 text-brand-teal' :
                        task.status === 'IN_REVIEW' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-zinc-500">
                          Due: {format(new Date(task.dueDate), 'MMM dd')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts Section - New */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Pie Chart */}
        <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FolderKanban className="w-5 h-5 text-brand-teal" />
            <h2 className="font-rubik font-semibold text-white">Project Status Overview</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
              {projectStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {projectStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-zinc-400">{item.name}</span>
                <span className="text-xs text-white font-mono ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Completion Bar Chart */}
        <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-brand-mint" />
            <h2 className="font-rubik font-semibold text-white">Task Completion Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskCompletionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {taskCompletionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-white/[0.02] rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Total Tasks</span>
              <span className="text-white font-mono">
                {taskCompletionData.reduce((sum, item) => sum + item.value, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-zinc-400">Completion Rate</span>
              <span className="text-brand-mint font-mono">
                {Math.round((taskCompletionData.find(item => item.name === 'Done')?.value || 0) / 
                  taskCompletionData.reduce((sum, item) => sum + item.value, 0) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-brand-mint" />
          <h2 className="font-rubik font-semibold text-white">Upcoming Milestones</h2>
          <span className="text-xs text-zinc-600">next 14 days</span>
        </div>
        <div className="space-y-3">
          {milestones.length === 0 && (
            <div className="text-center py-4 text-zinc-600 text-sm">No upcoming milestones</div>
          )}
          {milestones.map((milestone) => (
            <div key={milestone.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-brand-mint/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-brand-mint" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">{milestone.name}</div>
                <div className="text-xs text-zinc-500">{milestone.project?.name}</div>
              </div>
              <div className="text-xs text-brand-mint font-mono">
                {format(new Date(milestone.targetDate), 'MMM dd')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-brand-orange" />
          <h2 className="font-rubik font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="space-y-3">
          {activity.length === 0 && (
            <div className="text-center py-4 text-zinc-600 text-sm">No recent activity</div>
          )}
          {activity.map((act) => (
            <div key={act.id} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-teal/50 mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-300 leading-tight">{act.description}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {format(new Date(act.createdAt), 'MMM dd, HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
  )
}
