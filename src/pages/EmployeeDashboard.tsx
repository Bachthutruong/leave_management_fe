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

// Helper function to get month name in Traditional Chinese
const getMonthName = (month: number): string => {
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  return months[month - 1];
};

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
  
  // Date filter state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
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

  // Debug: Log when myRequests changes
  useEffect(() => {
    console.log('myRequests updated:', myRequests.length, 'requests');
    console.log('Current filter:', selectedYear, selectedMonth);
  }, [myRequests, selectedYear, selectedMonth]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            已核准
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            已拒絕
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            待核准
          </span>
        );
      default:
        return null;
    }
  };

  const getLeaveTypeText = (leaveType: string, halfDayType?: string) => {
    switch (leaveType) {
      case 'full_day':
        return '全天假';
      case 'half_day':
        return `半天假 (${halfDayType === 'morning' ? '選時段排休' : halfDayType === 'afternoon' ? '自定時間排休' : '晚上'})`;
      case 'hourly':
        return '時假';
      default:
        return '排休';
    }
  };

  // Filter and pagination logic - includes date filtering
  const filteredRequests = myRequests.filter(request => {
    const requestDate = new Date(request.startDate);
    const requestYear = requestDate.getFullYear();
    const requestMonth = requestDate.getMonth() + 1;
    
    const matchesDate = requestYear === selectedYear && requestMonth === selectedMonth;
    const matchesSearch = searchTerm === '' || 
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = leaveTypeFilter === 'all' || request.leaveType === leaveTypeFilter;
    
    // Debug log
    console.log('Filtering request:', {
      requestDate: request.startDate,
      requestYear,
      requestMonth,
      selectedYear,
      selectedMonth,
      matchesDate,
      employeeName: request.employeeName,
      reason: request.reason
    });
    
    return matchesDate && matchesSearch && matchesStatus && matchesType;
  });

  // Debug log for filtered results
  console.log('Filtered requests count:', filteredRequests.length, 'for year:', selectedYear, 'month:', selectedMonth);

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

  // Reset page when date filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedMonth]);

  // Use filtered requests for stats
  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');
  const approvedRequests = filteredRequests.filter(req => req.status === 'approved');
  const rejectedRequests = filteredRequests.filter(req => req.status === 'rejected');
  
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
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center min-h-[4rem] sm:min-h-[5rem] py-2 sm:py-4">
            {/* Company Logo and Name - Left Side */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-white leading-tight truncate">
                  排休管理系統
                </h1>
                <p className="text-xs sm:text-sm text-green-100 truncate">中華衛星</p>
              </div>
            </div>
            
            {/* Employee Name and Logout Button - Right Side */}
            <div className="flex flex-col items-end space-y-1 sm:space-y-2 flex-shrink-0 ml-2 sm:ml-4">
              <div className="text-right text-white">
                <p className="text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[120px] lg:max-w-none">{user?.name}</p>
                <p className="text-xs text-green-100 truncate max-w-[100px] sm:max-w-[120px] lg:max-w-none">{(user as Employee)?.department}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="border-white/30 bg-green-700/50 text-white hover:bg-green-700/70 backdrop-blur-sm text-xs px-2 sm:px-3"
              >
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Year and Month Filter */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-full sm:w-32 bg-white border-2 border-gray-300 hover:border-green-500 focus:border-green-500">
                  <SelectValue placeholder="選擇年份" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 50 }, (_, i) => 2000 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-full sm:w-32 bg-white border-2 border-gray-300 hover:border-green-500 focus:border-green-500">
                  <SelectValue placeholder="選擇月份" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthName(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Filter Status Display */}
            {/* <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              Đang hiển thị dữ liệu cho: <span className="font-semibold text-green-600">{selectedYear} - {getMonthName(selectedMonth)}</span>
              {filteredRequests.length === 0 && (
                <span className="text-red-500 ml-2">(Không có dữ liệu cho thời gian này)</span>
              )}
            </div> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4">
          <Card className="h-20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 py-2">
              <CardTitle className="text-sm font-medium">已核准</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="px-3 py-1">
              <div className="text-xl font-bold text-green-600">{approvedRequests.length}</div>
            </CardContent>
          </Card>
          
          <Card className="h-20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 py-2">
              <CardTitle className="text-sm font-medium">待核准</CardTitle>
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent className="px-3 py-1">
              <div className="text-xl font-bold text-yellow-600">{pendingRequests.length}</div>
            </CardContent>
          </Card>
          
          <Card className="h-20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 py-2">
              <CardTitle className="text-sm font-medium">已拒絕</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent className="px-3 py-1">
              <div className="text-xl font-bold text-red-600">{rejectedRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="calendar" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100 rounded-xl gap-1">
            <TabsTrigger 
              value="calendar" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all duration-200 text-sm sm:text-lg py-2"
            >
              <span className="hidden xs:inline">排休日曆</span>
              <span className="xs:hidden">日曆</span>
            </TabsTrigger>
            <TabsTrigger 
              value="request" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 rounded-lg transition-all duration-200 text-sm sm:text-lg py-2"
            >
              <span className="hidden xs:inline">申請排休</span>
              <span className="xs:hidden">申請</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600 rounded-lg transition-all duration-200 text-sm sm:text-lg py-2"
            >
              <span className="hidden xs:inline">申請歷史</span>
              <span className="xs:hidden">歷史</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                📅 排休日曆目前顯示： <span className="font-semibold">{selectedYear} - {getMonthName(selectedMonth)}</span>
              </p>
            </div>
            <LeaveCalendar 
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onDateChange={(year, month) => {
                console.log('Calendar date changed:', year, month);
                setSelectedYear(year);
                setSelectedMonth(month);
              }}
            />
          </TabsContent>

          <TabsContent value="request" className="space-y-4">
            <LeaveRequestForm />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>排休申請歷史</CardTitle>
                <CardDescription>
                  查看您的所有排休申請
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="搜尋原因或姓名..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有狀態</SelectItem>
                      <SelectItem value="pending">待核准</SelectItem>
                      <SelectItem value="approved">已核准</SelectItem>
                      <SelectItem value="rejected">已拒絕</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="排休類型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有類型</SelectItem>
                      <SelectItem value="full_day">全天假</SelectItem>
                      <SelectItem value="half_day">半天假</SelectItem>
                      <SelectItem value="hourly">時假</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>{selectedYear} - {getMonthName(selectedMonth)} 沒有排休申請</p>
                    <p className="text-sm mt-2">請嘗試選擇其他時間或檢查篩選條件</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">排休類型</TableHead>
                            <TableHead>時間</TableHead>
                            <TableHead className="max-w-xs">原因</TableHead>
                            <TableHead className="w-[120px]">狀態</TableHead>
                            <TableHead className="w-[100px]">文件</TableHead>
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
                                    <div>從：{format(new Date(request.startDate), 'dd/MM/yyyy', { locale: vi })}</div>
                                    <div>至：{format(new Date(request.endDate), 'dd/MM/yyyy', { locale: vi })}</div>
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
                                      {request.reason || '無原因'}
                                    </div>
                                    {request.rejectionReason && (
                                      <div className="text-xs text-destructive mt-1 truncate">
                                        拒絕原因：{request.rejectionReason}
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
                                      {request.attachments.length} 個文件
                                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">無</div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                  <Search className="h-8 w-8 mb-2 opacity-50" />
                                  <p>找不到符合的結果</p>
                                  <p className="text-xs mt-1">請嘗試更改篩選條件或搜尋關鍵字</p>
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
                        <span>共 {totalItems} 個申請</span>
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
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">排休申請詳情</h2>
              <Button variant="ghost" size="sm" onClick={closeDetailModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">基本資訊</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">排休類型：</span> {getLeaveTypeText(selectedRequest.leaveType, selectedRequest.halfDayType)}</div>
                    <div><span className="font-medium">狀態：</span> {getStatusBadge(selectedRequest.status)}</div>
                    <div><span className="font-medium">建立日期：</span> {format(new Date(selectedRequest.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                    {selectedRequest.approvedBy && (
                      <div><span className="font-medium">核准者：</span> {selectedRequest.approvedBy}</div>
                    )}
                    {selectedRequest.approvedAt && (
                      <div><span className="font-medium">核准日期：</span> {format(new Date(selectedRequest.approvedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">排休時間</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">開始日期：</span> {format(new Date(selectedRequest.startDate), 'dd/MM/yyyy', { locale: vi })}</div>
                    <div><span className="font-medium">結束日期：</span> {format(new Date(selectedRequest.endDate), 'dd/MM/yyyy', { locale: vi })}</div>
                    {selectedRequest.startTime && selectedRequest.endTime && (
                      <div><span className="font-medium">時間：</span> {selectedRequest.startTime} - {selectedRequest.endTime}</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Reason */}
              {selectedRequest.reason && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">排休原因</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedRequest.reason}
                  </p>
                </div>
              )}
              
              {/* Rejection Reason */}
              {selectedRequest.rejectionReason && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 text-red-600">拒絕原因</h3>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}
              
              {/* Attachments */}
              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">附件文件</h3>
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
