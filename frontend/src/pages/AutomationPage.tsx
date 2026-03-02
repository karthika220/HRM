import { useState, useEffect } from 'react'
import { Settings, AlertCircle, Clock, CheckCircle, ToggleLeft, Plus, Zap, Calendar, UserCheck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

// Demo data fallback
const DEMO_AUTOMATION_RULES = [
  {
    id: '1',
    name: 'Daily Task Status Update',
    trigger: 'Daily at 9:00 AM',
    action: 'Send task status email to team',
    active: true,
    createdAt: '2024-02-20T10:00:00Z',
    creator: {
      id: '1',
      name: 'Emma Davis',
      email: 'emma.davis@company.com',
      role: 'Team Lead'
    }
  },
  {
    id: '2',
    name: 'Weekly Report Generation',
    trigger: 'Every Friday at 5:00 PM',
    action: 'Generate and send weekly progress report',
    active: true,
    createdAt: '2024-02-18T14:00:00Z',
    creator: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Manager'
    }
  },
  {
    id: '3',
    name: 'Deadline Reminder',
    trigger: 'Task due date - 1 day',
    action: 'Send reminder notification',
    active: false,
    createdAt: '2024-02-15T11:00:00Z',
    creator: {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'Developer'
    }
  }
]

interface AutomationRule {
  id: string
  name: string
  trigger: string
  action: string
  active: boolean
  createdAt: string
  creator: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface NewRule {
  name: string
  trigger: string
  action: string
  target?: string
  projectScope?: 'any' | 'specific'
  projectId?: string
}

export default function AutomationPage() {
  const { user } = useAuthStore()
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [projects, setProjects] = useState<any[]>([])

  const [newRule, setNewRule] = useState<NewRule>({
    name: '',
    trigger: 'TASK_OVERDUE',
    action: 'SEND_NOTIFICATION',
    target: 'PROJECT_MANAGER',
    projectScope: 'any'
  })

  useEffect(() => {
    loadAutomationRules()
    loadProjects()
  }, [])

  const loadAutomationRules = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/automation')
      setRules(response.data || DEMO_AUTOMATION_RULES)
    } catch (err: any) {
      console.error('Failed to load automation rules:', err)
      setError('Failed to load automation rules')
      // Fallback to demo data
      setRules(DEMO_AUTOMATION_RULES)
    } finally {
      setLoading(false)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data)
    } catch (err: any) {
      console.error('Failed to load projects:', err)
    }
  }

  const handleToggleRule = async (ruleId: string, currentActive: boolean) => {
    try {
      // Optimistic UI update
      setRules(rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, active: !currentActive }
          : rule
      ))

      await api.patch(`/automation/${ruleId}/toggle`)
    } catch (err: any) {
      console.error('Failed to toggle rule:', err)
      // Revert optimistic update on error
      setRules(rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, active: currentActive }
          : rule
      ))
    }
  }

  const handleCreateRule = async () => {
    try {
      if (!newRule.name.trim()) {
        setError('Rule name is required')
        return
      }

      const response = await api.post('/automation', newRule)
      setRules([response.data, ...rules])
      setShowCreateModal(false)
      setNewRule({
        name: '',
        trigger: 'TASK_OVERDUE',
        action: 'SEND_NOTIFICATION',
        target: 'PROJECT_MANAGER',
        projectScope: 'any'
      })
      setError(null)
    } catch (err: any) {
      console.error('Failed to create rule:', err)
      setError('Failed to create automation rule')
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await api.delete(`/automation/${ruleId}`)
      setRules(rules.filter(rule => rule.id !== ruleId))
    } catch (err: any) {
      console.error('Failed to delete rule:', err)
      setError('Failed to delete automation rule')
    }
  }

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'TASK_OVERDUE': 
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'TASK_ASSIGNED': 
        return <UserCheck className="w-5 h-5 text-blue-400" />
      case 'TASK_STATUS_CHANGED': 
        return <CheckCircle className="w-5 h-5 text-yellow-400" />
      case 'MILESTONE_REACHED': 
        return <Zap className="w-5 h-5 text-purple-400" />
      case 'SCHEDULED': 
        return <Clock className="w-5 h-5 text-green-400" />
      default: 
        return <Settings className="w-5 h-5 text-zinc-400" />
    }
  }

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case 'TASK_OVERDUE': return 'bg-red-500/20 border-red-500/30 text-red-400'
      case 'TASK_ASSIGNED': return 'bg-blue-500/20 border-blue-500/30 text-blue-400'
      case 'TASK_STATUS_CHANGED': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
      case 'MILESTONE_REACHED': return 'bg-purple-500/20 border-purple-500/30 text-purple-400'
      case 'SCHEDULED': return 'bg-green-500/20 border-green-500/30 text-green-400'
      default: return 'bg-zinc-500/20 border-zinc-500/30 text-zinc-400'
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#09090B] border border-white/10 rounded-xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading automation rules...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-[#09090B] border border-white/10 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-brand-teal" />
            <h1 className="font-rubik font-bold text-white text-2xl">Automation Rules</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-black font-medium rounded-xl hover:bg-brand-teal/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Rule
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {rules.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No automation rules yet</h3>
            <p className="text-zinc-400 mb-6">Create your first automation rule to streamline your workflow</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-teal text-black font-medium rounded-xl hover:bg-brand-teal/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first rule
            </button>
          </div>
        ) : (
          /* Rules List - Single Column Row Layout */
          <div className="flex flex-col gap-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-[#09090B] border border-white/10 rounded-lg p-3 hover:border-white/20 transition-colors w-full"
              >
                <div className="flex items-center justify-between w-full">
                  {/* Left Side: Icon + Rule Name + Badge + Created by */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getTriggerIcon(rule.trigger)}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-sm truncate">{rule.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getTriggerColor(rule.trigger)}`}>
                          {rule.trigger}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          by {rule.creator.name}
                        </span>
                      </div>
                  </div>
                </div>

                {/* Status Only */}
                <div className="flex items-center px-4 flex-shrink-0">
                  <div className="text-xs text-zinc-300">
                    <span className="font-medium text-white text-xs">Status:</span> 
                    <span className={`ml-1 text-xs ${rule.active ? 'text-green-400' : 'text-zinc-500'}`}>
                      {rule.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Right Side: Toggle Switch + Delete Rule */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleRule(rule.id, rule.active)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      rule.active ? 'bg-brand-teal' : 'bg-zinc-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                        rule.active ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-[10px] text-red-400 hover:text-red-300 transition-colors px-2 py-1"
                  >
                    Delete
                  </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Create Automation Rule</h2>
            
            <div className="space-y-4">
              {/* Rule Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                  placeholder="Enter rule name"
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  IF Trigger
                </label>
                <select
                  value={newRule.trigger}
                  onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                >
                  <option value="TASK_OVERDUE">Task Overdue</option>
                  <option value="TASK_ASSIGNED">Task Assigned</option>
                  <option value="TASK_STATUS_CHANGED">Task Status Changed</option>
                  <option value="MILESTONE_REACHED">Milestone Reached</option>
                  <option value="SCHEDULED">Scheduled</option>
                </select>
              </div>

              {/* Project Scope */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Project Scope
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="any"
                      checked={newRule.projectScope === 'any'}
                      onChange={(e) => setNewRule({ ...newRule, projectScope: 'any' })}
                      className="text-brand-teal"
                    />
                    <span className="text-zinc-300">In any project</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="specific"
                      checked={newRule.projectScope === 'specific'}
                      onChange={(e) => setNewRule({ ...newRule, projectScope: 'specific' })}
                      className="text-brand-teal"
                    />
                    <span className="text-zinc-300">Specific project</span>
                  </label>
                </div>
                {newRule.projectScope === 'specific' && (
                  <select
                    value={newRule.projectId || ''}
                    onChange={(e) => setNewRule({ ...newRule, projectId: e.target.value })}
                    className="w-full mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Action */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  THEN Action
                </label>
                <select
                  value={newRule.action}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                >
                  <option value="SEND_NOTIFICATION">Send Notification</option>
                  <option value="ASSIGN_TASK">Assign Task</option>
                </select>
              </div>

              {/* Target */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Target
                </label>
                <select
                  value={newRule.target}
                  onChange={(e) => setNewRule({ ...newRule, target: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
                >
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="MANAGING_DIRECTOR">Managing Director</option>
                  <option value="ALL">All</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                className="flex-1 px-4 py-2 bg-brand-teal text-black font-medium rounded-lg hover:bg-brand-teal/90 transition-colors"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
