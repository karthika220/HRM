import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import { User, Calendar, AlertTriangle } from 'lucide-react'

interface UserProfile {
  id?: string
  name?: string
  email?: string
  role?: string
  department?: string
  phone?: string
  avatarUrl?: string
  createdAt?: string
  employeeCode?: string
  designation?: string
  employmentType?: string
  joinDate?: string
  employmentStatus?: string
}

interface LeaveBalance {
  sickTotal: number
  sickUsed: number
  casualTotal: number
  casualUsed: number
  lopUsed: number
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null)
  const [escalationCount, setEscalationCount] = useState(0)

  useEffect(() => {
    loadProfile()
    loadLeaveBalance()
    loadEscalationCount()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await api.get('/user/me')
      console.log('Frontend - Profile response:', res.data)
      setProfile(res.data.user) // Backend returns { success: true, user: {...} }
    } catch (error: any) {
      console.error('Frontend - Failed to load profile:', error)
      console.error('Frontend - Error response:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const loadLeaveBalance = async () => {
    try {
      const currentYear = new Date().getFullYear()
      const res = await api.get(`/hr/leave/balance?year=${currentYear}`)
      const userBalance = res.data.find((balance: any) => balance.employeeId === user?.id)
      if (userBalance) {
        setLeaveBalance({
          sickTotal: userBalance.sickTotal,
          sickUsed: userBalance.sickUsed,
          casualTotal: userBalance.casualTotal,
          casualUsed: userBalance.casualUsed,
          lopUsed: userBalance.lopUsed
        })
      }
    } catch (error: any) {
      console.error('Failed to load leave balance:', error)
    }
  }

  const loadEscalationCount = async () => {
    try {
      const res = await api.get('/hr/escalations?status=Open')
      const userEscalations = res.data.filter((escalation: any) => escalation.employeeId === user?.id)
      setEscalationCount(userEscalations.length)
    } catch (error: any) {
      console.error('Failed to load escalation count:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-zinc-400">Failed to load profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-rubik font-bold text-2xl text-white">View Profile</h1>
        <p className="text-zinc-500 text-sm mt-1">Your profile information</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar */}
        <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-teal to-brand-mint flex items-center justify-center mx-auto mb-4">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name || 'Profile'}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span className="text-black font-bold text-2xl">
                  {profile.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="font-rubik font-bold text-xl text-white mb-1">{profile.name}</h2>
            <p className="text-brand-teal font-medium">{profile.role?.replace('_', ' ')}</p>
            {profile.employeeCode && (
              <p className="text-zinc-400 text-sm mt-1">Code: {profile.employeeCode}</p>
            )}
            {profile.designation && (
              <p className="text-zinc-400 text-sm">{profile.designation}</p>
            )}
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* HR Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leave Balance Card */}
            <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-brand-teal" />
                <h3 className="font-rubik font-semibold text-white">Leave Balance</h3>
              </div>
              {leaveBalance ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Sick Leave</span>
                    <span className="text-sm text-white">
                      {leaveBalance.sickTotal - leaveBalance.sickUsed}/{leaveBalance.sickTotal}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Casual Leave</span>
                    <span className="text-sm text-white">
                      {leaveBalance.casualTotal - leaveBalance.casualUsed}/{leaveBalance.casualTotal}
                    </span>
                  </div>
                  {leaveBalance.lopUsed > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-400">LOP Used</span>
                      <span className="text-sm text-red-400">{leaveBalance.lopUsed}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-400 text-sm">No leave data available</p>
              )}
            </div>

            {/* Escalations Card */}
            <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-brand-orange" />
                <h3 className="font-rubik font-semibold text-white">Escalations</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{escalationCount}</div>
                <p className="text-sm text-zinc-400">Open escalations</p>
                {escalationCount > 0 && (
                  <button 
                    onClick={() => window.location.href = '/escalations'}
                    className="mt-3 text-xs text-brand-orange hover:text-brand-orange/80"
                  >
                    View Details →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
            <h3 className="font-rubik font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-teal" />
              Profile Information
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                  <div className="px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white">
                    {profile.name}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                  <div className="px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white">
                    {profile.email}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number</label>
                  <div className="px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white">
                    {profile.phone || 'Not provided'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Department</label>
                  <div className="px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white">
                    {profile.department || 'Not specified'}
                  </div>
                </div>

                {profile.employmentType && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Employment Type</label>
                    <div className="px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white">
                      {profile.employmentType}
                    </div>
                  </div>
                )}

                {profile.joinDate && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Join Date</label>
                    <div className="px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white">
                      {new Date(profile.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-zinc-400 mb-1">Role</label>
                <div className="px-4 py-2.5 bg-[#18181B] border border-white/10 rounded-xl text-white">
                  {profile.role?.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#09090B] border border-white/10 rounded-2xl p-6">
        <h3 className="font-rubik font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-brand-teal font-bold">
                  {activity.action.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">
                  <span className="font-medium">{activity.action}</span> - {activity.description}
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Button */}
      <div className="flex justify-center">
        <button
          onClick={() => window.location.href = '/profile/edit'}
          className="px-6 py-2.5 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all"
        >
          Edit Profile
        </button>
      </div>
    </div>
  )
}
