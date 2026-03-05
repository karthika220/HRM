import axios from 'axios'

// Create centralized axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('🔐 Adding Authorization header for:', config.url)
  } else {
    console.log('⚠️ No token found for:', config.url)
  }
  
  return config
}, (error) => {
  console.error('Request interceptor error:', error)
  return Promise.reject(error)
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('❌ API Error:', error)
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    })
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || ''
      
      // Don't automatically logout for all 401 errors
      const shouldLogout = [
        'Invalid token',
        'Token expired',
        'User not found',
        'User not active'
      ]
      
      const shouldNotLogout = [
        'No token provided',
        'Invalid credentials',
        'Email already registered',
        'Invalid request',
        'Unauthorized',
        'Access denied'
      ]
      
      if (shouldLogout.some(msg => errorMessage.includes(msg))) {
        console.log('🔐 Authentication failed, logging out...')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        console.log('🔐 401 error due to system issues, not logging out:', errorMessage)
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('🌐 Network connection refused - backend may be down')
      error.message = 'Unable to connect to server. Please check if the backend is running.'
    }
    
    return Promise.reject(error)
  }
)

export default api
