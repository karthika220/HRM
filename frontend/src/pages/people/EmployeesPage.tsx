import React, { useState, useEffect } from 'react'
import { Search, Plus, User, Calendar, FileText, TrendingUp, ChevronRight, Mail, Phone, Building, Briefcase, UserCheck, X, Edit, AlertTriangle, Plus as PlusIcon, Clock } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { format } from 'date-fns'

export default function EmployeesPage() {
  const [searchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState(statusParam || 'all')
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(false)

  // Fetch real employees from backend
  const loadEmployees = async () => {
    setEmployeesLoading(true)
    try {
      let apiUrl = '/users'
      
      // Apply status filter if coming from dashboard
      if (statusParam && statusParam !== 'all') {
        if (statusParam === 'present') {
          apiUrl = '/users?attendance=PRESENT'
        } else if (statusParam === 'absent') {
          apiUrl = '/users?attendance=ABSENT'
        } else if (statusParam === 'late') {
          apiUrl = '/users?isLate=true'
        }
      }
      
      // Update the status filter to match the URL parameter
      setStatusFilter(statusParam)
      setDepartmentFilter('all') // Reset department filter when coming from dashboard
      
      const response = await api.get(apiUrl)
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

  // Handle status parameter changes from dashboard navigation
  useEffect(() => {
    if (statusParam && statusParam !== statusFilter) {
      setStatusFilter(statusParam)
      setDepartmentFilter('all') // Reset department filter when coming from dashboard
      loadEmployees() // Reload employees with new filter
    }
  }, [statusParam])

  const departments = ['all', 'Engineering', 'Marketing', 'Sales', 'HR']
  const statuses = ['all', 'active', 'resigned', 'terminated']
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const currentUser = useAuthStore((state: any) => state.user)

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-gray-400">Manage your workforce efficiently</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employees..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {employeesLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                  <p className="text-gray-500 mt-2">Loading employees...</p>
                </td>
              </tr>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-gray-300 font-medium text-sm">{emp.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">{emp.name}</div>
                        <div className="text-xs text-gray-400">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{emp.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{emp.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      emp.status === 'active' ? 'bg-green-100 text-green-800' :
                      emp.status === 'resigned' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <p className="text-gray-500">No employees found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Employee Details</h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-lg">{selectedEmployee.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedEmployee.name}</h4>
                  <p className="text-gray-600">{selectedEmployee.email}</p>
                  <p className="text-sm text-gray-500">{selectedEmployee.department}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedEmployee.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Employment Details</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Department:</span>
                    <span className="text-sm text-gray-900">{selectedEmployee.department}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedEmployee.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedEmployee.status === 'resigned' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEmployee.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Join Date:</span>
                    <span className="text-sm text-gray-900">{format(new Date(selectedEmployee.joinDate), 'PPP')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
