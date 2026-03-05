import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('🔐 Adding Authorization header for:', config.url)
  } else {
    console.log('⚠️ No token found for:', config.url)
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err);
    
    // Only logout on specific authentication failures and only for critical routes
    if (err.response?.status === 401) {
      const errorMessage = err.response?.data?.message || '';
      
      // Only logout for explicit authentication failures on auth endpoints
      const isAuthEndpoint = err.config?.url?.includes('/auth/');
      
      // Only logout for explicit authentication failures on auth endpoints
      const shouldLogout = [
        'Invalid token',
        'Token expired',
        'User not found',
        'User not active'
      ];
      
      // Don't logout for login/signup errors or general issues
      const shouldNotLogout = [
        'No token provided',
        'Invalid credentials',
        'Email already registered',
        'Invalid request',
        'Unauthorized',
        'Access denied',
        'max clients reached',
        'MaxClientsInSessionMode',
        'database'
      ];
      
      // Only logout if it's an auth endpoint failure OR explicit token issue
      if (isAuthEndpoint && shouldLogout.some(msg => errorMessage.includes(msg))) {
        console.log('🔐 Authentication failed on auth endpoint, logging out...');
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else if (shouldNotLogout.some(msg => errorMessage.includes(msg))) {
        console.log('🔐 401 error due to system issues, not logging out:', errorMessage);
        // Don't automatically logout for system/database errors
      } else {
        console.log('🔐 401 error, but not logging out:', errorMessage);
        // Don't automatically logout for other 401 errors
      }
    }
    
    return Promise.reject(err)
  }
)

export default api
