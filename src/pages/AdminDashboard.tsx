import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/authStore';
import { employeeAPI, leaveRequestAPI, halfDayOptionsAPI } from '@/services/api';
import { Employee, LeaveRequest, HalfDayOption } from '@/types';
import AttachmentViewer from '@/components/AttachmentViewer';
// Simple chart components - will implement with recharts later
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
  // Calendar as CalendarIcon,
  FileText,
  Search,
  Filter,
  X,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import EmployeeForm from '@/components/EmployeeForm';
import AdminLeaveForm, { AdminLeaveFormRef } from '@/components/AdminLeaveForm';

// Employee Management Component
const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

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

  const handleSave = async (data: any) => {
    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee._id, data);
        toast.success('Cập nhật nhân viên thành công!');
      } else {
        await employeeAPI.create(data);
        toast.success('Thêm nhân viên thành công!');
      }
      setShowForm(false);
      setEditingEmployee(null);
      loadEmployees();
    } catch (error) {
      toast.error('Có lỗi xảy ra!');
      throw error;
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
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

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(emp => emp.department))];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (showForm) {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingEmployee ? 'Chỉnh sửa Nhân viên' : 'Thêm Nhân viên mới'}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setEditingEmployee(null);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <EmployeeForm
          employee={editingEmployee || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingEmployee(null);
          }}
          mode={editingEmployee ? 'edit' : 'create'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Quản lý Nhân viên
          </h2>
          <p className="text-gray-600 mt-1">Quản lý thông tin và trạng thái nhân viên</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, mã nhân viên, email..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Lọc theo phòng ban" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phòng ban</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Tổng nhân viên</p>
                <p className="text-2xl font-bold text-blue-800">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Đang làm việc</p>
                <p className="text-2xl font-bold text-green-800">
                  {employees.filter(emp => emp.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Đã nghỉ việc</p>
                <p className="text-2xl font-bold text-red-800">
                  {employees.filter(emp => emp.status === 'inactive').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Phòng ban</p>
                <p className="text-2xl font-bold text-purple-800">{departments.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card>
        <CardContent className="p-0">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Không tìm thấy nhân viên nào</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Mã NV</TableHead>
                    <TableHead className="min-w-[200px]">Tên nhân viên</TableHead>
                    <TableHead className="w-[150px]">Phòng ban</TableHead>
                    <TableHead className="w-[150px]">Chức vụ</TableHead>
                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                    <TableHead className="w-[120px]">Ngày vào</TableHead>
                    <TableHead className="w-[200px]">Liên hệ</TableHead>
                    <TableHead className="w-[120px] text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {employee.employeeId}
                        </span>
                      </TableCell>
                      <TableCell>
                  <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${employee.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="font-medium">{employee.name}</span>
                  </div>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status === 'active' ? 'Đang làm việc' : 'Đã nghỉ việc'}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(employee.joinDate), 'dd/MM/yyyy', { locale: vi })}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-orange-600" />
                            <span className="truncate max-w-[150px]" title={employee.email}>{employee.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-teal-600" />
                      <span>{employee.phone}</span>
                    </div>
                  </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                                     <Button
                     variant="outline"
                     size="sm"
                            onClick={() => handleEdit(employee)}
                            className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                   >
                     <Edit className="h-4 w-4" />
                   </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(employee._id)}
                            className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
          )}
            </CardContent>
          </Card>
    </div>
  );
};

