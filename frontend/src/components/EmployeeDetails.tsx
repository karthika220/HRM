import { useEffect, useState } from 'react'
import { X, AlertTriangle, Plus, Clock } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import { format } from 'date-fns'

interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
  employeeCode?: string
  designation?: string
  employmentType?: string
  joinDate?: string
  employmentStatus?: string
  reportingManagerId?: string
}

interface Escalation {
  id: string
  type: string
  severity: 'Low' | 'Medium' | 'High'
  description: string
  status: 'Open' | 'Closed'
  createdAt: string
  employee: {
    name: string
    email: string
    employeeCode?: string
  }
  raiser: {
    name: string
    email: string
    role: string
  }
}

interface EmployeeDetailsProps {
  employee: Employee
  onClose: () => void
}

export default function EmployeeDetails({ employee, onClose }: EmployeeDetailsProps) {
  const { user: currentUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'details' | 'escalations'>('details')
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [loading, setLoading] = useState(false)
  const [showEscalationModal, setShowEscalationModal] = useState(false)
  const [escalationForm, setEscalationForm] = useState({
    type: '',
    severity: 'Medium' as 'Low' | 'Medium' | 'High',
    description: ''
  })

  const canCreateEscalation = ['HR', 'Manager', 'MD'].includes(currentUser?.role || '')
  const canCloseEscalation = ['HR', 'MD'].includes(currentUser?.role || '')

  useEffect(() => {
    if (activeTab === 'escalations') {
      loadEscalations()
    }
  }, [activeTab, employee.id])

  const loadEscalations = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/escalations/employee/${employee.id}`)
      setEscalations(response.data.escalations)
    } catch (error: any) {
      console.error('Failed to load escalations:', error)
      if (error.response?.status !== 403) {
        // Don't show error for access denied (expected for employees viewing others)
        alert('Failed to load escalations')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEscalation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!escalationForm.type || !escalationForm.description) {
      alert('Please fill all fields')
      return
    }

    try {
      await api.post('/escalations', {
        employeeId: employee.id,
        type: escalationForm.type,
        severity: escalationForm.severity,
        description: escalationForm.description
      })

      setShowEscalationModal(false)
      setEscalationForm({ type: '', severity: 'Medium', description: '' })
      loadEscalations()
      alert('Escalation created successfully')
    } catch (error: any) {
      console.error('Failed to create escalation:', error)
      alert(error.response?.data?.message || 'Failed to create escalation')
    }
  }

  const handleCloseEscalation = async (escalationId: string) => {
    try {
      await api.put(`/escalations/${escalationId}/close`)
      loadEscalations()
      alert('Escalation closed successfully')
    } catch (error: any) {
      console.error('Failed to close escalation:', error)
      alert(error.response?.data?.message || 'Failed to close escalation')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-red-400 bg-red-400/10'
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'Low': return 'text-green-400 bg-green-400/10'
      default: return 'text-zinc-400 bg-zinc-400/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-brand-orange bg-brand-orange/10'
      case 'Closed': return 'text-zinc-400 bg-zinc-400/10'
      default: return 'text-zinc-400 bg-zinc-400/10'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#09090B] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-rubik font-bold text-xl text-white">{employee.name}</h2>
            <p className="text-zinc-400">{employee.designation || employee.role}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-brand-teal border-b-2 border-brand-teal'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('escalations')}
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'escalations'
                ? 'text-brand-teal border-b-2 border-brand-teal'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Escalations
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-zinc-400">Name</label>
                    <p className="text-white">{employee.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Email</label>
                    <p className="text-white">{employee.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Role</label>
                    <p className="text-white">{employee.role}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Department</label>
                    <p className="text-white">{employee.department}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">Employee Information</h3>
                <div className="space-y-3">
                  {employee.employeeCode && (
                    <div>
                      <label className="text-sm text-zinc-400">Employee Code</label>
                      <p className="text-white">{employee.employeeCode}</p>
                    </div>
                  )}
                  {employee.designation && (
                    <div>
                      <label className="text-sm text-zinc-400">Designation</label>
                      <p className="text-white">{employee.designation}</p>
                    </div>
                  )}
                  {employee.employmentType && (
                    <div>
                      <label className="text-sm text-zinc-400">Employment Type</label>
                      <p className="text-white">{employee.employmentType}</p>
                    </div>
                  )}
                  {employee.joinDate && (
                    <div>
                      <label className="text-sm text-zinc-400">Join Date</label>
                      <p className="text-white">{format(new Date(employee.joinDate), 'dd MMM yyyy')}</p>
                    </div>
                  )}
                  {employee.employmentStatus && (
                    <div>
                      <label className="text-sm text-zinc-400">Employment Status</label>
                      <p className="text-white">{employee.employmentStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'escalations' && (
            <div>
              {/* Raise Escalation Button */}
              {canCreateEscalation && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowEscalationModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-orange to-brand-orange/80 text-white font-medium rounded-xl hover:opacity-90 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Raise Escalation
                  </button>
                </div>
              )}

              {/* Escalations List */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" />
                </div>
              ) : escalations.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No escalations found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {escalations.map((escalation) => (
                    <div key={escalation.id} className="bg-[#18181B] border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-white">{escalation.type}</h4>
                          <p className="text-sm text-zinc-400 mt-1">
                            Raised by {escalation.raiser.name} ({escalation.raiser.role})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(escalation.severity)}`}>
                            {escalation.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(escalation.status)}`}>
                            {escalation.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-zinc-300 mb-3">{escalation.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-zinc-400 text-sm">
                          <Clock className="w-3 h-3" />
                          {format(new Date(escalation.createdAt), 'dd MMM yyyy, HH:mm')}
                        </div>
                        
                        {escalation.status === 'Open' && canCloseEscalation && (
                          <button
                            onClick={() => handleCloseEscalation(escalation.id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Raise Escalation Modal */}
      {showEscalationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-[#09090B] border border-white/10 rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="font-rubik font-bold text-white">Raise Escalation</h3>
              <button onClick={() => setShowEscalationModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateEscalation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Type</label>
                <input
                  type="text"
                  value={escalationForm.type}
                  onChange={(e) => setEscalationForm({ ...escalationForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="e.g., Performance, Attendance, Policy"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Severity</label>
                <select
                  value={escalationForm.severity}
                  onChange={(e) => setEscalationForm({ ...escalationForm, severity: e.target.value as 'Low' | 'Medium' | 'High' })}
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                <textarea
                  value={escalationForm.description}
                  onChange={(e) => setEscalationForm({ ...escalationForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-teal resize-none"
                  rows={4}
                  placeholder="Describe the escalation details..."
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalationModal(false)}
                  className="flex-1 py-2.5 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-brand-orange to-brand-orange/80 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  Raise Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
