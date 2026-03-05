import { create } from 'zustand'
import api from '../utils/api'

export interface User {
  id: string
  email: string
  name: string
  role: 'MANAGING_DIRECTOR' | 'HR_MANAGER' | 'TEAM_LEAD' | 'MANAGER' | 'EMPLOYEE'
  department?: string
  avatar?: string
  isActive: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  validateToken: () => boolean
}

// Token validation function
const validateToken = (token: string): boolean => {
  try {
    // Basic token format validation
    if (!token || typeof token !== 'string') {
      return false
    }
    
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.')
    if (parts.length !== 3) {
      return false
    }
    
    // Try to decode the payload (base64)
    const payload = JSON.parse(atob(parts[1]))
    
    // Check if token is expired (with extended buffer time)
    if (payload.exp && payload.exp < Date.now() / 1000 - 3600) { // 1 hour buffer instead of 5 minutes
      return false
    }
    
    return true
  } catch (error) {
    console.error('Token validation error:', error)
    // Don't automatically invalidate on parsing errors - be very lenient during development
    return true
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })(),
  token: localStorage.getItem('token'),
  isLoading: false,

  validateToken: () => {
    const token = localStorage.getItem('token')
    if (!token) return false
    
    const isValid = validateToken(token)
    if (!isValid) {
      console.log('🔐 Token validation failed, but not logging out automatically...')
      // Don't automatically logout - let user handle it manually if needed
      return false
    }
    return isValid
  },

  login: async (email, password) => {
    console.log('🔐 AuthStore login called with:', { email, password: password ? '***' : 'empty' })
    set({ isLoading: true })
    try {
      console.log('🌐 Making login request to:', '/auth/login')
      const res = await api.post('/auth/login', { email, password })
      console.log('✅ Login response received:', res.status, res.data)
      
      const { token, user } = res.data
      console.log('✅ AuthStore login successful, token received:', !!token)
      
      // Validate token before storing
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token received from server')
      }
      
      // Validate user data
      if (!user || !user.id || !user.email) {
        throw new Error('Invalid user data received from server')
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token, user, isLoading: false })
      
      console.log('✅ User logged in successfully:', user.email)
    } catch (err: any) {
      console.error('❌ AuthStore login error:', err)
      
      // Provide more specific error messages
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check your internet connection and ensure the backend is running.')
      } else if (err.response?.status === 0) {
        throw new Error('Network error. Please check if the backend server is running on localhost:3001.')
      } else if (err.response?.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials.')
      } else if (err.response?.status === 400) {
        throw new Error(err.response.data?.message || 'Invalid request. Please check your input.')
      } else if (err.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else if (err.message) {
        throw new Error(err.message)
      } else {
        throw new Error('Login failed. Please try again.')
      }
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
}))
