import { useTimerStore } from '../store/timerStore'
import { Clock } from 'lucide-react'
import { useEffect } from 'react'

export default function TimerBadge() {
  const { isRunning, elapsedSeconds, resumeTimer } = useTimerStore()

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Resume timer on component mount if it was running
  useEffect(() => {
    if (isRunning) {
      resumeTimer()
    }
  }, [isRunning, resumeTimer])

  if (!isRunning) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-[#09090B] border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
      <Clock className="w-4 h-4 text-brand-teal" />
      <span className="text-sm font-medium text-brand-teal">
        {formatTime(elapsedSeconds)} Running
      </span>
    </div>
  )
}
