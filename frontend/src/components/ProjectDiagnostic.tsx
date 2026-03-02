import React, { useEffect, useState } from 'react'
import api from '../api/axios'

interface ProjectDiagnosticProps {
  isVisible: boolean
  onClose: () => void
}

export default function ProjectDiagnostic({ isVisible, onClose }: ProjectDiagnosticProps) {
  const [diagnostic, setDiagnostic] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isVisible) {
      runDiagnostic()
    }
  }, [isVisible])

  const runDiagnostic = async () => {
    setLoading(true)
    try {
      // Check authentication
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      // Test API connection
      let apiStatus = 'Unknown'
      let apiData = null
      let apiError = null
      
      try {
        const response = await api.get('/projects')
        apiStatus = 'Success'
        apiData = response.data
      } catch (error: any) {
        apiStatus = 'Failed'
        apiError = error.response?.status || error.message
      }

      setDiagnostic({
        auth: {
          hasToken: !!token,
          hasUser: !!user,
          userId: user ? JSON.parse(user).id : null,
          userRole: user ? JSON.parse(user).role : null
        },
        api: {
          status: apiStatus,
          error: apiError,
          dataCount: apiData?.length || 0,
          sampleData: apiData?.slice(0, 2) || []
        },
        localStorage: {
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'None',
          userPreview: user ? JSON.parse(user).name : 'None'
        }
      })
    } catch (error) {
      console.error('Diagnostic error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#09090B] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-rubik font-bold text-white">🔍 Projects Diagnostic</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400">
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center text-zinc-400">Running diagnostic...</div>
          ) : diagnostic ? (
            <>
              {/* Authentication Status */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-brand-teal">🔐 Authentication Status</h3>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1 text-xs">
                  <div>Token: {diagnostic.auth.hasToken ? '✅ Present' : '❌ Missing'}</div>
                  <div>User: {diagnostic.auth.hasUser ? '✅ Logged in' : '❌ Not logged in'}</div>
                  <div>User ID: {diagnostic.auth.userId || 'N/A'}</div>
                  <div>User Role: {diagnostic.auth.userRole || 'N/A'}</div>
                </div>
              </div>

              {/* API Status */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-brand-teal">🌐 API Connection</h3>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1 text-xs">
                  <div>Status: {diagnostic.api.status === 'Success' ? '✅ Connected' : '❌ Failed'}</div>
                  {diagnostic.api.error && <div>Error: {diagnostic.api.error}</div>}
                  <div>Projects Count: {diagnostic.api.dataCount}</div>
                </div>
              </div>

              {/* Sample Data */}
              {diagnostic.api.sampleData.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-brand-teal">📊 Sample Projects</h3>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
                    {diagnostic.api.sampleData.map((project: any, index: number) => (
                      <div key={project.id} className="text-xs border-b border-white/5 pb-2">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-zinc-400">
                          Tasks: {project._count?.tasks || 0} | Progress: {project.progress || 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-brand-teal">💡 Recommendations</h3>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1 text-xs">
                  {!diagnostic.auth.hasToken && <div>• Please log in to access projects</div>}
                  {diagnostic.api.status !== 'Success' && <div>• Check if backend server is running on port 3001</div>}
                  {diagnostic.api.dataCount === 0 && diagnostic.api.status === 'Success' && (
                    <div>• Create some projects to see data (currently using demo data)</div>
                  )}
                  {diagnostic.api.dataCount > 0 && <div>• Real data is being loaded successfully</div>}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
