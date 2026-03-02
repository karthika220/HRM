import { create } from 'zustand'

interface TimerState {
  isRunning: boolean
  startTime: number | null
  elapsedSeconds: number
  runningTaskId: string | null
}

interface TimerActions {
  startTimer: (taskId?: string) => void
  stopTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  tick: () => void
}

export const useTimerStore = create<TimerState & TimerActions>((set, get) => {
  let interval: number | null = null

  // Load timer state from localStorage on init
  const savedState = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('timerState') || '{}') : {}

  return {
    isRunning: savedState.isRunning || false,
    startTime: savedState.startTime || null,
    elapsedSeconds: savedState.elapsedSeconds || 0,
    runningTaskId: savedState.runningTaskId || null,

    startTimer: (taskId?: string) => {
      const now = Date.now()
      set({
        isRunning: true,
        startTime: now,
        elapsedSeconds: 0,
        runningTaskId: taskId || null
      })

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('timerState', JSON.stringify({
          isRunning: true,
          startTime: now,
          elapsedSeconds: 0,
          runningTaskId: taskId || null
        }))
      }

      // Start interval
      if (interval) clearInterval(interval)
      interval = setInterval(() => {
        set((state) => {
          const newElapsed = state.elapsedSeconds + 1
          const newState = { ...state, elapsedSeconds: newElapsed }
          
          // Update localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('timerState', JSON.stringify(newState))
          }
          
          return newState
        })
      }, 1000)
    },

    stopTimer: () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      
      const currentState = get()
      set({
        ...currentState,
        isRunning: false
      })

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('timerState', JSON.stringify({
          ...currentState,
          isRunning: false
        }))
      }
    },

    resumeTimer: () => {
      const { isRunning, startTime, elapsedSeconds } = get()
      
      if (!isRunning && startTime) {
        set({ isRunning: true })
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('timerState', JSON.stringify({
            isRunning: true,
            startTime,
            elapsedSeconds,
            runningTaskId: get().runningTaskId
          }))
        }

        // Restart interval from saved elapsed time
        if (interval) clearInterval(interval)
        interval = setInterval(() => {
          set((state) => {
            const newElapsed = state.elapsedSeconds + 1
            const newState = { ...state, elapsedSeconds: newElapsed }
            
            // Update localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('timerState', JSON.stringify(newState))
            }
            
            return newState
          })
        }, 1000)
      }
    },

    resetTimer: () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      
      set({
        isRunning: false,
        startTime: null,
        elapsedSeconds: 0,
        runningTaskId: null
      })

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('timerState')
      }
    },

    tick: () => {
      set((state) => ({
        ...state,
        elapsedSeconds: state.elapsedSeconds + 1
      }))
    }
  }
})
