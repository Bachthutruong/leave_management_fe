import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { employeeAPI, leaveRequestAPI, halfDayOptionsAPI } from '@/services/api';
import { Employee, LeaveRequest, HalfDayOption } from '@/types';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings as SettingsIcon, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  LogOut,
  Building2,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Employee Management Component
const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (error) {
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      try {
        await employeeAPI.delete(id);
        toast.success('Xóa nhân viên thành công');
        loadEmployees();
      } catch (error) {
        toast.error('Không thể xóa nhân viên');
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Nhân viên</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      <div className="grid gap-4">
        {employees.map((employee) => (
          <Card key={employee._id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{employee.name}</span>
                    <span className="text-sm text-muted-foreground">({employee.employeeId})</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-3 w-3" />
                      <span>{employee.department}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{employee.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                                     <Button
                     variant="outline"
                     size="sm"
                   >
                     <Edit className="h-4 w-4" />
                   </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(employee._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Leave Management Component
const LeaveManagement: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLeaveRequests();
  }, [filter]);

  const loadLeaveRequests = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await leaveRequestAPI.getAll(params);
      setLeaveRequests(data);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn xin nghỉ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await leaveRequestAPI.update(id, { status: 'approved' });
      toast.success('Đã duyệt đơn xin nghỉ');
      loadLeaveRequests();
    } catch (error) {
      toast.error('Không thể duyệt đơn');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Lý do từ chối:');
    if (reason) {
      try {
        await leaveRequestAPI.update(id, { 
          status: 'rejected', 
          rejectionReason: reason 
        });
        toast.success('Đã từ chối đơn xin nghỉ');
        loadLeaveRequests();
      } catch (error) {
        toast.error('Không thể từ chối đơn');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Chờ duyệt
        </span>;
      case 'approved':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Đã duyệt
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Từ chối
        </span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Đơn xin nghỉ</h2>
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tất cả
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Chờ duyệt
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('approved')}
          >
            Đã duyệt
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {leaveRequests.map((request) => (
          <Card key={request._id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{request.employeeName}</span>
                    <span className="text-sm text-muted-foreground">({request.department})</span>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>
                        {format(new Date(request.startDate), 'dd/MM/yyyy', { locale: vi })} - 
                        {format(new Date(request.endDate), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    {request.reason && (
                      <div className="flex items-center space-x-1 mt-1">
                        <FileText className="h-3 w-3" />
                        <span>{request.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
                {request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request._id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Duyệt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(request._id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Từ chối
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Statistics Component
const Statistics: React.FC = () => {
  const [statistics, setStatistics] = useState<any[]>([]);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    try {
      const data = await leaveRequestAPI.getStatistics(period);
      setStatistics(data);
    } catch (error) {
      toast.error('Không thể tải thống kê');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thống kê Nghỉ phép</h2>
        <div className="flex space-x-2">
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('month')}
          >
            Tháng
          </Button>
          <Button
            variant={period === 'quarter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('quarter')}
          >
            Quý
          </Button>
          <Button
            variant={period === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('year')}
          >
            Năm
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {statistics.map((stat) => (
          <Card key={stat.employeeId}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{stat.employeeName}</h3>
                    <p className="text-sm text-muted-foreground">{stat.department}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{stat.totalDays}</div>
                    <div className="text-sm text-muted-foreground">Tổng ngày nghỉ</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-blue-600">{stat.fullDays}</div>
                    <div className="text-xs text-muted-foreground">Cả ngày</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">{stat.halfDays}</div>
                    <div className="text-xs text-muted-foreground">Nửa ngày</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-purple-600">{stat.hourlyLeaves}</div>
                    <div className="text-xs text-muted-foreground">Theo giờ</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Settings Component
const SettingsTab: React.FC = () => {
  const [halfDayOptions, setHalfDayOptions] = useState<HalfDayOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHalfDayOptions();
  }, []);

  const loadHalfDayOptions = async () => {
    try {
      const data = await halfDayOptionsAPI.getAll();
      setHalfDayOptions(data);
    } catch (error) {
      toast.error('Không thể tải cài đặt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLabel = async (id: string, newLabel: string) => {
    try {
      await halfDayOptionsAPI.update(id, newLabel);
      toast.success('Cập nhật thành công');
      loadHalfDayOptions();
    } catch (error) {
      toast.error('Không thể cập nhật');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cài đặt Hệ thống</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt Nửa ngày</CardTitle>
          <CardDescription>
            Tùy chỉnh nhãn cho các loại nghỉ nửa ngày
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {halfDayOptions.map((option) => (
              <div key={option._id} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium">
                  {option.code === 'morning' ? 'Sáng' : 
                   option.code === 'afternoon' ? 'Chiều' : 'Tối'}
                </div>
                <input
                  type="text"
                  defaultValue={option.label}
                  className="flex-1 px-3 py-2 border rounded-md"
                  onBlur={(e) => handleUpdateLabel(option._id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Admin Dashboard
const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const admin = user as any;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Hệ thống Quản lý Nghỉ phép</h1>
                <p className="text-sm text-muted-foreground">Quản trị viên</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{admin?.name}</p>
                <p className="text-xs text-muted-foreground">{admin?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Nhân viên</span>
            </TabsTrigger>
            <TabsTrigger value="leaves" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Đơn xin nghỉ</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Thống kê</span>
            </TabsTrigger>
                         <TabsTrigger value="settings" className="flex items-center space-x-2">
               <SettingsIcon className="h-4 w-4" />
               <span>Cài đặt</span>
             </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="leaves">
            <LeaveManagement />
          </TabsContent>

          <TabsContent value="statistics">
            <Statistics />
          </TabsContent>

                  <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
