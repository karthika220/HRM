import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Clock, 
  User, 
  Eye, 
  Calendar,
  ChevronRight,
  X,
  UserCircle,
  Activity,
  Timer,
  LogIn,
  LogOut,
  AlertCircle
} from 'lucide-react'

interface AttendanceLog {
  id: string
  type: 'IN' | 'OUT'
  time: string
}

interface AttendanceStatus {
  currentStatus: string
  canCheckIn: boolean
  canCheckOut: boolean
  isLate: boolean
  summary: {
    totalWorkMinutes: number
    lunchDurationMinutes: number
    status: string
  }
  todayLogs: AttendanceLog[]
}

interface AttendanceRecord {
  id: string
  employee: {
    id: string
    name: string
    avatar?: string
  }
  department: string
  totalWorkMinutes: number
  lunchDurationMinutes: number
  status: string
  logs: AttendanceLog[]
}

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentEmployeeId] = useState('1') // Mock current employee

  useEffect(() => {
    fetchAttendanceData()
    fetchAttendanceStatus()
    
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    
    return () => clearInterval(timer)
  }, [])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      // Mock data for now - will be replaced with API calls
      const mockRecords: AttendanceRecord[] = [
        {
          id: '1',
          employee: {
            id: '1',
            name: 'Sarah Johnson',
            avatar: 'SJ'
          },
          department: 'Engineering',
          totalWorkMinutes: 517,
          lunchDurationMinutes: 56,
          status: 'Present',
          logs: [
            { id: '1', type: 'IN', time: '2024-02-28T09:02:00Z' },
            { id: '2', type: 'OUT', time: '2024-02-28T13:32:00Z' },
            { id: '3', type: 'IN', time: '2024-02-28T14:28:00Z' },
            { id: '4', type: 'OUT', time: '2024-02-28T18:55:00Z' }
          ]
        },
        {
          id: '2',
          employee: {
            id: '2',
            name: 'Michael Chen',
            avatar: 'MC'
          },
          department: 'Engineering',
          totalWorkMinutes: 480,
          lunchDurationMinutes: 60,
          status: 'Present',
          logs: [
            { id: '5', type: 'IN', time: '2024-02-28T09:00:00Z' },
            { id: '6', type: 'OUT', time: '2024-02-28T13:00:00Z' },
            { id: '7', type: 'IN', time: '2024-02-28T14:00:00Z' },
            { id: '8', type: 'OUT', time: '2024-02-28T18:00:00Z' }
          ]
        },
        {
          id: '3',
          employee: {
            id: '3',
            name: 'Emma Davis',
            avatar: 'ED'
          },
          department: 'Marketing',
          totalWorkMinutes: 0,
          lunchDurationMinutes: 0,
          status: 'Absent',
          logs: []
        }
      ]
      setAttendanceRecords(mockRecords)
    } catch (error) {
      console.error('Error fetching attendance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch(`/api/attendance/status/${currentEmployeeId}`)
      const data = await response.json()
      setAttendanceStatus(data)
    } catch (error) {
      console.error('Error fetching attendance status:', error)
      
      // Fallback to mock status
      const mockStatus: AttendanceStatus = {
        currentStatus: 'Not Checked In',
        canCheckIn: true,
        canCheckOut: false,
        isLate: false,
        summary: {
          totalWorkMinutes: 0,
          lunchDurationMinutes: 0,
          status: 'Not Checked In'
        },
        todayLogs: []
      }
      setAttendanceStatus(mockStatus)
    }
  }

  const handleCheckIn = async () => {
    try {
      const response = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: currentEmployeeId })
      })
      const data = await response.json()
      
      if (data.success) {
        await fetchAttendanceStatus()
        await fetchAttendanceData()
      }
    } catch (error) {
      console.error('Error checking in:', error)
    }
  }

  const handleCheckOut = async () => {
    try {
      const response = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: currentEmployeeId })
      })
      const data = await response.json()
      
      if (data.success) {
        await fetchAttendanceStatus()
        await fetchAttendanceData()
      }
    } catch (error) {
      console.error('Error checking out:', error)
    }
  }

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getCurrentTimePosition = () => {
    const startTime = 9 * 60 // 09:00 = 540 minutes
    const workEnd = 18.75 * 60 // 18:45 = 1125 minutes
    const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    
    const totalWorkMinutes = workEnd - startTime
    const elapsedMinutes = currentTimeMinutes - startTime
    
    const clampedMinutes = Math.max(0, Math.min(elapsedMinutes, totalWorkMinutes))
    const widthPercent = (clampedMinutes / totalWorkMinutes) * 100
    
    return `${widthPercent}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-500/20 text-green-400'
      case 'Half Day': return 'bg-yellow-500/20 text-yellow-400'
      case 'Absent': return 'bg-red-500/20 text-red-400'
      case 'Overtime': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-zinc-500/20 text-zinc-400'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Half Day': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Absent': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'Overtime': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rubik font-bold text-2xl text-white">Attendance Management</h1>
          <p className="text-zinc-400 mt-1">Track employee check-in and check-out times</p>
        </div>
      </div>

      {/* Check-In/Check-Out Section */}
      {attendanceStatus && (
        <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-rubik font-semibold text-lg text-white mb-2">Quick Attendance</h2>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span>Current Time: {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                <span>•</span>
                <span>Status: {attendanceStatus.currentStatus}</span>
                {attendanceStatus.isLate && (
                  <span className="text-yellow-400">• Late</span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {attendanceStatus.canCheckIn && (
                <button
                  onClick={handleCheckIn}
                  className="px-6 py-3 bg-[#00FFAA] text-black font-medium rounded-lg hover:bg-[#00CC88] transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Check In
                </button>
              )}
              {attendanceStatus.canCheckOut && (
                <button
                  onClick={handleCheckOut}
                  className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Check Out
                </button>
              )}
            </div>
          </div>

          {/* Today's Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#18181B] rounded-lg p-4">
              <div className="text-sm text-zinc-400 mb-1">Total Work Time</div>
              <div className="text-xl font-bold text-white">
                {formatMinutes(attendanceStatus.summary.totalWorkMinutes)}
              </div>
            </div>
            <div className="bg-[#18181B] rounded-lg p-4">
              <div className="text-sm text-zinc-400 mb-1">Lunch Duration</div>
              <div className="text-xl font-bold text-white">
                {formatMinutes(attendanceStatus.summary.lunchDurationMinutes)}
              </div>
            </div>
            <div className="bg-[#18181B] rounded-lg p-4">
              <div className="text-sm text-zinc-400 mb-1">Status</div>
              <div className={`text-xl font-bold ${getStatusColor(attendanceStatus.summary.status)}`}>
                {attendanceStatus.summary.status}
              </div>
            </div>
            <div className="bg-[#18181B] rounded-lg p-4">
              <div className="text-sm text-zinc-400 mb-1">Today's Logs</div>
              <div className="text-xl font-bold text-white">
                {attendanceStatus.todayLogs.length}
              </div>
            </div>
          </div>

          {/* Today's Logs */}
          {attendanceStatus.todayLogs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-white mb-3">Today's Attendance Logs</h3>
              <div className="space-y-2">
                {attendanceStatus.todayLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-[#18181B] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        log.type === 'IN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {log.type === 'IN' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                      </div>
                      <span className="text-white font-medium">{log.type}</span>
                    </div>
                    <span className="text-zinc-400">{formatTime(log.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance Tracking Timeline */}
      <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-6">
        <div className="mb-6">
          <h2 className="font-rubik font-semibold text-lg text-white mb-2">Today's Attendance Tracking</h2>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>Current Time: {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Current Time Indicator */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00FFAA] rounded-full animate-pulse"></div>
            <span className="text-sm text-[#00FFAA] font-medium">Current Time: {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="relative mb-6">
          <div className="h-4 bg-zinc-800 rounded-full overflow-hidden flex">
            {/* Working (9:00-1:30) */}
            <div className="bg-blue-500 flex items-center justify-center" style={{ width: '37.5%' }}>
              <span className="text-xs text-white font-medium">Working</span>
            </div>
            {/* Break (1:30-2:30) */}
            <div className="bg-yellow-500 flex items-center justify-center" style={{ width: '6.25%' }}>
              <span className="text-xs text-black font-medium">Break</span>
            </div>
            {/* Working (2:30-6:45) */}
            <div className="bg-blue-500 flex items-center justify-center" style={{ width: '43.75%' }}>
              <span className="text-xs text-white font-medium">Working</span>
            </div>
            {/* Overtime (6:45+) */}
            <div className="bg-red-500 flex items-center justify-center" style={{ width: '12.5%' }}>
              <span className="text-xs text-white font-medium">Overtime</span>
            </div>
          </div>
          
          {/* Current Time Position Indicator */}
          <div 
            className="absolute top-0 w-0.5 h-4 bg-[#00FFAA] rounded-full shadow-lg shadow-[#00FFAA]/50"
            style={{ left: getCurrentTimePosition() }}
          >
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#00FFAA] rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Time Markers */}
        <div className="flex justify-between text-xs text-zinc-400 mb-6">
          <span>9:00 AM</span>
          <span>1:30 PM</span>
          <span>2:30 PM</span>
          <span>6:45 PM</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-zinc-300">Working</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-zinc-300">Break</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-zinc-300">Overtime</span>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-[#09090B] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="font-rubik font-semibold text-lg text-white">Team Attendance</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Users className="w-4 h-4" />
                <span>{attendanceRecords.length} employees</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-400">
            <div className="animate-spin w-8 h-8 border-2 border-[#00FFAA] border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading attendance records...
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No attendance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#18181B] sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Work Time</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Lunch</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Logs</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-[#18181B] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#00FFAA]/20 text-[#00FFAA] rounded-full flex items-center justify-center text-sm font-medium">
                          {record.employee.avatar}
                        </div>
                        <span className="text-white font-medium">{record.employee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                      {record.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                      {formatMinutes(record.totalWorkMinutes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                      {formatMinutes(record.lunchDurationMinutes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                      {record.logs.length} logs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedRecord(record)
                          setShowDrawer(true)
                        }}
                        className="text-[#00FFAA] hover:text-[#00CC88] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Drawer */}
      {showDrawer && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
          <div className={`ml-auto w-96 h-full bg-[#09090B] border-l border-zinc-800 transform transition-transform duration-300 ${
            showDrawer ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="h-full flex flex flex-col">
              {/* Drawer Header */}
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-rubik font-semibold text-lg text-white">Attendance Details</h3>
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
                    {selectedRecord.employee.avatar}
                  </div>
                  <div>
                    <h4 className="font-rubik font-semibold text-white">{selectedRecord.employee.name}</h4>
                    <p className="text-zinc-400 text-sm">{selectedRecord.department}</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-[#18181B] rounded-lg p-4 space-y-3">
                  <h5 className="font-medium text-white mb-3">Today's Summary</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400 block">Work Time</span>
                      <span className="text-white font-medium">{formatMinutes(selectedRecord.totalWorkMinutes)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Lunch Duration</span>
                      <span className="text-white font-medium">{formatMinutes(selectedRecord.lunchDurationMinutes)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Status</span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border mt-1 ${getStatusBadgeColor(selectedRecord.status)}`}>
                        {selectedRecord.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Total Logs</span>
                      <span className="text-white font-medium">{selectedRecord.logs.length}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance Logs */}
                <div>
                  <h5 className="font-medium text-white mb-3">Attendance Logs</h5>
                  <div className="space-y-2">
                    {selectedRecord.logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-[#18181B] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            log.type === 'IN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {log.type === 'IN' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                          </div>
                          <span className="text-white font-medium">{log.type}</span>
                        </div>
                        <span className="text-zinc-400">{formatTime(log.time)}</span>
                      </div>
                    ))}
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
