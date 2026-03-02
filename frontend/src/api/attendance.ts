import axios from 'axios'
import api from './axios'

// Create a version without authentication for demo purposes
const publicApi = axios.create({
  baseURL: 'http://localhost:3001/api',
})

export const attendanceService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/attendance/dashboard')
      return response.data
    } catch (error) {
      // Fallback to public API if auth fails
      const response = await publicApi.get('/attendance/dashboard')
      return response.data
    }
  },

  // Get team attendance status
  getTeamStatus: async () => {
    try {
      const response = await api.get('/attendance/team-status')
      return response.data
    } catch (error) {
      // Fallback to public API if auth fails
      const response = await publicApi.get('/attendance/team-status')
      return response.data
    }
  },

  // Get recent activity
  getActivity: async () => {
    try {
      const response = await api.get('/attendance/activity')
      return response.data
    } catch (error) {
      // Fallback to public API if auth fails
      const response = await publicApi.get('/attendance/activity')
      return response.data
    }
  },

  // Get current user's timeline
  getMyTimeline: async () => {
    try {
      const response = await api.get('/attendance/my-timeline')
      return response.data
    } catch (error) {
      // Fallback to public API if auth fails
      const response = await publicApi.get('/attendance/my-timeline')
      return response.data
    }
  }
}
