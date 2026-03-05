import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

// Centralized data store hook
export const useCentralizedData = () => {
  const [data, setData] = useState({
    employees: [],
    projects: [],
    tasks: [],
    attendance: [],
    leaves: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch all centralized data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/centralized/data');
      
      // Defensive parsing - don't assume response shape
      const data = response.data;
      let centralizedData = {
        employees: [],
        projects: [],
        tasks: [],
        attendance: [],
        leaves: []
      };

      if (data && typeof data === 'object') {
        // Handle different response structures
        if (data.data && typeof data.data === 'object') {
          centralizedData = {
            employees: Array.isArray((data.data as any).employees) ? (data.data as any).employees : [],
            projects: Array.isArray((data.data as any).projects) ? (data.data as any).projects : [],
            tasks: Array.isArray((data.data as any).tasks) ? (data.data as any).tasks : [],
            attendance: Array.isArray((data.data as any).attendance) ? (data.data as any).attendance : [],
            leaves: Array.isArray((data.data as any).leaves) ? (data.data as any).leaves : []
          };
        } else if (typeof data === 'object') {
          centralizedData = {
            employees: Array.isArray((data as any).employees) ? (data as any).employees : [],
            projects: Array.isArray((data as any).projects) ? (data as any).projects : [],
            tasks: Array.isArray((data as any).tasks) ? (data as any).tasks : [],
            attendance: Array.isArray((data as any).attendance) ? (data as any).attendance : [],
            leaves: Array.isArray((data as any).leaves) ? (data as any).leaves : []
          };
        }
      }
      
      console.log("✅ Centralized data parsed:", centralizedData);
      setData(centralizedData);
      setLastUpdated(data.timestamp || new Date().toISOString());
    } catch (err: unknown) {
      console.error("Failed to fetch centralized data:", err);
      const error = err instanceof Error ? err : new Error('Network error');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch specific data type
  const fetchDataType = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/centralized/${type}`);
      
      // Defensive parsing - don't assume response shape
      const data = response.data;
      let dataTypeData = [];

      if (Array.isArray(data)) {
        // Direct array response
        dataTypeData = data;
      } else if (data && Array.isArray(data.data)) {
        // Wrapped response with data property
        dataTypeData = data.data;
      } else if (data && Array.isArray(data[type])) {
        // Response with type property
        dataTypeData = data[type];
      } else {
        console.warn(`⚠️ Unexpected ${type} response structure:`, data);
        dataTypeData = [];
      }
      
      console.log(`✅ ${type} data parsed:`, dataTypeData);
      setData(prev => ({
        ...prev,
        [type]: dataTypeData
      }));
      setLastUpdated(data.timestamp || new Date().toISOString());
    } catch (err: unknown) {
      console.error(`Failed to fetch ${type}:`, err);
      const error = err instanceof Error ? err : new Error('Network error');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh cache for specific data type
  const refreshCache = useCallback(async (type: string) => {
    try {
      await api.post('/centralized/refresh', { type });
      await fetchDataType(type);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to refresh cache');
      setError(error);
    }
  }, [fetchDataType]);

  // Refresh all cache
  const refreshAllCache = useCallback(async () => {
    try {
      await api.post('/centralized/refresh', { type: 'all' });
      await fetchAllData();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to refresh cache');
      setError(error);
    }
  }, [fetchAllData]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    fetchAllData,
    fetchDataType,
    refreshCache,
    refreshAllCache
  };
};

// Individual data hooks for specific use cases
export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/centralized/employees');
      
      // Defensive parsing - don't assume response shape
      const data = response.data;
      let employeesData = [];

      if (Array.isArray(data)) {
        // Direct array response
        employeesData = data;
      } else if (data && Array.isArray(data.data)) {
        // Wrapped response with data property
        employeesData = data.data;
      } else if (data && Array.isArray(data.employees)) {
        // Response with employees property
        employeesData = data.employees;
      } else {
        console.warn("⚠️ Unexpected employees response structure:", data);
        employeesData = [];
      }
      
      console.log("✅ Employees data parsed:", employeesData);
      setEmployees(employeesData);
    } catch (err: unknown) {
      console.error("Failed to fetch employees:", err);
      const error = err instanceof Error ? err : new Error('Network error');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, loading, error, refetch: fetchEmployees };
};

export const useProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/projects');
      
      // DEBUG: Log actual API response structure
      console.log("=== PROJECTS API RESPONSE DEBUG ===");
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      console.log("Type of response.data:", typeof response.data);
      console.log("Is response.data an array?", Array.isArray(response.data));
      console.log("Response.data keys:", Object.keys(response.data || {}));
      console.log("========================================");
      
      // Normalize response safely with defensive parsing
      const data = response.data;
      let projectsData = [];

      if (Array.isArray(data)) {
        console.log("✅ Response data is directly an array");
        projectsData = data;
      } else if (Array.isArray(data.projects)) {
        console.log("✅ Response data has .projects array");
        projectsData = data.projects;
      } else if (Array.isArray(data.data)) {
        console.log("✅ Response data has .data array");
        projectsData = data.data;
      } else if (data && data.success && Array.isArray(data.data)) {
        console.log("✅ Response has success flag and .data array");
        projectsData = data.data;
      } else {
        console.warn("⚠️ Unexpected projects response structure:", data);
        console.warn("⚠️ Available keys:", Object.keys(data || {}));
        console.warn("⚠️ Response data type:", typeof data);
        // Don't set error, just use empty array to prevent false error triggering
        projectsData = [];
      }
      
      console.log("✅ Final projectsData:", projectsData);
      console.log("✅ Projects count:", projectsData.length);
      
      setProjects(projectsData);
      setError(null);
    } catch (err: unknown) {
      console.error("=== PROJECTS API ERROR DEBUG ===");
      console.error("Error:", err);
      console.error("Error response:", (err as any).response);
      console.error("Error message:", (err as any).message);
      console.error("=================================");
      const error = err instanceof Error ? err : new Error('Network error');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
};

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/centralized/tasks');
      
      // Defensive parsing - don't assume response shape
      const data = response.data;
      let tasksData = [];

      if (Array.isArray(data)) {
        // Direct array response
        tasksData = data;
      } else if (data && Array.isArray(data.data)) {
        // Wrapped response with data property
        tasksData = data.data;
      } else if (data && Array.isArray(data.tasks)) {
        // Response with tasks property
        tasksData = data.tasks;
      } else {
        console.warn("⚠️ Unexpected tasks response structure:", data);
        tasksData = [];
      }
      
      console.log("✅ Tasks data parsed:", tasksData);
      setTasks(tasksData);
    } catch (err: unknown) {
      console.error("Failed to fetch tasks:", err);
      const error = err instanceof Error ? err : new Error('Network error');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
};

export const useAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/centralized/attendance');
      
      // Defensive parsing - don't assume response shape
      const data = response.data;
      let attendanceData = [];

      if (Array.isArray(data)) {
        // Direct array response
        attendanceData = data;
      } else if (data && Array.isArray(data.data)) {
        // Wrapped response with data property
        attendanceData = data.data;
      } else if (data && Array.isArray(data.attendance)) {
        // Response with attendance property
        attendanceData = data.attendance;
      } else {
        console.warn("⚠️ Unexpected attendance response structure:", data);
        attendanceData = [];
      }
      
      console.log("✅ Attendance data parsed:", attendanceData);
      setAttendance(attendanceData);
    } catch (err: unknown) {
      console.error("Failed to fetch attendance:", err);
      const error = err instanceof Error ? err : new Error('Network error');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return { attendance, loading, error, refetch: fetchAttendance };
};

export const useLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/centralized/leaves');
      
      // Defensive parsing - don't assume response shape
      const data = response.data;
      let leavesData = [];

      if (Array.isArray(data)) {
        // Direct array response
        leavesData = data;
      } else if (data && Array.isArray(data.data)) {
        // Wrapped response with data property
        leavesData = data.data;
      } else if (data && Array.isArray(data.leaves)) {
        // Response with leaves property
        leavesData = data.leaves;
      } else {
        console.warn("⚠️ Unexpected leaves response structure:", data);
        leavesData = [];
      }
      
      console.log("✅ Leaves data parsed:", leavesData);
      setLeaves(leavesData);
    } catch (err: unknown) {
      console.error("Failed to fetch leaves:", err);
      const error = err instanceof Error ? err : new Error('Network error');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  return { leaves, loading, error, refetch: fetchLeaves };
};
