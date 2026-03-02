import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Upload, User, Clock, Edit2, Trash2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import { format } from 'date-fns'

interface IssueComment {
  id: string
  message: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

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
  raisedDate?: string
  expectedEndDate?: string
  tags?: string
  project?: {
    id: string
    name: string
  }
  comments: IssueComment[]
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

const STATUS_OPTIONS = [
  'OPEN',
  'IN_REVIEW',
  'ESCALATED',
  'WAITING_REPLY',
  'RESOLVED',
  'CLOSED'
]

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [newAssignedTo, setNewAssignedTo] = useState('')
  const [newExpectedEndDate, setNewExpectedEndDate] = useState('')
  const [newTags, setNewTags] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    if (id) {
      loadIssue()
      loadUsers()
      loadProjects()
    }
  }, [id])

  const loadIssue = async () => {
    try {
      const response = await api.get(`/issues/${id}`)
      const issueData = response.data
      setIssue(issueData)
      setNewStatus(issueData.status)
      setNewAssignedTo(issueData.assignedTo?.id || '')
      setNewExpectedEndDate(issueData.expectedEndDate ? new Date(issueData.expectedEndDate).toISOString().split('T')[0] : '')
      setNewTags(issueData.tags || '')
    } catch (error) {
      console.error('Failed to load issue:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await api.get('/issues/assignable-users')
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

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      await api.post(`/issues/${id}/comments`, { message: newComment })
      setNewComment('')
      loadIssue() // Reload to get new comment
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleUpdateIssue = async () => {
    if (!issue) return

    try {
      setUpdating(true)
      const response = await api.put(`/issues/${id}`, {
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        status: newStatus || issue.status,
        assignedTo: newAssignedTo || issue.assignedTo?.id,
        projectId: issue.project?.id,
        expectedEndDate: newExpectedEndDate || issue.expectedEndDate,
        tags: newTags || issue.tags
      })
      setIssue(response.data)
      setShowEdit(false)
    } catch (error) {
      console.error('Failed to update issue:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteIssue = async () => {
    if (!issue || !confirm('Are you sure you want to delete this issue?')) return

    try {
      await api.delete(`/issues/${id}`)
      navigate('/issues')
    } catch (error) {
      console.error('Failed to delete issue:', error)
    }
  }

  const canEdit = () => {
    if (!user || !issue) return false
    
    // ALL users can edit their own issues or assigned issues
    return (
      issue.reporter.id === user.id ||  // Can edit own issues
      issue.assignedTo?.id === user.id ||  // Can edit assigned issues
      ['MANAGER', 'MANAGING_DIRECTOR'].includes(user.role)  // Managers/MD can edit any
    )
  }

  const canClose = () => {
    return user && ['MANAGER', 'MANAGING_DIRECTOR'].includes(user.role)
  }

  const canDelete = () => {
    if (!user || !issue) return false
    
    // Users can delete their own issues, Managers/MD can delete any
    return (
      issue.reporter.id === user.id ||  // Can delete own issues
      ['MANAGER', 'MANAGING_DIRECTOR'].includes(user.role)  // Managers/MD can delete any
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040A] flex items-center justify-center">
        <div className="text-zinc-400">Loading issue...</div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-[#02040A] flex items-center justify-center">
        <div className="text-zinc-400">Issue not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#02040A]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#09090B] min-h-screen p-4 border-r border-white/10">
          <Link
            to="/issues"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Issues
          </Link>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="font-rubik font-semibold text-white mb-3">Quick Actions</h3>
            
            {canEdit() && (
              <button
                onClick={() => setShowEdit(!showEdit)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-brand-teal hover:bg-brand-mint text-white rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {showEdit ? 'Cancel Edit' : 'Edit Issue'}
              </button>
            )}

            {canDelete() && (
              <button
                onClick={handleDeleteIssue}
                className="w-full flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Issue
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Issue Header */}
          <div className="bg-[#09090B] border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="font-rubik font-semibold text-white text-2xl mb-2">{issue.title}</h1>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[issue.priority]}`}>
                    {issue.priority}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[issue.status]}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Created by {issue.reporter.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(issue.createdAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-zinc-300 whitespace-pre-wrap mb-6">{issue.description}</div>

            {/* Assignment Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-2">Assigned To</label>
                <div className="text-white">{issue.assignedTo?.name || 'Unassigned'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-2">Role Level</label>
                <div className="text-white">{issue.roleLevel}</div>
              </div>
            </div>

            {/* Edit Form */}
            {showEdit && canEdit() && (
              <div className="border-t border-white/10 pt-6">
                <h3 className="font-rubik font-semibold text-white mb-4">Edit Issue</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Reassign To</label>
                    <select
                      value={newAssignedTo}
                      onChange={(e) => setNewAssignedTo(e.target.value)}
                      className="w-full px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                    >
                      <option value="">Keep Current Assignment</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Expected End Date</label>
                    <input
                      type="date"
                      value={newExpectedEndDate}
                      onChange={(e) => setNewExpectedEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Tags</label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="Enter tags separated by commas"
                      className="w-full px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-brand-teal"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowEdit(false)}
                      className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateIssue}
                      disabled={updating}
                      className="px-4 py-2 bg-brand-teal hover:bg-brand-mint text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Updating...' : 'Update Issue'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-[#09090B] border border-white/10 rounded-xl p-6">
            <h3 className="font-rubik font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({issue.comments?.length || 0})
            </h3>

            {/* Add Comment */}
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 bg-[#02040A] border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-brand-teal h-24 resize-none"
              />
              <div className="flex items-center justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-brand-teal hover:bg-brand-mint text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Comment
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {issue.comments?.map((comment) => (
                <div key={comment.id} className="border-b border-white/5 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-brand-teal rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{comment.user.name}</span>
                        <span className="text-zinc-500 text-sm">
                          {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <div className="text-zinc-300 whitespace-pre-wrap">{comment.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
