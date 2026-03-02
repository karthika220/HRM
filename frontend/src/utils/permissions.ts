export const isSuperAdmin = (role: string) =>
  ["MANAGING_DIRECTOR","MANAGER"].includes(role)

export const isTeamLead = (role: string) =>
  role === "TEAM_LEAD"

export const canManageProjects = (role: string) =>
  isSuperAdmin(role)

export const canManageTasks = (role: string) =>
  isSuperAdmin(role) || isTeamLead(role)
