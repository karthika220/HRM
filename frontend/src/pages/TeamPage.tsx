import { useEffect, useState } from 'react'
import { Users, Briefcase } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import MemberCard from '../components/MemberCard'
import TeamLeadExpansionPanel from '../components/TeamLeadExpansionPanel'

// Demo data fallback
const DEMO_TEAM_MEMBERS = [
  {
    id: '1',
    name: 'Emma Davis',
    email: 'emma.davis@company.com',
    role: 'Team Lead',
    department: 'Engineering',
    activeTaskCount: 8,
    hasDirectReports: true
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Senior Developer',
    department: 'Engineering',
    activeTaskCount: 6,
    hasDirectReports: false
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'Developer',
    department: 'Engineering',
    activeTaskCount: 4,
    hasDirectReports: false
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    role: 'Project Manager',
    department: 'Sales',
    activeTaskCount: 5,
    hasDirectReports: true
  },
  {
    id: '5',
    name: 'Lisa Brown',
    email: 'lisa.brown@company.com',
    role: 'HR Manager',
    department: 'HR',
    activeTaskCount: 3,
    hasDirectReports: true
  },
  {
    id: '6',
    name: 'Robert Taylor',
    email: 'robert.taylor@company.com',
    role: 'Marketing Specialist',
    department: 'Marketing',
    activeTaskCount: 7,
    hasDirectReports: false
  }
]

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  activeTaskCount: number
  hasDirectReports?: boolean
}

interface DirectReport {
  id: string
  name: string
  email: string
  role: string
  department: string
  activeTaskCount: number
  hasDirectReports: boolean
  managerId?: string
}

interface TeamGroup {
  teamLead: DirectReport
  employees: DirectReport[]
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  activeTaskCount: number
  hasDirectReports?: boolean
}

