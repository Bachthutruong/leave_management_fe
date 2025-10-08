import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { leaveRequestAPI } from '@/services/api';
import { CalendarEvent } from '@/types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Smartphone, X, CheckCircle, XCircle } from 'lucide-react';
import { getMonthName } from '@/lib/dateUtils';
import { useAuthStore } from '@/store/authStore';

interface LeaveCalendarProps {
  selectedYear?: number;
  selectedMonth?: number;
  onDateChange?: (year: number, month: number) => void;
}

const LeaveCalendar: React.FC<LeaveCalendarProps> = ({ 
  selectedYear, 
  selectedMonth,
  onDateChange
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if user is admin or department head
  useEffect(() => {
    const userType = useAuthStore.getState().userType;
    const user = useAuthStore.getState().user;
    const isAdmin = userType === 'admin';
    const isDepartmentHead = userType === 'employee' && (user as any)?.role === 'department_head';
    setIsAdmin(isAdmin || isDepartmentHead);
  }, []);

  // Custom CSS styles for calendar events
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .calendar-event {
        border-radius: 0 !important;
        text-overflow: inherit !important;
        white-space: normal !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        margin-left: -0.125rem !important;
        margin-right: -0.125rem !important;
      }
      
      @media (max-width: 767px) {
        .calendar-event {
          margin-left: -0.25rem !important;
          margin-right: -0.25rem !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          width: calc(100% + 0.5rem) !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // Validate year and month
      if (year < 1900 || year > 2100 || month < 1 || month > 12) {
        console.error('Invalid year or month:', { year, month });
        setEvents([]);
        return;
      }
      
      console.log('Fetching calendar for:', { year, month });
      const userType = useAuthStore.getState().userType;
      const user = useAuthStore.getState().user;
      
      // Admin sees company calendar, department heads see company calendar, regular employees see personal calendar
      const isAdmin = userType === 'admin';
      const isDepartmentHead = userType === 'employee' && (user as any)?.role === 'department_head';
      
      const data = await (isAdmin
        ? leaveRequestAPI.getCompanyCalendar(year, month)
        : isDepartmentHead
        ? leaveRequestAPI.getDeptHeadCalendar(year, month)
        : leaveRequestAPI.getMyCalendar(year, month));
      console.log('Calendar data received:', data);
      
      // Ensure data is in correct format
      if (Array.isArray(data)) {
        setEvents(data);
      } else if (data && typeof data === 'object') {
        // If data is an object, try to extract events array
        const eventsArray = (data as any).events || (data as any).data || [];
        setEvents(Array.isArray(eventsArray) ? eventsArray : []);
      } else {
        console.warn('Unexpected calendar data format:', data);
        setEvents([]);
      }
    } catch (error: any) {
      console.error('Error fetching calendar events:', error);
      // Set empty events array on error to prevent crashes
      setEvents([]);
      // You could also show a toast error here
      // toast.error('無法載入排休日曆');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending requests for admin actions
  const fetchPendingRequests = async () => {
    if (!isAdmin) return;
    try {
      const data = await leaveRequestAPI.getAll({ status: 'pending' });
      setPendingRequests(data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await leaveRequestAPI.update(requestId, { status: 'approved' });
      fetchEvents();
      fetchPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await leaveRequestAPI.update(requestId, { status: 'rejected', rejectionReason: 'Rejected from calendar view' });
      fetchEvents();
      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  // Update currentDate when props change
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      const newDate = new Date(selectedYear, selectedMonth - 1, 1);
      setCurrentDate(newDate);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchEvents();
    fetchPendingRequests();
    
    // Listen for leave request submission to refresh calendar
    const handleLeaveRequestSubmitted = () => {
      console.log('Refreshing calendar due to new leave request');
      fetchEvents();
    };
    
    window.addEventListener('leaveRequestSubmitted', handleLeaveRequestSubmitted);
    
    return () => {
      window.removeEventListener('leaveRequestSubmitted', handleLeaveRequestSubmitted);
    };
  }, [currentDate]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvent = events.find(event => event.date === dateStr);
    return dayEvent ? dayEvent.events : [];
  };

  // Get pending requests for a specific day
  const getPendingRequestsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return pendingRequests.filter(request => {
      const startDate = format(new Date(request.startDate), 'yyyy-MM-dd');
      const endDate = format(new Date(request.endDate), 'yyyy-MM-dd');
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  // Get events for display (limit to 2 per day)
  const getDisplayEventsForDay = (date: Date) => {
    const dayEvents = getEventsForDay(date);
    return {
      displayEvents: dayEvents.slice(0, 2), // Show only first 2 events
      totalEvents: dayEvents.length,
      hasMore: dayEvents.length > 2
    };
  };

  const getLeaveTypeColor = (leaveType: string, halfDayType?: string) => {
    switch (leaveType) {
      case 'full_day':
        return 'bg-red-500 text-white';
      case 'half_day':
        return halfDayType === 'morning' 
          ? 'bg-orange-500 text-white' 
          : halfDayType === 'afternoon'
          ? 'bg-yellow-500 text-white'
          : 'bg-purple-500 text-white';
      case 'hourly':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getLeaveTypeText = (leaveType: string, halfDayType?: string) => {
    switch (leaveType) {
      case 'full_day':
        return '全天假';
      case 'half_day':
        return halfDayType === 'morning' 
          ? '選時段排休/請假' 
          : halfDayType === 'afternoon'
          ? '自定時段排休/請假'
          : '晚上';
      case 'hourly':
        return '時假';
      default:
        return '排休';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      
      // Notify parent component about the date change
      if (onDateChange) {
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1;
        onDateChange(newYear, newMonth);
      }
      
      return newDate;
    });
  };

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
            <CalendarIcon className="h-5 w-5 lg:h-6 lg:w-6" />
            <span className="hidden sm:inline">公司排休日曆</span>
            <span className="sm:hidden">排休日曆</span>
            {isMobileView && <Smartphone className="h-4 w-4 ml-2 opacity-75" />}
          </CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="border-white/30 bg-transparent text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-base lg:text-lg font-medium min-w-[100px] lg:min-w-[120px] text-center">
              {getMonthName(currentDate.getMonth() + 1)} {currentDate.getFullYear()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="border-white/30 bg-transparent text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEvents}
              className="border-white/30 bg-transparent text-white hover:bg-white/20 backdrop-blur-sm ml-2"
              title="重新載入資料"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="text-center">
              <CalendarIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">沒有排休資料</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">請稍後再試或建立新的排休申請</p>
              <Button 
                onClick={fetchEvents} 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重新載入
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0 sm:gap-0.5 lg:gap-1 w-full">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="p-1 sm:p-2 lg:p-3 text-center text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map(day => {
              const { displayEvents, totalEvents, hasMore } = getDisplayEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] sm:min-h-[120px] p-2 sm:p-3 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'
                  } ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                >
                  {/* Date number */}
                  <div className={`text-sm sm:text-base font-bold mb-2 text-center ${
                    isToday ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Events container */}
                  <div className="space-y-1.5 sm:space-y-2">
                    {/* Visible events */}
                    {displayEvents.map((event, index) => (
                      <div
                        key={index}
                        className={`calendar-event p-0.5 sm:p-1 text-[10px] font-medium cursor-pointer hover:shadow-sm transition-shadow ${getLeaveTypeColor(event.leaveType, event.halfDayType)}`}
                        title={`${event.employeeName} - ${event.department} - ${getLeaveTypeText(event.leaveType, event.halfDayType)}`}
                        onClick={() => {
                          // Show dropdown for this day
                          const dayKey = format(day, 'yyyy-MM-dd');
                          setOpenDropdown(openDropdown === dayKey ? null : dayKey);
                        }}
                      >
                        {/* Compact event display - only show name */}
                        <div className="leading-tight">
                          {event.employeeName}
                        </div>
                      </div>
                    ))}
                    
                    {/* More events button */}
                    {hasMore && (
                      <button 
                        className={`w-full text-[10px] sm:text-xs p-0.5 sm:p-1 rounded-full transition-colors font-medium border border-dashed hover:border-solid ${
                          openDropdown === format(day, 'yyyy-MM-dd')
                            ? 'bg-blue-100 text-blue-700 border-blue-300' 
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const dayKey = format(day, 'yyyy-MM-dd');
                          setOpenDropdown(openDropdown === dayKey ? null : dayKey);
                        }}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>+{totalEvents - 2} 更多</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            備註
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full shadow-md"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">排休/請假全天</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded-full shadow-md"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">選時段排休/請假</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full shadow-md"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">自定時段排休/請假</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full shadow-md"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">自定時間休</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Global Dropdown for Events */}
      {openDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                排休詳細資料 {format(new Date(openDropdown), 'yyyy年MM月dd日', { locale: zhTW })}
              </h3> 
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenDropdown(null)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6">
              {(() => {
                const dayEvents = getEventsForDay(new Date(openDropdown));
                return dayEvents.length > 0 ? (
                  <div className="space-y-4">
                    {dayEvents.map((event, index) => {
                      const pendingForThisEvent = getPendingRequestsForDay(new Date(openDropdown)).find(req => 
                        req.employeeName === event.employeeName && req.phone === event.phone
                      );
                      
                      return (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-lg text-gray-900 mb-2">
                              {event.employeeName}
                            </div>
                                                         <div className="space-y-1 text-sm text-gray-600">
                               <div><span className="font-medium">部門:</span> {event.department}</div>
                               <div><span className="font-medium">排休類型:</span> {getLeaveTypeText(event.leaveType, event.halfDayType)}</div>
                               {event.startTime && event.endTime && (
                                 <div><span className="font-medium">時間:</span> {event.startTime} - {event.endTime}</div>
                               )}
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className={`text-sm px-3 py-2 rounded-full shrink-0 font-medium ${getLeaveTypeColor(event.leaveType, event.halfDayType)}`}>
                              {getLeaveTypeText(event.leaveType, event.halfDayType)}
                            </div>
                            {isAdmin && pendingForThisEvent && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(pendingForThisEvent._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(pendingForThisEvent._id)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>沒有排休資料</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default LeaveCalendar;
