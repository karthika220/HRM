export interface CentralizedData {
  employees: any[];
  projects: any[];
  tasks: any[];
  attendance: any[];
  leaves: any[];
}

export interface UseCentralizedDataReturn {
  data: CentralizedData;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  fetchAllData: () => Promise<void>;
  fetchDataType: (type: string) => Promise<void>;
  refreshCache: (type: string) => Promise<void>;
  refreshAllCache: () => Promise<void>;
}

export interface UseDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export declare const useCentralizedData: () => UseCentralizedDataReturn;
export declare const useEmployees: () => UseDataReturn<any>;
export declare const useProjects: () => UseDataReturn<any>;
export declare const useTasks: () => UseDataReturn<any>;
export declare const useAttendance: () => UseDataReturn<any>;
export declare const useLeaves: () => UseDataReturn<any>;
