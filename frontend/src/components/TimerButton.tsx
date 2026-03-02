import { useTimerStore } from '../store/timerStore'
import { Play, Square } from 'lucide-react'

export default function TimerButton() {
  const { isRunning, elapsedSeconds, startTimer, stopTimer } = useTimerStore()

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleToggle = () => {
    if (isRunning) {
      stopTimer()
    } else {
      startTimer()
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
        isRunning 
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
          : 'bg-brand-teal/20 text-brand-teal hover:bg-brand-teal/30 border border-brand-teal/30'
      }`}
    >
      {isRunning ? (
        <>
          <Square className="w-4 h-4" />
          <span>Stop Timer</span>
          <span className="text-sm ml-2">{formatTime(elapsedSeconds)}</span>
        </>
      ) : (
        <>
          <Play className="w-4 h-4" />
          <span>Start Timer</span>
        </>
      )}
    </button>
  )
}
