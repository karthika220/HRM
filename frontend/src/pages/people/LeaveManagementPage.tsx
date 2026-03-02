import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Plus,
  X,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Check,
  Edit,
  MoreVertical,
  Settings
} from 'lucide-react'

interface LeaveBalance {
  sick_total: number
  sick_used: number
  casual_total: number
  casual_used: number
  lop_used: number
}

interface LeaveRequest {
  id: string
  employee: {
    id: string
    name: string
    avatar?: string
  }
  leave_type: 'Sick' | 'Casual' | 'LOP'
  start_date: string
  end_date: string
  total_days: number
  status: 'Pending' | 'Approved' | 'Rejected' | 'LOP' | 'Cancelled'
  reason?: string
  hr_remark?: string
  created_at: string
}

interface Employee {
  id: string
  name: string
  avatar?: string
}

export default function LeaveManagementPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null)
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    sick_total: 8,
    sick_used: 3,
    casual_total: 8,
    casual_used: 5,
    lop_used: 2
  })
  const [loading, setLoading] = useState(true)
  
  // HR Balance Management State
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [balanceFormData, setBalanceFormData] = useState({
    sick_used: 0,
    casual_used: 0,
    lop_used: 0
  })
  
  // Mock employees for dropdown
  const [employees] = useState<Employee[]>([
    { id: '1', name: 'Sarah Johnson', avatar: 'SJ' },
    { id: '2', name: 'Michael Chen', avatar: 'MC' },
    { id: '3', name: 'Emma Davis', avatar: 'ED' },
    { id: '4', name: 'James Wilson', avatar: 'JW' }
  ])
  
  // Form state for new leave request
  const [formData, setFormData] = useState({
    leave_type: 'Sick' as 'Sick' | 'Casual',
    start_date: '',
    end_date: '',
    reason: ''
  })
  const [balanceWarning, setBalanceWarning] = useState('')

  useEffect(() => {
    fetchLeaveData()
  }, [selectedYear])

  const fetchLeaveData = async () => {
    try {
      setLoading(true)
      // Mock data for now - will be replaced with API calls
      const mockRequests: LeaveRequest[] = [
        {
          id: '1',
          employee: {
            id: '1',
            name: 'Sarah Johnson',
            avatar: 'SJ'
          },
          leave_type: 'Sick',
          start_date: '2024-02-10',
          end_date: '2024-02-12',
          total_days: 3,
          status: 'Approved',
          reason: 'Fever and cold',
          created_at: '2024-02-08T10:00:00Z'
        },
        {
          id: '2',
          employee: {
            id: '2',
            name: 'Michael Chen',
            avatar: 'MC'
          },
          leave_type: 'Casual',
          start_date: '2024-02-15',
          end_date: '2024-02-16',
          total_days: 2,
          status: 'Pending',
          reason: 'Personal work',
          created_at: '2024-02-13T14:30:00Z'
        },
        {
          id: '3',
          employee: {
            id: '3',
            name: 'Emma Davis',
            avatar: 'ED'
          },
          leave_type: 'Casual',
          start_date: '2024-02-20',
          end_date: '2024-02-22',
          total_days: 3,
          status: 'Approved',
          reason: 'Family function',
          created_at: '2024-02-18T09:15:00Z'
        },
        {
          id: '4',
          employee: {
            id: '4',
            name: 'James Wilson',
            avatar: 'JW'
          },
          leave_type: 'Sick',
          start_date: '2024-02-25',
          end_date: '2024-02-26',
          total_days: 2,
          status: 'LOP',
          reason: 'Medical emergency',
          created_at: '2024-02-24T16:45:00Z'
        }
      ]
      setLeaveRequests(mockRequests)
    } catch (error) {
      console.error('Error fetching leave data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const checkBalanceExceeded = (leaveType: 'Sick' | 'Casual', totalDays: number) => {
    if (leaveType === 'Sick') {
      const available = leaveBalance.sick_total - leaveBalance.sick_used
      return totalDays > available
    } else {
      const available = leaveBalance.casual_total - leaveBalance.casual_used
      return totalDays > available
    }
  }

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const totalDays = calculateTotalDays(formData.start_date, formData.end_date)
      const exceeded = checkBalanceExceeded(formData.leave_type, totalDays)
      
      if (exceeded) {
        setBalanceWarning('Leave balance exceeded. Excess will be marked as Loss of Pay.')
      } else {
        setBalanceWarning('')
      }
    }
  }, [formData.start_date, formData.end_date, formData.leave_type])

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault()
    
    const totalDays = calculateTotalDays(formData.start_date, formData.end_date)
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      employee: {
        id: 'current-user',
        name: 'Current User',
        avatar: 'CU'
      },
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      total_days: totalDays,
      status: 'Pending',
      reason: formData.reason,
      created_at: new Date().toISOString()
    }
    
    setLeaveRequests([newRequest, ...leaveRequests])
    setShowModal(false)
    setFormData({
      leave_type: 'Sick',
      start_date: '',
      end_date: '',
      reason: ''
    })
    setBalanceWarning('')
  }

  const approveLeave = async (id: string) => {
    try {
      // Mock API call - replace with actual API
      // const response = await fetch(`/api/leave/approve/${id}`, { method: 'POST' })
      
      // Find the request to approve
      const request = leaveRequests.find(req => req.id === id)
      if (!request) return

      // Update leave balance based on leave type
      let newBalance = { ...leaveBalance }
      let newStatus: 'Approved' | 'LOP' = 'Approved'

      if (request.leave_type === 'Sick') {
        const available = leaveBalance.sick_total - leaveBalance.sick_used
        if (request.total_days <= available) {
          newBalance.sick_used += request.total_days
        } else {
          // Partial approval + LOP
          newBalance.sick_used = leaveBalance.sick_total
          const excessDays = request.total_days - available
          newBalance.lop_used += excessDays
          newStatus = 'LOP'
        }
      } else if (request.leave_type === 'Casual') {
        const available = leaveBalance.casual_total - leaveBalance.casual_used
        if (request.total_days <= available) {
          newBalance.casual_used += request.total_days
        } else {
          // Partial approval + LOP
          newBalance.casual_used = leaveBalance.casual_total
          const excessDays = request.total_days - available
          newBalance.lop_used += excessDays
          newStatus = 'LOP'
        }
      }

      // Update the request status
      const updatedRequests = leaveRequests.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
      )

      setLeaveRequests(updatedRequests)
      setLeaveBalance(newBalance)
      setShowDrawer(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error approving leave:', error)
    }
  }

  const rejectLeave = async (id: string) => {
    try {
      // Mock API call - replace with actual API
      // const response = await fetch(`/api/leave/reject/${id}`, { method: 'POST' })
      
      // Update the request status
      const updatedRequests = leaveRequests.map(req => 
        req.id === id ? { ...req, status: 'Rejected' as const } : req
      )

      setLeaveRequests(updatedRequests)
      setShowDrawer(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error rejecting leave:', error)
    }
  }

  const openDrawer = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setShowDrawer(true)
  }

  const openEditModal = (request: LeaveRequest) => {
    setEditingRequest({ ...request })
    setShowEditModal(true)
    setShowMoreMenu(null)
  }

  const updateLeaveRequest = async () => {
    if (!editingRequest) return

    try {
      // Mock API call - replace with actual API
      // const response = await fetch(`/api/leave/update/${editingRequest.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editingRequest)
      // })

      // Update the request in the list
      const updatedRequests = leaveRequests.map(req => 
        req.id === editingRequest.id ? editingRequest : req
      )

      setLeaveRequests(updatedRequests)
      setShowEditModal(false)
      setEditingRequest(null)
      
      // Refresh balance if status changed
      fetchLeaveData()
    } catch (error) {
      console.error('Error updating leave request:', error)
    }
  }

  const convertToLOP = async (id: string) => {
    try {
      // Mock API call
      // const response = await fetch(`/api/leave/convert-to-lop/${id}`, { method: 'POST' })

      const updatedRequests = leaveRequests.map(req => 
        req.id === id ? { ...req, status: 'LOP' as const } : req
      )

      setLeaveRequests(updatedRequests)
      setShowMoreMenu(null)
    } catch (error) {
      console.error('Error converting to LOP:', error)
    }
  }

  const cancelLeave = async (id: string) => {
    try {
      // Mock API call
      // const response = await fetch(`/api/leave/cancel/${id}`, { method: 'POST' })

      const updatedRequests = leaveRequests.map(req => 
        req.id === id ? { ...req, status: 'Cancelled' as const } : req
      )

      setLeaveRequests(updatedRequests)
      setShowMoreMenu(null)
    } catch (error) {
      console.error('Error cancelling leave:', error)
    }
  }

  const updateLeaveBalance = async () => {
    if (!selectedEmployee) return

    try {
      // Mock API call
      // const response = await fetch(`/api/leave/balance/${selectedEmployee}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(balanceFormData)
      // })

      // For demo, update the global balance
      setLeaveBalance({
        ...leaveBalance,
        ...balanceFormData
      })

      setSelectedEmployee('')
      setBalanceFormData({ sick_used: 0, casual_used: 0, lop_used: 0 })
    } catch (error) {
      console.error('Error updating leave balance:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'LOP': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'Cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Sick': return 'text-red-400'
      case 'Casual': return 'text-blue-400'
      case 'LOP': return 'text-purple-400'
      default: return 'text-zinc-400'
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rubik font-bold text-2xl text-white">Leave Management</h1>
          <p className="text-zinc-400 mt-1">Manage employee leave balances and requests</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#00FFAA] text-black font-medium rounded-lg hover:bg-[#00CC88] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Apply Leave
          </button>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sick Leave Card */}
        <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Sick Leave</h3>
                <p className="text-xs text-zinc-400">Annual Balance</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{leaveBalance.sick_total - leaveBalance.sick_used}</div>
              <div className="text-xs text-zinc-400">remaining</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Used: {leaveBalance.sick_used}</span>
              <span className="text-zinc-400">Total: {leaveBalance.sick_total}</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(leaveBalance.sick_used / leaveBalance.sick_total) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-zinc-500">
              {Math.round((leaveBalance.sick_used / leaveBalance.sick_total) * 100)}% utilized
            </div>
          </div>
        </div>

        {/* Casual Leave Card */}
        <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Casual Leave</h3>
                <p className="text-xs text-zinc-400">Annual Balance</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{leaveBalance.casual_total - leaveBalance.casual_used}</div>
              <div className="text-xs text-zinc-400">remaining</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Used: {leaveBalance.casual_used}</span>
              <span className="text-zinc-400">Total: {leaveBalance.casual_total}</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(leaveBalance.casual_used / leaveBalance.casual_total) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-zinc-500">
              {Math.round((leaveBalance.casual_used / leaveBalance.casual_total) * 100)}% utilized
            </div>
          </div>
        </div>

        {/* Loss of Pay Card */}
        <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Loss of Pay</h3>
                <p className="text-xs text-zinc-400">Unpaid Leave</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{leaveBalance.lop_used}</div>
              <div className="text-xs text-zinc-400">days</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <AlertCircle className="w-4 h-4" />
            <span>No balance available</span>
          </div>
        </div>
      </div>

      {/* Manage Leave Balance Section */}
      <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-[#00FFAA]" />
          <h2 className="font-rubik font-semibold text-lg text-white">Manage Leave Balance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
            >
              <option value="">Choose employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Sick Used
            </label>
            <input
              type="number"
              min="0"
              max="8"
              value={balanceFormData.sick_used}
              onChange={(e) => setBalanceFormData({ ...balanceFormData, sick_used: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
              disabled={!selectedEmployee}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Casual Used
            </label>
            <input
              type="number"
              min="0"
              max="8"
              value={balanceFormData.casual_used}
              onChange={(e) => setBalanceFormData({ ...balanceFormData, casual_used: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
              disabled={!selectedEmployee}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              LOP Used
            </label>
            <input
              type="number"
              min="0"
              value={balanceFormData.lop_used}
              onChange={(e) => setBalanceFormData({ ...balanceFormData, lop_used: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
              disabled={!selectedEmployee}
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={updateLeaveBalance}
            disabled={!selectedEmployee}
            className="px-4 py-2 bg-[#00FFAA] text-black font-medium rounded-lg hover:bg-[#00CC88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Balance
          </button>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-[#09090B] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="font-rubik font-semibold text-lg text-white">Leave Requests</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Users className="w-4 h-4" />
                <span>{leaveRequests.length} requests</span>
              </div>
              <button className="text-[#00FFAA] hover:text-[#00CC88] transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-400">
            <div className="animate-spin w-8 h-8 border-2 border-[#00FFAA] border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading leave requests...
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#18181B] sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Days</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {leaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-[#18181B] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#00FFAA]/20 text-[#00FFAA] rounded-full flex items-center justify-center text-sm font-medium">
                          {request.employee.avatar}
                        </div>
                        <span className="text-white font-medium">{request.employee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${getLeaveTypeColor(request.leave_type)}`}>
                        {request.leave_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                      {new Date(request.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                      {new Date(request.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                      {request.total_days} {request.total_days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDrawer(request)}
                          className="text-[#00FFAA] hover:text-[#00CC88] transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(request)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {request.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => approveLeave(request.id)}
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejectLeave(request.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <div className="relative">
                          <button
                            onClick={() => setShowMoreMenu(showMoreMenu === request.id ? null : request.id)}
                            className="text-zinc-400 hover:text-zinc-300 transition-colors"
                            title="More Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {showMoreMenu === request.id && (
                            <div className="absolute right-0 top-8 bg-[#18181B] border border-zinc-700 rounded-lg shadow-lg z-10 min-w-[150px]">
                              <button
                                onClick={() => convertToLOP(request.id)}
                                className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-[#09090B] transition-colors flex items-center gap-2"
                              >
                                <AlertCircle className="w-3 h-3" />
                                Convert to LOP
                              </button>
                              <button
                                onClick={() => cancelLeave(request.id)}
                                className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-[#09090B] transition-colors flex items-center gap-2"
                              >
                                <X className="w-3 h-3" />
                                Cancel Leave
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#09090B] border border-zinc-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-rubik font-semibold text-lg text-white">Apply Leave</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Leave Type
                </label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value as 'Sick' | 'Casual' })}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                >
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  required
                />
              </div>

              {formData.start_date && formData.end_date && (
                <div className="text-sm text-zinc-400">
                  Total Days: {calculateTotalDays(formData.start_date, formData.end_date)}
                </div>
              )}

              {balanceWarning && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">{balanceWarning}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA] resize-none"
                  rows={3}
                  placeholder="Enter reason for leave..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-700 text-white font-medium rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#00FFAA] text-black font-medium rounded-lg hover:bg-[#00CC88] transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Leave Modal */}
      {showEditModal && editingRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#09090B] border border-zinc-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-rubik font-semibold text-lg text-white">Edit Leave Request</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); updateLeaveRequest(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Leave Type
                </label>
                <select
                  value={editingRequest.leave_type}
                  onChange={(e) => setEditingRequest({ ...editingRequest, leave_type: e.target.value as 'Sick' | 'Casual' | 'LOP' })}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                >
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="LOP">Loss of Pay</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={editingRequest.start_date}
                  onChange={(e) => setEditingRequest({ ...editingRequest, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={editingRequest.end_date}
                  onChange={(e) => setEditingRequest({ ...editingRequest, end_date: e.target.value })}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                  required
                />
              </div>

              {editingRequest.start_date && editingRequest.end_date && (
                <div className="text-sm text-zinc-400">
                  Total Days: {calculateTotalDays(editingRequest.start_date, editingRequest.end_date)}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Status
                </label>
                <select
                  value={editingRequest.status}
                  onChange={(e) => setEditingRequest({ ...editingRequest, status: e.target.value as 'Pending' | 'Approved' | 'Rejected' | 'LOP' | 'Cancelled' })}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="LOP">Loss of Pay</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Employee Reason
                </label>
                <textarea
                  value={editingRequest.reason || ''}
                  onChange={(e) => setEditingRequest({ ...editingRequest, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA] resize-none"
                  rows={2}
                  placeholder="Employee reason..."
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  HR Remark
                </label>
                <textarea
                  value={editingRequest.hr_remark || ''}
                  onChange={(e) => setEditingRequest({ ...editingRequest, hr_remark: e.target.value })}
                  className="w-full px-4 py-2 bg-[#18181B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00FFAA] resize-none"
                  rows={3}
                  placeholder="Add HR remarks..."
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

      {/* View Details Drawer */}
      {showDrawer && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
          <div className={`ml-auto w-96 h-full bg-[#09090B] border-l border-zinc-800 transform transition-transform duration-300 ${
            showDrawer ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="h-full flex flex-col">
              {/* Drawer Header */}
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-rubik font-semibold text-lg text-white">Leave Details</h3>
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Employee Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00FFAA]/20 text-[#00FFAA] rounded-full flex items-center justify-center text-lg font-medium">
                    {selectedRequest.employee.avatar}
                  </div>
                  <div>
                    <h4 className="font-rubik font-semibold text-white">{selectedRequest.employee.name}</h4>
                    <p className="text-zinc-400 text-sm">Employee</p>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="bg-[#18181B] rounded-lg p-4 space-y-4">
                  <h5 className="font-medium text-white mb-3">Leave Information</h5>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400 block">Leave Type</span>
                      <span className={`font-medium ${getLeaveTypeColor(selectedRequest.leave_type)}`}>
                        {selectedRequest.leave_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Status</span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border mt-1 ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Start Date</span>
                      <span className="text-white font-medium">
                        {new Date(selectedRequest.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">End Date</span>
                      <span className="text-white font-medium">
                        {new Date(selectedRequest.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Total Days</span>
                      <span className="text-white font-medium">
                        {selectedRequest.total_days} {selectedRequest.total_days === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Applied On</span>
                      <span className="text-white font-medium">
                        {new Date(selectedRequest.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {selectedRequest.reason && (
                    <div>
                      <span className="text-zinc-400 block text-sm">Employee Reason</span>
                      <p className="text-white mt-1">{selectedRequest.reason}</p>
                    </div>
                  )}

                  {selectedRequest.hr_remark && (
                    <div>
                      <span className="text-zinc-400 block text-sm">HR Remark</span>
                      <p className="text-white mt-1">{selectedRequest.hr_remark}</p>
                    </div>
                  )}
                </div>

                {/* Current Leave Balance */}
                <div className="bg-[#18181B] rounded-lg p-4 space-y-3">
                  <h5 className="font-medium text-white mb-3">Current Leave Balance</h5>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Sick Leave</span>
                      <span className="text-white">{leaveBalance.sick_total - leaveBalance.sick_used}/{leaveBalance.sick_total}</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-1.5">
                      <div 
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{ width: `${(leaveBalance.sick_used / leaveBalance.sick_total) * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Casual Leave</span>
                      <span className="text-white">{leaveBalance.casual_total - leaveBalance.casual_used}/{leaveBalance.casual_total}</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${(leaveBalance.casual_used / leaveBalance.casual_total) * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">LOP Days</span>
                      <span className="text-purple-400">{leaveBalance.lop_used}</span>
                    </div>
                  </div>
                </div>

                {/* LOP Warning */}
                {selectedRequest.status === 'Pending' && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-400 font-medium">Balance Check</p>
                        <p className="text-xs text-yellow-300 mt-1">
                          {selectedRequest.leave_type === 'Sick' && 
                            (selectedRequest.total_days > (leaveBalance.sick_total - leaveBalance.sick_used) 
                              ? `Exceeds sick leave balance by ${selectedRequest.total_days - (leaveBalance.sick_total - leaveBalance.sick_used)} days. Excess will be marked as LOP.`
                              : 'Within sick leave balance.')
                          }
                          {selectedRequest.leave_type === 'Casual' && 
                            (selectedRequest.total_days > (leaveBalance.casual_total - leaveBalance.casual_used) 
                              ? `Exceeds casual leave balance by ${selectedRequest.total_days - (leaveBalance.casual_total - leaveBalance.casual_used)} days. Excess will be marked as LOP.`
                              : 'Within casual leave balance.')
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedRequest.status === 'Pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => approveLeave(selectedRequest.id)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectLeave(selectedRequest.id)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* Edit Shortcut Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowDrawer(false)
                      openEditModal(selectedRequest)
                    }}
                    className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Leave Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
