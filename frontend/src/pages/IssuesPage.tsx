import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter, Search, ChevronDown, ArrowUpDown, Edit2, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import { format } from 'date-fns'

// Demo data fallback
const DEMO_ISSUES = [
  {
    id: '1',
    title: 'Critical security vulnerability in authentication',
    description: 'A critical security vulnerability has been discovered in the authentication system that could allow unauthorized access to user accounts.',
    priority: 'CRITICAL',
    status: 'OPEN',
    reporter: {
      id: '1',
      name: 'Emma Davis',
      email: 'emma.davis@company.com'
    },
    assignedTo: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com'
    },
    roleLevel: 'MANAGER',
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-02-20T09:00:00Z',
    project: {
      id: '1',
      name: 'Website Redesign'
    }
  },
  {
    id: '2',
    title: 'Performance issues with mobile app loading',
    description: 'Users are reporting slow loading times and occasional crashes when using the mobile application on iOS devices.',
    priority: 'HIGH',
    status: 'IN_REVIEW',
    reporter: {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@company.com'
    },
    assignedTo: {
      id: '4',
      name: 'James Wilson',
      email: 'james.wilson@company.com'
    },
    roleLevel: 'TL',
    createdAt: '2024-02-18T14:30:00Z',
    updatedAt: '2024-02-22T10:15:00Z',
    project: {
      id: '2',
      name: 'Mobile App v2.0'
    }
  },
  {
    id: '3',
    title: 'UI inconsistency in dashboard components',
    description: 'There are several UI inconsistencies across different dashboard components that need to be standardized for better user experience.',
    priority: 'MEDIUM',
    status: 'OPEN',
    reporter: {
      id: '5',
      name: 'Lisa Brown',
      email: 'lisa.brown@company.com'
    },
    roleLevel: 'EMPLOYEE',
    createdAt: '2024-02-19T11:00:00Z',
    updatedAt: '2024-02-19T11:00:00Z',
    project: {
      id: '3',
      name: 'Security Audit'
    }
  },
  {
    id: '4',
    title: 'Missing documentation for API endpoints',
    description: 'Several API endpoints lack proper documentation, making it difficult for developers to integrate with the system.',
    priority: 'LOW',
    status: 'WAITING_REPLY',
    reporter: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com'
    },
    assignedTo: {
      id: '1',
      name: 'Emma Davis',
      email: 'emma.davis@company.com'
    },
    roleLevel: 'EMPLOYEE',
    createdAt: '2024-02-17T16:45:00Z',
    updatedAt: '2024-02-21T09:30:00Z',
    project: {
      id: '4',
      name: 'Data Migration'
    }
  },
  {
    id: '5',
    title: 'Database connection timeout errors',
    description: 'Intermittent database connection timeout errors are occurring during peak usage hours, affecting system reliability.',
    priority: 'HIGH',
    status: 'RESOLVED',
    reporter: {
      id: '4',
      name: 'James Wilson',
      email: 'james.wilson@company.com'
    },
    assignedTo: {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@company.com'
    },
    roleLevel: 'TL',
    createdAt: '2024-02-15T10:20:00Z',
    updatedAt: '2024-02-23T14:00:00Z',
    project: {
      id: '5',
      name: 'API Development'
    }
  }
]

