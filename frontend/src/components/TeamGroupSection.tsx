import { Users } from 'lucide-react'
import MemberCard from './MemberCard'

interface TeamGroupSectionProps {
  teamLead: {
    id: string
    name: string
    email: string
    role: string
    department: string
    activeTaskCount: number
    hasDirectReports: boolean
  }
  employees: Array<{
    id: string
    name: string
    email: string
    role: string
    department: string
    activeTaskCount: number
    managerId?: string
  }>
  isLoading?: boolean
}

export default function TeamGroupSection({
  teamLead,
  employees,
  isLoading = false
}: TeamGroupSectionProps) {
  // Group employees by department
  const employeesByDepartment = employees.reduce((groups, employee) => {
    const department = employee.department || 'Unassigned'
    if (!groups[department]) {
      groups[department] = []
    }
    groups[department].push(employee)
    return groups
  }, {} as Record<string, typeof employees>)

  return (
    <div className="space-y-4">
      {/* Team Lead Card */}
      <MemberCard
        id={teamLead.id}
        name={teamLead.name}
        email={teamLead.email}
        role={teamLead.role}
        department={teamLead.department}
        activeTaskCount={teamLead.activeTaskCount}
        isTeamLead={true}
        isClickable={false}
      />

      {/* Team Section */}
      <div className="ml-4 pl-4 border-l-2 border-zinc-700">
        {/* Team Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
            {teamLead.name.split(' ').map((word, index) => (
              <span key={index} className="first-letter:uppercase">
                {word.charAt(0)}
              </span>
            ))}
          </div>
          <span className="text-xs text-zinc-500">
            ({employees.length} {employees.length === 1 ? 'member' : 'members'})
          </span>
        </div>

        {/* Employees Grouped by Department */}
        {isLoading ? (
          // Loading Skeleton
          <div className="space-y-4">
            {['Engineering', 'Design', 'QA'].map((dept) => (
              <div key={dept} className="space-y-3">
                <div className="h-4 bg-white/5 rounded w-32 mb-3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2].map((i) => (
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
              </div>
            ))}
          </div>
        ) : Object.keys(employeesByDepartment).length === 0 ? (
          // Empty State
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No team members assigned</p>
            <p className="text-zinc-500 text-xs mt-1">
              This Team Lead currently has no employees reporting to them.
            </p>
          </div>
        ) : (
          // Employees Grouped by Department
          <div className="space-y-6">
            {Object.entries(employeesByDepartment).map(([department, deptEmployees]) => (
              <div key={department} className="space-y-3">
                {/* Department Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-brand-teal" />
                  </div>
                  <h4 className="text-sm font-medium text-white">{department}</h4>
                  <span className="text-xs text-zinc-500">
                    ({deptEmployees.length} {deptEmployees.length === 1 ? 'member' : 'members'})
                  </span>
                </div>
                
                {/* Department Employees Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {deptEmployees.map((employee) => (
                    <MemberCard
                      key={employee.id}
                      id={employee.id}
                      name={employee.name}
                      email={employee.email}
                      role={employee.role}
                      department={employee.department}
                      activeTaskCount={employee.activeTaskCount}
                      isTeamLead={false}
                      isClickable={false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
