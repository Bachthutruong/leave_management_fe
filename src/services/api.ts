import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Employee, LeaveRequest, AuthResponse, LoginCredentials, LeaveStatistics, CalendarEvent, HalfDayOption } from '@/types';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  // baseURL: 'https://leave-management-be-8rhi.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  adminLogin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
  },
  
  employeeAuth: async (employeeId: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/employee/auth', { employeeId });
    return response.data;
  },
};

// Employee API
export const employeeAPI = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/employees');
    return response.data;
  },
  
  getById: async (id: string): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  
  create: async (employee: Omit<Employee, '_id'>): Promise<Employee> => {
    const response = await api.post('/employees', employee);
    return response.data;
  },
  
  update: async (id: string, employee: Partial<Employee>): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, employee);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },
  
  getByDepartment: async (department: string): Promise<Employee[]> => {
    const response = await api.get(`/employees/department/${department}`);
    return response.data;
  },
};

// Leave Request API
export const leaveRequestAPI = {
  getAll: async (filters?: any): Promise<LeaveRequest[]> => {
    const response = await api.get('/leave-requests', { params: filters });
    return response.data;
  },
  
  getMyRequests: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/leave-requests/my-requests');
    return response.data;
  },
  
  getById: async (id: string): Promise<LeaveRequest> => {
    const response = await api.get(`/leave-requests/${id}`);
    return response.data;
  },
  
  create: async (leaveRequest: FormData): Promise<LeaveRequest> => {
    const response = await api.post('/leave-requests', leaveRequest, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Admin create leave request
  createByAdmin: async (leaveRequest: any): Promise<LeaveRequest> => {
    const response = await api.post('/leave-requests/admin', leaveRequest);
    return response.data;
  },
  
  update: async (id: string, updateData: any): Promise<LeaveRequest> => {
    const response = await api.put(`/leave-requests/${id}`, updateData);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/leave-requests/${id}`);
  },
  
  deleteAttachment: async (leaveRequestId: string, publicId: string): Promise<void> => {
    await api.delete(`/leave-requests/${leaveRequestId}/attachments/${publicId}`);
  },
  
  getCompanyCalendar: async (year?: number, month?: number): Promise<CalendarEvent[]> => {
    // Ensure year and month are valid numbers
    if (year && month) {
      console.log('API call params:', { year, month });
    }
    
    try {
      const response = await api.get('/leave-requests/calendar/company', {
        params: { year, month }
      });
      
      console.log('Calendar API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Calendar API error:', error);
      throw error;
    }
  },
  
  getStatistics: async (period: 'month' | 'quarter' | 'year', value?: number): Promise<LeaveStatistics[]> => {
    const response = await api.get('/leave-requests/statistics/summary', {
      params: { period, value }
    });
    return response.data;
  },
};

// Half Day Options API
export const halfDayOptionsAPI = {
  getAll: async (): Promise<HalfDayOption[]> => {
    const response = await api.get('/half-day-options');
    return response.data;
  },
  
  create: async (option: { code: string; label: string }): Promise<HalfDayOption> => {
    const response = await api.post('/half-day-options', option);
    return response.data;
  },
  
  update: async (id: string, label: string): Promise<HalfDayOption> => {
    const response = await api.put(`/half-day-options/${id}`, { label });
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/half-day-options/${id}`);
  },
};

export default api;