interface Issue {
  id: string
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_REVIEW' | 'ESCALATED' | 'WAITING_REPLY' | 'RESOLVED' | 'CLOSED'
  reporter: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  roleLevel: 'EMPLOYEE' | 'TL' | 'MANAGER' | 'MD'
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    name: string
  }
  _count?: {
    comments: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Project {
  id: string
  name: string
}

const PRIORITY_COLORS = {
  LOW: 'text-zinc-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-brand-orange',
  CRITICAL: 'text-red-400'
}

const STATUS_COLORS = {
  OPEN: 'text-blue-400',
  IN_REVIEW: 'text-yellow-400',
  ESCALATED: 'text-red-400',
  WAITING_REPLY: 'text-orange-400',
  RESOLVED: 'text-green-400',
  CLOSED: 'text-zinc-400'
}

export default function IssuesPage() {
  const { user } = useAuthStore()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('')
  const [assignedFilter, setAssignedFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedTo: '',
    projectId: '',
    raisedDate: new Date().toISOString().split('T')[0],
    expectedEndDate: '',
    tags: ''
  })
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [editingIssue, setEditingIssue] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    assignedTo: '',
    projectId: '',
    expectedEndDate: '',
    tags: ''
  })

  useEffect(() => {
    loadIssues()
    loadUsers()
    loadProjects()
  }, [statusFilter, assignedFilter, roleFilter, searchTerm, sortBy, sortOrder, currentPage])

  const loadIssues = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(statusFilter && { status: statusFilter }),
        ...(assignedFilter && { assignedTo: assignedFilter }),
        ...(roleFilter && { roleLevel: roleFilter }),
        ...(searchTerm && { search: searchTerm }),
        page: currentPage.toString(),
        limit: '10'
      })

      const response = await api.get(`/issues?${params}`)
      setIssues(response.data.issues || DEMO_ISSUES)
    } catch (error) {
      console.error('Failed to load issues:', error)
      // Fallback to demo data
      setIssues(DEMO_ISSUES)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await api.get('/issues/active-users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const handleCreateIssue = async () => {
    try {
      // Validation
      const errors: {[key: string]: string} = {}
      
      if (!newIssue.title.trim()) {
        errors.title = 'Issue title is required'
      }
      
      if (!newIssue.projectId) {
        errors.projectId = 'Project is required'
      }
      
      if (!newIssue.raisedDate) {
        errors.raisedDate = 'Raised date is required'
      }
      
      if (newIssue.expectedEndDate && new Date(newIssue.expectedEndDate) < new Date(newIssue.raisedDate)) {
        errors.expectedEndDate = 'Expected end date must be after raised date'
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }
      
      await api.post('/issues', newIssue)
      setShowCreateModal(false)
      setNewIssue({ 
        title: '', 
        description: '', 
        priority: 'MEDIUM', 
        assignedTo: '',
        projectId: '',
        raisedDate: new Date().toISOString().split('T')[0],
        expectedEndDate: '',
        tags: ''
      })
      setFormErrors({})
      loadIssues()
    } catch (error: any) {
      console.error('Failed to create issue:', error)
      if (error.response?.data?.error) {
        setFormErrors({ general: error.response.data.error })
      }
    }
  }

  const handleInlineEdit = (issue: any) => {
    setEditingIssue(issue.id)
    setEditForm({
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
      status: issue.status,
      assignedTo: issue.assignedTo?.id || '',
      projectId: issue.project?.id || '',
      expectedEndDate: issue.expectedEndDate ? new Date(issue.expectedEndDate).toISOString().split('T')[0] : '',
      tags: issue.tags || ''
    })
  }

  const handleInlineSave = async () => {
    if (!editingIssue) return

    try {
      await api.put(`/issues/${editingIssue}`, editForm)
      setEditingIssue(null)
      loadIssues()
    } catch (error) {
      console.error('Failed to update issue:', error)
    }
  }

  const handleInlineCancel = () => {
    setEditingIssue(null)
    setEditForm({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: '',
      projectId: '',
      expectedEndDate: '',
      tags: ''
    })
  }

  const handleDeleteIssue = async (issue: any) => {
    if (!confirm('Are you sure you want to delete this issue?')) return

    try {
      await api.delete(`/issues/${issue.id}`)
      loadIssues()
    } catch (error) {
      console.error('Failed to delete issue:', error)
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const filteredIssues = issues.filter(issue => {
    if (statusFilter && issue.status !== statusFilter) return false
    if (assignedFilter && issue.assignedTo?.id !== assignedFilter) return false
    if (roleFilter && issue.roleLevel !== roleFilter) return false
    if (searchTerm && !issue.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Issue]
    let bValue: any = b[sortBy as keyof Issue]
    
    if (sortBy === 'priority') {
      const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }
      aValue = priorityOrder[a.priority]
      bValue = priorityOrder[b.priority]
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const totalPages = Math.ceil(issues.length / 10)
  const paginatedIssues = sortedIssues.slice((currentPage - 1) * 10, currentPage * 10)

  const canCreate = ['MANAGING_DIRECTOR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE'].includes(user?.role || '')

  return (
    <div className="min-h-screen bg-[#02040A]">
      {/* Main Content */}
      <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-rubik font-semibold text-white text-2xl">Issues Management</h1>
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-teal hover:bg-brand-mint text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Issue
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-[#09090B] border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex-1 flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#09090B] border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-brand-teal w-64"
                  />
                </div>

                {showFilters && (
                  <>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-[#09090B] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                    >
                      <option value="">All Status</option>
                      <option value="OPEN">Open</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="ESCALATED">Escalated</option>
                      <option value="WAITING_REPLY">Waiting Reply</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>

                    <select
                      value={assignedFilter}
                      onChange={(e) => setAssignedFilter(e.target.value)}
                      className="px-3 py-2 bg-[#09090B] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                    >
                      <option value="">All Users</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>

                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 bg-[#09090B] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                    >
                      <option value="">All Roles</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="TL">Team Lead</option>
                      <option value="MANAGER">Manager</option>
                      <option value="MD">Managing Director</option>
                    </select>

                    <button
                      onClick={() => {
                        setStatusFilter('')
                        setAssignedFilter('')
                        setRoleFilter('')
                        setSearchTerm('')
                      }}
                      className="px-3 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg transition-colors text-sm"
                    >
                      Reset Filters
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Issues Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-zinc-400">Loading issues...</div>
            </div>
          ) : paginatedIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="w-12 h-12 text-zinc-400 mb-4" />
              <h3 className="text-xl font-medium text-zinc-300 mb-2">No issues found</h3>
              <p className="text-zinc-500">Create your first issue to get started</p>
            </div>
          ) : (
            <div className="bg-[#09090B] border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left py-3 px-4 font-medium text-zinc-500 uppercase tracking-wider">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort('title')}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          Title
                          {sortBy === 'title' && (
                            <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button
                          onClick={() => handleSort('priority')}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          Priority
                          {sortBy === 'priority' && (
                            <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedIssues.map((issue) => (
                      <tr key={issue.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        {editingIssue === issue.id ? (
                          <>
                            <td className="py-3 px-4" colSpan={7}>
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                  className="w-full px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-brand-teal"
                                  placeholder="Issue title"
                                />
                                <textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                  className="w-full px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-brand-teal h-20 resize-none"
                                  placeholder="Issue description"
                                />
                                <div className="grid grid-cols-3 gap-3">
                                  <select
                                    value={editForm.priority}
                                    onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                                    className="px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                                  >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                  </select>
                                  <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                    className="px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                                  >
                                    <option value="OPEN">Open</option>
                                    <option value="IN_REVIEW">In Review</option>
                                    <option value="ESCALATED">Escalated</option>
                                    <option value="WAITING_REPLY">Waiting Reply</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="CLOSED">Closed</option>
                                  </select>
                                  <select
                                    value={editForm.assignedTo}
                                    onChange={(e) => setEditForm({...editForm, assignedTo: e.target.value})}
                                    className="px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                                  >
                                    <option value="">Unassigned</option>
                                    {users.map(user => (
                                      <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="date"
                                    value={editForm.expectedEndDate}
                                    onChange={(e) => setEditForm({...editForm, expectedEndDate: e.target.value})}
                                    className="px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                                  />
                                  <input
                                    type="text"
                                    value={editForm.tags}
                                    onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                                    placeholder="Tags (comma separated)"
                                    className="flex-1 px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-brand-teal"
                                  />
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                  <button
                                    onClick={handleInlineSave}
                                    className="px-4 py-2 bg-brand-teal hover:bg-brand-mint text-white rounded-lg transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleInlineCancel}
                                    className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4">
                              <Link
                                to={`/issues/${issue.id}`}
                                className="text-brand-teal hover:text-brand-mint transition-colors"
                              >
                                {issue.title}
                              </Link>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[issue.priority]}`}>
                                {issue.priority}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[issue.status]}`}>
                                {issue.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-zinc-300">{issue.reporter.name}</td>
                            <td className="py-3 px-4 text-zinc-300">
                              {issue.assignedTo ? issue.assignedTo.name : 'Unassigned'}
                            </td>
                            <td className="py-3 px-4 text-zinc-300">
                              {format(new Date(issue.createdAt), 'MMM dd, yyyy')}
                            </td>
                            <td className="py-3 px-4 text-zinc-300">
                              <button
                                onClick={() => handleInlineEdit(issue)}
                                className="text-brand-teal hover:text-brand-mint transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteIssue(issue)}
                                className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                  <div className="text-sm text-zinc-500">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, filteredIssues.length)} of {filteredIssues.length} issues
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-[#09090B] border border-white/10 rounded text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-zinc-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-[#09090B] border border-white/10 rounded text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Create Issue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-rubik font-semibold text-white text-xl">Create New Issue</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormErrors({})
                }}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* General Error */}
            {formErrors.general && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">
                {formErrors.general}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Issue Title *</label>
                <input
                  type="text"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  className={`w-full px-3 py-2 bg-[#02040A] border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-brand-teal ${
                    formErrors.title ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Enter issue title..."
                />
                {formErrors.title && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-brand-teal h-32 resize-none"
                  placeholder="Describe the issue in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Project Title *</label>
                  <select
                    value={newIssue.projectId}
                    onChange={(e) => setNewIssue({ ...newIssue, projectId: e.target.value })}
                    className={`w-full px-3 py-2 bg-[#02040A] border rounded-lg text-white focus:outline-none focus:border-brand-teal ${
                      formErrors.projectId ? 'border-red-500' : 'border-white/10'
                    }`}
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                  {formErrors.projectId && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.projectId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
                  <select
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
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
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Assigned To</label>
                  <select
                    value={newIssue.assignedTo}
                    onChange={(e) => setNewIssue({ ...newIssue, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Issue Raised Date *</label>
                  <input
                    type="date"
                    value={newIssue.raisedDate}
                    onChange={(e) => setNewIssue({ ...newIssue, raisedDate: e.target.value })}
                    className={`w-full px-3 py-2 bg-[#02040A] border rounded-lg text-white focus:outline-none focus:border-brand-teal ${
                      formErrors.raisedDate ? 'border-red-500' : 'border-white/10'
                    }`}
                  />
                  {formErrors.raisedDate && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.raisedDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Expected End Date</label>
                  <input
                    type="date"
                    value={newIssue.expectedEndDate}
                    onChange={(e) => setNewIssue({ ...newIssue, expectedEndDate: e.target.value })}
                    min={newIssue.raisedDate}
                    className={`w-full px-3 py-2 bg-[#02040A] border rounded-lg text-white focus:outline-none focus:border-brand-teal ${
                      formErrors.expectedEndDate ? 'border-red-500' : 'border-white/10'
                    }`}
                  />
                  {formErrors.expectedEndDate && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.expectedEndDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Tags</label>
                  <input
                    type="text"
                    value={newIssue.tags}
                    onChange={(e) => setNewIssue({ ...newIssue, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-brand-teal"
                    placeholder="Enter tags separated by commas"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormErrors({})
                  }}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateIssue}
                  disabled={!newIssue.title.trim() || !newIssue.projectId}
                  className="px-4 py-2 bg-brand-teal hover:bg-brand-mint text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
