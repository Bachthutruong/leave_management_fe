import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/authStore';
import { employeeAPI, leaveRequestAPI, halfDayOptionsAPI, departmentAPI } from '@/services/api';
import { Employee, LeaveRequest, HalfDayOption, Department } from '@/types';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
// import { format, parseISO } from 'date-fns';
// import { vi } from 'date-fns/locale';
import { formatDate, createLocalDate, calculateDaysBetween, getMonthName, getShortMonthName } from '@/lib/dateUtils';

// Note: Using utility functions to avoid timezone issues when displaying dates
// This fixes the problem where selecting date 17 shows as 16, or 24 shows as 23
import EmployeeForm from '@/components/EmployeeForm';
import AdminLeaveForm, { AdminLeaveFormRef } from '@/components/AdminLeaveForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import PromptDialog from '@/components/PromptDialog';
// import DepartmentForm from '@/components/DepartmentForm';
// import PositionForm from '@/components/PositionForm';
import DepartmentManagement from '@/pages/DepartmentManagement';
import PositionManagement from '@/pages/PositionManagement';

// Employee Management Component
const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (error) {
      toast.error('無法載入員工清單');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentAPI.getActive();
      setDepartments(data);
    } catch (error) {
      toast.error('無法載入部門清單');
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee._id, data);
        toast.success('更新員工成功！');
      } else {
        await employeeAPI.create(data);
        toast.success('新增員工成功！');
      }
      setShowForm(false);
      setEditingEmployee(null);
      loadEmployees();
    } catch (error) {
      toast.error('發生錯誤！');
      throw error;
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      await employeeAPI.delete(employeeToDelete._id);
      toast.success('刪除員工成功');
      loadEmployees();
    } catch (error) {
      toast.error('無法刪除員工');
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Calculate pagination
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDepartment]);

  // const departmentNames = [...new Set(employees.map(emp => emp.department))];

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
            {editingEmployee ? '編輯員工' : '新增員工'}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setEditingEmployee(null);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            返回
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
            員工管理
          </h2>
          <p className="text-gray-600 mt-1">管理員工資訊和狀態</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          新增員工
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜尋姓名、員工編號、電子郵件..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="依部門篩選" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有部門</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-blue-600">總員工數</p>
                <p className="text-lg md:text-2xl font-bold text-blue-800">{employees.length}</p>
              </div>
              <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-green-600">在職中</p>
                <p className="text-lg md:text-2xl font-bold text-green-800">
                  {employees.filter(emp => emp.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-red-600">已離職</p>
                <p className="text-2xl font-bold text-red-800">
                  {employees.filter(emp => emp.status === 'inactive').length}
                </p>
              </div>
              <XCircle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-purple-600">部門</p>
                <p className="text-lg md:text-2xl font-bold text-purple-800">{departments.length}</p>
              </div>
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
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
              <p className="text-gray-500">找不到任何員工</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">員工編號</TableHead>
                    <TableHead className="min-w-[200px]">員工姓名</TableHead>
                    <TableHead className="w-[150px]">部門</TableHead>
                    <TableHead className="w-[150px]">職位</TableHead>
                    <TableHead className="w-[120px]">狀態</TableHead> 
                    <TableHead className="w-[120px]">入職日期</TableHead>
                    <TableHead className="w-[200px]">聯絡方式</TableHead>
                    <TableHead className="w-[120px] text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEmployees.map((employee) => (
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
                          {employee.status === 'active' ? '在職中' : '已離職'}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(employee.joinDate)}</TableCell>
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
                    onClick={() => handleDelete(employee)}
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
              
              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>顯示</span>
                  <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>總共 {totalItems} 位員工</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一頁
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    下一頁
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              </div>
          )}
            </CardContent>
          </Card>

          {/* Confirm Delete Dialog */}
          <ConfirmDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            title="確認刪除員工"
            description={`您確定要刪除員工 "${employeeToDelete?.name}" 嗎？此操作無法撤銷。`}
            onConfirm={confirmDeleteEmployee}
            variant="destructive"
            confirmText="刪除"
            cancelText="取消"
          />
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteAttachmentConfirmOpen, setDeleteAttachmentConfirmOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<LeaveRequest | null>(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState<{leaveRequestId: string, publicId: string, name: string} | null>(null);

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
      toast.error('無法載入請假清單');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('無法載入員工清單:', error);
    }
  };

  const handleSave = async (data: any) => {
    try {
      // Convert MongoDB ObjectId to employeeId (employee code)
      let processedData = { ...data };
      if (data.employeeId) {
        const selectedEmployee = employees.find(emp => emp._id === data.employeeId);
        if (selectedEmployee) {
          processedData.employeeId = selectedEmployee.employeeId; // Convert to employee code (e.g., "EMP001")
          console.log('Converting employeeId from MongoDB ObjectId to employee code:', {
            originalId: data.employeeId,
            employeeCode: selectedEmployee.employeeId,
            employeeName: selectedEmployee.name
          });
        } else {
          console.error('Employee not found with ID:', data.employeeId);
          toast.error('找不到員工');
          return;
        }
      }
      
      if (editingLeave) {
        await leaveRequestAPI.update(editingLeave._id, processedData);
        toast.success('更新請假成功！');
        
        // Force refresh form with latest data after successful update
        if (leaveFormRef.current) {
          console.log('Refreshing form after successful update...');
          leaveFormRef.current.forceRefresh();
        }
      } else {
        console.log('Creating new leave request with data:', processedData);
        await leaveRequestAPI.createByAdmin(processedData);
        toast.success('新增請假成功！');
      }
      setShowForm(false);
      setEditingLeave(null);
      loadLeaveRequests();
    } catch (error) {
      console.error('Error saving leave request:', error);
      toast.error('發生錯誤！');
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
      toast.success('批准請假成功！');
      loadLeaveRequests();
    } catch (error) {
      toast.error('無法批准請假');
    }
  };

  const handleReject = (id: string) => {
    setRequestToReject(id);
    setRejectDialogOpen(true);
  };

  const confirmReject = async (reason: string) => {
    if (!requestToReject) return;
    
    try {
      await leaveRequestAPI.update(requestToReject, { 
        status: 'rejected', 
        rejectionReason: reason 
      });
      toast.success('拒絕請假成功！');
      loadLeaveRequests();
    } catch (error) {
      toast.error('無法拒絕請假');
    } finally {
      setRequestToReject(null);
    }
  };

  const handleDeleteRequest = (request: LeaveRequest) => {
    setRequestToDelete(request);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteRequest = async () => {
    if (!requestToDelete) return;
    
    try {
      await leaveRequestAPI.delete(requestToDelete._id);
      toast.success('刪除請假成功！');
      loadLeaveRequests();
    } catch (error) {
      toast.error('無法刪除請假');
    } finally {
      setRequestToDelete(null);
    }
  };

  const handleDeleteAttachment = (leaveRequestId: string, publicId: string, fileName: string) => {
    setAttachmentToDelete({ leaveRequestId, publicId, name: fileName });
    setDeleteAttachmentConfirmOpen(true);
  };

  const confirmDeleteAttachment = async () => {
    if (!attachmentToDelete) return;
    
    try {
      await leaveRequestAPI.deleteAttachment(attachmentToDelete.leaveRequestId, attachmentToDelete.publicId);
      toast.success('刪除附件成功！');
      loadLeaveRequests();
    } catch (error) {
      toast.error('無法刪除附件');
    } finally {
      setAttachmentToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          待批准
        </span>;
      case 'approved':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          已批准
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          已拒絕
        </span>;
      default:
        return null;
    }
  };

  const getLeaveTypeText = (leaveType: string, halfDayType?: string) => {
    switch (leaveType) {
      case 'full_day':
        return '全薪假';
      case 'half_day':
        return `半薪假 (${halfDayType === 'morning' ? '上午' : halfDayType === 'afternoon' ? '下午' : '晚上'})`;
      case 'hourly':
        return '按時計薪';
      default:
        return '請假';
    }
  };

  // Filter and pagination logic
  const filteredRequests = leaveRequests.filter(request => {
    return request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           request.department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate pagination
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

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
            {editingLeave ? '編輯請假' : '新增請假'}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setEditingLeave(null);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            返回
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
            管理請假申請
          </h2>
          <p className="text-gray-600 mt-1">批准和監控員工的請假申請</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          新增請假
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜尋員工姓名、部門..."
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
            全部 ({leaveRequests.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            待批准 ({leaveRequests.filter(r => r.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('approved')}
            className={filter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            已批准 ({leaveRequests.filter(r => r.status === 'approved').length})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-blue-600">總請假</p>
                <p className="text-lg md:text-2xl font-bold text-blue-800">{leaveRequests.length}</p>
              </div>
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-yellow-600">待批准</p>
                <p className="text-lg md:text-2xl font-bold text-yellow-800">
                  {leaveRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-green-600">已批准</p>
                <p className="text-lg md:text-2xl font-bold text-green-800">
                  {leaveRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-red-600">已拒絕</p>
                <p className="text-lg md:text-2xl font-bold text-red-800">
                  {leaveRequests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
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
              <p className="text-gray-500">找不到請假申請</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">員工</TableHead>
                      <TableHead className="w-[120px]">部門</TableHead>
                      <TableHead className="w-[120px]">請假類型</TableHead>
                      <TableHead className="w-[150px]">時間</TableHead>
                      <TableHead className="w-[120px]">狀態</TableHead> 
                      <TableHead className="w-[200px]">原因</TableHead>
                      <TableHead className="w-[100px]">附件</TableHead>
                      <TableHead className="w-[200px] text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRequests.map((request) => (
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
                            <div>From: {formatDate(request.startDate)}</div>
                            <div>To: {formatDate(request.endDate)}</div>
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
                            <div className="text-sm truncate" title={request.reason || 'No reason'}>
                              {request.reason || 'No reason'}
                </div>
                            {request.rejectionReason && (
                              <div className="text-xs text-red-600 mt-1 truncate" title={request.rejectionReason}>
                                拒絕原因:  {request.rejectionReason} 
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
                              {request.attachments.length} 附件
                            </button>
                          ) : (
                            <div className="text-sm text-muted-foreground">沒有</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(request)}
                              className="h-8 w-8 p-0 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              title="查看詳情"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                {request.status === 'pending' && (
                            <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request._id)}
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                                title="批准"
                    >
                                <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(request._id)}
                                className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                                title="拒絕"
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
                            title="編輯"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRequest(request)}
                            className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                            title="刪除"
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

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>顯示</span>
                  <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>總共 {totalItems} 筆</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一頁
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    下一頁
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
            </CardContent>
          </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                請假詳情 - {selectedRequest.employeeName}
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
                    <label className="text-sm font-medium text-gray-600">員工</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedRequest.employeeName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">部門</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedRequest.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">請假類型</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {getLeaveTypeText(selectedRequest.leaveType, selectedRequest.halfDayType)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">狀態</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">開始日期</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDate(selectedRequest.startDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">結束日期</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDate(selectedRequest.endDate)}
                    </p>
                  </div>
                  {selectedRequest.startTime && selectedRequest.endTime && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">時間</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedRequest.startTime} - {selectedRequest.endTime}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">創建日期</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDate(selectedRequest.createdAt || selectedRequest.startDate, 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {selectedRequest.reason && (
                <div>
                  <label className="text-sm font-medium text-gray-600">請假原因</label>
                  <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">  
                    {selectedRequest.reason}
                  </p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedRequest.rejectionReason && (
                <div>
                  <label className="text-sm font-medium text-red-600">拒絕原因</label>
                  <p className="text-sm text-red-800 mt-1 p-3 bg-red-50 rounded-lg border border-red-200">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}

              {/* Attachments */}
              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">附件</label>
                  <div className="mt-2">
                    <AttachmentViewer 
                      attachments={selectedRequest.attachments} 
                      canDelete={true}
                      onDelete={(publicId, fileName) => handleDeleteAttachment(selectedRequest._id, publicId, fileName)}
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
                      批准
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
                      拒絕
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
                  編輯
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleDeleteRequest(selectedRequest);
                    handleCloseDetailModal();
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  刪除
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <PromptDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="拒絕請假申請"
        description="請輸入拒絕原因:"
        placeholder="請輸入拒絕原因..."
        onConfirm={confirmReject}
        confirmText="拒絕"
        cancelText="取消"
        multiline={true}
        required={true}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="確認刪除請假申請"
        description={`確認刪除請假申請 "${requestToDelete?.employeeName}" 嗎? 此操作無法撤銷.`}
        onConfirm={confirmDeleteRequest}
        variant="destructive"
        confirmText="刪除"
        cancelText="取消"
      />

      <ConfirmDialog
        open={deleteAttachmentConfirmOpen}
        onOpenChange={setDeleteAttachmentConfirmOpen}
        title="確認刪除附件"
        description={`確認刪除附件 "${attachmentToDelete?.name}" 嗎? 此操作無法撤銮.`}
        onConfirm={confirmDeleteAttachment}
        variant="destructive"
        confirmText="刪除"
        cancelText="取消"
      />
    </div>
  );
};

// Statistics Component
const Statistics: React.FC = () => {
  const [statistics, setStatistics] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Pagination state for detailed statistics
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Dialog state for detailed view
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  useEffect(() => {
    loadStatistics();
  }, [period, selectedYear, selectedMonth]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      
      // Load all leave requests first
      const allRequests = await leaveRequestAPI.getAll();
      setLeaveRequests(allRequests);
      
      // Generate statistics from leave requests
      const stats = generateStatisticsFromRequests(allRequests, period, selectedYear, selectedMonth);
      setStatistics(stats);
      
      console.log('Generated statistics:', stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('無法載入統計');
      
      // Set demo data for testing
      const demoStats = [
        {
          employeeId: 'EMP001',
          employeeName: 'Nguyễn Văn An',
          department: 'IT',
          totalDays: 2.5,
          fullDays: 2,
          halfDays: 0.5,
          hourlyLeaves: 0,
          status: 'approved'
        },
        {
          employeeId: 'EMP002',
          employeeName: 'Trần Thị Bình',
          department: 'HR',
          totalDays: 1,
          fullDays: 1,
          halfDays: 0,
          hourlyLeaves: 0,
          status: 'pending'
        }
      ];
      setStatistics(demoStats);
    } finally {
      setIsLoading(false);
    }
  };

  const generateStatisticsFromRequests = (requests: LeaveRequest[], period: string, year: number, month: number) => {
    // const stats: any[] = [];
    const employeeStats = new Map<string, any>();

    requests.forEach(request => {
      // Filter by period if needed
      const requestDate = createLocalDate(request.startDate);
      const requestYear = requestDate.getFullYear();
      const requestMonth = requestDate.getMonth() + 1;
      
      let shouldInclude = false;
      if (period === 'month') {
        shouldInclude = requestYear === year && requestMonth === month;
      } else if (period === 'quarter') {
        const quarterStart = Math.ceil(month / 3) * 3 - 2;
        shouldInclude = requestYear === year && requestMonth >= quarterStart && requestMonth < quarterStart + 3;
      } else if (period === 'year') {
        shouldInclude = requestYear === year;
      }

      if (shouldInclude || period === 'all') {
        const key = request.employeeId;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, {
            employeeId: request.employeeId,
            employeeName: request.employeeName,
            department: request.department,
            totalDays: 0,
            fullDays: 0,
            halfDays: 0,
            hourlyLeaves: 0,
            status: request.status
          });
        }

        const stat = employeeStats.get(key);
        
        // Calculate days based on leave type
        if (request.leaveType === 'full_day') {
          const days = calculateDaysBetween(request.startDate, request.endDate);
          stat.fullDays += days;
          stat.totalDays += days;
        } else if (request.leaveType === 'half_day') {
          stat.halfDays += 0.5;
          stat.totalDays += 0.5;
        } else if (request.leaveType === 'hourly') {
          stat.hourlyLeaves += 1;
          stat.totalDays += 0.125; // 1 hour = 0.125 days (1/8)
        }
      }
    });

    return Array.from(employeeStats.values());
  };

  // Handle detailed view dialog
  const handleViewDetails = (employee: any) => {
    setSelectedEmployee(employee);
    setShowDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setSelectedEmployee(null);
    setShowDetailDialog(false);
  };

  // Calculate pagination for detailed statistics
  const employeeStats = (() => {
    const employeeStatsMap = new Map<string, any>();
    
    leaveRequests.forEach(request => {
      const key = request.employeeId;
      if (!employeeStatsMap.has(key)) {
        employeeStatsMap.set(key, {
          employeeId: request.employeeId,
          employeeName: request.employeeName,
          department: request.department,
          fullDays: 0,
          halfDays: 0,
          hourlyLeaves: 0,
          totalDays: 0,
          status: request.status,
          leaveDetails: []
        });
      }
      
      const stat = employeeStatsMap.get(key);
      
      // Add leave details
      stat.leaveDetails.push({
        startDate: request.startDate,
        endDate: request.endDate,
        leaveType: request.leaveType,
        halfDayType: request.halfDayType,
        status: request.status,
        reason: request.reason
      });
      
      if (request.leaveType === 'full_day') {
        const days = calculateDaysBetween(request.startDate, request.endDate);
        stat.fullDays += days;
        stat.totalDays += days;
      } else if (request.leaveType === 'half_day') {
        stat.halfDays += 0.5;
        stat.totalDays += 0.5;
      } else if (request.leaveType === 'hourly') {
        stat.hourlyLeaves += 1;
        stat.totalDays += 0.125;
      }
    });
    
    return Array.from(employeeStatsMap.values());
  })();

  const totalItems = employeeStats.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployeeStats = employeeStats.slice(startIndex, endIndex);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

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
            統計請假
          </h2>
          <p className="text-gray-600 mt-1">查看員工請假總天數</p>
        </div>
        
        {/* Period Selection */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={period === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('month')}
              className={`text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 ${period === 'month' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
              月份
            </Button>
            <Button
              variant={period === 'quarter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('quarter')}
              className={`text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 ${period === 'quarter' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
              季度
            </Button>
            <Button
              variant={period === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('year')}
              className={`text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 ${period === 'year' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
              年份
            </Button>
          </div>
          
          {/* Year and Month Selection */}
          <div className="flex flex-wrap gap-2">
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => {
                setSelectedYear(parseInt(value));
                // Reset month when year changes
                if (period === 'month') {
                  setSelectedMonth(1);
                }
              }}
            >
              <SelectTrigger className="w-20 md:w-24 text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {period === 'month' && (
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-28 md:w-32 text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthName(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Employee Statistics - Moved to top */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>詳細統計員工</span>
          </CardTitle>
          <CardDescription className="text-blue-100">
            查看每個員工的請假詳情
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {leaveRequests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">沒有統計數據</p>  
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">員工</TableHead>
                    <TableHead className="w-[150px]">部門</TableHead>
                    <TableHead className="w-[100px] text-center">全薪假</TableHead>
                    <TableHead className="w-[100px] text-center">半薪假</TableHead> 
                    <TableHead className="w-[100px] text-center">小時假</TableHead>
                    <TableHead className="w-[100px] text-center">狀態</TableHead>
                    <TableHead className="w-[120px] text-center">總天數</TableHead>
                    <TableHead className="w-[200px] text-center">請假詳情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEmployeeStats.map((stat) => (
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
                        <span className="text-sm font-medium text-blue-600">{stat.fullDays.toFixed(1)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-green-600">{stat.halfDays.toFixed(1)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-purple-600">{stat.hourlyLeaves}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          stat.status === 'approved' ? 'bg-green-100 text-green-800' :
                          stat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {stat.status === 'approved' ? '已批准' :
                           stat.status === 'pending' ? '待批准' : '已拒絕'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-lg font-bold text-purple-600">{stat.totalDays.toFixed(1)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {stat.leaveDetails.slice(0, 3).map((detail: any, index: number) => (
                            <div key={index} className="text-xs bg-gray-50 p-1 rounded border">
                              <div className="font-medium">
                                {formatDate(detail.startDate)} - {formatDate(detail.endDate)}
                              </div>
                              <div className="text-gray-600">
                                {detail.leaveType === 'full_day' ? '全薪假' : 
                                 detail.leaveType === 'half_day' ? `半薪假 (${detail.halfDayType === 'morning' ? '上午' : '下午'})` : 
                                 '小時假'}
                              </div>
                              <div className="text-gray-500 truncate" title={detail.reason}>
                                {detail.reason || '沒有理由'}
                              </div>
                            </div>
                          ))}
                          {stat.leaveDetails.length > 3 && (
                            <div className="text-xs text-blue-600 font-medium">
                              +{stat.leaveDetails.length - 3} 其他請假
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(stat)}
                            className="mt-2 w-full text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            查看詳情
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>顯示</span>
                  <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>總共 {totalItems} 員工</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一頁
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    下一頁
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Employee View Dialog */}
      {showDetailDialog && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                請假詳情 - {selectedEmployee.employeeName}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseDetailDialog}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-600">員工</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedEmployee.employeeName}</p>
                  <p className="text-sm text-gray-500">{selectedEmployee.employeeId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">部門</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedEmployee.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">總天數</label>
                  <p className="text-2xl font-bold text-purple-600">{selectedEmployee.totalDays.toFixed(1)} ngày</p>
                </div>
              </div>

              {/* Leave Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">全薪假</p>
                      <p className="text-2xl font-bold text-blue-800">{selectedEmployee.fullDays.toFixed(1)}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">半薪假</p>
                      <p className="text-2xl font-bold text-green-800">{selectedEmployee.halfDays.toFixed(1)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">小時假</p>
                      <p className="text-2xl font-bold text-purple-800">{selectedEmployee.hourlyLeaves}</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">總請假</p>
                      <p className="text-2xl font-bold text-orange-800">{selectedEmployee.leaveDetails.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* All Leave Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">所有請假</h4>
                <div className="space-y-3">
                  {selectedEmployee.leaveDetails.map((detail: any, index: number) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-semibold text-gray-900">
                              {formatDate(detail.startDate)} - {formatDate(detail.endDate)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              detail.status === 'approved' ? 'bg-green-100 text-green-800' :
                              detail.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {detail.status === 'approved' ? '已批准' :
                               detail.status === 'pending' ? '待批准' : '已拒絕'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">請假類型</label>  
                              <p className="text-sm text-gray-900">
                                {detail.leaveType === 'full_day' ? '全薪假' : 
                                 detail.leaveType === 'half_day' ? `半薪假 (${detail.halfDayType === 'morning' ? '上午' : '下午'})` : 
                                 '小時假'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">理由</label>
                              <p className="text-sm text-gray-900">{detail.reason || '沒有理由'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-blue-600">總員工</p>
                <p className="text-lg md:text-2xl font-bold text-blue-800">
                  {statistics.length}
                </p>
              </div>
              <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-green-600">總天數</p>
                <p className="text-lg md:text-2xl font-bold text-green-800">
                  {statistics.reduce((sum, stat) => sum + (stat.totalDays || 0), 0)}
                </p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-orange-600">全薪假</p>
                <p className="text-lg md:text-2xl font-bold text-orange-800">
                  {statistics.reduce((sum, stat) => sum + (stat.fullDays || 0), 0)}
                </p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-purple-600">半薪假</p>
                <p className="text-lg md:text-2xl font-bold text-purple-800">
                  {statistics.reduce((sum, stat) => sum + (stat.halfDays || 0), 0)}
                </p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Bar Chart - Leave Types Distribution */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-semibold text-blue-800 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">請假類型分布</span>
              <span className="sm:hidden">請假類型</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 md:space-y-4">
              {statistics.length > 0 ? (
                <>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-gray-600">全薪假</span>
                      <span className="text-xs md:text-sm font-medium text-blue-600">
                        {statistics.reduce((sum, stat) => sum + (stat.fullDays || 0), 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 md:h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ 
                          width: `${Math.max(1, (statistics.reduce((sum, stat) => sum + (stat.fullDays || 0), 0) / Math.max(1, statistics.reduce((sum, stat) => sum + (stat.totalDays || 0), 0))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-gray-600">半薪假</span>
                      <span className="text-xs md:text-sm font-medium text-green-600">
                        {statistics.reduce((sum, stat) => sum + (stat.halfDays || 0), 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 md:h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ 
                          width: `${Math.max(1, (statistics.reduce((sum, stat) => sum + (stat.halfDays || 0), 0) / Math.max(1, statistics.reduce((sum, stat) => sum + (stat.totalDays || 0), 0))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-gray-600">小時假</span>
                      <span className="text-xs md:text-sm font-medium text-purple-600">
                        {statistics.reduce((sum, stat) => sum + (stat.hourlyLeaves || 0), 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 md:h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ 
                          width: `${Math.max(1, (statistics.reduce((sum, stat) => sum + (stat.hourlyLeaves || 0), 0) / Math.max(1, statistics.reduce((sum, stat) => sum + (stat.totalDays || 0), 0))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 md:py-8 text-gray-500">
                  <BarChart3 className="mx-auto h-8 w-8 md:h-12 md:w-12 mb-3 md:mb-4 opacity-50" />
                  <p className="text-sm md:text-base">沒有數據顯示</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Department Distribution */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-semibold text-green-800 flex items-center gap-2">
              <Building2 className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">部門分布</span>
              <span className="sm:hidden">部門</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 md:space-y-4">
              {(() => {
                const deptStats = statistics.reduce((acc, stat) => {
                  if (stat.department) {
                    acc[stat.department] = (acc[stat.department] || 0) + (stat.totalDays || 0);
                  }
                  return acc;
                }, {} as Record<string, number>);
                
                const totalDeptDays = Object.values(deptStats).reduce((sum, days) => (sum as number) + (days as number), 0);
                
                if (Object.keys(deptStats).length === 0) {
                  return (
                    <div className="text-center py-6 md:py-8 text-gray-500">
                      <Building2 className="mx-auto h-8 w-8 md:h-12 md:w-12 mb-3 md:mb-4 opacity-50" />
                      <p className="text-sm md:text-base">沒有部門數據</p>
                    </div>
                  );
                }
                
                return Object.entries(deptStats).map(([dept, days]) => (
                  <div key={dept} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-gray-600 truncate max-w-[100px] md:max-w-none">{dept}</span>
                      <span className="text-xs md:text-sm font-medium text-green-600">{days as number}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 md:h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${Math.max(1, ((days as number) / Math.max(1, totalDeptDays as number)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Trend Chart */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-semibold text-orange-800 flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">請假趨勢</span>
              <span className="sm:hidden">請假趨勢</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 md:space-y-4">
              {statistics.length > 0 ? (
                <div className="h-32 md:h-48 flex items-end justify-center space-x-1 md:space-x-2">
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    
                    // Calculate total days for this month based on actual leave requests
                    let monthTotalDays = 0;
                    
                    // Filter leave requests for this specific month
                    const monthRequests = leaveRequests.filter(request => {
                      const requestDate = createLocalDate(request.startDate);
                      return requestDate.getFullYear() === selectedYear && requestDate.getMonth() + 1 === month;
                    });
                    
                    // Calculate total days for this month
                    monthRequests.forEach(request => {
                      if (request.leaveType === 'full_day') {
                        const days = calculateDaysBetween(request.startDate, request.endDate);
                        monthTotalDays += days;
                      } else if (request.leaveType === 'half_day') {
                        monthTotalDays += 0.5;
                      } else if (request.leaveType === 'hourly') {
                        monthTotalDays += 0.125; // 1 hour = 0.125 days
                      }
                    });
                    
                    // If no data for this month, show a small value for visual appeal
                    if (monthTotalDays === 0) {
                      monthTotalDays = 0.1;
                    }
                    
                    const maxDays = Math.max(1, Math.max(...Array.from({ length: 12 }, (_, m) => {
                      const monthRequests = leaveRequests.filter(request => {
                        const requestDate = createLocalDate(request.startDate);
                        return requestDate.getFullYear() === selectedYear && requestDate.getMonth() + 1 === m + 1;
                      });
                      
                      let totalDays = 0;
                      monthRequests.forEach(request => {
                        if (request.leaveType === 'full_day') {
                          const days = calculateDaysBetween(request.startDate, request.endDate);
                          totalDays += days;
                        } else if (request.leaveType === 'half_day') {
                          totalDays += 0.5;
                        } else if (request.leaveType === 'hourly') {
                          totalDays += 0.125;
                        }
                      });
                      return totalDays;
                    })));
                    
                    const height = Math.max((monthTotalDays / maxDays) * 100, 2);
                    
                    return (
                      <div key={month} className="flex flex-col items-center space-y-1">
                        <div 
                          className="w-4 md:w-6 bg-gradient-to-t from-orange-500 to-red-500 rounded-t transition-all duration-500 ease-out"
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-[10px] md:text-xs text-gray-600 font-medium">
                          {getShortMonthName(month)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8 text-gray-500">
                  <Calendar className="mx-auto h-8 w-8 md:h-12 md:w-12 mb-3 md:mb-4 opacity-50" />
                  <p className="text-sm md:text-base">沒有數據顯示</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employee Performance Chart */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-semibold text-indigo-800 flex items-center gap-2">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Top 員工請假</span>
              <span className="sm:hidden">Top 員工</span>
            </CardTitle>
          </CardHeader> 
          <CardContent className="pt-0">
            <div className="space-y-2 md:space-y-3">
              {statistics.length > 0 ? (
                statistics
                  .sort((a, b) => (b.totalDays || 0) - (a.totalDays || 0))
                  .slice(0, 5)
                  .map((stat, index) => (
                    <div key={stat.employeeId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-white text-[10px] md:text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-xs md:text-sm font-medium text-gray-700 truncate max-w-[80px] md:max-w-[120px]">
                          {stat.employeeName}
                        </span>
                      </div>
                      <span className="text-xs md:text-sm font-bold text-indigo-600">
                        {stat.totalDays || 0} 天
                      </span>
                    </div>
                  ))
              ) : (
                <div className="text-center py-6 md:py-8 text-gray-500">
                  <Users className="mx-auto h-8 w-8 md:h-12 md:w-12 mb-3 md:mb-4 opacity-50" />
                  <p className="text-sm md:text-base">沒有數據顯示</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Chart - Leave Summary by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Department Leave Summary */}
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-semibold text-teal-800 flex items-center gap-2">
              <Building2 className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">部門請假總覽</span>
              <span className="sm:hidden">部門</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 md:space-y-4">
              {(() => {
                const deptStats = leaveRequests.reduce((acc, request) => {
                  if (request.department) {
                    if (!acc[request.department]) {
                      acc[request.department] = {
                        totalDays: 0,
                        fullDays: 0,
                        halfDays: 0,
                        hourlyLeaves: 0,
                        employeeCount: new Set()
                      };
                    }
                    
                    // Add employee to set for unique count
                    acc[request.department].employeeCount.add(request.employeeId);
                    
                    // Calculate days based on leave type
                    if (request.leaveType === 'full_day') {
                      const days = calculateDaysBetween(request.startDate, request.endDate);
                      acc[request.department].fullDays += days;
                      acc[request.department].totalDays += days;
                    } else if (request.leaveType === 'half_day') {
                      acc[request.department].halfDays += 0.5;
                      acc[request.department].totalDays += 0.5;
                    } else if (request.leaveType === 'hourly') {
                      acc[request.department].hourlyLeaves += 1;
                      acc[request.department].totalDays += 0.125;
                    }
                  }
                  return acc;
                }, {} as Record<string, any>);
                
                if (Object.keys(deptStats).length === 0) {
                  return (
                    <div className="text-center py-6 md:py-8 text-gray-500">
                      <Building2 className="mx-auto h-8 w-8 md:h-12 md:w-12 mb-3 md:mb-4 opacity-50" />
                      <p className="text-sm md:text-base">沒有部門數據</p>
                    </div>  
                  );
                }
                
                return Object.entries(deptStats).map(([dept, data]) => {
                  const deptData = data as {
                    totalDays: number;
                    fullDays: number;
                    halfDays: number;
                    hourlyLeaves: number;
                    employeeCount: Set<string>;
                  };
                  
                  return (
                    <div key={dept} className="p-3 bg-white rounded-lg border border-teal-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-teal-800">{dept}</span>
                        <span className="text-xs text-teal-600">{deptData.employeeCount.size} 員工</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">全薪假:</span>
                          <span className="font-medium text-blue-600">{deptData.fullDays.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">半薪假:</span>
                          <span className="font-medium text-green-600">{deptData.halfDays.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">小時假:</span>
                          <span className="font-medium text-purple-600">{deptData.hourlyLeaves}</span>
                        </div>
                        <div className="border-t border-teal-100 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">總共:</span>
                            <span className="text-lg font-bold text-teal-600">{deptData.totalDays.toFixed(1)} 天</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>

                {/* Leave Status Distribution */}
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-semibold text-pink-800 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">請假狀態分布</span>
              <span className="sm:hidden">狀態</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 md:space-y-4">
              {leaveRequests.length > 0 ? (
                <>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-gray-600">已批准</span>
                      <span className="text-xs md:text-sm font-medium text-green-600">
                        {leaveRequests.filter(request => request.status === 'approved').length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 md:h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ 
                          width: `${Math.max(1, (leaveRequests.filter(request => request.status === 'approved').length / Math.max(1, leaveRequests.length)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-gray-600">待批准</span>
                      <span className="text-xs md:text-sm font-medium text-yellow-600">
                        {leaveRequests.filter(request => request.status === 'pending').length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 md:h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ 
                          width: `${Math.max(1, (leaveRequests.filter(request => request.status === 'pending').length / Math.max(1, leaveRequests.length)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-gray-600">已拒絕</span>
                      <span className="text-xs md:text-sm font-medium text-red-600">
                        {leaveRequests.filter(request => request.status === 'rejected').length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600 h-2 md:h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ 
                          width: `${Math.max(1, (leaveRequests.filter(request => request.status === 'rejected').length / Math.max(1, leaveRequests.length)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 md:py-8 text-gray-500">
                  <BarChart3 className="mx-auto h-8 w-8 md:h-12 md:w-12 mb-3 md:mb-4 opacity-50" />
                  <p className="text-sm md:text-base">沒有數據顯示</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Chart - Real-time Leave Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Leave Requests by Month */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-semibold text-amber-800 flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">請假月份分布</span>
              <span className="sm:hidden">月份</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 md:space-y-4">
              {(() => {
                const monthStats = Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  const monthRequests = leaveRequests.filter(request => {
                    const requestDate = createLocalDate(request.startDate);
                    return requestDate.getFullYear() === selectedYear && requestDate.getMonth() + 1 === month;
                  });
                  
                  return {
                    month,
                    requests: monthRequests.length,
                    totalDays: monthRequests.reduce((sum, request) => {
                      if (request.leaveType === 'full_day') {
                        return sum + calculateDaysBetween(request.startDate, request.endDate);
                      } else if (request.leaveType === 'half_day') {
                        return sum + 0.5;
                      } else if (request.leaveType === 'hourly') {
                        return sum + 0.125;
                      }
                      return sum;
                    }, 0)
                  };
                });
                
                return monthStats.map(({ month, requests, totalDays }) => (
                  <div key={month} className="flex items-center justify-between p-2 bg-white rounded border border-amber-100">
                                          <span className="text-sm font-medium text-amber-800">
                        {getMonthName(month)}
                      </span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-amber-600">{requests} 請假</span>
                      <span className="text-sm font-bold text-amber-700">{totalDays.toFixed(1)} 天</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leave Activity */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg font-semibold text-emerald-800 flex items-center gap-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">請假活動近期</span>
              <span className="sm:hidden">近期</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 md:space-y-4">
              {(() => {
                const recentRequests = leaveRequests
                  .sort((a, b) => createLocalDate(b.createdAt || b.startDate).getTime() - createLocalDate(a.createdAt || a.startDate).getTime())
                  .slice(0, 5);
                
                if (recentRequests.length === 0) {
                  return (
                    <div className="text-center py-6 text-gray-500">
                      <Clock className="mx-auto h-8 w-8 mb-3 opacity-50" />
                      <p className="text-sm">沒有近期活動</p>
                    </div>
                  );
                }
                
                return recentRequests.map((request) => (
                  <div key={request._id} className="p-3 bg-white rounded-lg border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-emerald-800">{request.employeeName}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status === 'approved' ? '已批准' :
                         request.status === 'pending' ? '待批准' : '已拒絕'}
                      </span>
                    </div>
                                          <div className="text-xs text-gray-600">
                        {formatDate(request.startDate)} - {request.leaveType === 'full_day' ? '全薪假' : request.leaveType === 'half_day' ? '半薪假' : '小時假'}
                      </div>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

            {/* Detailed Statistics Table */}
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
      toast.error('無法載入設定');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLabel = async (id: string, newLabel: string) => {
    try {
      await halfDayOptionsAPI.update(id, newLabel);
      toast.success('更新成功');
      setEditingOption(null);
      setEditValue('');
      loadHalfDayOptions();
    } catch (error) {
      toast.error('無法更新');
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
          系統設定
        </h2>
        <p className="text-gray-600 mt-1">調整系統設定和配置</p>
      </div>
      
      {/* Half Day Options */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>半薪假設定</span>
          </CardTitle>
          <CardDescription className="text-indigo-100">
            調整半薪假標籤
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {halfDayOptions.map((option) => (
              <div key={option._id} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                <div className="w-24 text-sm font-medium text-indigo-700">
                  {option.code === 'morning' ? '上午' : 
                   option.code === 'afternoon' ? '下午' : '晚上'}
                </div>
                
                {editingOption === option._id ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      value={editValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                      className="flex-1 border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="輸入新標籤..."
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(option._id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      保存
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      取消
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
                      編輯
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
            <span>系統資訊</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">版本</p>
              <p className="text-lg font-semibold text-gray-800">v1.0.0</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">狀態</p>
              <p className="text-lg font-semibold text-green-600">運行</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">最後更新</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatDate(new Date(), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">總設定</p>
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
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 py-4">
            {/* Company Logo and Name - Left Side */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">
                  請假管理系統
                </h1>
                <p className="text-sm text-green-100">ABC有限公司</p>
              </div>
            </div>
            
            {/* Employee Name and Logout Button - Right Side */}
            <div className="flex flex-col items-end space-y-2">
              <div className="text-right text-white">
                <p className="text-sm font-medium">{admin?.name}</p>
                <p className="text-xs text-green-100">{admin?.email}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-white/30 bg-transparent text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="leaves" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto p-1 bg-gray-100 rounded-xl gap-1">
            <TabsTrigger 
              value="leaves" 
              className="flex flex-col items-center justify-center space-y-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 rounded-lg transition-all duration-200 text-xs sm:text-sm py-3"
            >
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs">請假</span>
            </TabsTrigger>
            <TabsTrigger 
              value="statistics" 
              className="flex flex-col items-center justify-center space-y-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600 rounded-lg transition-all duration-200 text-xs sm:text-sm py-3"
            >
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs">統計</span>
            </TabsTrigger>
            <TabsTrigger 
              value="employees" 
              className="flex flex-col items-center justify-center space-y-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200 text-xs sm:text-sm py-3"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs">員工</span>
            </TabsTrigger>
            <TabsTrigger 
              value="departments" 
              className="flex flex-col items-center justify-center space-y-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 rounded-lg transition-all duration-200 text-xs sm:text-sm py-3"
            >
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs">部門</span>
            </TabsTrigger>
            <TabsTrigger 
              value="positions" 
              className="flex flex-col items-center justify-center space-y-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 rounded-lg transition-all duration-200 text-xs sm:text-sm py-3"
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs">職位</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex flex-col items-center justify-center space-y-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 rounded-lg transition-all duration-200 text-xs sm:text-sm py-3"
            >
               <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs">設定</span>
             </TabsTrigger>
          </TabsList>

          <TabsContent value="leaves">
            <LeaveManagement />
          </TabsContent>

          <TabsContent value="statistics">
            <Statistics />
          </TabsContent>

          <TabsContent value="employees">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentManagement />
          </TabsContent>

          <TabsContent value="positions">
            <PositionManagement />
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
