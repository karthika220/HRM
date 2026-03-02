import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FolderKanban, Users, CheckSquare, Calendar, Tag, X, LayoutGrid, List, Edit, TrendingUp, CheckCircle, Archive, PauseCircle, Trash2, Bug } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import { format } from 'date-fns'
import { canManageProjects, isSuperAdmin, isTeamLead } from '../utils/permissions'
import ReminderModal from '../components/ReminderModal'
import { generateServiceTasks } from '../utils/generateServiceTasks'
import ProjectDiagnostic from '../components/ProjectDiagnostic'

const STATUS_OPTIONS = ['ONBOARDING', 'ACTIVE', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']
const STATUS_COLORS: Record<string, string> = {
  ONBOARDING: 'bg-blue-500/20 text-blue-400 ring-blue-500/30',
  ACTIVE: 'bg-cyan-500/20 text-cyan-400 ring-cyan-500/30',
  IN_PROGRESS: 'bg-brand-teal/15 text-brand-teal ring-brand-teal/30',
  ON_HOLD: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/30',
  COMPLETED: 'bg-brand-mint/15 text-brand-mint ring-brand-mint/30',
  ARCHIVED: 'bg-zinc-500/20 text-zinc-400 ring-zinc-500/30',
}

const SERVICE_OPTIONS = [
  'GMB',
  'Meta Ads',
  'Google Ads',
  'SEO',
  'Amazon Ads',
  'Amazon SEO',
  'LinkedIn Ads',
  'Graphic Design',
  'SMM',
  'Web Development',
  'Email Marketing',
  'WhatsApp Marketing',
  'Video Marketing',
  'Personal Branding',
  'Influencer Outreach',
  'Personal Assistance'
]

// Real project names mapping
const getRealProjectName = (originalName: string): string => {
  const projectMapping: Record<string, string> = {
    'Website Redesign': 'Rentla',
    'Security Audit': 'IT World',
    'Mobile App': 'Space Inc.',
    'Data Migration': 'Anthilla Architectz',
    'API Development': 'The Detailing Mafia | Sarjapura',
    'UI Redesign': 'The Detailing Mafia | Kalyan Nagar',
    'Database Update': 'Motofence | Bangalore',
    'Cloud Migration': 'Detailing Wolves | Tirupur',
    'Performance Optimization': 'Uniq Customz',
    'Feature Development': 'One Stop Automotive',
    'Testing Suite': 'MMA 360',
    'Documentation': 'DIYA Robotics | Malaysia',
    'Code Review': 'Drive Dynamix'
  }
  
  return projectMapping[originalName] || originalName
}

// Demo data fallback
const DEMO_PROJECTS = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete website redesign with modern UI/UX',
    status: 'ACTIVE',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    budget: 25000,
    color: '#00A1C7',
    tags: ['Web Development', 'UI/UX', 'Frontend'],
    services: ['Web Development', 'UI Design', 'SEO', 'Content'],
    memberIds: ['1', '2', '3'],
    createdBy: '1',
    ownerIds: ['1'],
    progress: 75,
    _count: { tasks: 12, milestones: 3 }
  },
  {
    id: '2',
    name: 'Mobile App v2.0',
    description: 'Native mobile application with React Native',
    status: 'IN_PROGRESS',
    startDate: '2024-02-01',
    endDate: '2024-04-15',
    budget: 35000,
    color: '#FF6B6B',
    tags: ['Mobile Development', 'React Native', 'iOS', 'Android'],
    services: ['Mobile Development', 'Backend API', 'Database'],
    memberIds: ['1', '2', '4'],
    createdBy: '1',
    ownerIds: ['1'],
    progress: 45,
    _count: { tasks: 8, milestones: 2 }
  },
  {
    id: '3',
    name: 'Security Audit',
    description: 'Comprehensive security assessment and recommendations',
    status: 'COMPLETED',
    startDate: '2023-12-01',
    endDate: '2024-01-15',
    budget: 15000,
    color: '#10B981',
    tags: ['Security', 'Audit', 'Compliance', 'Risk Assessment'],
    services: ['Security Testing', 'Penetration Testing', 'Documentation'],
    memberIds: ['1', '3', '5'],
    createdBy: '1',
    ownerIds: ['1'],
    progress: 100,
    _count: { tasks: 15, milestones: 4 }
  },
  {
    id: '4',
    name: 'Data Migration',
    description: 'Database migration and optimization',
    status: 'ON_HOLD',
    startDate: '2024-03-01',
    endDate: '2024-05-15',
    budget: 20000,
    color: '#F59E0B',
    tags: ['Database', 'Migration', 'Optimization'],
    services: ['Database Design', 'Data Engineering', 'ETL'],
    memberIds: ['1', '2', '4'],
    createdBy: '1',
    ownerIds: ['1'],
    progress: 30,
    _count: { tasks: 6, milestones: 1 }
  },
  {
    id: '5',
    name: 'API Development',
    description: 'RESTful API development and documentation',
    status: 'ACTIVE',
    startDate: '2024-01-10',
    endDate: '2024-03-10',
    budget: 18000,
    color: '#06B6D4',
    tags: ['Backend', 'API', 'Documentation'],
    services: ['Node.js', 'Express', 'MongoDB'],
    memberIds: ['1', '2', '3'],
    createdBy: '1',
    ownerIds: ['1'],
    progress: 60,
    _count: { tasks: 10, milestones: 2 }
  }
]

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderProject, setReminderProject] = useState<any>(null)
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false)
  const ownerDropdownRef = useRef<HTMLDivElement>(null)

  const canCreate = canManageProjects(user?.role || '')

  const [form, setForm] = useState({
    name: '', description: '', status: 'ONBOARDING',
    startDate: '', endDate: '', budget: '', color: '#00A1C7', tags: '',
    services: [] as string[], memberIds: [] as string[],
    createdBy: user?.id || '',
    ownerIds: [] as string[],
  })
  const [showDiagnostic, setShowDiagnostic] = useState(false)

  // Auto-trigger reminder for demo
  useEffect(() => {
    if (!showReminderModal) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Check for projects due today
      const dueTodayProjects = projects.filter(project => {
        if (project.endDate) {
          const dueDate = new Date(project.endDate)
          dueDate.setHours(0, 0, 0, 0)
          
          // Check if due date is today (within 24 hours for demo)
          const isDueToday = Math.abs(today.getTime() - dueDate.getTime()) < 24 * 60 * 60 * 1000
          
          if (isDueToday) {
            setReminderProject(project)
            setShowReminderModal(true)
            return // Only show one reminder at a time
          }
        }
      })
      
      // Show first reminder found
      if (dueTodayProjects.length > 0 && !showReminderModal) {
        setReminderProject(dueTodayProjects[0])
        setShowReminderModal(true)
      }
    }
  }, [projects, showReminderModal])

  const handleMarkDone = () => {
    console.log(`✅ Project "${reminderProject?.name}" marked as done via reminder`)
    setShowReminderModal(false)
    setReminderProject(null)
  }

  const handleCancelReminder = () => {
    console.log(`❌ Project "${reminderProject?.name}" reminder dismissed`)
    setShowReminderModal(false)
    setReminderProject(null)
  }

  useEffect(() => {
    loadProjects()
    if (canCreate) {
      api.get('/users').then(r => setAllUsers(r.data))
    }
    // Load view mode from localStorage
    const savedViewMode = localStorage.getItem('projectsViewMode')
    if (savedViewMode === 'list' || savedViewMode === 'grid') {
      setViewMode(savedViewMode)
    }
  }, [statusFilter, serviceFilter])

  const loadProjects = async () => {
    setLoading(true)
    try {
      // Try to fetch real data first
      const response = await api.get('/projects', {
        params: statusFilter ? { status: statusFilter } : {}
      })
      
      console.log('✅ Successfully loaded projects from API:', response.data?.length || 0, 'projects');
      setProjects(response.data || DEMO_PROJECTS)
    } catch (error) {
      console.error('❌ Failed to load projects from API:', error)
      console.log('📋 Falling back to demo data with', DEMO_PROJECTS.length, 'projects');
      // Fallback to demo data
      setProjects(DEMO_PROJECTS)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const projectData = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        budget: form.budget ? parseFloat(form.budget) : null,
        startDate: form.startDate ? new Date(form.startDate) : null,
        endDate: form.endDate ? new Date(form.endDate) : null,
      }
      
      if (editingProject) {
        // Update existing project
        const oldServices = editingProject.services || []
        const updatedServices = form.services || []
        
        await api.put(`/projects/${editingProject.id}`, projectData)
        
        // Auto-generate tasks for newly added services
        const newlyAddedServices = updatedServices.filter(
          (service: string) => !oldServices.includes(service)
        )

        for (const service of newlyAddedServices) {
          const serviceUpper = service.toUpperCase()
          
          try {
            const tasksResponse = await api.get(`/tasks?projectId=${editingProject.id}`)
            const existingTasks = tasksResponse.data
            const existingServiceTasks = existingTasks?.filter(
              (t: any) =>
                t.projectId === editingProject.id &&
                t.service === serviceUpper &&
                t.isAutomated === true
            )

            if (!existingServiceTasks || existingServiceTasks.length === 0) {
              const autoTasks = generateServiceTasks(serviceUpper, editingProject.id, user?.id || '')

              if (autoTasks.length > 0) {
                for (const task of autoTasks) {
                  await api.post('/tasks', task)
                }
              }
            }
          } catch (taskError) {
            console.warn('Could not check for existing tasks, proceeding with auto-generation:', taskError)
            const autoTasks = generateServiceTasks(serviceUpper, editingProject.id, user?.id || '')

            if (autoTasks.length > 0) {
              for (const task of autoTasks) {
                await api.post('/tasks', task)
              }
            }
          }
        }
        
        setEditingProject(null)
      } else {
        // Create new project
        const response = await api.post('/projects', projectData)
        const newProject = response.data

        // Auto-generate service-based tasks
        if (form.services && form.services.length > 0) {
          for (const service of form.services) {
            const serviceUpper = service.toUpperCase()
            
            // Prevent duplicate automated tasks
            try {
              const tasksResponse = await api.get(`/tasks?projectId=${newProject.id}`)
              const existingTasks = tasksResponse.data
              const existingServiceTasks = existingTasks?.filter(
                (t: any) =>
                  t.projectId === newProject.id &&
                  t.service === serviceUpper &&
                  t.isAutomated === true
              )

              if (!existingServiceTasks || existingServiceTasks.length === 0) {
                const autoTasks = generateServiceTasks(serviceUpper, newProject.id, user?.id || '')

                if (autoTasks.length > 0) {
                  // Create tasks individually since no batch addTasks method exists
                  for (const task of autoTasks) {
                    await api.post('/tasks', task)
                  }
                }
              }
            } catch (taskError) {
              // If task checking fails, proceed with task creation
              console.warn('Could not check for existing tasks, proceeding with auto-generation:', taskError)
              const autoTasks = generateServiceTasks(serviceUpper, newProject.id, user?.id || '')

              if (autoTasks.length > 0) {
                for (const task of autoTasks) {
                  await api.post('/tasks', task)
                }
              }
            }
          }
        }
      }
      
      setShowModal(false)
      setForm({ name: '', description: '', status: 'ONBOARDING', startDate: '', endDate: '', budget: '', color: '#00A1C7', tags: '', services: [], memberIds: [], createdBy: user?.id || '', ownerIds: [] })
      loadProjects()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving project')
    }
  }

  const handleEdit = (project: any) => {
    setEditingProject(project)
    setForm({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'ONBOARDING',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      budget: project.budget?.toString() || '',
      color: project.color || '#00A1C7',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
      services: project.services || [],
      memberIds: project.members?.map((m: any) => m.user.id) || [],
      createdBy: project.createdBy || user?.id || '',
      ownerIds: project.owners?.map((o: any) => o.id) || [],
    })
    setShowModal(true)
  }

  const handleDelete = async (project: any) => {
    if (!confirm(`Are you sure you want to delete project "${project.name}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      await api.delete(`/projects/${project.id}`)
      loadProjects()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting project')
    }
  }

  const safeProjects = Array.isArray(projects) ? projects : [];

  const filtered = safeProjects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  // Create filteredProjects based on selected status
  const filteredProjects = filtered

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('projectsViewMode', mode)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rubik font-bold text-2xl text-white">Projects</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-zinc-500 text-sm">{projects.length} projects total</p>
            {projects.some(p => p._count?.tasks === undefined) && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                Demo Data
              </span>
            )}
            {projects.every(p => p._count?.tasks !== undefined) && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                Live Data
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canCreate && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,161,199,0.3)]"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
          <button
            onClick={() => setShowDiagnostic(true)}
            className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 text-zinc-300 rounded-xl hover:bg-white/10 transition-all"
            title="Run diagnostic to check API connection and data"
          >
            <Bug className="w-4 h-4" />
            Diagnostic
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center bg-[#18181B] border border-white/10 rounded-xl px-3 focus-within:border-brand-teal transition-all">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="bg-transparent text-white placeholder-zinc-600 text-sm px-3 py-2.5 outline-none w-64"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#18181B] border border-white/10 text-zinc-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal transition-all"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select
          value={serviceFilter}
          onChange={e => setServiceFilter(e.target.value)}
          className="bg-[#18181B] border border-white/10 text-zinc-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-brand-teal transition-all"
        >
          <option value="">All Services</option>
          {SERVICE_OPTIONS.map(service => <option key={service} value={service}>{service}</option>)}
        </select>
        <div className="flex bg-[#18181B] border border-white/10 rounded-xl p-1">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-brand-teal/20 text-brand-teal'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-brand-teal/20 text-brand-teal'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Grid or List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#09090B] border border-white/5 rounded-2xl p-5 h-52 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-2/3 mb-3" />
              <div className="h-3 bg-white/5 rounded w-full mb-2" />
              <div className="h-3 bg-white/5 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredProjects.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-[#09090B] border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-200 group block"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: project.color + '20', border: `1px solid ${project.color}30` }}
                  >
                    <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                  </div>
                  <div>
                    <h3 className="font-rubik font-semibold text-white text-sm group-hover:text-brand-teal transition-colors line-clamp-1">
                      {getRealProjectName(project.name)}
                    </h3>
                    <span className="text-xs text-zinc-500">{project.owner?.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Progress indicator for grid view */}
                  {viewMode === 'grid' && (
                    <div className="relative w-8 h-8">
                      <svg className="w-8 h-8 transform -rotate-90">
                        <circle
                          cx="16"
                          cy="16"
                          r="12"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          className="text-white/10"
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="12"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 12}`}
                          strokeDashoffset={`${2 * Math.PI * 12 * (1 - (project.progress || 0) / 100)}`}
                          className="text-brand-teal transition-all duration-300"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-medium text-white">
                        {project.progress || 0}%
                      </span>
                    </div>
                  )}
                  {canCreate && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleEdit(project)
                        }}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDelete(project)
                        }}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ring-1 ${STATUS_COLORS[project.status]}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {project.description && (
                <p className="text-zinc-500 text-xs mb-4 line-clamp-2">{project.description}</p>
              )}

              {/* Tags */}
              {project.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
              {Array.isArray(project.tags) ? project.tags.slice(0, 3).map((tag: string) => {
                    // Generate color dynamically based on tag name
                    const getTagColor = (tagName: string) => {
                      const tagLower = tagName.toLowerCase();
                      if (tagLower.includes('gmb') || tagLower.includes('google my business')) return 'bg-emerald-500';
                      if (tagLower.includes('seo') || tagLower.includes('search')) return 'bg-blue-500';
                      if (tagLower.includes('meta') || tagLower.includes('facebook') || tagLower.includes('instagram')) return 'bg-purple-500';
                      if (tagLower.includes('google') || tagLower.includes('ads')) return 'bg-orange-500';
                      if (tagLower.includes('amazon')) return 'bg-yellow-500';
                      if (tagLower.includes('linkedin')) return 'bg-blue-600';
                      if (tagLower.includes('design') || tagLower.includes('graphic')) return 'bg-pink-500';
                      if (tagLower.includes('smm') || tagLower.includes('social')) return 'bg-indigo-500';
                      if (tagLower.includes('web') || tagLower.includes('development')) return 'bg-cyan-500';
                      if (tagLower.includes('email') || tagLower.includes('marketing')) return 'bg-red-500';
                      if (tagLower.includes('video')) return 'bg-violet-500';
                      if (tagLower.includes('branding') || tagLower.includes('personal')) return 'bg-teal-500';
                      return 'bg-cyan-400'; // default color
                    };
                    
                    return (
                    <span 
                      key={tag} 
                      className="inline-flex items-center gap-1 text-xs font-medium text-white px-2 py-1 rounded-full bg-opacity-90 hover:bg-opacity-100 transition-all"
                      style={{ backgroundColor: getTagColor(tag) }}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                    );
                  }) : null}
                </div>
              )}

              {/* Service Tag */}
              {project.service && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="flex items-center gap-1 text-[10px] bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-md border border-brand-teal/20">
                    <Tag className="w-2.5 h-2.5" />
                    {project.service}
                  </span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{project._count?.tasks || 0} tasks</span>
                </div>
                {/* Progress bar for list view */}
                {viewMode === 'list' && (
                  <div className="flex items-center gap-2">
                    <div className="w-[120px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-teal rounded-full transition-all duration-300"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-brand-teal font-medium text-[10px]">
                      {project.progress || 0}%
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{(project.members?.length || 0) + 1} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(new Date(project.endDate), 'MMM dd, yy')}</span>
                </div>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && !loading && (
            <div className={`col-span-full flex flex-col items-center justify-center py-20 text-zinc-600 ${viewMode === 'list' ? 'col-span-full' : ''}`}>
              <FolderKanban className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm">Try adjusting your filters or create a new project</p>
            </div>
          )}
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && reminderProject && (
        <ReminderModal
          projectName={reminderProject.name}
          dueDate={reminderProject.endDate}
          onMarkDone={handleMarkDone}
          onCancel={handleCancelReminder}
        />
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090B] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-rubik font-bold text-xl text-white">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project Name *</label>
                <input
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  required placeholder="e.g. Website Redesign"
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Assigned By</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    readOnly
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white opacity-60 cursor-not"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project Owners *</label>
                  <div className="relative" ref={ownerDropdownRef}>
                    <div 
                      className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white cursor-pointer focus:border-brand-teal outline-none transition-all min-h-[42px] flex flex-wrap items-center gap-2"
                      onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                    >
                      {form.ownerIds.length === 0 ? (
                        <span className="text-zinc-600">Select project owners...</span>
                      ) : (
                        form.ownerIds.map(ownerId => {
                          const owner = allUsers.find(u => u.id === ownerId)
                          return owner ? (
                            <span key={ownerId} className="bg-brand-teal/20 text-brand-teal px-2 py-1 rounded text-xs flex items-center gap-1">
                              {owner.name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setForm({ ...form, ownerIds: form.ownerIds.filter(id => id !== ownerId) })
                                }}
                                className="hover:text-brand-mint"
                              >
                                ×
                              </button>
                            </span>
                          ) : null
                        })
                      )}
                    </div>
                    
                    {showOwnerDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#18181B] border border-white/10 rounded-xl max-h-48 overflow-y-auto z-10">
                        {allUsers.map(u => (
                          <div
                            key={u.id}
                            onClick={() => {
                              if (form.ownerIds.includes(u.id)) {
                                setForm({ ...form, ownerIds: form.ownerIds.filter(id => id !== u.id) })
                              } else {
                                setForm({ ...form, ownerIds: [...form.ownerIds, u.id] })
                              }
                            }}
                            className="px-4 py-2 text-sm text-white cursor-pointer hover:bg-white/5 flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={form.ownerIds.includes(u.id)}
                              onChange={() => {}}
                              className="rounded border-white/20 bg-white/10 text-brand-teal focus:ring-brand-teal focus:ring-offset-0 pointer-events-none"
                            />
                            <span>{u.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                <textarea
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Describe the project..."
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 outline-none transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Services</label>
                <div className="h-40 overflow-y-auto rounded-lg border border-white/10 bg-[#18181B] p-2 space-y-2" style={{ height: '160px' }}>
                  {SERVICE_OPTIONS.map(service => (
                    <label key={service} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={form.services.includes(service)}
                        onChange={e => {
                          if (e.target.checked) {
                            setForm({ ...form, services: [...form.services, service] })
                          } else {
                            setForm({ ...form, services: form.services.filter(s => s !== service) })
                          }
                        }}
                        className="rounded border-white/20 bg-[#18181B] text-brand-teal focus:ring-brand-teal focus:ring-offset-0"
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">End Date *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none transition-all"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Budget (optional)</label>
                  <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-brand-teal outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="design, frontend, urgent"
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-brand-teal outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-[#18181B] cursor-pointer"
                  />
                  <span className="text-zinc-500 text-sm font-mono">{form.color}</span>
                  <div className="flex gap-2 flex-wrap">
                    {['#00A1C7', '#00FFAA', '#FF6826', '#8B5CF6', '#EC4899', '#F59E0B'].map(c => (
                      <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                        className="w-6 h-6 rounded-full border-2 transition-all"
                        style={{ backgroundColor: c, borderColor: form.color === c ? '#fff' : 'transparent' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.name.trim()}
                  className="px-6 py-3 bg-brand-teal text-white rounded-xl font-medium hover:bg-brand-teal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
          </form>
        </div>
        </div>
      )}
      
      {/* Diagnostic Modal */}
      <ProjectDiagnostic 
        isVisible={showDiagnostic} 
        onClose={() => setShowDiagnostic(false)} 
      />
    </div>
  )
}
