import React, { useState, useEffect } from 'react'
import { Users, UserCheck, UserX, Clock, Calendar, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'

interface Holiday {
  id: string
  name: string
  date: string
  type: 'Public Holiday' | 'Optional Holiday'
}

export default function PeopleDashboardPage() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loadingHolidays, setLoadingHolidays] = useState(false)

  // Navigation handlers
  const handleCardClick = (filterType: string) => {
    const baseUrl = '/people/employees'
    const url = filterType ? `${baseUrl}?status=${filterType}` : baseUrl
    navigate(url)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    
    // Fetch holidays
    const fetchHolidays = async () => {
      try {
        setLoadingHolidays(true)
        const response = await api.get('/holidays/upcoming')
        setHolidays(response.data.data || [])
      } catch (error) {
        console.error('Failed to fetch holidays:', error)
        setHolidays([])
      } finally {
        setLoadingHolidays(false)
      }
    }

    fetchHolidays()

    return () => clearInterval(timer)
  }, [])

  const currentDate = currentTime.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })

  const currentTimeString = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })

  const getCurrentTimePosition = () => {
    const startTime = 9 * 60 // 09:00 = 540 minutes
    const workEnd = 18.75 * 60 // 18:45 = 1125 minutes
    const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    
    const totalWorkMinutes = workEnd - startTime
    const elapsedMinutes = currentTimeMinutes - startTime
    
    // Clamp values
    const clampedMinutes = Math.max(0, Math.min(elapsedMinutes, totalWorkMinutes))
    
    return `${clampedMinutes}%`
  }

  const getTimelineSegments = () => {
    const startMinutes = 9 * 60 // 09:00
    const lunchStartMinutes = 13.5 * 60 // 13:30
    const lunchEndMinutes = 14.5 * 60 // 14:30
    const workEndMinutes = 18.75 * 60 // 18:45
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    
    const segments: Array<{type: string, width: string, label: string}> = []
    
    if (currentMinutes < startMinutes) {
      // Before work hours - no segments
      return segments
    }
    
    if (currentMinutes <= lunchStartMinutes) {
      // Only show working segment up to current time
      const segmentDuration = currentMinutes - startMinutes
      const totalDuration = currentMinutes - startMinutes
      const width = totalDuration > 0 ? (segmentDuration / totalDuration) * 100 : 0
      
      segments.push({
        type: 'working',
        width: `${Math.max(0, Math.min(width, 100))}%`,
        label: 'Working'
      })
    } else if (currentMinutes <= lunchEndMinutes) {
      // Show working (start → lunchStart) and lunch (lunchStart → currentTime)
      const workDuration = lunchStartMinutes - startMinutes
      const lunchDuration = currentMinutes - lunchStartMinutes
      const totalDuration = currentMinutes - startMinutes
      
      segments.push({
        type: 'working',
        width: `${(workDuration / totalDuration) * 100}%`,
        label: 'Working'
      })
      
      segments.push({
        type: 'lunch',
        width: `${(lunchDuration / totalDuration) * 100}%`,
        label: 'Lunch'
      })
    } else if (currentMinutes <= workEndMinutes) {
      // Show working (start → lunchStart), lunch (lunchStart → lunchEnd), and working (lunchEnd → currentTime)
      const work1Duration = lunchStartMinutes - startMinutes
      const lunchDuration = lunchEndMinutes - lunchStartMinutes
      const work2Duration = currentMinutes - lunchEndMinutes
      const totalDuration = currentMinutes - startMinutes
      
      segments.push({
        type: 'working',
        width: `${(work1Duration / totalDuration) * 100}%`,
        label: 'Working'
      })
      
      segments.push({
        type: 'lunch',
        width: `${(lunchDuration / totalDuration) * 100}%`,
        label: 'Lunch'
      })
    } else {
      // Show full work day plus overtime
      const work1Duration = lunchStartMinutes - startMinutes
      const lunchDuration = lunchEndMinutes - lunchStartMinutes
      const work2Duration = workEndMinutes - lunchEndMinutes
      const overtimeDuration = currentMinutes - workEndMinutes
      const totalDuration = currentMinutes - startMinutes
      
      segments.push({
        type: 'working',
        width: `${(work1Duration / totalDuration) * 100}%`,
        label: 'Working'
      })
      
      segments.push({
        type: 'lunch',
        width: `${(lunchDuration / totalDuration) * 100}%`,
        label: 'Lunch'
      })
      
      if (overtimeDuration > 0) {
        segments.push({
          type: 'overtime',
          width: `${(overtimeDuration / totalDuration) * 100}%`,
          label: 'Overtime'
        })
      }
    }
    
    return segments
  }

  const isLunchTime = () => {
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    const lunchStart = 13.5 * 60 // 1:30 PM
    const lunchEnd = 14.5 * 60 // 2:30 PM
    return currentMinutes >= lunchStart && currentMinutes <= lunchEnd
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rubik font-bold text-2xl text-white">PeopleHub</h1>
          <p className="text-zinc-500 text-sm">HR Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-zinc-400 text-sm">{currentDate}</div>
          <button className="bg-brand-teal hover:bg-brand-teal/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Check In
          </button>
          <div className="w-10 h-10 bg-brand-mint/20 rounded-full flex items-center justify-center">
            <span className="text-brand-mint font-medium text-sm">SJ</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Employees', value: '248', subtext: '+3 this month', icon: Users, color: 'text-brand-teal', bg: 'bg-brand-teal/10', filter: '' },
          { title: 'Present Today', value: '221', subtext: '89% attendance', icon: UserCheck, color: 'text-brand-mint', bg: 'bg-brand-mint/10', filter: 'present' },
          { title: 'Absent Today', value: '18', subtext: '7.2% of total', icon: UserX, color: 'text-red-400', bg: 'bg-red-500/10', filter: 'absent' },
          { title: 'Late Arrivals', value: '9', subtext: '3.6% of total', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', filter: 'late' }
        ].map(({ title, value, subtext, icon: Icon, color, bg, filter }) => (
          <div 
            key={title} 
            className="bg-[#09090B] border border-white/10 rounded-2xl p-5 hover:border-violet-500/40 transition-all duration-200 cursor-pointer"
            onClick={() => handleCardClick(filter)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <div className={`font-mono font-bold text-3xl ${color}`}>{value}</div>
            <div className="text-zinc-500 text-sm mt-1">{title}</div>
            <div className={`text-xs ${color} mt-2`}>{subtext}</div>
          </div>
        ))}
      </div>

      {/* Today's Attendance Tracking Card */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="font-rubik font-semibold text-lg text-white mb-2">Today's Attendance Tracking</h2>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>Current Time: {currentTimeString}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Current Time Indicator */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00FFAA] rounded-full animate-pulse"></div>
            <span className="text-sm text-[#00FFAA] font-medium">Current Time: {currentTimeString}</span>
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

      {/* Upcoming Holidays Section */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-rubik font-semibold text-white">Upcoming Holidays</h2>
          <div className="text-brand-teal hover:text-brand-teal/80 text-sm flex items-center gap-1 transition-colors">
            View all
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        {loadingHolidays ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white/[0.02] border border-zinc-800 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-zinc-400 mb-4" />
            <p className="text-zinc-500 text-sm mt-2">No upcoming holidays</p>
            <p className="text-zinc-500 text-xs">You're all set for now 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {holidays.slice(0, 5).map((holiday, index) => {
              const isToday = new Date(holiday.date).toDateString() === currentDate
              const daysRemaining = Math.max(0, Math.ceil((new Date(holiday.date).getTime() - new Date().getTime()) / (1000 * 60 * 24)))
              
              return (
                <div key={index} className="bg-white/[0.02] border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                          holiday.type === 'Public Holiday' ? 'bg-green-100' : 'bg-violet-100'
                        }`}>
                          <Calendar className={`w-4 h-4 ${
                            holiday.type === 'Public Holiday' ? 'text-green-600' : 'text-violet-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{holiday.name}</div>
                          <div className="text-sm text-zinc-500">{holiday.date}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-500 mb-1">
                        {isToday ? 'Today' : `${daysRemaining} days remaining`}
                      </div>
                      {holiday.type && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          holiday.type === 'Public Holiday' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-violet-100 text-violet-700 border-violet-200'
                        }`}>
                          {holiday.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {holidays.length > 5 && (
              <div className="text-center mt-4">
                <button className="text-brand-teal hover:text-brand-teal/80 text-sm flex items-center gap-1 transition-colors">
                  View all holidays
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-rubik font-semibold text-white">Recent Activity</h2>
          <a href="#" className="text-brand-teal hover:text-brand-teal/80 text-sm flex items-center gap-1 transition-colors">
            View all
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        
        <div className="space-y-3">
          {[
            { name: 'Sarah Johnson', action: 'Checked in', time: '9:02 AM', initials: 'SJ' },
            { name: 'Mike Chen', action: 'Started lunch', time: '1:05 PM', initials: 'MC' }
          ].map((activity, index) => (
            <div key={index} className="bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/20 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-brand-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-teal font-bold text-xs">{activity.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 leading-tight">
                    <span className="font-medium text-white">{activity.name}</span>
                    <span className="text-zinc-500"> – {activity.action}</span>
                  </p>
                </div>
                <div className="text-xs text-zinc-500 flex-shrink-0">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
