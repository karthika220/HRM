import { useEffect, useState } from 'react'
import { Search, UserPlus, X, Shield, User, CheckCircle, XCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import { format } from 'date-fns'

const ROLE_LABELS: Record<string, string> = {
  MANAGING_DIRECTOR: 'Managing Director',
  HR_MANAGER: 'HR Manager',
  TEAM_LEAD: 'Team Lead',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
}
const ROLE_COLORS: Record<string, string> = {
  MANAGING_DIRECTOR: 'bg-brand-orange/15 text-brand-orange ring-brand-orange/30',
  HR_MANAGER: 'bg-brand-teal/15 text-brand-teal ring-brand-teal/30',
  TEAM_LEAD: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/30',
  MANAGER: 'bg-blue-500/15 text-blue-400 ring-blue-500/30',
  EMPLOYEE: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30',
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  const [form, setForm] = useState({
    name: '', 
    email: '', 
    password: '', 
    role: 'EMPLOYEE', 
    department: '', 
    reportTo: '',
    employeeCode: '',
    designation: '',
    employmentType: 'Full-time',
    joinDate: '',
    employmentStatus: 'Active',
    reportingManagerId: '',
  })

  const canManage = ['MANAGING_DIRECTOR'].includes(currentUser?.role || '')
  const canView = ['MANAGING_DIRECTOR', 'HR_MANAGER', 'TEAM_LEAD', 'MANAGER'].includes(currentUser?.role || '')

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const r = await api.get('/users')
      setUsers(r.data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, form)
      } else {
        await api.post('/users', form)
      }
      setShowModal(false)
      setEditUser(null)
      setForm({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'EMPLOYEE', 
        department: '', 
        reportTo: '',
        employeeCode: '',
        designation: '',
        employmentType: 'Full-time',
        joinDate: '',
        employmentStatus: 'Active',
        reportingManagerId: '',
      })
      loadUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error')
    }
  }

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/users/${userId}`, { isActive: !isActive })
      loadUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error')
    }
  }

  const openEdit = (user: any) => {
    setEditUser(user)
    setForm({ 
      name: user.name, 
      email: user.email, 
      password: '', 
      role: user.role, 
      department: user.department || '', 
      reportTo: user.reportTo || '',
      employeeCode: user.employeeCode || '',
      designation: user.designation || '',
      employmentType: user.employmentType || 'Full-time',
      joinDate: user.joinDate ? new Date(user.joinDate).toISOString().split('T')[0] : '',
      employmentStatus: user.employmentStatus || 'Active',
      reportingManagerId: user.reportingManagerId || '',
    })
    setShowModal(true)
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rubik font-bold text-2xl text-white">Users</h1>
          <p className="text-zinc-500 text-sm mt-1">{users.length} users registered</p>
        </div>
        {canManage && (
          <button onClick={() => { 
            setEditUser(null); 
            setForm({ 
              name: '', 
              email: '', 
              password: '', 
              role: 'EMPLOYEE', 
              department: '', 
              reportTo: '',
              employeeCode: '',
              designation: '',
              employmentType: 'Full-time',
              joinDate: '',
              employmentStatus: 'Active',
              reportingManagerId: '',
            }); 
            setShowModal(true) 
          }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,161,199,0.3)]">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      <div className="flex items-center bg-[#18181B] border border-white/10 rounded-xl px-3 focus-within:border-brand-teal transition-all w-72">
        <Search className="w-4 h-4 text-zinc-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="bg-transparent text-white placeholder-zinc-600 text-sm px-3 py-2.5 outline-none flex-1"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(ROLE_LABELS).map(([role, label]) => {
          const count = users.filter(u => u.role === role).length
          return (
            <div key={role} className="bg-[#09090B] border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-mono font-bold text-white">{count}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
            </div>
          )
        })}
      </div>

      {/* Users Table */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Employee Code</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Designation</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tasks</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                {canView && <th className="px-5 py-3.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-5 py-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                    </td>
                  </tr>
                ))
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-teal/20 to-brand-mint/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-brand-teal">{u.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{u.name}</div>
                        <div className="text-xs text-zinc-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-mono text-zinc-400">{u.employeeCode || '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded ring-1 ${ROLE_COLORS[u.role] || ROLE_COLORS.EMPLOYEE}`}>
                      {ROLE_LABELS[u.role] || 'Employee'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-zinc-400">{u.department || '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-zinc-400">{u.designation || '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-mono text-zinc-400">{u._count?.assignedTasks || 0}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-zinc-500">{format(new Date(u.createdAt), 'MMM dd, yyyy')}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${u.isActive ? 'text-brand-mint' : 'text-zinc-600'}`}>
                      {u.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {canView && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(u)}
                          className="px-3 py-1.5 text-xs border border-white/20 text-zinc-300 rounded-lg hover:bg-white/5 transition-all">
                          Edit
                        </button>
                        {u.id !== currentUser?.id && (
                          <button onClick={() => toggleActive(u.id, u.isActive)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                              u.isActive ? 'border border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border border-brand-mint/30 text-brand-mint hover:bg-brand-mint/10'
                            }`}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Details Section */}
      {selectedEmployee && (
        <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-brand-teal" />
              <h2 className="font-rubik font-semibold text-white">Employee Details</h2>
            </div>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="p-2 hover:bg-white/5 rounded-xl text-zinc-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-zinc-400">Name</label>
                  <p className="text-white">{selectedEmployee.name}</p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Email</label>
                  <p className="text-white">{selectedEmployee.email}</p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Role</label>
                  <p className="text-white">{selectedEmployee.role}</p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Department</label>
                  <p className="text-white">{selectedEmployee.department}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Employee Information</h3>
              <div className="space-y-3">
                {selectedEmployee.employeeCode && (
                  <div>
                    <label className="text-sm text-zinc-400">Employee Code</label>
                    <p className="text-white">{selectedEmployee.employeeCode}</p>
                  </div>
                )}
                {selectedEmployee.designation && (
                  <div>
                    <label className="text-sm text-zinc-400">Designation</label>
                    <p className="text-white">{selectedEmployee.designation}</p>
                  </div>
                )}
                {selectedEmployee.employmentType && (
                  <div>
                    <label className="text-sm text-zinc-400">Employment Type</label>
                    <p className="text-white">{selectedEmployee.employmentType}</p>
                  </div>
                )}
                {selectedEmployee.joinDate && (
                  <div>
                    <label className="text-sm text-zinc-400">Join Date</label>
                    <p className="text-white">{format(new Date(selectedEmployee.joinDate), 'dd MMM yyyy')}</p>
                  </div>
                )}
                {selectedEmployee.employmentStatus && (
                  <div>
                    <label className="text-sm text-zinc-400">Employment Status</label>
                    <p className="text-white">{selectedEmployee.employmentStatus}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090B] border border-white/10 rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-rubik font-bold text-white">{editUser ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                  disabled={!!editUser}
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none disabled:opacity-50"
                  placeholder="john@company.com"
                />
              </div>
              {!editUser && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password *</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editUser}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                    placeholder="Min. 6 characters"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none">
                    {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Department</label>
                  <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-brand-teal outline-none"
                    placeholder="e.g. Engineering"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Report To</label>
                <select
                  value={form.reportTo}
                  onChange={e => setForm({ ...form, reportTo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                >
                  <option value="">Select a manager...</option>
                  {users
                    .filter(u => ['MANAGING_DIRECTOR', 'MANAGER', 'TEAM_LEAD'].includes(u.role))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
              </div>
              
              {/* Employee Specific Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Employee Code</label>
                  <input value={form.employeeCode} onChange={e => setForm({ ...form, employeeCode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-brand-teal outline-none"
                    placeholder="e.g. EMP001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Designation</label>
                  <input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-brand-teal outline-none"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Employment Type</label>
                  <select value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none">
                    <option value="Full-time">Full-time</option>
                    <option value="Intern">Intern</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Join Date</label>
                  <input type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Employment Status</label>
                  <select value={form.employmentStatus} onChange={e => setForm({ ...form, employmentStatus: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none">
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Reporting Manager</label>
                  <select
                    value={form.reportingManagerId}
                    onChange={e => setForm({ ...form, reportingManagerId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
                  >
                    <option value="">Select a manager...</option>
                    {users
                      .filter(u => ['MANAGING_DIRECTOR', 'MANAGER', 'TEAM_LEAD'].includes(u.role))
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all">
                  {editUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
