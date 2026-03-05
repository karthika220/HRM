import React, { useState, useEffect, useRef } from 'react'
import { Play, Square, Clock } from 'lucide-react'
import api from '../utils/api'

interface TaskTimerProps {
  taskId: string
  taskTitle?: string
  className?: string
}

interface TimerStatus {
  isActive: boolean
  timer?: {
    id: string
    startTime: string
    duration?: number
  }
  startTime?: string | null
}

export default function TaskTimer({ taskId, taskTitle, className = '' }: TaskTimerProps) {
  const [timerStatus, setTimerStatus] = useState<TimerStatus>({ isActive: false })
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch timer status on component mount
  useEffect(() => {
    fetchTimerStatus()
  }, [taskId])

  // Start live counter when timer is active
  useEffect(() => {
    if (timerStatus.isActive && timerStatus.startTime) {
      const startTime = new Date(timerStatus.startTime).getTime()
      
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Start new interval
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000)
        setElapsedSeconds(elapsed)
      }, 1000)

      // Cleanup on unmount
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    } else {
      // Clear interval when timer is not active
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setElapsedSeconds(0)
    }
  }, [timerStatus.isActive, timerStatus.startTime])

  const fetchTimerStatus = async () => {
    try {
      const response = await api.get(`/task-time/status/${taskId}`)
      setTimerStatus(response.data.data)
      
      // Set initial elapsed time if timer is active
      if (response.data.data.isActive && response.data.data.startTime) {
        const startTime = new Date(response.data.data.startTime).getTime()
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setElapsedSeconds(elapsed)
      }
    } catch (error: any) {
      console.error('Error fetching timer status:', error)
      // Don't set error for initial fetch, just log it
    }
  }

  const startTimer = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post(`/task-time/start/${taskId}`)
      if (response.data.success) {
        setTimerStatus({ 
          isActive: true, 
          timer: response.data.data,
          startTime: response.data.data.startTime 
        })
      }
    } catch (error: any) {
      console.error('Error starting timer:', error)
      setError(error.response?.data?.message || 'Failed to start timer')
    } finally {
      setLoading(false)
    }
  }

  const stopTimer = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post(`/task-time/stop/${taskId}`)
      if (response.data.success) {
        setTimerStatus({ 
          isActive: false, 
          timer: response.data.data,
          startTime: null 
        })
        setElapsedSeconds(0)
      }
    } catch (error: any) {
      console.error('Error stopping timer:', error)
      setError(error.response?.data?.message || 'Failed to stop timer')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleToggle = () => {
    if (timerStatus.isActive) {
      stopTimer()
    } else {
      startTimer()
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
          loading 
            ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
            : timerStatus.isActive 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              : 'bg-brand-teal/20 text-brand-teal hover:bg-brand-teal/30 border border-brand-teal/30'
        }`}
        title={taskTitle ? `Timer for ${taskTitle}` : 'Task Timer'}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{timerStatus.isActive ? 'Stopping...' : 'Starting...'}</span>
          </>
        ) : timerStatus.isActive ? (
          <>
            <Square className="w-4 h-4" />
            <span>Stop</span>
            <span className="text-xs ml-1 font-mono">{formatTime(elapsedSeconds)}</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>Start</span>
          </>
        )}
      </button>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
          {error}
        </div>
      )}

      {timerStatus.isActive && (
        <div className="flex items-center gap-1 text-xs text-brand-teal bg-brand-teal/10 px-2 py-1 rounded">
          <Clock className="w-3 h-3" />
          <span className="font-mono">{formatTime(elapsedSeconds)}</span>
        </div>
      )}
    </div>
  )
}
