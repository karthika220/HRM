import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { login, token } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@workforce.io')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) navigate('/dashboard')
  }, [token])

  // Debug: Clear any existing invalid token on mount
  useEffect(() => {
    const currentToken = localStorage.getItem('token')
    if (currentToken) {
      console.log('🔍 Found existing token, checking validity...')
      try {
        // Basic JWT format check
        const parts = currentToken.split('.')
        if (parts.length !== 3) {
          console.log('❌ Invalid token format, clearing...')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.log('❌ Token validation error, clearing...')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔐 Login attempt:', { email, password: password ? '***' : 'empty' })
    
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }
    
    setError('')
    setLoading(true)
    
    try {
      console.log('🌐 Calling login function...')
      await login(email, password)
      console.log('✅ Login successful, navigating to dashboard...')
      navigate('/dashboard')
    } catch (err: any) {
      console.error('❌ Login error:', err)
      let errorMessage = 'Login failed. Please try again.'
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Unable to connect to server. Please check your internet connection and ensure the backend is running.'
      } else if (err.response?.status === 0) {
        errorMessage = 'Network error. Please check if the backend server is running on localhost:3001.'
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.'
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Invalid request. Please check your input.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      console.log('🚨 Error message set:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Gradient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-mint/5 rounded-full blur-3xl" />

      {/* Card */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-[#09090B]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img 
              src="/logo.png" 
              alt="Workforce Logo"
              className="h-16 w-auto mx-auto mb-6 object-contain"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 animate-slide-up">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600
                  focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 transition-all duration-200 outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-zinc-600
                    focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 transition-all duration-200 outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6
                bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl
                hover:opacity-90 transition-all duration-200
                shadow-[0_0_30px_rgba(0,161,199,0.4)] disabled:opacity-50 disabled:cursor-not-allowed
                mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Sign Up Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full flex items-center justify-center gap-2 py-3 px-6
                border border-white/20 text-zinc-300 font-medium rounded-xl
                hover:bg-white/5 transition-all duration-200"
            >
              Sign Up
            </button>
          </div>

          {/* Demo Credentials Hint */}
          <div className="mt-4 text-center">
            <p className="text-zinc-500 text-xs">
              Demo Credentials: admin@workforce.io / password
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.reload()
              }}
              className="mt-2 text-xs text-zinc-400 hover:text-zinc-300 underline"
            >
              Clear Session & Reload
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-brand-teal hover:text-brand-mint transition-colors font-medium"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
