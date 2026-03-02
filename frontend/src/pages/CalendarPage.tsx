import { useState, useEffect } from 'react'
import { Calendar, Plus, Clock, Users, AlertCircle, ChevronLeft, ChevronRight, Edit, Trash2, Bell } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

// Demo data fallback
const DEMO_CALENDAR_EVENTS = [
  {
    id: '1',
    title: 'Team Meeting - Project Kickoff',
    description: 'Initial project kickoff meeting with all stakeholders',
    startTime: '2024-02-28T10:00:00Z',
    endTime: '2024-02-28T11:00:00Z',
    reminderAt: '2024-02-28T09:30:00Z',
    userId: '1',
    linkedTaskId: '1',
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-02-20T09:00:00Z'
  },
  {
    'id': '2',
    title: 'Design Review Session',
    description: 'Review and approve landing page design mockups',
    startTime: '2024-02-28T14:00:00Z',
    endTime: '2024-02-28T15:30:00Z',
    reminderAt: '2024-02-28T13:30:00Z',
    userId: '2',
    linkedTaskId: '1',
    createdAt: '2024-02-21T10:00:00Z',
    updatedAt: '2024-02-21T10:00:00Z'
  },
  {
    id: '3',
    title: 'Sprint Planning',
    description: 'Q1 sprint planning and task allocation',
    startTime: '2024-02-29T09:00:00Z',
    endTime: '2024-02-29T10:30:00Z',
    reminderAt: '2024-02-28T17:00:00Z',
    userId: '1',
    linkedTaskId: '2',
    createdAt: '2024-02-22T14:00:00Z',
    updatedAt: '2024-02-22T14:00:00Z'
  },
  {
    id: '4',
    title: 'Client Presentation',
    description: 'Present project progress to client',
    startTime: '2024-03-01T15:00:00Z',
    endTime: '2024-03-01T16:30:00Z',
    reminderAt: '2024-03-01T14:00:00Z',
    userId: '4',
    linkedIssueId: '1',
    createdAt: '2024-02-23T11:00:00Z',
    updatedAt: '202-02-23T11:00:00Z'
  }
]

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  reminderAt?: string
  userId: string
  linkedTaskId?: string
  linkedIssueId?: string
  createdAt: string
  updatedAt: string
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  dueDate?: string
}

interface Issue {
  id: string
  title: string
  priority: string
  status: string
}

