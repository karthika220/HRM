import { useEffect, useState } from 'react'
import { Clock, Plus, X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useTimerStore } from '../store/timerStore'
import api from '../api/axios'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import TimerButton from '../components/TimerButton'

// Demo data fallback
const DEMO_TIMESHEETS = [
  {
    id: '1',
    taskId: '1',
    taskName: 'Design landing page mockup',
    date: '2024-02-20',
    startTime: '09:00',
    endTime: '17:00',
    hours: 8,
    workType: 'BILLABLE',
    notes: 'Completed wireframes and initial design concepts',
    status: 'APPROVED',
    employee: {
      id: '1',
      name: 'Emma Davis',
      email: 'emma.davis@company.com'
    },
    createdAt: '2024-02-20T17:00:00Z'
  },
  {
    id: '2',
    taskId: '2',
    taskName: 'Implement user authentication',
    date: '2024-02-20',
    startTime: '09:30',
    endTime: '17:30',
    hours: 8,
    workType: 'BILLABLE',
    notes: 'JWT implementation with refresh tokens',
    status: 'PENDING',
    employee: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com'
    },
    createdAt: '2024-02-20T17:30:00Z'
  },
  {
    id: '3',
    taskId: '3',
    taskName: 'Database schema optimization',
    date: '2024-02-19',
    startTime: '10:00',
    endTime: '18:00',
    hours: 8,
    workType: 'BILLABLE',
    notes: 'Index optimization and query performance improvements',
    status: 'APPROVED',
    employee: {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@company.com'
    },
    createdAt: '2024-02-19T18:00:00Z'
  },
  {
    id: '4',
    taskId: '4',
    taskName: 'Write API documentation',
    date: '2024-02-19',
    startTime: '09:00',
    endTime: '13:00',
    hours: 4,
    workType: 'NON_BILLABLE',
    notes: 'Documentation for REST API endpoints',
    status: 'APPROVED',
    employee: {
      id: '4',
      name: 'James Wilson',
      email: 'james.wilson@company.com'
    },
    createdAt: '2024-02-19T13:00:00Z'
  },
  {
    id: '5',
    taskId: '5',
    taskName: 'Security vulnerability assessment',
    date: '2024-02-18',
    startTime: '08:00',
    endTime: '16:00',
    hours: 8,
    workType: 'BILLABLE',
    notes: 'Comprehensive security audit and recommendations',
    status: 'REJECTED',
    employee: {
      id: '5',
      name: 'Lisa Brown',
      email: 'lisa.brown@company.com'
    },
    createdAt: '2024-02-18T16:00:00Z'
  }
]

