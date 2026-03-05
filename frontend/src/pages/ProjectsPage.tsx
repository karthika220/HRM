import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, LayoutGrid, List, MoreHorizontal, X, Check, Users, Calendar, Tag, FolderKanban } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useProjects } from '../hooks/useCentralizedData'
import { DataTable } from '../components/DataTable'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { canManageProjects } from '../utils/permissions'
import { Project } from '../types'

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  IN_PROGRESS: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
  COMPLETED: { bg: 'bg-sky-500/20', text: 'text-sky-400', dot: 'bg-sky-500' },
  ON_HOLD: { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-500' },
  ONBOARDING: { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-500' },
  ARCHIVED: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', dot: 'bg-zinc-500' },
}

const columnHelper = createColumnHelper<Project>()

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { projects, loading, error, refetch } = useProjects()
  const [viewMode, setViewMode] = useState<'sheet' | 'list'>('sheet')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  // DEBUG: Log projects data when it changes
  useEffect(() => {
    console.log("=== PROJECTS PAGE DEBUG ===");
    console.log("Projects data:", projects);
    console.log("Projects type:", typeof projects);
    console.log("Is projects an array?", Array.isArray(projects));
    console.log("Projects length:", projects?.length);
    console.log("Loading:", loading);
    console.log("Error:", error);
    if (projects && projects.length > 0) {
      console.log("First project structure:", projects[0]);
      console.log("First project keys:", Object.keys(projects[0] || {}));
    }
    console.log("========================");
  }, [projects, loading, error]);

  const canCreate = canManageProjects(user?.role || '')

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = projects || []

    // Search filter
    if (search) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.id.toLowerCase().includes(search.toLowerCase()) ||
        project.services?.some((service: string) => 
          service.toLowerCase().includes(search.toLowerCase())
        )
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    return filtered
  }, [projects, search, statusFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const active = (projects || []).filter(p => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length
    const review = (projects || []).filter(p => p.status === 'ON_HOLD' || p.status === 'ONBOARDING').length
    const done = (projects || []).filter(p => p.status === 'COMPLETED').length
    return { active, review, done }
  }, [projects])

  // Progress bar color
  const getProgressColor = (progress?: number) => {
    if (!progress) return { bg: 'bg-gray-500', text: 'text-gray-400' }
    if (progress > 75) return { bg: 'bg-emerald-500', text: 'text-emerald-400' }
    if (progress >= 40) return { bg: 'bg-amber-500', text: 'text-amber-400' }
    return { bg: 'bg-red-500', text: 'text-red-400' }
  }

  // Table columns
  const columns = useMemo<ColumnDef<Project>[]>(() => [
    // Checkbox
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-gray-600 bg-gray-700 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-600 bg-gray-700 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
        />
      ),
      enableSorting: false,
      enableResizing: false,
      size: 44,
    },
    // ID
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => (
        <span className="font-mono text-xs text-gray-500">{info.getValue() as string}</span>
      ),
      size: 90,
    }),
    // Name
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <div className="font-semibold text-gray-100">{info.getValue() as string}</div>
      ),
      size: 240,
    }),
    // Services
    columnHelper.accessor('services', {
      header: 'Services',
      cell: (info) => {
        const services = info.getValue() as string[] || []
        return (
          <div className="flex flex-wrap gap-1">
            {services.slice(0, 2).map((service: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20"
              >
                <Tag className="w-2.5 h-2.5" />
                {service}
              </span>
            ))}
            {services.length > 2 && (
              <span className="text-xs text-gray-500">+{services.length - 2}</span>
            )}
          </div>
        )
      },
      size: 180,
    }),
    // Task Progress
    columnHelper.accessor('progress', {
      header: 'Task Progress',
      cell: (info) => {
        const progress = info.getValue() as number || 0
        const taskCount = info.row.original._count?.tasks || 0
        const color = getProgressColor(progress)
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color.bg} rounded-full transition-all duration-300`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={color.text}>{progress || 0}%</span>
            </div>
            {taskCount > 0 && (
              <div className="text-xs text-gray-500">{taskCount} tasks</div>
            )}
          </div>
        )
      },
      size: 120,
    }),
    // Tags
    columnHelper.accessor('tags', {
      header: 'Tags',
      cell: (info) => {
        const tags = info.getValue() as string[] || []
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag: string, idx: number) => {
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500']
              const color = colors[idx % colors.length]
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 text-xs font-medium text-white px-2 py-1 rounded-full ${color}`}
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              )
            })}
            {tags.length > 2 && (
              <span className="text-xs text-gray-500">+{tags.length - 2}</span>
            )}
          </div>
        )
      },
      size: 180,
    }),
    // Status
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue() as string
        const colors = STATUS_COLORS[status] || STATUS_COLORS.ACTIVE
        return (
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} border border-current border-opacity-20`}>
            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {status.replace('_', ' ')}
          </div>
        )
      },
      size: 120,
    }),
    // Owner
    columnHelper.accessor('owner', {
      header: 'Owner',
      cell: (info) => {
        const owner = info.getValue() as { id: string; name: string; avatar?: string } | undefined
        if (!owner) return <span className="text-gray-500">-</span>
        
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {owner.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-300">{owner.name}</span>
          </div>
        )
      },
      size: 140,
    }),
    // Actions
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="relative group">
          <button
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Show dropdown menu
            }}
            className="p-1 text-gray-400 hover:text-gray-200 rounded hover:bg-gray-700 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {/* Dropdown menu would go here */}
        </div>
      ),
      enableSorting: false,
      enableResizing: false,
      size: 50,
    },
  ], [])

  // Data memoization for table
  const data = useMemo(() => filteredProjects ?? [], [filteredProjects])

  // Handle row click
  const handleRowClick = useCallback((project: Project) => {
    navigate(`/projects/${project.id}`)
  }, [navigate])

  // Handle new project
  const handleNewProject = useCallback(() => {
    // TODO: Open create project modal
    console.log('New project')
  }, [])

  // Load view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('projectsViewMode')
    if (savedViewMode === 'sheet' || savedViewMode === 'list') {
      setViewMode(savedViewMode)
    }
  }, [])

  // Save view mode to localStorage
  const handleViewModeChange = useCallback((mode: 'sheet' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('projectsViewMode', mode)
  }, [])

  // Correct render logic order
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mb-4"></div>
        <p className="text-gray-400">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-400">
        <p className="text-lg font-medium">Error loading projects</p>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <FolderKanban className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-lg font-medium">No projects found</p>
        <p className="text-sm text-gray-400 mb-4">Get started by creating your first project</p>
        {canCreate && (
          <button
            onClick={() => navigate('/projects/new')}
            className="px-4 py-2 bg-brand-teal/20 text-brand-teal border border-brand-teal/30 rounded-lg hover:bg-brand-teal/30 transition-colors"
          >
            Create Project
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span>ProjectFlow</span>
          <span>/</span>
          <span className="text-gray-400">Projects</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-50 mb-2">Projects</h1>
        <p className="text-sm text-gray-500 mb-4">Manage and track all client engagements</p>
        
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-gray-400">
              {stats.active} Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm text-gray-400">
              {stats.review} Review
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-sm text-gray-400">
              {stats.done} Done
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-1">
          <button
            onClick={() => handleViewModeChange('sheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'sheet'
                ? 'bg-gray-700 text-gray-100'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Sheet
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-gray-700 text-gray-100'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={`flex items-center gap-2 px-3 py-2 bg-gray-800 border rounded-lg text-sm transition-all ${
              statusFilter 
                ? 'border-violet-500/50 bg-violet-500/10 text-violet-400' 
                : 'border-gray-700 text-gray-300 hover:border-gray-600'
            }`}
          >
            <span>Filter</span>
            <span className="text-xs">▼</span>
          </button>
          
          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[150px]">
              <button
                onClick={() => {
                  setStatusFilter('')
                  setShowStatusDropdown(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                All Statuses
                {!statusFilter && <Check className="w-3 h-3 text-violet-400" />}
              </button>
              {Object.keys(STATUS_COLORS).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status)
                    setShowStatusDropdown(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  {status.replace('_', ' ')}
                  {statusFilter === status && <Check className="w-3 h-3 text-violet-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all max-w-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Stats (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
          <span className="text-emerald-400">{stats.active} active</span>
          <span className="text-amber-400">{stats.review} review</span>
        </div>

        {/* New Project Button */}
        {canCreate && (
          <button
            onClick={handleNewProject}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Content */}
      {viewMode === 'sheet' ? (
        <DataTable
          data={data}
          columns={columns}
          onRowClick={handleRowClick}
        />
      ) : (
        <div className="space-y-4">
          {/* Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 hover:bg-gray-800/50 transition-all duration-200 group block"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: project.color + '20', border: `1px solid ${project.color}40` }}
                      >
                        <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-100 text-sm group-hover:text-violet-400 transition-colors line-clamp-1">
                          {project.name}
                        </h3>
                        <span className="text-xs text-gray-500">{project.owner?.name}</span>
                      </div>
                    </div>
                    <div className={`text-xs font-bold uppercase px-2 py-1 rounded-full border ${STATUS_COLORS[project.status]?.bg} ${STATUS_COLORS[project.status]?.text} ${STATUS_COLORS[project.status]?.bg?.replace('bg-', 'border-')}`}>
                      {project.status.replace('_', ' ')}
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-gray-500 text-xs mb-4 line-clamp-2">{project.description}</p>
                  )}

                  {/* Services */}
                  {project.services && project.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.services.slice(0, 2).map((service: any, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {service}
                        </span>
                      ))}
                      {project.services.length > 2 && (
                        <span className="text-xs text-gray-500">+{project.services.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{(project.members?.length || 0) + 1} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{format(new Date(project.endDate), 'MMM dd, yy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getProgressColor(project.progress).bg} rounded-full transition-all duration-300`}
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className={getProgressColor(project.progress).text}>
                        {project.progress || 0}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
        </div>
      )}
    </div>
  )
}
