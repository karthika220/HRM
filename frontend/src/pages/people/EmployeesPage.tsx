import React, { useState, useEffect } from 'react'
import { Search, Plus, User, Calendar, FileText, TrendingUp, ChevronRight, Mail, Phone, Building, Briefcase, UserCheck, X, Edit, AlertTriangle, Plus as PlusIcon, Clock } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import { format } from 'date-fns'

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)

  // Escalation state
  const [escalations, setEscalations] = useState<any[]>([])
  const [escalationsLoading, setEscalationsLoading] = useState(false)
  const [showEscalationModal, setShowEscalationModal] = useState(false)
  const [editingEscalation, setEditingEscalation] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [escalationToDelete, setEscalationToDelete] = useState<any>(null)
  
  // Attendance state
  const [attendanceData, setAttendanceData] = useState<any>(null)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  
  // Leave state
  const [leaveData, setLeaveData] = useState<any>(null)
  const [leaveLoading, setLeaveLoading] = useState(false)
  
  const [escalationForm, setEscalationForm] = useState({
    type: 'Warning',
    severity: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    description: ''
  })

  const { user: currentUser } = useAuthStore()

  // Role-based access control
  const canViewEscalations = true // All roles can view escalations (filtered by API)
  const canCreateEscalation = ['HR', 'Manager', 'MD', 'SUPER_ADMIN'].includes(currentUser?.role || '')
  const canCloseEscalation = ['HR', 'MD', 'SUPER_ADMIN'].includes(currentUser?.role || '')
  const canEditEscalation = ['HR', 'MD', 'SUPER_ADMIN'].includes(currentUser?.role || '')
  const canDeleteEscalation = ['HR', 'MD', 'SUPER_ADMIN'].includes(currentUser?.role || '')
  const [employees, setEmployees] = useState<any[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(false)

  // Fetch real employees from backend
  const loadEmployees = async () => {
    setEmployeesLoading(true)
    try {
      const response = await api.get('/users')
      setEmployees(response.data || [])
    } catch (error) {
      console.error('Failed to load employees:', error)
      // Fallback to empty array if API fails
      setEmployees([])
    } finally {
      setEmployeesLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const departments = ['all', 'Engineering', 'Marketing', 'Sales', 'HR']
  const statuses = ['all', 'active', 'resigned', 'terminated']

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-brand-mint/20 text-brand-mint'
      case 'resigned': return 'bg-orange-500/20 text-orange-500'
      case 'terminated': return 'bg-red-500/20 text-red-500'
      default: return 'bg-zinc-500/20 text-zinc-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'resigned': return 'Resigned'
      case 'terminated': return 'Terminated'
      default: return status
    }
  }

  // Escalation functions
  const loadEscalations = async (employeeId: string) => {
    setEscalationsLoading(true)
    try {
      const response = await api.get(`/escalations/employee/${employeeId}`)
      setEscalations(response.data.escalations)
    } catch (error: any) {
      console.error('Failed to load escalations:', error)
      if (error.response?.status !== 403) {
        // Don't show alert for access denied (expected for employees viewing others)
      }
    } finally {
      setEscalationsLoading(false)
    }
  }

  const handleCreateEscalation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!escalationForm.type || !escalationForm.description) {
      alert('Please fill all fields')
      return
    }

    try {
      if (editingEscalation) {
        // Update existing escalation
        await api.put(`/escalations/${editingEscalation.id}`, {
          type: escalationForm.type,
          severity: escalationForm.severity,
          description: escalationForm.description
        })
        alert('Escalation updated successfully')
      } else {
        // Create new escalation
        await api.post('/escalations', {
          employeeId: selectedEmployee.id,
          type: escalationForm.type,
          severity: escalationForm.severity,
          description: escalationForm.description
        })
        alert('Escalation created successfully')
      }

      setShowEscalationModal(false)
      setEditingEscalation(null)
      setEscalationForm({ type: 'Warning', severity: 'Medium', description: '' })
      loadEscalations(selectedEmployee.id)
    } catch (error: any) {
      console.error('Failed to save escalation:', error)
      alert(error.response?.data?.message || 'Failed to save escalation')
    }
  }

  const handleEditEscalation = (escalation: any) => {
    setEditingEscalation(escalation)
    setEscalationForm({
      type: escalation.type,
      severity: escalation.severity,
      description: escalation.description
    })
    setShowEscalationModal(true)
  }

  const handleDeleteEscalation = (escalation: any) => {
    setEscalationToDelete(escalation)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteEscalation = async () => {
    try {
      await api.delete(`/escalations/${escalationToDelete.id}`)
      setShowDeleteConfirm(false)
      setEscalationToDelete(null)
      loadEscalations(selectedEmployee.id)
      alert('Escalation deleted successfully')
    } catch (error: any) {
      console.error('Failed to delete escalation:', error)
      alert(error.response?.data?.message || 'Failed to delete escalation')
    }
  }

  const handleCloseEscalation = async (escalationId: string) => {
    try {
      await api.put(`/escalations/${escalationId}/close`)
      loadEscalations(selectedEmployee.id)
      alert('Escalation closed successfully')
    } catch (error: any) {
      console.error('Failed to close escalation:', error)
      alert(error.response?.data?.message || 'Failed to close escalation')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-600/10 border border-red-600/30'
      case 'High': return 'text-red-400 bg-red-400/10 border border-red-400/30'
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30'
      case 'Low': return 'text-green-400 bg-green-400/10 border border-green-400/30'
      default: return 'text-zinc-400 bg-zinc-400/10 border border-zinc-400/30'
    }
  }

  const getEscalationStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-brand-orange bg-brand-orange/10 border border-brand-orange/30'
      case 'Closed': return 'text-green-400 bg-green-400/10 border border-green-400/30'
      default: return 'text-zinc-400 bg-zinc-400/10 border border-zinc-400/30'
    }
  }

  useEffect(() => {
    if (selectedEmployee && activeTab === 'escalations') {
      loadEscalations(selectedEmployee.id)
    }
    if (selectedEmployee && activeTab === 'attendance') {
      loadAttendance(selectedEmployee.id)
    }
    if (selectedEmployee && activeTab === 'leave') {
      loadLeave(selectedEmployee.id)
    }
  }, [selectedEmployee, activeTab])

  // Load attendance data
  const loadAttendance = async (employeeId: string) => {
    setAttendanceLoading(true)
    try {
      const response = await api.get(`/attendance/employee/${employeeId}`)
      setAttendanceData(response.data)
    } catch (error: any) {
      console.error('Failed to load attendance:', error)
      if (error.response?.status !== 403) {
        // Don't show alert for access denied (expected for employees viewing others)
      }
    } finally {
      setAttendanceLoading(false)
    }
  }

  // Load leave data
  const loadLeave = async (employeeId: string) => {
    setLeaveLoading(true)
    try {
      const response = await api.get(`/leave/employee/${employeeId}`)
      setLeaveData(response.data)
    } catch (error: any) {
      console.error('Failed to load leave:', error)
      if (error.response?.status !== 403) {
        // Don't show alert for access denied (expected for employees viewing others)
      }
    } finally {
      setLeaveLoading(false)
    }
  }

  const handleAddEmployee = () => {
    setShowAddModal(true)
  }

  const handleEditEmployee = () => {
    setEditingEmployee({ ...selectedEmployee })
    setShowEditModal(true)
  }

  const handleSubmitEditEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    const updatedEmployee = {
      ...editingEmployee,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      department: formData.get('department') as string,
      role: formData.get('role') as string,
      status: formData.get('status') as string,
      joinDate: formData.get('joinDate') as string,
      manager: formData.get('manager') as string,
      avatar: formData.get('name')?.toString().split(' ').map(n => n[0]).join('').toUpperCase() || ''
    }
    
    setEmployees(employees.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp))
    setSelectedEmployee(updatedEmployee)
    setShowEditModal(false)
    setEditingEmployee(null)
  }

  const handleSubmitEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    const newEmployee = {
      id: employees.length + 1,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      department: formData.get('department') as string,
      role: formData.get('role') as string,
      status: 'active',
      joinDate: formData.get('joinDate') as string,
      manager: formData.get('manager') as string,
      avatar: formData.get('name')?.toString().split(' ').map(n => n[0]).join('').toUpperCase() || '',
      attendance: {
        present: 0,
        leave: 0,
        late: 0
      },
      leave: {
        balance: 20,
        used: 0
      },
      performance: {
        rating: 0,
        lastReview: '',
        goals: 0
      }
    }
    
    setEmployees([...employees, newEmployee])
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rubik font-bold text-2xl text-white">Employees</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage and view employee details</p>
        </div>
        <button onClick={handleAddEmployee} className="bg-brand-teal hover:bg-brand-teal/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-brand-teal/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal/50 transition-colors"
            >
              {departments.map(dept => (
                <option key={dept} value={dept} className="bg-[#09090B]">
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal/50 transition-colors"
            >
              {statuses.map(status => (
                <option key={status} value={status} className="bg-[#09090B]">
                  {status === 'all' ? 'All Status' : getStatusText(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Avatar</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Name</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Employee ID</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Department</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Role</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Status</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Join Date</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {employeesLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-zinc-400">Loading employees...</p>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <p className="text-zinc-400">No employees found</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="w-8 h-8 bg-brand-teal/20 rounded-lg flex items-center justify-center">
                      <span className="text-brand-teal font-bold text-xs">
                        {employee.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{employee.name}</p>
                      <p className="text-zinc-500 text-sm">{employee.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-zinc-300">{employee.employeeCode || 'N/A'}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-zinc-300">{employee.department || 'Not assigned'}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-zinc-300">{employee.role}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.isActive ? 'active' : 'inactive')}`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-300">
                    {employee.createdAt ? format(new Date(employee.createdAt), 'dd MMM yyyy') : 'N/A'}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedEmployee(employee)}
                      className="text-brand-teal hover:text-brand-teal/80 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      View
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Details Section */}
      {selectedEmployee && (
        <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-rubik font-semibold text-xl text-white">Employee Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditEmployee}
                className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                title="Edit Employee"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-zinc-400 hover:text-white transition-colors p-2"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-white/10 mb-6">
            {['profile', 'attendance', 'leave', 'performance', 'escalations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-brand-teal border-brand-teal'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-brand-teal/20 rounded-full flex items-center justify-center mb-4">
                      <span className="text-brand-teal font-bold text-2xl">
                        {selectedEmployee.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">{selectedEmployee.name}</h3>
                    <p className="text-zinc-500">{selectedEmployee.role}</p>
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-zinc-500 text-sm">Email</p>
                      <div className="flex items-center gap-2 text-white">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        {selectedEmployee.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-zinc-500 text-sm">Phone</p>
                      <div className="flex items-center gap-2 text-white">
                        <Phone className="w-4 h-4 text-zinc-400" />
                        {selectedEmployee.phone || 'Not provided'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-zinc-500 text-sm">Department</p>
                      <div className="flex items-center gap-2 text-white">
                        <Building className="w-4 h-4 text-zinc-400" />
                        {selectedEmployee.department || 'Not assigned'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-zinc-500 text-sm">Role</p>
                      <div className="flex items-center gap-2 text-white">
                        <Briefcase className="w-4 h-4 text-zinc-400" />
                        {selectedEmployee.role}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-zinc-500 text-sm">Employee Code</p>
                      <div className="flex items-center gap-2 text-white">
                        <User className="w-4 h-4 text-zinc-400" />
                        {selectedEmployee.employeeCode || 'Not assigned'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-zinc-500 text-sm">Join Date</p>
                      <div className="flex items-center gap-2 text-white">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        {selectedEmployee.createdAt ? format(new Date(selectedEmployee.createdAt), 'dd MMM yyyy') : 'Not available'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-zinc-500 text-sm">Employment Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEmployee.isActive ? 'active' : 'inactive')}`}>
                        {selectedEmployee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                {attendanceLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-zinc-400">Loading attendance data...</p>
                  </div>
                ) : attendanceData ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h4 className="text-zinc-400 text-sm font-medium mb-1">Present Days</h4>
                        <p className="text-2xl font-bold text-brand-mint">{attendanceData.summary.presentDays}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h4 className="text-zinc-400 text-sm font-medium mb-1">Late Count</h4>
                        <p className="text-2xl font-bold text-yellow-400">{attendanceData.summary.lateCount}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h4 className="text-zinc-400 text-sm font-medium mb-1">Overtime Hours</h4>
                        <p className="text-2xl font-bold text-orange-400">{attendanceData.summary.overtimeHours}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h4 className="text-zinc-400 text-sm font-medium mb-1">Total Working Hours</h4>
                        <p className="text-2xl font-bold text-blue-400">{attendanceData.summary.totalWorkingHours}</p>
                      </div>
                    </div>

                    {/* Today's Attendance */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-brand-teal" />
                        Today's Attendance
                      </h3>
                      {attendanceData.todayAttendance ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-zinc-400 text-sm mb-1">First IN</p>
                            <p className="text-white font-medium">
                              {attendanceData.todayAttendance.firstIn ? 
                                format(new Date(attendanceData.todayAttendance.firstIn), 'hh:mm a') : 
                                'Not recorded'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-400 text-sm mb-1">Last OUT</p>
                            <p className="text-white font-medium">
                              {attendanceData.todayAttendance.lastOut ? 
                                format(new Date(attendanceData.todayAttendance.lastOut), 'hh:mm a') : 
                                'Not recorded'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-400 text-sm mb-1">Total Worked Duration</p>
                            <p className="text-white font-medium">{attendanceData.todayAttendance.totalWorkedDuration} hours</p>
                          </div>
                          <div>
                            <p className="text-zinc-400 text-sm mb-1">Lunch Duration</p>
                            <p className="text-white font-medium">{attendanceData.todayAttendance.lunchDuration} hour</p>
                          </div>
                          <div>
                            <p className="text-zinc-400 text-sm mb-1">Status</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              attendanceData.todayAttendance.status === 'Present' 
                                ? 'text-green-400 bg-green-400/10 border border-green-400/30' 
                                : attendanceData.todayAttendance.status === 'Absent'
                                ? 'text-red-400 bg-red-400/10 border border-red-400/30'
                                : 'text-zinc-400 bg-zinc-400/10 border border-zinc-400/30'
                            }`}>
                              {attendanceData.todayAttendance.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-zinc-400">No attendance recorded for today</p>
                        </div>
                      )}
                    </div>

                    {/* Monthly Attendance Table */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-white font-semibold mb-4">Monthly Attendance</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">First IN</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Last OUT</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Hours</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Late</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Overtime</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {attendanceData.monthlyAttendance.map((record: any, index: number) => (
                              <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                  <span className="text-sm text-zinc-300">
                                    {format(new Date(record.date), 'dd MMM yyyy')}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-zinc-300">
                                    {record.firstIn ? format(new Date(record.firstIn), 'hh:mm a') : '—'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-zinc-300">
                                    {record.lastOut ? format(new Date(record.lastOut), 'hh:mm a') : '—'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-zinc-300">{record.workingHours.toFixed(1)}</span>
                                </td>
                                <td className="px-4 py-3">
                                  {record.late ? (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium text-yellow-400 bg-yellow-400/10 border border-yellow-400/30">
                                      Late
                                    </span>
                                  ) : (
                                    <span className="text-sm text-zinc-400">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-zinc-300">{record.overtime.toFixed(1)}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    record.status === 'Present' 
                                      ? 'text-green-400 bg-green-400/10 border border-green-400/30' 
                                      : record.status === 'Absent'
                                      ? 'text-red-400 bg-red-400/10 border border-red-400/30'
                                      : 'text-zinc-400 bg-zinc-400/10 border border-zinc-400/30'
                                  }`}>
                                    {record.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No attendance data available</p>
                    <p className="text-zinc-500 text-sm mt-2">Please check back later</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leave' && (
              <div>
                {leaveLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-zinc-400">Loading leave data...</p>
                  </div>
                ) : leaveData ? (
                  <>
                    {/* Proper Leave Balance Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {/* Sick Leave Card */}
                      {(() => {
                        const sickBalance = leaveData.leaveBalances.find((b: any) => b.leaveType === 'sick');
                        const used = sickBalance?.sickUsed || 0;
                        const total = sickBalance?.sickTotal || 8;
                        const remaining = total - used;
                        return (
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h4 className="text-zinc-400 text-sm font-medium mb-1">Sick Leave</h4>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-2xl font-bold text-brand-mint">{used}</span>
                              <span className="text-zinc-400 text-sm">/ {total}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-zinc-400">Remaining: </span>
                              <span className="text-green-400 font-medium">{remaining} days</span>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Casual Leave Card */}
                      {(() => {
                        const casualBalance = leaveData.leaveBalances.find((b: any) => b.leaveType === 'casual');
                        const used = casualBalance?.casualUsed || 0;
                        const total = casualBalance?.casualTotal || 8;
                        const remaining = total - used;
                        return (
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h4 className="text-zinc-400 text-sm font-medium mb-1">Casual Leave</h4>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-2xl font-bold text-blue-400">{used}</span>
                              <span className="text-zinc-400 text-sm">/ {total}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-zinc-400">Remaining: </span>
                              <span className="text-green-400 font-medium">{remaining} days</span>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* LOP Card */}
                      {(() => {
                        const lopBalance = leaveData.leaveBalances.find((b: any) => b.leaveType === 'lop');
                        const used = lopBalance?.lopUsed || 0;
                        return (
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h4 className="text-zinc-400 text-sm font-medium mb-1">LOP (Loss of Pay)</h4>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-2xl font-bold text-orange-400">{used}</span>
                              <span className="text-zinc-400 text-sm">days used</span>
                            </div>
                            <div className="text-sm text-zinc-400">Total LOP days used</div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Leave Requests Table */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-white font-semibold mb-4">Leave Requests</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Leave Type</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Start Date</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">End Date</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Days</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Approved By</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {leaveData.leaveRequests.map((request: any, index: number) => (
                              <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                  <span className="text-sm text-white capitalize">{request.leaveType}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-zinc-300">
                                    {format(new Date(request.startDate), 'dd MMM yyyy')}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-zinc-300">
                                    {format(new Date(request.endDate), 'dd MMM yyyy')}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-zinc-300">{request.totalDays}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    request.status === 'Approved' 
                                      ? 'text-green-400 bg-green-400/10 border border-green-400/30' 
                                      : request.status === 'Pending'
                                      ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30'
                                      : 'text-red-400 bg-red-400/10 border border-red-400/30'
                                  }`}>
                                    {request.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-zinc-300">
                                    {request.approvedBy || '—'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No leave data available</p>
                    <p className="text-zinc-500 text-sm mt-2">Please check back later</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">Performance data not available</p>
                <p className="text-zinc-500 text-sm mt-2">This feature requires integration with performance management system</p>
              </div>
            )}

            {activeTab === 'escalations' && (
              <div>
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Escalations</h3>
                  {canCreateEscalation && (
                    <button
                      onClick={() => setShowEscalationModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-orange to-brand-orange/80 text-white font-medium rounded-xl hover:opacity-90 transition-all"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Raise Escalation
                    </button>
                  )}
                </div>

                {/* Summary Count Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h4 className="text-zinc-400 text-sm font-medium mb-1">Total Escalations</h4>
                    <p className="text-2xl font-bold text-white">{escalations.length}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h4 className="text-zinc-400 text-sm font-medium mb-1">Warnings</h4>
                    <p className="text-2xl font-bold text-yellow-400">
                      {escalations.filter(e => e.type === 'Warning').length}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h4 className="text-zinc-400 text-sm font-medium mb-1">Performance Issues</h4>
                    <p className="text-2xl font-bold text-red-400">
                      {escalations.filter(e => e.type === 'Performance Issue').length}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h4 className="text-zinc-400 text-sm font-medium mb-1">Policy Violations</h4>
                    <p className="text-2xl font-bold text-brand-orange">
                      {escalations.filter(e => e.type === 'Policy Violation').length}
                    </p>
                  </div>
                </div>

                {/* Escalations List */}
                {escalationsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" />
                  </div>
                ) : escalations.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400 mb-2">No escalations recorded for this employee</p>
                    {canCreateEscalation && (
                      <p className="text-zinc-500 text-sm">You can raise an escalation using the button above</p>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Severity</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Raised By</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Created Date</th>
                          <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {escalations.map((escalation) => (
                          <tr key={escalation.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3">
                              <span className="text-sm text-white">{escalation.type}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(escalation.severity)}`}>
                                {escalation.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              <span 
                                className="text-sm text-zinc-300 truncate block cursor-help" 
                                title={escalation.description}
                              >
                                {escalation.description}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-zinc-400">{escalation.raiser?.name || 'Unknown'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEscalationStatusColor(escalation.status)}`}>
                                {escalation.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-zinc-400">
                                {format(new Date(escalation.createdAt), 'dd MMM yyyy')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {canEditEscalation && (
                                  <button
                                    onClick={() => handleEditEscalation(escalation)}
                                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                                  >
                                    Edit
                                  </button>
                                )}
                                {escalation.status === 'Open' && canCloseEscalation && (
                                  <button
                                    onClick={() => handleCloseEscalation(escalation.id)}
                                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                                  >
                                    Close
                                  </button>
                                )}
                                {canDeleteEscalation && (
                                  <button
                                    onClick={() => handleDeleteEscalation(escalation)}
                                    className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#09090B] border border-zinc-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-rubik font-semibold text-lg text-white">Edit Employee</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingEmployee.name}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={editingEmployee.email}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  defaultValue={editingEmployee.phone}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  required
                  defaultValue={editingEmployee.department}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  required
                  defaultValue={editingEmployee.role}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  placeholder="Enter job role"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  required
                  defaultValue={editingEmployee.status}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                >
                  <option value="active">Active</option>
                  <option value="resigned">Resigned</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Join Date
                </label>
                <input
                  type="date"
                  name="joinDate"
                  required
                  defaultValue={editingEmployee.joinDate}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Manager
                </label>
                <input
                  type="text"
                  name="manager"
                  required
                  defaultValue={editingEmployee.manager}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  placeholder="Enter manager name"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-700 text-white font-medium rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#00FFAA] text-black font-medium rounded-lg hover:bg-[#00CC88] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#09090B] border border-zinc-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-rubik font-semibold text-lg text-white">Add New Employee</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  required
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  required
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  placeholder="Enter job role"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Join Date
                </label>
                <input
                  type="date"
                  name="joinDate"
                  required
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Manager
                </label>
                <input
                  type="text"
                  name="manager"
                  required
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  placeholder="Enter manager name"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-700 text-white font-medium rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#00FFAA] text-black font-medium rounded-lg hover:bg-[#00CC88] transition-colors"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escalation Modal */}
      {showEscalationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-[#09090B] border border-white/10 rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="font-rubik font-bold text-white">
                {editingEscalation ? 'Edit Escalation' : 'Raise Escalation'}
              </h3>
              <button 
                onClick={() => {
                  setShowEscalationModal(false)
                  setEditingEscalation(null)
                  setEscalationForm({ type: 'Warning', severity: 'Medium', description: '' })
                }} 
                className="p-2 hover:bg-white/5 rounded-xl text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateEscalation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Type</label>
                <select
                  value={escalationForm.type}
                  onChange={(e) => setEscalationForm({ ...escalationForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  <option value="Warning">Warning</option>
                  <option value="Performance Issue">Performance Issue</option>
                  <option value="Policy Violation">Policy Violation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Severity</label>
                <select
                  value={escalationForm.severity}
                  onChange={(e) => setEscalationForm({ ...escalationForm, severity: e.target.value as 'Low' | 'Medium' | 'High' | 'Critical' })}
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
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
                  {editingEscalation ? 'Update Escalation' : 'Raise Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && escalationToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-[#09090B] border border-white/10 rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="font-rubik font-bold text-white">Delete Escalation</h3>
              <button onClick={() => setShowDeleteConfirm(false)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Are you sure you want to delete this escalation?</p>
                <p className="text-zinc-400 text-sm">This action cannot be undone.</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-zinc-400 text-sm mb-1">Type:</p>
                <p className="text-white font-medium">{escalationToDelete.type}</p>
                <p className="text-zinc-400 text-sm mb-1 mt-3">Severity:</p>
                <p className="text-white font-medium">{escalationToDelete.severity}</p>
                <p className="text-zinc-400 text-sm mb-1 mt-3">Description:</p>
                <p className="text-white text-sm">{escalationToDelete.description}</p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteEscalation}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
