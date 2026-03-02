import { X, Users, Briefcase } from 'lucide-react'
import MemberCard from './MemberCard'
import TeamGroupSection from './TeamGroupSection'

interface TeamLeadExpansionPanelProps {
  teamLeadId: string
  teamLeadName: string
  teamLeadDepartment: string
  members: Array<{
    id: string
    name: string
    email: string
    role: string
    department: string
    activeTaskCount: number
    managerId?: string
  }>
  isLoading: boolean
  onClose: () => void
  expandedUserRole?: string | null
  managers?: Array<{
    id: string
    name: string
    email: string
    role: string
    department: string
    activeTaskCount: number
  }>
}

export default function TeamLeadExpansionPanel({
  teamLeadId,
  teamLeadName,
  teamLeadDepartment,
  members,
  isLoading,
  onClose,
  expandedUserRole,
  managers = []
}: TeamLeadExpansionPanelProps) {
  // Filter members based on managerId relationships for the expanded user
  const directReports = members.filter(member => member.managerId === teamLeadId)
  
  // Group members by Team Lead for Manager/MD expansions
  const groupedMembers = members.reduce((groups, member) => {
    if (member.role === 'TEAM_LEAD') {
      // Create new team group for Team Lead
      groups[member.id] = {
        teamLead: member,
        employees: []
      }
    } else if (member.role === 'EMPLOYEE' && member.managerId) {
      // Add employee to their Team Lead's group
      const teamLeadGroup = groups[member.managerId]
      if (teamLeadGroup) {
        teamLeadGroup.employees.push(member)
      }
    }
    return groups
  }, {} as Record<string, { teamLead: any, employees: any[] }>)

  const teamGroups = Object.values(groupedMembers)
  const hasTeamLeads = members.some(m => m.role === 'TEAM_LEAD')

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'MANAGING_DIRECTOR': return Users
      case 'MANAGER': return Users
      case 'TEAM_LEAD': return Briefcase
      case 'EMPLOYEE': return Users
      default: return Users
    }
  }

  return (
    <div className="w-full mx-auto bg-[#09090B] border border-brand-teal/30 rounded-xl p-6 mt-4 transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-brand-teal" />
          <h3 className="font-semibold text-white text-base">
            {teamLeadName}'s Direct Reports
          </h3>
          <span className="text-sm text-zinc-400 ml-2">
            ({members.length} {members.length === 1 ? 'member' : 'members'})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Managers Section - Only for MD expansion */}
      {expandedUserRole === 'MANAGING_DIRECTOR' && managers && managers.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-blue-400" />
            <h4 className="font-semibold text-white text-base">
              Reporting Managers
            </h4>
            <span className="text-sm text-zinc-400 ml-2">
              ({managers.length} {managers.length === 1 ? 'manager' : 'managers'})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {managers.map((manager) => (
              <MemberCard
                key={manager.id}
                id={manager.id}
                name={manager.name}
                email={manager.email}
                role={manager.role}
                department={manager.department}
                activeTaskCount={manager.activeTaskCount}
                isTeamLead={false}
                isClickable={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        // Loading Skeleton
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="bg-[#09090B] border border-white/10 rounded-xl p-4 animate-pulse">
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
              <div className="ml-4 pl-4 border-l-2 border-zinc-700">
                <div className="h-4 bg-white/5 rounded w-32 mb-3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="bg-[#09090B] border border-white/10 rounded-xl p-4 animate-pulse">
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
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        // Empty State
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No direct reports assigned</p>
          <p className="text-zinc-500 text-xs mt-1">
            This person currently has no direct reports in the organization hierarchy.
          </p>
        </div>
      ) : hasTeamLeads && (expandedUserRole === 'MANAGER' || expandedUserRole === 'MANAGING_DIRECTOR') ? (
        // Grouped View for Manager/MD expansions
        <div className="space-y-6">
          {teamGroups.map((group) => (
            <TeamGroupSection
              key={group.teamLead.id}
              teamLead={group.teamLead}
              employees={group.employees}
              isLoading={false}
            />
          ))}
        </div>
      ) : (
        // Flat View for Team Lead expansions - Use directReports
        (() => {
          // For Team Lead expansion, use directReports (employees with managerId === teamLeadId)
          const displayMembers = expandedUserRole === 'TEAM_LEAD' ? directReports : members
          
          // If no employees found for Team Lead, show empty state
          if (expandedUserRole === 'TEAM_LEAD' && displayMembers.length === 0) {
            return (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">No direct reports found</p>
                <p className="text-zinc-500 text-xs mt-1">
                  This person currently has no direct reports assigned to them.
                </p>
              </div>
            )
          }
          
          // Group members by department (only for non-Team Lead expansions)
          const membersByDepartment = expandedUserRole === 'TEAM_LEAD' 
            ? { [teamLeadDepartment]: displayMembers }
            : displayMembers.reduce((groups: Record<string, any[]>, member: any) => {
                const department = member.department || 'Unassigned'
                if (!groups[department]) {
                  groups[department] = []
                }
                groups[department].push(member)
                return groups
              }, {} as Record<string, any[]>)

          return (
            <div className="space-y-6">
              {Object.entries(membersByDepartment).map(([department, deptMembers]: [string, any[]]) => (
                <div key={department} className="space-y-3">
                  {/* Department Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-brand-teal" />
                    </div>
                    <h4 className="text-sm font-medium text-white">{department}</h4>
                    <span className="text-xs text-zinc-500">
                      ({deptMembers.length} {deptMembers.length === 1 ? 'member' : 'members'})
                    </span>
                  </div>
                  
                  {/* Department Members Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {deptMembers.map((member: any) => {
                      const RoleIcon = getRoleIcon(member.role)
                      const isTeamLead = member.role === 'TEAM_LEAD'
                      
                      return (
                        <MemberCard
                          key={member.id}
                          id={member.id}
                          name={member.name}
                          email={member.email}
                          role={member.role}
                          department={member.department}
                          activeTaskCount={member.activeTaskCount}
                          isTeamLead={isTeamLead}
                          isClickable={false}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        })()
      )}
    </div>
  )
}