// Leave Management Component
const LeaveManagement: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const leaveFormRef = useRef<AdminLeaveFormRef>(null);

  useEffect(() => {
    loadLeaveRequests();
    loadEmployees();
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

  const loadEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingLeave) {
        await leaveRequestAPI.update(editingLeave._id, data);
        toast.success('Cập nhật lịch nghỉ thành công!');
        
        // Force refresh form with latest data after successful update
        if (leaveFormRef.current) {
          console.log('Refreshing form after successful update...');
          leaveFormRef.current.forceRefresh();
        }
      } else {
        await leaveRequestAPI.createByAdmin(data);
        toast.success('Thêm lịch nghỉ thành công!');
      }
      setShowForm(false);
      setEditingLeave(null);
      loadLeaveRequests();
    } catch (error) {
      toast.error('Có lỗi xảy ra!');
      throw error;
    }
  };

  const handleEdit = (leaveRequest: LeaveRequest) => {
    setEditingLeave(leaveRequest);
    setShowForm(true);
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedRequest(null);
    setShowDetailModal(false);
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa lịch nghỉ này?')) {
      try {
        await leaveRequestAPI.delete(id);
        toast.success('Xóa lịch nghỉ thành công');
        loadLeaveRequests();
      } catch (error) {
        toast.error('Không thể xóa lịch nghỉ');
      }
    }
  };

  const handleDeleteAttachment = async (leaveRequestId: string, publicId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa tài liệu này?')) {
      try {
        await leaveRequestAPI.deleteAttachment(leaveRequestId, publicId);
        toast.success('Đã xóa tài liệu');
        loadLeaveRequests();
      } catch (error) {
        toast.error('Lỗi khi xóa tài liệu');
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

  const getLeaveTypeText = (leaveType: string, halfDayType?: string) => {
    switch (leaveType) {
      case 'full_day':
        return 'Nghỉ cả ngày';
      case 'half_day':
        return `Nghỉ nửa ngày (${halfDayType === 'morning' ? 'Sáng' : halfDayType === 'afternoon' ? 'Chiều' : 'Tối'})`;
      case 'hourly':
        return 'Nghỉ theo giờ';
      default:
        return 'Nghỉ';
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    return request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           request.department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (showForm) {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingLeave ? 'Chỉnh sửa Lịch nghỉ' : 'Thêm Lịch nghỉ mới'}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setEditingLeave(null);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <AdminLeaveForm
          ref={leaveFormRef}
          leaveRequest={editingLeave || undefined}
          employees={employees}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingLeave(null);
          }}
          mode={editingLeave ? 'edit' : 'create'}
          onFormRefresh={() => {
            console.log('Form refresh requested, reloading leave requests...');
            loadLeaveRequests();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Quản lý Đơn xin nghỉ
          </h2>
          <p className="text-gray-600 mt-1">Duyệt và quản lý đơn xin nghỉ của nhân viên</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm lịch nghỉ
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên nhân viên, phòng ban..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Tất cả ({leaveRequests.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            Chờ duyệt ({leaveRequests.filter(r => r.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('approved')}
            className={filter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Đã duyệt ({leaveRequests.filter(r => r.status === 'approved').length})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Tổng đơn</p>
                <p className="text-2xl font-bold text-blue-800">{leaveRequests.length}</p>
                  </div>
              <FileText className="h-8 w-8 text-blue-600" />
                    </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {leaveRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-800">
                  {leaveRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Từ chối</p>
                <p className="text-2xl font-bold text-red-800">
                  {leaveRequests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Không tìm thấy đơn xin nghỉ nào</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Nhân viên</TableHead>
                    <TableHead className="w-[120px]">Phòng ban</TableHead>
                    <TableHead className="w-[120px]">Loại nghỉ</TableHead>
                    <TableHead className="w-[150px]">Thời gian</TableHead>
                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                    <TableHead className="w-[200px]">Lý do</TableHead>
                    <TableHead className="w-[100px]">Tài liệu</TableHead>
                    <TableHead className="w-[200px] text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request._id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{request.employeeName}</div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {request.department}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getLeaveTypeText(request.leaveType, request.halfDayType)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>Từ: {format(new Date(request.startDate), 'dd/MM/yyyy', { locale: vi })}</div>
                          <div>Đến: {format(new Date(request.endDate), 'dd/MM/yyyy', { locale: vi })}</div>
                          {request.startTime && request.endTime && (
                            <div className="text-xs text-muted-foreground">
                              {request.startTime} - {request.endTime}
                      </div>
                    )}
                  </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[180px]">
                          <div className="text-sm truncate" title={request.reason || 'Không có lý do'}>
                            {request.reason || 'Không có lý do'}
                </div>
                          {request.rejectionReason && (
                            <div className="text-xs text-red-600 mt-1 truncate" title={request.rejectionReason}>
                              Lý do từ chối: {request.rejectionReason}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.attachments && request.attachments.length > 0 ? (
                          <button 
                            onClick={() => handleViewDetails(request)}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            {request.attachments.length} tài liệu
                          </button>
                        ) : (
                          <div className="text-sm text-muted-foreground">Không có</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                            className="h-8 w-8 p-0 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                {request.status === 'pending' && (
                            <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request._id)}
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                                title="Duyệt"
                    >
                                <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(request._id)}
                                className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                                title="Từ chối"
                    >
                                <XCircle className="h-4 w-4" />
                    </Button>
                            </>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(request)}
                            className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                            title="Sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(request._id)}
                            className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
              </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
            </CardContent>
          </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Chi tiết đơn xin nghỉ - {selectedRequest.employeeName}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseDetailModal}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </Button>
      </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nhân viên</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedRequest.employeeName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phòng ban</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedRequest.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Loại nghỉ</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {getLeaveTypeText(selectedRequest.leaveType, selectedRequest.halfDayType)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Trạng thái</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ngày bắt đầu</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {format(new Date(selectedRequest.startDate), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ngày kết thúc</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {format(new Date(selectedRequest.endDate), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                  {selectedRequest.startTime && selectedRequest.endTime && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Thời gian</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedRequest.startTime} - {selectedRequest.endTime}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ngày tạo</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {format(new Date(selectedRequest.createdAt || selectedRequest.startDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {selectedRequest.reason && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Lý do nghỉ phép</label>
                  <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                    {selectedRequest.reason}
                  </p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedRequest.rejectionReason && (
                <div>
                  <label className="text-sm font-medium text-red-600">Lý do từ chối</label>
                  <p className="text-sm text-red-800 mt-1 p-3 bg-red-50 rounded-lg border border-red-200">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}

              {/* Attachments */}
              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Tài liệu đính kèm</label>
                  <div className="mt-2">
                    <AttachmentViewer 
                      attachments={selectedRequest.attachments} 
                      canDelete={true}
                      onDelete={(publicId) => handleDeleteAttachment(selectedRequest._id, publicId)}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleApprove(selectedRequest._id);
                        handleCloseDetailModal();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Duyệt đơn
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleReject(selectedRequest._id);
                        handleCloseDetailModal();
                      }}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Từ chối
                    </Button>
                  </>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleEdit(selectedRequest);
                    handleCloseDetailModal();
                  }}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleDelete(selectedRequest._id);
                    handleCloseDetailModal();
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa đơn
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Statistics Component
const Statistics: React.FC = () => {
  const [statistics, setStatistics] = useState<any[]>([]);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadStatistics();
  }, [period, selectedYear, selectedMonth]);

  const loadStatistics = async () => {
    try {
      let value;
      if (period === 'month') {
        value = selectedYear * 100 + selectedMonth;
      } else if (period === 'quarter') {
        value = selectedYear * 10 + Math.ceil(selectedMonth / 3);
      } else {
        value = selectedYear;
      }
      const data = await leaveRequestAPI.getStatistics(period, value);
      setStatistics(data);
    } catch (error) {
      toast.error('Không thể tải thống kê');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Thống kê Nghỉ phép
          </h2>
          <p className="text-gray-600 mt-1">Xem tổng quan số ngày nghỉ của nhân viên</p>
        </div>
        
        {/* Period Selection */}
        <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex space-x-2">
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('month')}
              className={period === 'month' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            Tháng
          </Button>
          <Button
            variant={period === 'quarter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('quarter')}
              className={period === 'quarter' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            Quý
          </Button>
          <Button
            variant={period === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('year')}
              className={period === 'year' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            Năm
          </Button>
          </div>
          
          {/* Year and Month Selection */}
          <div className="flex gap-2">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {period === 'month' && (
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString()}>
                      {format(new Date(2024, month - 1), 'MMMM', { locale: vi })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-blue-600">Tổng nhân viên</p>
                <p className="text-2xl font-bold text-blue-800">
                  {statistics.length}
                </p>
                  </div>
              <Users className="h-8 w-8 text-blue-600" />
                  </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-green-600">Tổng ngày nghỉ</p>
                <p className="text-2xl font-bold text-green-800">
                  {statistics.reduce((sum, stat) => sum + (stat.totalDays || 0), 0)}
                </p>
                  </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-orange-600">Nghỉ cả ngày</p>
                <p className="text-2xl font-bold text-orange-800">
                  {statistics.reduce((sum, stat) => sum + (stat.fullDays || 0), 0)}
                </p>
                  </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-purple-600">Nghỉ nửa ngày</p>
                <p className="text-2xl font-bold text-purple-800">
                  {statistics.reduce((sum, stat) => sum + (stat.halfDays || 0), 0)}
                </p>
                  </div>
              <Clock className="h-8 w-8 text-purple-600" />
                </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Leave Types Distribution */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-800">Phân bố loại nghỉ phép</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Cả ngày</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.max(1, (statistics.reduce((sum, stat) => sum + (stat.fullDays || 0), 0) / Math.max(1, statistics.reduce((sum, stat) => sum + (stat.totalDays || 0), 0))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {statistics.reduce((sum, stat) => sum + (stat.fullDays || 0), 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Nửa ngày</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.max(1, (statistics.reduce((sum, stat) => sum + (stat.halfDays || 0), 0) / Math.max(1, statistics.reduce((sum, stat) => sum + (stat.totalDays || 0), 0))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {statistics.reduce((sum, stat) => sum + (stat.halfDays || 0), 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Theo giờ</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.max(1, (statistics.reduce((sum, stat) => sum + (stat.hourlyLeaves || 0), 0) / Math.max(1, statistics.reduce((sum, stat) => sum + (stat.totalDays || 0), 0))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-purple-600">
                        {statistics.reduce((sum, stat) => sum + (stat.hourlyLeaves || 0), 0)}
                      </span>
                    </div>
                  </div>
                </>
              )}
              </div>
            </CardContent>
          </Card>

        {/* Pie Chart - Department Distribution */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-800">Phân bố theo phòng ban</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
                             {(() => {
                 const deptStats = statistics.reduce((acc, stat) => {
                   if (stat.department) {
                     acc[stat.department] = (acc[stat.department] || 0) + (stat.totalDays || 0);
                   }
                   return acc;
                 }, {} as Record<string, number>);
                 
                 const totalDeptDays = Object.values(deptStats).reduce((sum, days) => (sum as number) + (days as number), 0);
                 
                 return Object.entries(deptStats).map(([dept, days]) => (
                   <div key={dept} className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-600">{dept}</span>
                     <div className="flex items-center space-x-2">
                       <div className="w-20 bg-gray-200 rounded-full h-2">
                         <div 
                           className="bg-green-500 h-2 rounded-full" 
                           style={{ width: `${Math.max(1, ((days as number) / Math.max(1, totalDeptDays as number)) * 100)}%` }}
                         ></div>
                       </div>
                       <span className="text-sm font-medium text-green-600">{days as number}</span>
                     </div>
                   </div>
                 ));
               })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Chi tiết thống kê nhân viên</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {statistics.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Không có dữ liệu thống kê</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Nhân viên</TableHead>
                    <TableHead className="w-[150px]">Phòng ban</TableHead>
                    <TableHead className="w-[100px] text-center">Cả ngày</TableHead>
                    <TableHead className="w-[100px] text-center">Nửa ngày</TableHead>
                    <TableHead className="w-[100px] text-center">Theo giờ</TableHead>
                    <TableHead className="w-[100px] text-center">Tổng giờ</TableHead>
                    <TableHead className="w-[120px] text-center">Tổng ngày</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.map((stat) => (
                    <TableRow key={stat.employeeId} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {stat.employeeName?.charAt(0) || 'N'}
                          </div>
                          <div>
                            <div className="font-medium">{stat.employeeName}</div>
                            <div className="text-xs text-muted-foreground">{stat.employeeId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {stat.department}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-blue-600">{stat.fullDays || 0}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-green-600">{stat.halfDays || 0}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-purple-600">{stat.hourlyLeaves || 0}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-orange-600">{stat.totalHours || 0}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-lg font-bold text-purple-600">{stat.totalDays || 0}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
      </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Settings Component
const SettingsTab: React.FC = () => {
  const [halfDayOptions, setHalfDayOptions] = useState<HalfDayOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

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
      setEditingOption(null);
      setEditValue('');
      loadHalfDayOptions();
    } catch (error) {
      toast.error('Không thể cập nhật');
    }
  };

  const handleEdit = (option: HalfDayOption) => {
    setEditingOption(option._id);
    setEditValue(option.label);
  };

  const handleSave = (id: string) => {
    if (editValue.trim()) {
      handleUpdateLabel(id, editValue.trim());
    }
  };

  const handleCancel = () => {
    setEditingOption(null);
    setEditValue('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Cài đặt Hệ thống
        </h2>
        <p className="text-gray-600 mt-1">Tùy chỉnh cài đặt và cấu hình hệ thống</p>
      </div>
      
      {/* Half Day Options */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Cài đặt Nửa ngày</span>
          </CardTitle>
          <CardDescription className="text-indigo-100">
            Tùy chỉnh nhãn cho các loại nghỉ nửa ngày
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {halfDayOptions.map((option) => (
              <div key={option._id} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                <div className="w-24 text-sm font-medium text-indigo-700">
                  {option.code === 'morning' ? '🌅 Sáng' : 
                   option.code === 'afternoon' ? '☀️ Chiều' : '🌙 Tối'}
                </div>
                
                {editingOption === option._id ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      value={editValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                      className="flex-1 border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Nhập nhãn mới..."
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(option._id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Lưu
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Hủy
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-gray-700">{option.label}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(option)}
                      className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Thông tin Hệ thống</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Phiên bản</p>
              <p className="text-lg font-semibold text-gray-800">v1.0.0</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Trạng thái</p>
              <p className="text-lg font-semibold text-green-600">Hoạt động</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Cập nhật cuối</p>
              <p className="text-lg font-semibold text-gray-800">
                {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tổng cài đặt</p>
              <p className="text-lg font-semibold text-gray-800">{halfDayOptions.length}</p>
            </div>
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
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Hệ thống Quản lý Nghỉ phép</h1>
                <p className="text-blue-100">Quản trị viên</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-white">
                <p className="text-sm font-medium">{admin?.name}</p>
                <p className="text-xs text-blue-100">{admin?.email}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-white/30 bg-transparent text-white hover:bg-white/20 backdrop-blur-sm"
              >
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
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto p-1 bg-gray-100 rounded-xl">
            <TabsTrigger 
              value="employees" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Nhân viên</span>
            </TabsTrigger>
            <TabsTrigger 
              value="leaves" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 rounded-lg transition-all duration-200"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Đơn xin nghỉ</span>
            </TabsTrigger>
            <TabsTrigger 
              value="statistics" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600 rounded-lg transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Thống kê</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 rounded-lg transition-all duration-200"
            >
               <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Cài đặt</span>
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
