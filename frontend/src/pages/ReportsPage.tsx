import { useEffect, useState } from 'react'
import { BarChart3, Plus, Trash2, X, FileText, TrendingUp, Clock, Download, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import { format } from 'date-fns'

// Demo data fallback
const DEMO_REPORTS = [
  {
    id: '1',
    projectName: 'Website Redesign',
    totalTasks: 25,
    completedTasks: 18,
    overdueTasks: 2,
    progressPercent: 72,
    tasksByStatus: [
      { status: 'TODO', count: 5 },
      { status: 'IN_PROGRESS', count: 8 },
      { status: 'DONE', count: 18 },
      { status: 'DELAYED', count: 2 }
    ],
    generatedAt: '2024-02-20T17:00:00Z',
    generatedBy: 'System',
    type: 'Project Progress'
  },
  {
    id: '2',
    projectName: 'Mobile App v2.0',
    totalTasks: 30,
    completedTasks: 12,
    overdueTasks: 5,
    progressPercent: 40,
    tasksByStatus: [
      { status: 'TODO', count: 13 },
      { status: 'IN_PROGRESS', count: 10 },
      { status: 'DONE', count: 12 },
      { status: 'DELAYED', count: 5 }
    ],
    generatedAt: '2024-02-19T15:00:00Z',
    generatedBy: 'System',
    type: 'Project Progress'
  },
  {
    id: '3',
    projectName: 'Security Audit',
    totalTasks: 15,
    completedTasks: 15,
    overdueTasks: 0,
    progressPercent: 100,
    tasksByStatus: [
      { status: 'DONE', count: 15 }
    ],
    generatedAt: '2024-02-18T10:00:00Z',
    generatedBy: 'System',
    type: 'Project Progress'
  }
]

const DEMO_TASK_STATUS = [
  { status: 'TODO', count: 18 },
  { status: 'IN_PROGRESS', count: 18 },
  { status: 'DONE', count: 45 },
  { status: 'DELAYED', count: 7 }
]

const DEMO_PROJECT_STATUS = [
  { status: 'ACTIVE', count: 2 },
  { status: 'COMPLETED', count: 1 },
  { status: 'ON_HOLD', count: 2 }
]

const REPORT_TYPES = [
  { value: 'PROJECT_SUMMARY', label: 'Project Summary', icon: FileText },
  { value: 'TASK_SUMMARY', label: 'Task Summary', icon: TrendingUp },
  { value: 'TIMESHEET', label: 'Timesheet Report', icon: Clock },
]

// Fixed color mapping for status consistency
const STATUS_COLORS: Record<string, string> = {
  DELAYED: "#ef4444",
  DONE: "#22c55e",
  IN_PROGRESS: "#06b6d4",
  IN_REVIEW: "#facc15",
  TODO: "#9ca3af",

  COMPLETED: "#22c55e",
  PLANNING: "#a855f7"
}

// Fixed status order for consistent rendering
const STATUS_ORDER = [
  "DELAYED",
  "DONE",
  "IN_PROGRESS",
  "IN_REVIEW",
  "TODO"
]

// Separate order for project statuses
const PROJECT_STATUS_ORDER = ["COMPLETED","IN_PROGRESS","PLANNING"];

export default function ReportsPage() {
  const { user } = useAuthStore()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'PROJECT_SUMMARY' })
  const [selectedReport, setSelectedReport] = useState<any>(null)

  // New states for donut charts and project reports
  const [taskStatusData, setTaskStatusData] = useState<TaskStatus[]>([])
  const [projectStatusData, setProjectStatusData] = useState<ProjectStatus[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [projectReport, setProjectReport] = useState<ProjectReport | null>(null)
  const [loadingProjectReport, setLoadingProjectReport] = useState(false)

  const canCreate = ['MANAGING_DIRECTOR', 'HR_MANAGER'].includes(user?.role || '')

  useEffect(() => {
    loadReports()
    loadDonutData()
    loadProjects()
    
    // Set up periodic refresh for live updates (every 30 seconds)
    const interval = setInterval(() => {
      loadDonutData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDonutData = async () => {
    try {
      const [taskStatusRes, projectStatusRes] = await Promise.all([
        api.get('/reports/task-status'),
        api.get('/reports/project-status')
      ])
      setTaskStatusData(taskStatusRes.data)
      setProjectStatusData(projectStatusRes.data)
    } catch (error) {
      console.error('Failed to load donut data:', error)
    }
  }

  const loadProjects = async () => {
    try {
      const res = await api.get('/reports/projects')
      setProjects(res.data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const loadReports = async () => {
    setLoading(true)
    try {
      const r = await api.get('/reports')
      setReports(r.data)
    } finally {
      setLoading(false)
    }
  }

  const loadProjectReport = async (projectId: string) => {
    if (!projectId) return
    setLoadingProjectReport(true)
    try {
      const res = await api.get(`/reports/project/${projectId}`)
      setProjectReport(res.data)
    } catch (error) {
      console.error('Failed to load project report:', error)
    } finally {
      setLoadingProjectReport(false)
    }
  }

  const createReport = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Frontend - Creating report with form data:', form)
    try {
      const response = await api.post('/reports', form)
      console.log('Frontend - Report creation response:', response.data)
      setShowModal(false)
      setForm({ title: '', type: 'PROJECT_SUMMARY' })
      loadReports()
    } catch (err: any) {
      console.error('Frontend - Report creation error:', err)
      console.error('Frontend - Error response:', err.response?.data)
      alert(err.response?.data?.error || err.response?.data?.message || 'Error creating report')
    }
  }

  const deleteReport = async (id: string) => {
    if (!confirm('Delete this report?')) return
    await api.delete(`/reports/${id}`)
    loadReports()
    if (selectedReport?.id === id) setSelectedReport(null)
  }

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId)
    if (projectId) {
      loadProjectReport(projectId)
    } else {
      setProjectReport(null)
    }
  }

  // Donut chart component with proper cumulative angle
  const DonutChart = ({ data, title }: { data: any[], title: string }) => {
    // Create status counts from data
    const statusCounts: Record<string, number> = {};
    data.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + item.count;
    });
    
    // Detect project donut using title
    const isProject = title.includes("Project");
    
    // Use correct order
    const activeOrder = isProject ? PROJECT_STATUS_ORDER : STATUS_ORDER;
    
    // Build chartData from activeOrder
    const chartData = activeOrder.map(status => ({
      name: status,
      value: statusCounts[status] || 0
    }));
    
    const total = chartData.reduce((sum, item) => sum + item.value, 0)
    
    // Declare cumulativeAngle ONCE before map
    let cumulativeAngle = -90;
    
    return (
      <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">{title}</h3>
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle 
                cx="60" cy="60" r="50" 
                fill="none" 
                stroke="rgba(255,255,255,0.05)" 
                strokeWidth="12" 
              />
              
              {/* Render chartData in order */}
              {chartData.map((entry, index) => {
                if (entry.value === 0) return null;
                
                const percentage = total > 0 ? entry.value / total : 0;
                const angle = percentage * 360;
                
                // Calculate startAngle from cumulativeAngle
                const startAngle = (cumulativeAngle * Math.PI) / 180;
                cumulativeAngle += angle;
                const endAngle = (cumulativeAngle * Math.PI) / 180;
                
                const radius = 50;
                const strokeWidth = 12;
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
                const largeArcFlag = angle > 180 ? 1 : 0;
                const path = `
                  M ${x2} ${y2}
                  A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x4} ${y4}
                  L ${x3} ${y3}
                  A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
                  Z
                `;
                
                return (
                  <path
                    key={entry.name}
                    d={path}
                    fill={STATUS_COLORS[entry.name]}
                    stroke="none"
                    className="transition-all duration-1000"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono font-bold text-2xl text-white">{total}</span>
              <span className="text-zinc-500 text-xs">total</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[entry.name] }}
                />
                <span className="text-zinc-400">{entry.name.replace('_', ' ')}</span>
              </div>
              <span className="font-mono text-zinc-300 font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rubik font-bold text-2xl text-white">Reports & Analytics</h1>
          <p className="text-zinc-500 text-sm mt-1">View and generate project reports</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,161,199,0.3)]">
            <Plus className="w-4 h-4" />
            Generate Report
          </button>
        )}
      </div>

      {/* Live Overview with Donut Charts */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
        <h2 className="font-rubik font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-teal" />
          Live Overview
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Status Distribution */}
          <DonutChart 
            data={taskStatusData}
            title="Task Status Distribution"
          />
          
          {/* Project Status Distribution */}
          <DonutChart 
            data={projectStatusData}
            title="Project Status Distribution"
          />
        </div>
      </div>

      {/* Project Selector */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
        <h3 className="font-rubik font-semibold text-white mb-4">Project Analytics</h3>
        <div className="relative">
          <select 
            value={selectedProject}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none appearance-none cursor-pointer"
          >
            <option value="">Select a project to view report</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-3 w-5 h-5 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* Project Wise Report */}
      {loadingProjectReport && (
        <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" />
          </div>
        </div>
      )}

      {projectReport && !loadingProjectReport && (
        <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
          <h3 className="font-rubik font-semibold text-white mb-4">{projectReport.projectName} Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="font-mono font-bold text-2xl text-brand-teal">{projectReport.totalTasks}</div>
              <div className="text-zinc-500 text-sm mt-1">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="font-mono font-bold text-2xl text-brand-mint">{projectReport.completedTasks}</div>
              <div className="text-zinc-500 text-sm mt-1">Completed Tasks</div>
            </div>
            <div className="text-center">
              <div className="font-mono font-bold text-2xl text-red-400">{projectReport.overdueTasks}</div>
              <div className="text-zinc-500 text-sm mt-1">Overdue Tasks</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-zinc-400">Project Progress</span>
              <span className="font-mono text-brand-teal font-bold">{projectReport.progressPercent}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-teal to-brand-mint rounded-full transition-all duration-500"
                style={{ width: `${projectReport.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Mini Donut for Task Statuses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonutChart 
              data={projectReport.tasksByStatus}
              title="Task Status Breakdown"
            />
            
            <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Task Details</h3>
              <div className="space-y-3">
                {projectReport.tasksByStatus.map((task) => (
                  <div key={task.status} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{task.status.replace('_', ' ')}</span>
                    <span className="font-mono text-zinc-300 font-bold">{task.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Reports */}
      <div>
        <h2 className="font-rubik font-semibold text-white mb-4">Generated Reports</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-[#09090B] border border-white/5 rounded-xl h-16 animate-pulse" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[#09090B] border border-white/10 rounded-2xl text-zinc-600">
            <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-lg font-medium">No reports generated</p>
            {canCreate && <p className="text-sm mt-1">Click "Generate Report" to create your first report</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(report => {
              const typeInfo = REPORT_TYPES.find(t => t.value === report.type)
              const Icon = typeInfo?.icon || FileText
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                  className="bg-[#09090B] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-brand-teal" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm">{report.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                        <span>{typeInfo?.label}</span>
                        <span>·</span>
                        <span>by {report.createdBy?.name}</span>
                        <span>·</span>
                        <span>{format(new Date(report.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    {canCreate && (
                      <button
                        onClick={e => { e.stopPropagation(); deleteReport(report.id) }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Expanded data */}
                  {selectedReport?.id === report.id && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="space-y-4">
                        {report.data && typeof report.data === 'object' ? (
                          // Render as table for structured data
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead>
                                <tr className="border-b border-white/10">
                                  <th className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                  <th className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Count</th>
                                </tr>
                              </thead>
                              <tbody>
                                {report.data.tasksByStatus?.map((status: any) => (
                                  <tr key={status.status} className="border-b border-white/5">
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status.status] || 'bg-zinc-500/20 text-zinc-400'}`}>
                                        <div className="w-2 h-2 rounded-full bg-current" />
                                        {status.status}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <span className="font-mono text-zinc-300">{status.count}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          // Fallback for non-object data
                          <pre className="text-xs text-zinc-400 bg-black/30 rounded-lg p-4 overflow-auto max-h-60">
                            {JSON.stringify(report.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090B] border border-white/10 rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-rubik font-bold text-white">Generate Report</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Report Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                  placeholder="e.g. Q4 Project Summary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Report Type</label>
                <div className="space-y-2">
                  {REPORT_TYPES.map(({ value, label, icon: Icon }) => (
                    <label key={value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.type === value ? 'border-brand-teal/40 bg-brand-teal/5' : 'border-white/10 hover:border-white/20'
                    }`}>
                      <input type="radio" name="type" value={value} checked={form.type === value}
                        onChange={e => setForm({ ...form, type: e.target.value })} className="hidden" />
                      <Icon className={`w-5 h-5 ${form.type === value ? 'text-brand-teal' : 'text-zinc-500'}`} />
                      <span className={`text-sm font-medium ${form.type === value ? 'text-white' : 'text-zinc-400'}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
