import { useEffect, useState, useRef } from 'react'
import { CheckSquare, Search, Filter, Plus, X, MessageSquare, Clock, AlertTriangle, Calendar, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import { format, differenceInDays } from 'date-fns'
import { canManageTasks, isSuperAdmin, isTeamLead } from '../utils/permissions'

// Demo data fallback
const DEMO_TASKS = [
  {
    id: '1',
    title: 'Design landing page mockup',
    description: 'Create high-fidelity mockup for the new landing page design',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2024-03-01',
    projectId: '1',
    assigneeId: '2',
    assignerId: '1',
    ownerId: '2',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
    comments: 3,
    project: { id: '1', name: 'Website Redesign' },
    assignee: { id: '2', name: 'Sarah Johnson', avatar: 'SJ' }
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication system to the mobile app',
    status: 'TODO',
    priority: 'CRITICAL',
    dueDate: '2024-02-28',
    projectId: '2',
    assigneeId: '3',
    assignerId: '1',
    ownerId: '3',
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-18T16:00:00Z',
    comments: 5,
    project: { id: '2', name: 'Mobile App v2.0' },
    assignee: { id: '3', name: 'Michael Chen', avatar: 'MC' }
  },
  {
    id: '3',
    title: 'Database schema optimization',
    description: 'Optimize database queries and add proper indexing',
    status: 'DONE',
    priority: 'MEDIUM',
    dueDate: '2024-02-15',
    projectId: '4',
    assigneeId: '1',
    assignerId: '1',
    ownerId: '1',
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-14T15:30:00Z',
    comments: 2,
    project: { id: '4', name: 'Data Migration' },
    assignee: { id: '1', name: 'Emma Davis', avatar: 'ED' }
  },
  {
    id: '4',
    title: 'Write API documentation',
    description: 'Create comprehensive documentation for all API endpoints',
    status: 'IN_REVIEW',
    priority: 'LOW',
    dueDate: '2024-03-05',
    projectId: '5',
    assigneeId: '4',
    assignerId: '1',
    ownerId: '4',
    createdAt: '2024-02-12T13:00:00Z',
    updatedAt: '2024-02-22T10:15:00Z',
    comments: 1,
    project: { id: '5', name: 'API Development' },
    assignee: { id: '4', name: 'James Wilson', avatar: 'JW' }
  },
  {
    id: '5',
    title: 'Security vulnerability assessment',
    description: 'Conduct thorough security assessment of the application',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2024-02-25',
    projectId: '3',
    assigneeId: '5',
    assignerId: '1',
    ownerId: '5',
    createdAt: '2024-02-08T14:00:00Z',
    updatedAt: '2024-02-19T09:45:00Z',
    comments: 4,
    project: { id: '3', name: 'Security Audit' },
    assignee: { id: '5', name: 'Lisa Brown', avatar: 'LB' }
  },
  {
    id: '6',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment pipeline',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2024-03-10',
    projectId: '1',
    assigneeId: '1',
    assignerId: '1',
    ownerId: '1',
    createdAt: '2024-02-14T10:30:00Z',
    updatedAt: '2024-02-21T16:20:00Z',
    comments: 2,
    project: { id: '1', name: 'Website Redesign' },
    assignee: { id: '1', name: 'Emma Davis', avatar: 'ED' }
  },
  {
    id: '7',
    title: 'Performance testing',
    description: 'Run comprehensive performance tests on the application',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2024-03-15',
    projectId: '2',
    assigneeId: '2',
    assignerId: '1',
    ownerId: '2',
    createdAt: '2024-02-16T11:15:00Z',
    updatedAt: '2024-02-20T13:45:00Z',
    comments: 0,
    project: { id: '2', name: 'Mobile App v2.0' },
    assignee: { id: '2', name: 'Sarah Johnson', avatar: 'SJ' }
  },
  {
    id: '8',
    title: 'User acceptance testing',
    description: 'Coordinate UAT sessions with stakeholders',
    status: 'TODO',
    priority: 'LOW',
    dueDate: '2024-03-20',
    projectId: '3',
    assigneeId: '3',
    assignerId: '1',
    ownerId: '3',
    createdAt: '2024-02-18T15:00:00Z',
    updatedAt: '2024-02-22T14:10:00Z',
    comments: 1,
    project: { id: '3', name: 'Security Audit' },
    assignee: { id: '3', name: 'Michael Chen', avatar: 'MC' }
  },
  {
    id: '9',
    title: 'Data backup strategy',
    description: 'Implement automated backup and recovery procedures',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2024-02-27',
    projectId: '4',
    assigneeId: '4',
    assignerId: '1',
    ownerId: '4',
    createdAt: '2024-02-11T09:30:00Z',
    updatedAt: '2024-02-21T11:25:00Z',
    comments: 3,
    project: { id: '4', name: 'Data Migration' },
    assignee: { id: '4', name: 'James Wilson', avatar: 'JW' }
  },
  {
    id: '10',
    title: 'Code review and refactoring',
    description: 'Review existing code and implement refactoring improvements',
    status: 'DONE',
    priority: 'MEDIUM',
    dueDate: '2024-02-20',
    projectId: '5',
    assigneeId: '5',
    assignerId: '1',
    ownerId: '5',
    createdAt: '2024-02-05T12:00:00Z',
    updatedAt: '2024-02-19T17:30:00Z',
    comments: 6,
    project: { id: '5', name: 'API Development' },
    assignee: { id: '5', name: 'Lisa Brown', avatar: 'LB' }
  }
]

const DEMO_PROJECTS = [
  { id: '1', name: 'Website Redesign' },
  { id: '2', name: 'Mobile App v2.0' },
  { id: '3', name: 'Security Audit' },
  { id: '4', name: 'Data Migration' },
  { id: '5', name: 'API Development' }
]

const DEMO_USERS = [
  { id: '1', name: 'Emma Davis', avatar: 'ED' },
  { id: '2', name: 'Sarah Johnson', avatar: 'SJ' },
  { id: '3', name: 'Michael Chen', avatar: 'MC' },
  { id: '4', name: 'James Wilson', avatar: 'JW' },
  { id: '5', name: 'Lisa Brown', avatar: 'LB' }
]

const STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-zinc-500/20 text-zinc-400 ring-zinc-500/30',
  IN_PROGRESS: 'bg-brand-teal/15 text-brand-teal ring-brand-teal/30',
  IN_REVIEW: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/30',
  DONE: 'bg-brand-mint/15 text-brand-mint ring-brand-mint/30',
  DELAYED: 'bg-red-500/20 text-red-400 ring-red-500/30',
  CANCELLED: 'bg-red-500/15 text-red-400 ring-red-500/30',
}
const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-zinc-400', MEDIUM: 'text-yellow-400', HIGH: 'text-brand-orange', CRITICAL: 'text-red-400',
}
const PRIORITY_DOT: Record<string, string> = {
  LOW: 'bg-zinc-400', MEDIUM: 'bg-yellow-400', HIGH: 'bg-brand-orange', CRITICAL: 'bg-red-400',
}

