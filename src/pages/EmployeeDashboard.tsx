import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/authStore';
import { leaveRequestAPI } from '@/services/api';
import { LeaveRequest, Employee } from '@/types';
import LeaveRequestForm from '@/components/LeaveRequestForm';
import LeaveCalendar from '@/components/LeaveCalendar';
import AttachmentViewer from '@/components/AttachmentViewer';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  FileText, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  X
} from 'lucide-react';

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  
  // Detail modal state
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchMyRequests = async () => {
    setIsLoading(true);
    try {
      const data = await leaveRequestAPI.getMyRequests();
      setMyRequests(data);
    } catch (error) {
      console.error('Error fetching my requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
    
    // Listen for leave request submission to refresh data
    const handleLeaveRequestSubmitted = () => {
      fetchMyRequests();
    };
    
    window.addEventListener('leaveRequestSubmitted', handleLeaveRequestSubmitted);
    
    return () => {
      window.removeEventListener('leaveRequestSubmitted', handleLeaveRequestSubmitted);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Từ chối
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Chờ duyệt
          </span>
        );
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

  // Filter and pagination logic
  const filteredRequests = myRequests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = leaveTypeFilter === 'all' || request.leaveType === leaveTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate pagination
  const totalItems = filteredRequests.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // Update total pages when filters change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredRequests.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredRequests.length, itemsPerPage]);

  const pendingRequests = myRequests.filter(req => req.status === 'pending');
  const approvedRequests = myRequests.filter(req => req.status === 'approved');
  const rejectedRequests = myRequests.filter(req => req.status === 'rejected');
  
  const handleRowClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };
  
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Hệ thống Quản lý Nghỉ phép
                </h1>
                <p className="text-green-100">Giao diện nhân viên</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-white">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-green-100">{(user as Employee)?.department}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="border-white/30 bg-transparent text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng đơn</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myRequests.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto p-1 bg-gray-100 rounded-xl">
            <TabsTrigger 
              value="calendar" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
            >
              Lịch nghỉ phép
            </TabsTrigger>
            <TabsTrigger 
              value="request" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 rounded-lg transition-all duration-200"
            >
              Đăng ký nghỉ phép
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600 rounded-lg transition-all duration-200"
            >
              Lịch sử đơn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <LeaveCalendar />
          </TabsContent>

          <TabsContent value="request" className="space-y-4">
            <LeaveRequestForm />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử đơn xin nghỉ phép</CardTitle>
                <CardDescription>
                  Xem tất cả đơn xin nghỉ phép của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Tìm kiếm theo lý do hoặc tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="rejected">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Loại nghỉ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại</SelectItem>
                      <SelectItem value="full_day">Cả ngày</SelectItem>
                      <SelectItem value="half_day">Nửa ngày</SelectItem>
                      <SelectItem value="hourly">Theo giờ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : myRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Chưa có đơn xin nghỉ phép nào</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Loại nghỉ</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead className="max-w-xs">Lý do</TableHead>
                            <TableHead className="w-[120px]">Trạng thái</TableHead>
                            <TableHead className="w-[100px]">Tài liệu</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentRequests.length > 0 ? (
                            currentRequests.map((request) => (
                              <TableRow 
                                key={request._id} 
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleRowClick(request)}
                              >
                                <TableCell className="font-medium">
                                  {getLeaveTypeText(request.leaveType, request.halfDayType)}
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
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
                                  <div className="max-w-xs">
                                    <div className="truncate text-sm">
                                      {request.reason || 'Không có lý do'}
                                    </div>
                                    {request.rejectionReason && (
                                      <div className="text-xs text-destructive mt-1 truncate">
                                        Lý do từ chối: {request.rejectionReason}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(request.status)}
                                </TableCell>
                                <TableCell>
                                  {request.attachments && request.attachments.length > 0 ? (
                                    <div className="text-sm font-medium">
                                      {request.attachments.length} tài liệu
                                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">Không có</div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                  <Search className="h-8 w-8 mb-2 opacity-50" />
                                  <p>Không tìm thấy kết quả phù hợp</p>
                                  <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Hiển thị</span>
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
                        <span>trên tổng số {totalItems} đơn</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Trước
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
                          Sau
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Chi tiết đơn xin nghỉ phép</h2>
              <Button variant="ghost" size="sm" onClick={closeDetailModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Thông tin cơ bản</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Loại nghỉ:</span> {getLeaveTypeText(selectedRequest.leaveType, selectedRequest.halfDayType)}</div>
                    <div><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedRequest.status)}</div>
                    <div><span className="font-medium">Ngày tạo:</span> {format(new Date(selectedRequest.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                    {selectedRequest.approvedBy && (
                      <div><span className="font-medium">Duyệt bởi:</span> {selectedRequest.approvedBy}</div>
                    )}
                    {selectedRequest.approvedAt && (
                      <div><span className="font-medium">Ngày duyệt:</span> {format(new Date(selectedRequest.approvedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Thời gian nghỉ</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Từ ngày:</span> {format(new Date(selectedRequest.startDate), 'dd/MM/yyyy', { locale: vi })}</div>
                    <div><span className="font-medium">Đến ngày:</span> {format(new Date(selectedRequest.endDate), 'dd/MM/yyyy', { locale: vi })}</div>
                    {selectedRequest.startTime && selectedRequest.endTime && (
                      <div><span className="font-medium">Giờ:</span> {selectedRequest.startTime} - {selectedRequest.endTime}</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Reason */}
              {selectedRequest.reason && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Lý do nghỉ</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedRequest.reason}
                  </p>
                </div>
              )}
              
              {/* Rejection Reason */}
              {selectedRequest.rejectionReason && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 text-red-600">Lý do từ chối</h3>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}
              
              {/* Attachments */}
              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Tài liệu đính kèm</h3>
                  <AttachmentViewer attachments={selectedRequest.attachments} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
