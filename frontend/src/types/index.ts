// Centralized type definitions for the application

export interface Project {
  id: string
  name: string
  description?: string
  status: string
  startDate: string
  endDate: string
  budget?: number
  color: string
  tags?: string[]
  services?: string[]
  owner?: { id: string; name: string; avatar?: string }
  members?: any[]
  progress?: number
  _count?: { tasks: number; milestones: number }
}

export interface TaskStatus {
  status: string;
  count: number;
  color: string;
}

export interface ProjectStatus {
  status: string;
  count: number;
  color: string;
}

export interface ProjectReport {
  id: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  progressPercent: number;
  tasksByStatus: {
    status: string;
    count: number;
  }[];
  generatedAt: string;
  generatedBy: string;
  type: string;
}
