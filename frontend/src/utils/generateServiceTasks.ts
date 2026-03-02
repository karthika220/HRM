import { serviceWorkflows } from "../config/serviceWorkflows"

interface GeneratedTask {
  id: string
  title: string
  projectId: string
  status: string
  priority: string
  service?: string
  isAutomated: boolean
  creatorId: string
}

export function generateServiceTasks(
  service: string,
  projectId: string,
  creatorId: string
): GeneratedTask[] {
  const workflow = serviceWorkflows[service]

  if (!workflow) return []

  return workflow.map((step: { title: string }) => ({
    id: crypto.randomUUID(),
    title: step.title,
    projectId,
    status: "TODO",
    priority: "MEDIUM",
    service,
    isAutomated: true,
    creatorId
  }))
}
