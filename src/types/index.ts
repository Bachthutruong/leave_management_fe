export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'full_day' | 'half_day' | 'hourly';
  halfDayType?: 'morning' | 'afternoon' | 'evening';
  startTime?: string;
  endTime?: string;
  startDate: string;
  endDate: string;
  reason?: string;
  attachments?: Attachment[];
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin?: string;
}

export interface AuthResponse {
  token: string;
  employee?: Employee;
  admin?: Admin;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LeaveStatistics {
  employeeId: string;
  employeeName: string;
  department: string;
  totalDays: number;
  totalHours: number;
  fullDays: number;
  halfDays: number;
  hourlyLeaves: number;
}

export interface CalendarEvent {
  date: string;
  events: {
    employeeId: string;
    employeeName: string;
    department: string;
    leaveType: 'full_day' | 'half_day' | 'hourly';
    halfDayType?: 'morning' | 'afternoon' | 'evening';
    startTime?: string;
    endTime?: string;
  }[];
}

export interface HalfDayOption {
  _id: string;
  code: 'morning' | 'afternoon' | 'evening';
  label: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