// Utility function to calculate delay duration
const getDelayDuration = (dueDate: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const daysOverdue = differenceInDays(today, due)
  return daysOverdue > 0 ? daysOverdue : 0
}

export default function TasksPage() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [comment, setComment] = useState('')
  const [editingTask, setEditingTask] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewsDropdown, setShowViewsDropdown] = useState(false)
  const [selectedView, setSelectedView] = useState<string>('')
  const viewsDropdownRef = useRef<HTMLDivElement>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    projectId: '',
    assigneeId: '',
    assignerId: user?.id || '',
    ownerId: ''
  })
  const [users, setUsers] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([]) // For task creation dropdown
  const [projectUsers, setProjectUsers] = useState<any[]>([])

  const canCreate = canManageTasks(user?.role || '')

  // Task Views Configuration
  const taskViews = {
    // Predefined Views
    predefined: [
      { id: 'all', label: 'All Tasks', filter: {} as any },
      { id: 'all_open', label: 'All Open', filter: { status: 'TODO,IN_PROGRESS,IN_REVIEW' } as any },
      { id: 'all_closed', label: 'All Closed', filter: { status: 'DONE,CANCELLED' } as any },
      { id: 'all_overdue_open', label: 'All Overdue & Open', filter: { overdue: true, status: 'TODO,IN_PROGRESS,IN_REVIEW' } as any },
      { id: 'unassigned', label: 'Unassigned', filter: { unassigned: true } as any },
      { id: 'unscheduled', label: 'Unscheduled Tasks', filter: { unscheduled: true } as any },
    ],
    myViews: [
      { id: 'my_open', label: 'My Open', filter: { ownerId: user?.id, status: 'TODO,IN_PROGRESS,IN_REVIEW' } as any },
      { id: 'my_closed', label: 'My Closed', filter: { ownerId: user?.id, status: 'DONE,CANCELLED' } as any },
      { id: 'my_overdue_open', label: 'My Overdue & Open', filter: { ownerId: user?.id, overdue: true, status: 'TODO,IN_PROGRESS,IN_REVIEW' } as any },
      { id: 'today', label: "Today's Tasks", filter: { ownerId: user?.id, dueDate: 'today' } as any },
      { id: 'following', label: 'Tasks I Follow', filter: { following: true, ownerId: user?.id } as any },
      { id: 'created_by_me', label: 'Tasks Created By Me', filter: { assignerId: user?.id } as any },
      { id: 'assigned_via_picklist', label: 'Assigned Via Pick List', filter: { ownerId: user?.id, assignedViaPicklist: true } as any },
    ],
    customViews: [] as any[], // TODO: Add custom views from backend
    sharedViews: [] as any[], // TODO: Add shared views from backend
  }

  // Apply view filters
  const applyViewFilter = (viewId: string) => {
    setSelectedView(viewId)
    
    // Find the view configuration
    const allViews = [
      ...taskViews.predefined,
      ...taskViews.myViews,
      ...taskViews.customViews,
      ...taskViews.sharedViews
    ]
    const view = allViews.find(v => v.id === viewId)
    
    if (view) {
      // Reset existing filters
      setStatusFilter('')
      setPriorityFilter('')
      setProjectFilter('')
      
      // Apply view-specific filters
      if (view.filter.status) {
        setStatusFilter(view.filter.status)
      }
      if ('priority' in view.filter && view.filter.priority) {
        setPriorityFilter(view.filter.priority)
      }
      if ('projectId' in view.filter && view.filter.projectId) {
        setProjectFilter(view.filter.projectId)
      }
      
      // Store custom filter params for API call
      setViewFilter(view.filter)
    }
  }

  const [viewFilter, setViewFilter] = useState<any>({})

  // Close views dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewsDropdownRef.current && !viewsDropdownRef.current.contains(event.target as Node)) {
        setShowViewsDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Check if user can edit the task
  const canEditTask = (task: any) => {
    return task.assigneeId === user?.id || task.creatorId === user?.id || canCreate
  }

  useEffect(() => {
    loadTasks()
    api.get('/projects').then(r => setProjects(r.data))
    // Only load users if user has permission
    if (canManageTasks(user?.role || '')) {
      api.get('/users').then(r => {
        console.log('Users API response:', r.data);
        setUsers(r.data)        // For task filtering
        setAllUsers(r.data)      // For task creation dropdown
      }).catch(err => {
        console.log('Users API error:', err);
        if (err.response?.status === 403) {
          setUsers([])        // For task filtering
          setAllUsers([])      // For task creation dropdown
        }
      })
    }
  }, [statusFilter, priorityFilter, projectFilter, ownerFilter, viewFilter])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const params: any = {}
      
      // Apply standard filters
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      if (projectFilter) params.projectId = projectFilter
      if (ownerFilter) params.ownerId = ownerFilter
      
      // Apply view-specific filters
      if (selectedView) {
        const view = taskViews.predefined.find(v => v.id === selectedView) ||
                   taskViews.myViews.find(v => v.id === selectedView) ||
                   taskViews.customViews.find(v => v.id === selectedView)
        if (view?.filter) {
          Object.assign(params, view.filter)
        }
      }
      if (viewFilter.following) {
        params.following = true
      }
      if (viewFilter.assignedViaPicklist) {
        params.assignedViaPicklist = true
      }
      
      const r = await api.get('/tasks', { params })
      setTasks(r.data || DEMO_TASKS)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      // Fallback to demo data
      setTasks(DEMO_TASKS)
    } finally {
      setLoading(false)
    }
  }

  const openTask = async (task: any) => {
    const r = await api.get(`/tasks/${task.id}`)
    setSelectedTask(r.data)
  }

  const addComment = async () => {
    if (!comment.trim() || !selectedTask) return
    await api.post(`/tasks/${selectedTask.id}/comments`, { content: comment })
    setComment('')
    openTask(selectedTask)
  }

  const updateStatus = async (taskId: string, status: string) => {
    await api.put(`/tasks/${taskId}`, { status })
    loadTasks()
    if (selectedTask?.id === taskId) {
      setSelectedTask((t: any) => t ? { ...t, status } : t)
    }
  }

  const updateTask = async (taskId: string, updates: any) => {
    try {
      await api.put(`/tasks/${taskId}`, updates)
      loadTasks()
      if (selectedTask?.id === taskId) {
        setSelectedTask((t: any) => t ? { ...t, ...updates } : t)
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleFieldBlur = (field: string, value: any) => {
    if (editingTask && canEditTask(selectedTask)) {
      updateTask(selectedTask.id, { [field]: value })
    }
    setEditingTask(null)
  }

  const createTask = async () => {
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
        projectId: newTask.projectId,
        ownerId: newTask.ownerId
      }
      
      await api.post('/tasks', taskData)
      setShowCreateModal(false)
      setNewTask({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        projectId: '',
        assigneeId: '',
        assignerId: user?.id || '',
        ownerId: ''
      })
      setProjectUsers([])
      loadTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const loadProjectUsers = async (projectId: string) => {
    if (!projectId) {
      setProjectUsers([])
      return
    }
    
    try {
      // Get project details with team members
      const project = await api.get(`/projects/${projectId}`)
      setProjectUsers(project.data.team || [])
    } catch (error) {
      console.error('Failed to load project users:', error)
      setProjectUsers([])
    }
  }

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.project?.name.toLowerCase().includes(search.toLowerCase()) ||
    (!ownerFilter || t.ownerId === ownerFilter || t.assigneeId === ownerFilter)
  )

  return (
    <div className="flex gap-6 h-full animate-fade-in" style={{ maxHeight: 'calc(100vh - 160px)' }}>
      {/* Task List */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-rubik font-bold text-2xl text-white">Tasks</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{filtered.length} tasks</p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,161,199,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center bg-[#18181B] border border-white/10 rounded-xl px-3 focus-within:border-brand-teal transition-all">
            <Search className="w-4 h-4 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="bg-transparent text-white placeholder-zinc-600 text-sm px-3 py-2 outline-none w-48"
            />
          </div>
          
          {/* Views Dropdown */}
          <div className="relative" ref={viewsDropdownRef}>
            <button
              onClick={() => setShowViewsDropdown(!showViewsDropdown)}
              className={`flex items-center gap-2 bg-[#18181B] border border-white/10 text-zinc-300 text-sm rounded-xl px-3 py-2 outline-none transition-all ${
                selectedView ? 'border-brand-teal text-brand-teal' : 'hover:border-brand-teal'
              }`}
            >
              <Filter className="w-4 h-4" />
              {selectedView ? (() => {
                const allViews = [...taskViews.predefined, ...taskViews.myViews, ...taskViews.customViews, ...taskViews.sharedViews]
                const view = allViews.find(v => v.id === selectedView)
                return view ? view.label : 'Views'
              })() : 'Views'}
            </button>
            
            {showViewsDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-[#18181B] border border-white/10 rounded-xl min-w-[200px] max-h-80 overflow-y-auto z-10">
                {/* Predefined Views */}
                <div className="p-2">
                  <div className="text-xs font-medium text-zinc-500 mb-2 px-2">Predefined Views</div>
                  {taskViews.predefined.map(view => (
                    <button
                      key={view.id}
                      onClick={() => {
                        applyViewFilter(view.id)
                        setShowViewsDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-all ${
                        selectedView === view.id 
                          ? 'bg-brand-teal/20 text-brand-teal' 
                          : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
                
                {/* My Views */}
                <div className="p-2 border-t border-white/5">
                  <div className="text-xs font-medium text-zinc-500 mb-2 px-2">My Views</div>
                  {taskViews.myViews.map(view => (
                    <button
                      key={view.id}
                      onClick={() => {
                        applyViewFilter(view.id)
                        setShowViewsDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-all ${
                        selectedView === view.id 
                          ? 'bg-brand-teal/20 text-brand-teal' 
                          : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
                
                {/* My Custom Views */}
                {taskViews.customViews.length > 0 && (
                  <div className="p-2 border-t border-white/5">
                    <div className="text-xs font-medium text-zinc-500 mb-2 px-2">My Custom Views</div>
                    {taskViews.customViews.map(view => (
                      <button
                        key={view.id}
                        onClick={() => {
                          applyViewFilter(view.id)
                          setShowViewsDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-all ${
                          selectedView === view.id 
                            ? 'bg-brand-teal/20 text-brand-teal' 
                            : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Shared Views */}
                {taskViews.sharedViews.length > 0 && (
                  <div className="p-2 border-t border-white/5">
                    <div className="text-xs font-medium text-zinc-500 mb-2 px-2">Shared Views</div>
                    {taskViews.sharedViews.map(view => (
                      <button
                        key={view.id}
                        onClick={() => {
                          applyViewFilter(view.id)
                          setShowViewsDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-all ${
                          selectedView === view.id 
                            ? 'bg-brand-teal/20 text-brand-teal' 
                            : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#18181B] border border-white/10 text-zinc-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-brand-teal transition-all">
            <option value="">All Status</option>
            {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DELAYED', 'DONE', 'CANCELLED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="bg-[#18181B] border border-white/10 text-zinc-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-brand-teal transition-all">
            <option value="">All Priority</option>
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
            className="bg-[#18181B] border border-white/10 text-zinc-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-brand-teal transition-all">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}
            className="bg-[#18181B] border border-white/10 text-zinc-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-brand-teal transition-all">
            <option value="">All Owners</option>
            {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-[#09090B] border border-white/5 rounded-xl p-4 h-20 animate-pulse">
                <div className="h-3 bg-white/5 rounded w-2/3 mb-2" /><div className="h-3 bg-white/5 rounded w-1/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
              <CheckSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No tasks found</p>
            </div>
          ) : (
            filtered.map(task => (
              <div
                key={task.id}
                onClick={() => openTask(task)}
                className={`bg-[#09090B] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 transition-all group ${
                  selectedTask?.id === task.id ? 'border-brand-teal/30 bg-brand-teal/5' : 'border-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  {/* Left Section */}
                  <div className="flex flex-col">
                    <h3 className={`text-base font-semibold text-white ${task.status === 'DELAYED' ? 'text-red-400' : ''}`}>
                      {task.title}
                    </h3>
                    {task.project && (
                      <div className="text-xs text-gray-400 mt-1">
                        {task.project.name}
                      </div>
                    )}
                    {/* Owner Display */}
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Owner: {task.assignee?.name ?? "Unassigned"}</span>
                    </div>
                  </div>
                  
                  {/* Right Section */}
                  <div className="flex flex-col items-end">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'DONE' ? 'bg-green-500/15 text-green-400 ring-green-500/30' :
                      task.status === 'DELAYED' ? 'bg-red-500/15 text-red-400 ring-red-500/30' :
                      task.status === 'IN_PROGRESS' ? 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/30' :
                      STATUS_COLORS[task.status]
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    
                    {/* Due Date */}
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                        <Calendar className="w-3 h-3" />
                        <span className={task.status === 'DELAYED' ? 'text-red-400 font-medium' : ''}>
                          {format(new Date(task.dueDate), 'MMM dd')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <div className="w-96 flex-shrink-0 bg-[#09090B] border border-white/10 rounded-2xl flex flex-col overflow-hidden animate-slide-in">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-rubik font-semibold text-white text-sm">Task Detail</h3>
            <button onClick={() => setSelectedTask(null)} className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              {canEditTask(selectedTask) ? (
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={e => setSelectedTask({...selectedTask, title: e.target.value})}
                  onBlur={e => handleFieldBlur('title', e.target.value)}
                  className="font-rubik font-bold text-white bg-transparent border-none outline-none w-full text-lg"
                  placeholder="Task title"
                />
              ) : (
                <h2 className="font-rubik font-bold text-white">{selectedTask.title}</h2>
              )}
              {selectedTask.description && (
                canEditTask(selectedTask) ? (
                  <textarea
                    value={selectedTask.description}
                    onChange={e => setSelectedTask({...selectedTask, description: e.target.value})}
                    onBlur={e => handleFieldBlur('description', e.target.value)}
                    className="text-zinc-500 text-sm mt-1 bg-transparent border-none outline-none w-full resize-none"
                    rows={3}
                    placeholder="Task description"
                  />
                ) : (
                  <p className="text-zinc-500 text-sm mt-1">{selectedTask.description}</p>
                )
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/[0.02] rounded-lg p-2.5">
                <div className="text-zinc-600 mb-1">Status</div>
                <select value={selectedTask.status} onChange={e => updateStatus(selectedTask.id, e.target.value)}
                  className="bg-transparent text-white text-xs outline-none w-full cursor-pointer">
                  {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'].map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2.5">
                <div className="text-zinc-600 mb-1">Priority</div>
                {canEditTask(selectedTask) ? (
                  <select 
                    value={selectedTask.priority} 
                    onChange={e => handleFieldBlur('priority', e.target.value)}
                    className="bg-transparent text-white text-xs outline-none w-full cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                ) : (
                  <div className={`font-bold ${PRIORITY_COLORS[selectedTask.priority]}`}>{selectedTask.priority}</div>
                )}
              </div>
              {selectedTask.assignee && (
                <div className="bg-white/[0.02] rounded-lg p-2.5">
                  <div className="text-zinc-600 mb-1">Assignee</div>
                  <div className="text-white">{selectedTask.assignee.name}</div>
                </div>
              )}
              {selectedTask.dueDate && (
                <div className="bg-white/[0.02] rounded-lg p-2.5">
                  <div className="text-zinc-600 mb-1">Due Date</div>
                  {canEditTask(selectedTask) ? (
                    <input
                      type="date"
                      value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''}
                      onChange={e => handleFieldBlur('dueDate', e.target.value)}
                      className="bg-transparent text-white text-xs outline-none w-full cursor-pointer"
                    />
                  ) : (
                    <div className="text-white">{format(new Date(selectedTask.dueDate), 'MMM dd, yyyy')}</div>
                  )}
                </div>
              )}
              {selectedTask.estimatedHours && (
                <div className="bg-white/[0.02] rounded-lg p-2.5 col-span-2">
                  <div className="text-zinc-600 mb-1">Estimated Hours</div>
                  <div className="text-white flex items-center gap-1"><Clock className="w-3 h-3" />{selectedTask.estimatedHours}h</div>
                </div>
              )}
            </div>

            {/* Subtasks */}
            {selectedTask.subtasks?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-2">Subtasks</h4>
                {selectedTask.subtasks.map((st: any) => (
                  <div key={st.id} className="flex items-center gap-2 text-sm text-zinc-400 py-1">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span className={st.status === 'DONE' ? 'line-through' : ''}>{st.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Comments */}
            <div>
              <h4 className="text-xs font-medium text-zinc-400 mb-3">Comments ({selectedTask.comments?.length || 0})</h4>
              <div className="space-y-3 mb-3">
                {selectedTask.comments?.map((c: any) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-teal/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] text-brand-teal font-bold">{c.user.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-zinc-500 mb-0.5">{c.user.name} · {format(new Date(c.createdAt), 'MMM dd HH:mm')}</div>
                      <p className="text-xs text-zinc-300 bg-white/[0.02] rounded-lg px-3 py-2">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && addComment()}
                  placeholder="Add comment..."
                  className="flex-1 px-3 py-2 bg-[#18181B] border border-white/10 rounded-lg text-white placeholder-zinc-600 text-xs focus:border-brand-teal outline-none"
                />
                <button onClick={addComment}
                  className="px-3 py-2 bg-brand-teal text-black text-xs font-bold rounded-lg hover:bg-brand-mint transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090B] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-rubik font-bold text-white text-lg">Create New Task</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Task Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-3 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-brand-teal outline-none"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-4 py-3 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-brand-teal outline-none resize-none"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Status</label>
                  <select
                    value={newTask.status}
                    onChange={e => setNewTask({...newTask, status: e.target.value})}
                    className="w-full px-4 py-3 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-4 py-3 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Project</label>
                  <select
                    value={newTask.projectId}
                    onChange={e => {
                      setNewTask({...newTask, projectId: e.target.value, ownerId: ''})
                      loadProjectUsers(e.target.value)
                    }}
                    className="w-full px-4 py-3 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-4 py-3 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Assigned By</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    readOnly
                    className="w-full px-4 py-3 bg-[#18181B] border border-white/10 rounded-xl text-white opacity-60 cursor-not"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Owner *</label>
                  <select
                    value={newTask.ownerId}
                    onChange={e => setNewTask({...newTask, ownerId: e.target.value})}
                    className="w-full px-4 py-3 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                    required
                  >
                    <option value="">Select Owner</option>
                    {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-white/10">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                disabled={!newTask.title.trim() || !newTask.ownerId.trim()}
                className="px-6 py-3 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
