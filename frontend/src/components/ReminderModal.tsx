import { useState, useEffect } from 'react'
import { Calendar, X, CheckSquare } from 'lucide-react'

interface ReminderModalProps {
  projectName: string
  dueDate: string
  onMarkDone: () => void
  onCancel: () => void
}

export default function ReminderModal({ projectName, dueDate, onMarkDone, onCancel }: ReminderModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Auto-trigger for demo: Show reminder if due date is today
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    
    // Check if due date is today (within 24 hours for demo)
    const isDueToday = Math.abs(today.getTime() - due.getTime()) < 24 * 60 * 60 * 1000
    
    if (isDueToday && !isVisible) {
      setIsVisible(true)
    }
  }, [projectName, dueDate])

  const handleMarkDone = () => {
    console.log(`✅ Project "${projectName}" marked as done via reminder`)
    setIsVisible(false)
    onMarkDone()
  }

  const handleCancel = () => {
    console.log(`❌ Project "${projectName}" reminder dismissed`)
    setIsVisible(false)
    onCancel()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if ((e.target as Element) === e.currentTarget) {
      setIsVisible(false)
      onCancel()
    }
  }

  const handleEscKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false)
      onCancel()
    }
  }

  useEffect(() => {
    if (isVisible) {
      const handleMouseDown = (e: MouseEvent) => {
        if ((e.target as Element) === e.currentTarget) {
          setIsVisible(false)
          onCancel()
        }
      }
      
      document.addEventListener('mousedown', handleMouseDown)
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      if (isVisible) {
        const handleMouseDown = (e: MouseEvent) => {
          if ((e.target as Element) === e.currentTarget) {
            setIsVisible(false)
            onCancel()
          }
        }
        document.removeEventListener('mousedown', handleMouseDown)
        document.removeEventListener('keydown', handleEscKey)
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#09090B] border border-brand-teal/30 rounded-2xl w-full max-w-md mx-auto shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-teal/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-brand-teal" />
            </div>
            <div>
              <h3 className="font-rubik font-bold text-white text-lg">Project Reminder</h3>
              <p className="text-zinc-400 text-sm mt-1">Don't forget your deadline!</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-mint/20 flex items-center justify-center">
              <CheckSquare className="w-8 h-8 text-brand-mint" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xl mb-2">{projectName}</h4>
              <div className="flex items-center gap-2 text-zinc-300">
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] rounded-lg p-4 mb-6">
            <p className="text-zinc-700 text-sm leading-relaxed">
              This project is scheduled for today and needs your attention. Make sure to complete all required tasks before the deadline.
            </p>
          </div>

          {/* Message */}
          <div className="bg-white/[0.02] rounded-lg p-4">
            <textarea
              readOnly
              className="w-full p-3 bg-transparent text-zinc-600 text-sm border border-white/10 rounded-lg resize-none"
              rows={3}
              defaultValue="This project is scheduled for today. Don't forget your deadline!"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-white/10 text-zinc-700 font-medium rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMarkDone}
            className="flex-1 px-4 py-3 bg-brand-teal text-black font-medium rounded-lg hover:bg-brand-mint transition-colors shadow-lg"
          >
            <CheckSquare className="w-4 h-4" />
            Mark as Done
          </button>
        </div>
      </div>
    </div>
  )
}
