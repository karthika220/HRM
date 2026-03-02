import { User, Briefcase, Mail } from 'lucide-react'

interface MemberCardProps {
  id: string
  name: string
  email: string
  role: string
  department: string
  activeTaskCount: number
  isTeamLead?: boolean
  isExpanded?: boolean
  isClickable?: boolean
  onClick?: () => void
}

export default function MemberCard({
  id,
  name,
  email,
  role,
  department,
  activeTaskCount,
  isTeamLead = false,
  isExpanded = false,
  isClickable = false,
  onClick
}: MemberCardProps) {
  // Calculate workload percentage (threshold of 10 tasks = 100%)
  const workloadPercentage = Math.min((activeTaskCount / 10) * 100, 100)
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MANAGING_DIRECTOR': return 'text-purple-400'
      case 'MANAGER': return 'text-blue-400'
      case 'TEAM_LEAD': return 'text-brand-teal'
      case 'EMPLOYEE': return 'text-zinc-400'
      default: return 'text-zinc-400'
    }
  }

  // Get workload color
  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-brand-teal'
  }

  return (
    <div
      className={`
        bg-[#09090B] border border-white/10 rounded-xl p-4 transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:border-brand-teal/30 hover:shadow-lg' : ''}
        ${isExpanded ? 'border-brand-teal shadow-lg shadow-brand-teal/10' : ''}
      `}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Avatar and Name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-teal to-brand-mint flex items-center justify-center flex-shrink-0">
          <span className="text-black font-bold text-sm">{getInitials(name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-sm truncate">{name}</h3>
          <p className={`text-xs ${getRoleColor(role)} capitalize`}>{role.replace('_', ' ').toLowerCase()}</p>
        </div>
      </div>

      {/* Department and Email */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Briefcase className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{department}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{email}</span>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-zinc-400">Active Tasks</span>
          <span className="text-white font-medium">{activeTaskCount}</span>
        </div>
        
        {/* Workload Progress Bar */}
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getWorkloadColor(workloadPercentage)}`}
            style={{ width: `${workloadPercentage}%` }}
          />
        </div>
      </div>

      {/* Team Lead Indicator */}
      {isTeamLead && (
        <div className="flex items-center gap-1.5 text-xs text-brand-teal">
          <div className="w-2 h-2 bg-brand-teal rounded-full" />
          <span>Team Lead</span>
        </div>
      )}
    </div>
  )
}