export default function TimesheetPage() {
  const { user } = useAuthStore()
  const [timesheets, setTimesheets] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    taskId: '', date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00', endTime: '17:00',
    hours: '8', workType: 'BILLABLE', notes: '',
  })

  const canApprove = ['MANAGING_DIRECTOR', 'HR_MANAGER', 'TEAM_LEAD'].includes(user?.role || '')

  useEffect(() => {
    loadTimesheets()
    api.get('/tasks').then(r => setTasks(r.data))
  }, [])

  const loadTimesheets = async () => {
    setLoading(true)
    try {
      const r = await api.get('/timesheets')
      setTimesheets(r.data || DEMO_TIMESHEETS)
    } catch (error) {
      console.error('Failed to load timesheets:', error)
      // Fallback to demo data
      setTimesheets(DEMO_TIMESHEETS)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/timesheets', form)
      setShowModal(false)
      setForm({ taskId: '', date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', hours: '8', workType: 'BILLABLE', notes: '' })
      loadTimesheets()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error logging time')
    }
  }

  const approve = async (id: string, val: boolean) => {
    await api.patch(`/timesheets/${id}/approve`, { isApproved: val })
    loadTimesheets()
  }

  const calcHours = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const diff = (eh * 60 + em) - (sh * 60 + sm)
    return Math.max(0, diff / 60).toFixed(1)
  }

  const totalHours = timesheets.reduce((sum, t) => sum + t.hours, 0)
  const approvedHours = timesheets.filter(t => t.isApproved).reduce((sum, t) => sum + t.hours, 0)
  const pendingCount = timesheets.filter(t => t.isApproved === null).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rubik font-bold text-2xl text-white">Timesheets</h1>
          <p className="text-zinc-500 text-sm mt-1">Track work hours · Mon–Sat, 9:00 AM – 6:45 PM</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,161,199,0.3)]">
            <Plus className="w-4 h-4" />
            Log Time
          </button>
          <TimerButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Hours', value: totalHours.toFixed(1) + 'h', icon: Clock, color: 'text-brand-teal' },
          { label: 'Approved', value: approvedHours.toFixed(1) + 'h', icon: CheckCircle, color: 'text-brand-mint' },
          { label: 'Pending Review', value: pendingCount, icon: AlertTriangle, color: 'text-yellow-400' },
          { label: 'Entries', value: timesheets.length, icon: Clock, color: 'text-brand-orange' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#09090B] border border-white/10 rounded-xl p-4">
            <Icon className={`w-4 h-4 ${color} mb-2`} />
            <div className={`font-mono font-bold text-2xl ${color}`}>{value}</div>
            <div className="text-zinc-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['Date', 'Task', 'Time', 'Hours', 'Type', 'Notes', 'Status', canApprove && 'Actions'].filter(Boolean).map(h => (
                  <th key={h as string} className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-4"><div className="h-4 bg-white/5 rounded animate-pulse w-3/4" /></td></tr>
                ))
              ) : timesheets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-zinc-600">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No timesheet entries yet</p>
                  </td>
                </tr>
              ) : timesheets.map(t => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3.5 text-sm text-zinc-300">
                    {format(new Date(t.date), 'EEE, MMM dd')}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm text-white font-medium truncate max-w-[180px]">{t.task?.title || '—'}</div>
                    <div className="text-xs text-zinc-500">{t.task?.project?.name}</div>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-mono text-zinc-400">{t.startTime} – {t.endTime}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-mono font-bold text-brand-teal">{t.hours}h</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      t.workType === 'BILLABLE' ? 'bg-brand-teal/15 text-brand-teal' : 'bg-zinc-700/30 text-zinc-400'
                    }`}>{t.workType}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-zinc-500 max-w-[150px] truncate">{t.notes || '—'}</td>
                  <td className="px-4 py-3.5">
                    {t.isApproved === true && (
                      <span className="flex items-center gap-1 text-xs text-brand-mint">
                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                    {t.isApproved === false && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                    {t.isApproved === null && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  {canApprove && (
                    <td className="px-4 py-3.5">
                      {t.isApproved === null && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => approve(t.id, true)}
                            className="px-2 py-1 text-xs text-brand-mint border border-brand-mint/30 rounded-lg hover:bg-brand-mint/10 transition-all">Approve</button>
                          <button onClick={() => approve(t.id, false)}
                            className="px-2 py-1 text-xs text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all">Reject</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Time Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090B] border border-white/10 rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-rubik font-bold text-white">Log Time</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Task *</label>
                <select value={form.taskId} onChange={e => setForm({ ...form, taskId: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none">
                  <option value="">Select task...</option>
                  {tasks.map(t => <option key={t.id} value={t.id}>{t.title} ({t.project?.name})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Date *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Start *</label>
                  <input type="time" value={form.startTime}
                    onChange={e => {
                      const h = calcHours(e.target.value, form.endTime)
                      setForm({ ...form, startTime: e.target.value, hours: h })
                    }} required
                    className="w-full px-3 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">End *</label>
                  <input type="time" value={form.endTime}
                    onChange={e => {
                      const h = calcHours(form.startTime, e.target.value)
                      setForm({ ...form, endTime: e.target.value, hours: h })
                    }} required
                    className="w-full px-3 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Hours</label>
                  <input type="number" step="0.5" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Work Type</label>
                <div className="flex gap-2">
                  {['BILLABLE', 'NON_BILLABLE'].map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, workType: t })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.workType === t ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/30' : 'border border-white/10 text-zinc-400 hover:bg-white/5'
                      }`}>
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-brand-teal outline-none resize-none"
                  placeholder="Optional notes..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all">Log Time</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
