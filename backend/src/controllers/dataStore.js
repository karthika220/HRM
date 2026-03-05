const { prisma } = require('../prisma');

class DataStore {
  constructor() {
    this.cache = {
      employees: null,
      projects: null,
      tasks: null,
      attendance: null,
      leaves: null,
      lastUpdated: {
        employees: null,
        projects: null,
        tasks: null,
        attendance: null,
        leaves: null
      }
    };
    this.cacheTimeout = 30000; // 30 seconds cache timeout
  }

  // Helper function to check if cache is valid
  isCacheValid(type) {
    return this.cache[type] && 
           this.cache.lastUpdated[type] && 
           (Date.now() - this.cache.lastUpdated[type]) < this.cacheTimeout;
  }

  // Get all employees with their roles and status
  async getEmployees() {
    if (this.isCacheValid('employees')) {
      return this.cache.employees;
    }

    try {
      const employees = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          employeeCode: true,
          department: true,
          position: true,
          status: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          reportingManagerId: true,
          _count: {
            select: {
              projectsAsOwner: true,
              projectMemberships: true,
              assignedTasks: true,
              attendanceRecords: true,
              leaveRequests: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      this.cache.employees = employees;
      this.cache.lastUpdated.employees = Date.now();
      return employees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  // Get all projects with full details
  async getProjects() {
    if (this.isCacheValid('projects')) {
      return this.cache.projects;
    }

    try {
      const projects = await prisma.project.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                  role: true
                }
              }
            }
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              assigneeId: true,
              service: true,
              isAutomated: true
            }
          },
          _count: {
            select: {
              tasks: true,
              members: true,
              milestones: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate progress for each project
      const projectsWithProgress = projects.map(project => {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(task => task.status === 'DONE').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return {
          ...project,
          progress,
          tags: project.tags ? JSON.parse(project.tags) : [],
          services: project.services ? JSON.parse(project.services) : []
        };
      });

      this.cache.projects = projectsWithProgress;
      this.cache.lastUpdated.projects = Date.now();
      return projectsWithProgress;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get all tasks with full details
  async getTasks() {
    if (this.isCacheValid('tasks')) {
      return this.cache.tasks;
    }

    try {
      const tasks = await prisma.task.findMany({
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              comments: true,
              subtasks: true
            }
          }
        },
        orderBy: { order: 'asc' }
      });

      this.cache.tasks = tasks;
      this.cache.lastUpdated.tasks = Date.now();
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Get all attendance records
  async getAttendance() {
    if (this.isCacheValid('attendance')) {
      return this.cache.attendance;
    }

    try {
      const attendance = await prisma.attendanceSummary.findMany({
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeCode: true,
              department: true
            }
          }
        },
        orderBy: { month: 'desc' }
      });

      this.cache.attendance = attendance;
      this.cache.lastUpdated.attendance = Date.now();
      return attendance;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  }

  // Get all leave requests
  async getLeaves() {
    if (this.isCacheValid('leaves')) {
      return this.cache.leaves;
    }

    try {
      const leaves = await prisma.leaveRequest.findMany({
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeCode: true,
              department: true
            }
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      this.cache.leaves = leaves;
      this.cache.lastUpdated.leaves = Date.now();
      return leaves;
    } catch (error) {
      console.error('Error fetching leaves:', error);
      throw error;
    }
  }

  // Get complete centralized data
  async getCentralizedData() {
    try {
      const [employees, projects, tasks, attendance, leaves] = await Promise.all([
        this.getEmployees(),
        this.getProjects(),
        this.getTasks(),
        this.getAttendance(),
        this.getLeaves()
      ]);

      return {
        employees,
        projects,
        tasks,
        attendance,
        leaves,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching centralized data:', error);
      throw error;
    }
  }

  // Invalidate cache for specific data type
  invalidateCache(type) {
    if (type === 'all') {
      this.cache = {
        employees: null,
        projects: null,
        tasks: null,
        attendance: null,
        leaves: null,
        lastUpdated: {
          employees: null,
          projects: null,
          tasks: null,
          attendance: null,
          leaves: null
        }
      };
    } else {
      this.cache[type] = null;
      this.cache.lastUpdated[type] = null;
    }
  }

  // Update cache when data changes
  async updateCache(type, data = null) {
    this.invalidateCache(type);
    if (data) {
      this.cache[type] = data;
      this.cache.lastUpdated[type] = Date.now();
    } else {
      // Refetch from database
      switch (type) {
        case 'employees':
          await this.getEmployees();
          break;
        case 'projects':
          await this.getProjects();
          break;
        case 'tasks':
          await this.getTasks();
          break;
        case 'attendance':
          await this.getAttendance();
          break;
        case 'leaves':
          await this.getLeaves();
          break;
      }
    }
  }
}

// Singleton instance
const dataStore = new DataStore();

module.exports = dataStore;
