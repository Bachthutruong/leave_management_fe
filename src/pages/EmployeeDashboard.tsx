import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { leaveRequestAPI } from '@/services/api';
import { LeaveRequest, Employee } from '@/types';
import LeaveRequestForm from '@/components/LeaveRequestForm';
import LeaveCalendar from '@/components/LeaveCalendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
 
  FileText, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon 
} from 'lucide-react';

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const pendingRequests = myRequests.filter(req => req.status === 'pending');
  const approvedRequests = myRequests.filter(req => req.status === 'approved');
  const rejectedRequests = myRequests.filter(req => req.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Hệ thống Quản lý Nghỉ phép
                </h1>
                <p className="text-sm text-gray-500">Giao diện nhân viên</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{(user as Employee)?.department}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Lịch nghỉ phép</TabsTrigger>
            <TabsTrigger value="request">Đăng ký nghỉ phép</TabsTrigger>
            <TabsTrigger value="history">Lịch sử đơn</TabsTrigger>
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
                  <div className="space-y-4">
                    {myRequests.map((request) => (
                      <div
                        key={request._id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium">
                                {getLeaveTypeText(request.leaveType, request.halfDayType)}
                              </h3>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Từ:</span>{' '}
                                {format(new Date(request.startDate), 'dd/MM/yyyy', { locale: vi })}
                              </div>
                              <div>
                                <span className="font-medium">Đến:</span>{' '}
                                {format(new Date(request.endDate), 'dd/MM/yyyy', { locale: vi })}
                              </div>
                              {request.startTime && request.endTime && (
                                <div>
                                  <span className="font-medium">Giờ:</span>{' '}
                                  {request.startTime} - {request.endTime}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Ngày tạo:</span>{' '}
                                {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: vi })}
                              </div>
                            </div>
                            {request.reason && (
                              <div className="mt-2">
                                <span className="font-medium text-sm">Lý do:</span>{' '}
                                <span className="text-sm text-muted-foreground">{request.reason}</span>
                              </div>
                            )}
                            {request.rejectionReason && (
                              <div className="mt-2">
                                <span className="font-medium text-sm text-red-600">Lý do từ chối:</span>{' '}
                                <span className="text-sm text-red-600">{request.rejectionReason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
