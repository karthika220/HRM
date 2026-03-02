const isSuperAdmin = (role) =>
  ["SUPER_ADMIN", "MANAGING_DIRECTOR", "MANAGER", "TEAM_LEAD"].includes(role)

const isTeamLead = (role) =>
  role === "TEAM_LEAD"

const isManagerOrAbove = (role) =>
  ["SUPER_ADMIN", "MANAGING_DIRECTOR", "MANAGER"].includes(role)

const isHROrAbove = (role) =>
  ["SUPER_ADMIN", "MANAGING_DIRECTOR", "HR"].includes(role)

module.exports = { isSuperAdmin, isTeamLead, isManagerOrAbove, isHROrAbove }