export default function TeamPage() {
  const { user } = useAuthStore()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [directReports, setDirectReports] = useState<DirectReport[]>([])
  const [managers, setManagers] = useState<DirectReport[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [expandedUserType, setExpandedUserType] = useState<'team-lead' | 'manager' | 'md' | string | null>(null)

  // Role hierarchy for ordering
  const roleHierarchy = ['MANAGING_DIRECTOR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE']
  
  // Group members by role
  const groupedMembers = teamMembers.reduce((acc, member) => {
    const role = member.role
    if (!acc[role]) {
      acc[role] = []
    }
    acc[role].push(member)
    return acc
  }, {} as Record<string, TeamMember[]>)

  // Group direct reports by Team Lead for Manager/MD expansions
  const groupedDirectReports = directReports.reduce((groups, report) => {
    if (report.role === 'TEAM_LEAD') {
      // Create new team group for Team Lead
      groups[report.id] = {
        teamLead: report,
        employees: []
      }
    } else if (report.role === 'EMPLOYEE' && report.managerId) {
      // Add employee to their Team Lead's group
      const teamLeadGroup = groups[report.managerId]
      if (teamLeadGroup) {
        teamLeadGroup.employees.push(report)
      }
    }
    return groups
  }, {} as Record<string, TeamGroup>)

  // Check if user can expand different levels
  const canExpandMD = user?.role === 'MANAGING_DIRECTOR'
  const canExpandManager = ['MANAGING_DIRECTOR', 'MANAGER'].includes(user?.role || '')
  const canExpandTeamLead = ['MANAGING_DIRECTOR', 'MANAGER', 'TEAM_LEAD'].includes(user?.role || '')

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/team')
      setTeamMembers(response.data || DEMO_TEAM_MEMBERS)
    } catch (error: any) {
      console.error('Failed to load team members:', error)
      // Fallback to demo data
      setTeamMembers(DEMO_TEAM_MEMBERS)
      if (error.response?.status === 403) {
        setTeamMembers([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = async (userId: string, userRole: string) => {
    // If clicking the same user, close the expansion
    if (expandedUser === userId) {
      setExpandedUser(null)
      setDirectReports([])
      setManagers([])
      setExpandedUserType(null)
      return
    }

    // Check permissions based on role
    const canExpand = 
      (userRole === 'MANAGING_DIRECTOR' && canExpandMD) ||
      (userRole === 'MANAGER' && canExpandManager) ||
      (userRole === 'TEAM_LEAD' && canExpandTeamLead)

    if (!canExpand) {
      return
    }

    // Additional check: Team Leads can only expand their own card
    if (user?.role === 'TEAM_LEAD' && user.id !== userId) {
      return
    }

    try {
      setLoadingReports(true)
      setExpandedUser(userId)
      
      // Determine expansion type
      if (userRole === 'MANAGING_DIRECTOR') {
        setExpandedUserType('md')
      } else if (userRole === 'MANAGER') {
        setExpandedUserType('manager')
      } else if (userRole === 'TEAM_LEAD') {
        setExpandedUserType('team-lead')
      }
      
      const response = await api.get(`/users/team/${userId}/direct-reports`)
      const allReports = response.data
      
      // STRICT HIERARCHICAL FILTERING
      let filteredReports: DirectReport[] = []
      let filteredManagers: DirectReport[] = []
      
      if (userRole === 'MANAGING_DIRECTOR') {
        // MD Expansion: Render ONLY users with role === "MANAGER"
        filteredReports = allReports.filter((report: any) => report.role === 'MANAGER')
        filteredManagers = [] // No separate managers needed for MD
      } else if (userRole === 'MANAGER') {
        // Manager Expansion: Render ONLY users with role === "TEAM_LEAD"
        filteredReports = allReports.filter((report: any) => report.role === 'TEAM_LEAD')
        filteredManagers = [] // No separate managers needed for Manager
      } else if (userRole === 'TEAM_LEAD') {
        // Team Lead Expansion: Render ONLY Employees whose department matches team lead's department
        const teamLead = teamMembers.find(m => m.id === userId)
        const teamLeadDepartment = teamLead?.department
        
        if (teamLeadDepartment) {
          filteredReports = allReports.filter((report: any) => 
            report.role === 'EMPLOYEE' && report.department === teamLeadDepartment
          )
        } else {
          filteredReports = []
        }
        filteredManagers = [] // No managers for Team Lead
      }
      
      setDirectReports(filteredReports)
      setManagers(filteredManagers)
      
    } catch (error: any) {
      console.error('Failed to load direct reports:', error)
      if (error.response?.status === 403) {
        setDirectReports([])
        setManagers([])
      }
    } finally {
      setLoadingReports(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'MANAGING_DIRECTOR': return 'Managing Director'
      case 'MANAGER': return 'Manager'
      case 'TEAM_LEAD': return 'Team Lead'
      case 'EMPLOYEE': return 'Employee'
      default: return role.replace('_', ' ').toLowerCase()
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'MANAGING_DIRECTOR': return Users
      case 'MANAGER': return Users
      case 'TEAM_LEAD': return Briefcase
      case 'EMPLOYEE': return Users
      default: return Users
    }
  }

  const renderSkeletonCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#09090B] border border-white/10 rounded-xl p-4 animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1">
              <div className="h-3 bg-white/10 rounded mb-1" />
              <div className="h-2 bg-white/5 rounded w-20" />
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="h-2 bg-white/5 rounded w-24" />
            <div className="h-2 bg-white/5 rounded w-32" />
          </div>
          <div className="h-2 bg-white/5 rounded w-16" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-rubik font-bold text-2xl text-white">Team</h1>
        <p className="text-zinc-500 text-sm mt-1">Organization structure and team members</p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-6">
          {roleHierarchy.map((role) => (
            <div key={role}>
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                {getRoleLabel(role)}
              </h2>
              {renderSkeletonCards()}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {roleHierarchy.map((role) => {
            const members = groupedMembers[role] || []
            if (members.length === 0) return null

            const RoleIcon = getRoleIcon(role)
            const isClickableRole = ['MANAGING_DIRECTOR', 'MANAGER', 'TEAM_LEAD'].includes(role)
            const canExpandRole = 
              (role === 'MANAGING_DIRECTOR' && canExpandMD) ||
              (role === 'MANAGER' && canExpandManager) ||
              (role === 'TEAM_LEAD' && canExpandTeamLead)

            return (
              <div key={role}>
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <RoleIcon className="w-4 h-4" />
                  {getRoleLabel(role)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {members.map((member) => (
                    <MemberCard
                      key={member.id}
                      id={member.id}
                      name={member.name}
                      email={member.email}
                      role={member.role}
                      department={member.department}
                      activeTaskCount={member.activeTaskCount}
                      isClickable={isClickableRole && canExpandRole}
                      isExpanded={expandedUser === member.id}
                      onClick={() => handleUserClick(member.id, member.role)}
                    />
                  ))}
                </div>
                
                {/* Expansion Panel - Render only under the correct role section */}
                {expandedUser && expandedUserType && (() => {
                  const expandedMember = teamMembers.find(m => m.id === expandedUser)
                  if (!expandedMember) return null

                  if (expandedMember.role !== role) return null

                  return (
                    <TeamLeadExpansionPanel
                      teamLeadId={expandedUser}
                      teamLeadName={expandedMember.name}
                      teamLeadDepartment={expandedMember.department || 'Unassigned'}
                      members={directReports}
                      isLoading={loadingReports}
                      onClose={() => {
                        setExpandedUser(null)
                        setDirectReports([])
                        setManagers([])
                        setExpandedUserType(null)
                      }}
                      expandedUserRole={expandedUserType}
                      managers={managers}
                    />
                  )
                })()}
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && teamMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
          <h3 className="font-rubik font-bold text-white text-xl mb-2">No team members found</h3>
          <p className="text-zinc-500 text-sm">
            {canExpandTeamLead 
              ? "No team members are currently available in the system."
              : "You don't have permission to view team members."
            }
          </p>
        </div>
      )}
    </div>
  )
}