export default function CalendarPage() {
  const { user } = useAuthStore()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    loadCalendarData()
  }, [])

  const loadCalendarData = async () => {
    try {
      setLoading(true)
      
      // Load events, tasks, and issues in parallel
      const [eventsResponse, tasksResponse, issuesResponse] = await Promise.all([
        api.get('/calendar/events'),
        api.get('/calendar/tasks'),
        api.get('/calendar/issues')
      ])
      
      setEvents(eventsResponse.data || DEMO_CALENDAR_EVENTS)
      setTasks(tasksResponse.data || [])
      setIssues(issuesResponse.data || [])
    } catch (error) {
      console.error('Failed to load calendar data:', error)
      // Fallback to demo data
      setEvents(DEMO_CALENDAR_EVENTS)
      setTasks([])
      setIssues([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getEventColor = (event: CalendarEvent) => {
    if (event.linkedTaskId) return 'bg-green-500'
    if (event.linkedIssueId) return 'bg-red-500'
    return 'bg-blue-500'
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
    setSelectedEvent(null)
    setShowEventModal(true)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setSelectedDate(new Date(event.startTime))
    setShowEventModal(true)
  }

  const createEvent = async (eventData: any) => {
    try {
      const response = await api.post('/calendar/events', eventData)
      setEvents([...events, response.data])
      setShowEventModal(false)
      setSelectedDate(null)
      setSelectedEvent(null)
    } catch (error: any) {
      console.error('Failed to create event:', error)
      alert('Failed to create event: ' + (error.response?.data?.error || error.message))
    }
  }

  const updateEvent = async (eventId: string, eventData: any) => {
    try {
      const response = await api.put(`/calendar/events/${eventId}`, eventData)
      setEvents(events.map(event => event.id === eventId ? response.data : event))
      setShowEventModal(false)
      setSelectedDate(null)
      setSelectedEvent(null)
    } catch (error: any) {
      console.error('Failed to update event:', error)
      alert('Failed to update event: ' + (error.response?.data?.error || error.message))
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      await api.delete(`/calendar/events/${eventId}`)
      setEvents(events.filter(event => event.id !== eventId))
      setShowEventModal(false)
      setSelectedDate(null)
      setSelectedEvent(null)
    } catch (error: any) {
      console.error('Failed to delete event:', error)
      alert('Failed to delete event: ' + (error.response?.data?.error || error.message))
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }

  const getEventsForDay = (day: number) => {
    if (!day) return []
    const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 23, 59, 59)
    
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate >= dayStart && eventDate <= dayEnd
    })
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#09090B] border border-white/10 rounded-xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading calendar...</p>
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
            <Calendar className="w-6 h-6 text-brand-teal" />
            <h1 className="font-rubik font-bold text-white text-2xl">Personal Calendar</h1>
          </div>
          <button
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-2 bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-brand-teal/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <h2 className="text-white text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-zinc-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderCalendar().map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : []
            const isToday = day === new Date().getDate() && 
                           currentDate.getMonth() === new Date().getMonth() &&
                           currentDate.getFullYear() === new Date().getFullYear()
            
            return (
              <div
                key={index}
                onClick={() => day && handleDateClick(day)}
                className={`
                  min-h-[80px] p-2 border border-white/10 rounded-lg
                  ${day ? 'hover:bg-white/5 cursor-pointer' : ''}
                  ${isToday ? 'bg-brand-teal/20 border-brand-teal' : ''}
                `}
              >
                {day && (
                  <>
                    <div className="text-sm text-zinc-300 mb-1">{day}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={event.id}
                          onClick={(e) => handleEventClick(event, e)}
                          className={`text-xs px-1 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-80 ${getEventColor(event)}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-zinc-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-brand-teal" />
              <span className="text-sm font-medium text-white">Events</span>
            </div>
            <p className="text-2xl font-bold text-white">{events.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Tasks</span>
            </div>
            <p className="text-2xl font-bold text-white">{tasks.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-white">Issues</span>
            </div>
            <p className="text-2xl font-bold text-white">{issues.length}</p>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#09090B] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedEvent ? 'Edit Event' : (selectedDate ? `Add Event for ${selectedDate.toLocaleDateString()}` : 'Add Event')}
            </h3>
            <EventForm
              selectedDate={selectedDate}
              selectedEvent={selectedEvent}
              tasks={tasks}
              issues={issues}
              onSubmit={selectedEvent ? (data: any) => updateEvent(selectedEvent.id, data) : createEvent}
              onDelete={selectedEvent ? () => deleteEvent(selectedEvent.id) : null}
              onCancel={() => {
                setShowEventModal(false)
                setSelectedDate(null)
                setSelectedEvent(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function EventForm({ selectedDate, selectedEvent, tasks, issues, onSubmit, onDelete, onCancel }: any) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reminderMinutes, setReminderMinutes] = useState('')

  // Initialize form with selected event data when editing
  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title)
      setDescription(selectedEvent.description || '')
      const startDate = new Date(selectedEvent.startTime)
      setStartTime(`${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`)
      if (selectedEvent.endTime) {
        const endDate = new Date(selectedEvent.endTime)
        setEndTime(`${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`)
      } else {
        setEndTime('')
      }
      // Calculate reminder minutes from reminderAt
      if (selectedEvent.reminderAt) {
        const reminderTime = new Date(selectedEvent.reminderAt)
        const eventTime = new Date(selectedEvent.startTime)
        const minutes = Math.round((eventTime.getTime() - reminderTime.getTime()) / (60 * 1000))
        setReminderMinutes(minutes.toString())
      } else {
        setReminderMinutes('')
      }
    } else {
      // Reset form for new event
      setTitle('')
      setDescription('')
      setStartTime('')
      setEndTime('')
      setReminderMinutes('')
    }
  }, [selectedEvent])

  const handleSubmit = (e: any) => {
    e.preventDefault()
    
    const startHour = parseInt(String(startTime.split(':')[0] || 12))
    const startMinute = parseInt(String(startTime.split(':')[1] || 0))
    const endHour = endTime ? parseInt(String(endTime.split(':')[0] || 12)) : null
    const endMinute = endTime ? parseInt(String(endTime.split(':')[1] || 0)) : null
    
    // For editing, use the selectedEvent's date, for new events use selectedDate
    const baseDate = selectedEvent ? new Date(selectedEvent.startTime) : selectedDate!
    
    // Create ISO date strings
    const startDateTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), startHour, startMinute)
    const endDateTime = endTime && endHour !== null && endMinute !== null 
      ? new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), endHour, endMinute)
      : null
    
    // Calculate reminderAt from reminderMinutes
    let reminderAt = null
    if (reminderMinutes) {
      const minutes = parseInt(reminderMinutes)
      reminderAt = new Date(startDateTime.getTime() - (minutes * 60 * 1000))
    }
    
    const eventData = {
      title,
      description,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime ? endDateTime.toISOString() : null,
      reminderAt: reminderAt ? reminderAt.toISOString() : null,
      linkedTaskId: null,
      linkedIssueId: null
    }
    
    onSubmit(eventData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Reminder (minutes before event)
          </div>
        </label>
        <select
          value={reminderMinutes}
          onChange={(e) => setReminderMinutes(e.target.value)}
          className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-teal"
        >
          <option value="">No reminder</option>
          <option value="5">5 minutes before</option>
          <option value="10">10 minutes before</option>
          <option value="15">15 minutes before</option>
          <option value="30">30 minutes before</option>
          <option value="60">1 hour before</option>
          <option value="120">2 hours before</option>
          <option value="1440">1 day before</option>
        </select>
      </div>
      
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-brand-teal/90 transition-colors"
        >
          {selectedEvent ? 'Update Event' : 'Create Event'}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this event?')) {
                onDelete()
              }
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
