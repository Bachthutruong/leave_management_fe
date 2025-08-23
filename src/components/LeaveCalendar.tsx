import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { leaveRequestAPI } from '@/services/api';
import { CalendarEvent } from '@/types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Smartphone } from 'lucide-react';

const LeaveCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
      const data = await leaveRequestAPI.getCompanyCalendar(year, month);
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
      // toast.error('Không thể tải lịch nghỉ phép');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
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
        return 'Cả ngày';
      case 'half_day':
        return halfDayType === 'morning' 
          ? 'Sáng' 
          : halfDayType === 'afternoon'
          ? 'Chiều'
          : 'Tối';
      case 'hourly':
        return 'Theo giờ';
      default:
        return 'Nghỉ';
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
      return newDate;
    });
  };

  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
            <CalendarIcon className="h-5 w-5 lg:h-6 lg:w-6" />
            <span className="hidden sm:inline">Lịch nghỉ phép công ty</span>
            <span className="sm:hidden">Lịch nghỉ phép</span>
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
              {format(currentDate, 'MMMM yyyy', { locale: vi })}
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
              title="Làm mới dữ liệu"
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
              <p className="text-gray-500 text-sm sm:text-base">Không có dữ liệu lịch nghỉ phép</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">Vui lòng thử lại sau</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const maxDisplayEvents = isMobileView ? 1 : 2;
              const visibleEvents = dayEvents.slice(0, maxDisplayEvents);
              const remainingEvents = dayEvents.slice(maxDisplayEvents);
              const hasMoreEvents = remainingEvents.length > 0;

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'
                  } ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                >
                  <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-center ${
                    isToday ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    {/* Visible events */}
                    {visibleEvents.map((event, index) => (
                      <div
                        key={index}
                        className={`text-xs p-1 sm:p-1.5 rounded-md truncate shadow-sm ${getLeaveTypeColor(event.leaveType, event.halfDayType)}`}
                        title={`${event.employeeName} - ${event.department} - ${getLeaveTypeText(event.leaveType, event.halfDayType)}`}
                      >
                        <div className="font-medium truncate text-[10px] sm:text-xs">
                          {isMobileView ? event.employeeName.split(' ').slice(-1)[0] : event.employeeName}
                        </div>
                        <div className="text-[10px] sm:text-xs opacity-90 truncate">
                          {isMobileView ? event.department.substring(0, 2) : event.department}
                        </div>
                        <div className="text-[10px] sm:text-xs opacity-75 truncate">
                          {getLeaveTypeText(event.leaveType, event.halfDayType)}
                        </div>
                      </div>
                    ))}
                    
                    {/* More events dropdown */}
                    {hasMoreEvents && (
                      <div className="relative" ref={dropdownRef}>
                        <button 
                          className={`w-full text-[10px] sm:text-xs p-1 sm:p-1.5 rounded-md transition-colors ${
                            openDropdown === format(day, 'yyyy-MM-dd')
                              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const dayKey = format(day, 'yyyy-MM-dd');
                            setOpenDropdown(openDropdown === dayKey ? null : dayKey);
                          }}
                        >
                          +{remainingEvents.length} thêm
                        </button>
                        
                        {openDropdown === format(day, 'yyyy-MM-dd') && (
                          <div className={`absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto ${
                            isMobileView ? 'w-72' : 'w-80'
                          }`}>
                            <div className="p-3 border-b bg-gray-50 sticky top-0">
                              <h4 className="font-medium text-sm text-gray-900">
                                Nghỉ phép ngày {format(day, 'dd/MM/yyyy', { locale: vi })}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {dayEvents.length} nhân viên nghỉ phép
                              </p>
                            </div>
                            <div className="p-2 space-y-2">
                              {dayEvents.map((event, index) => (
                                <div
                                  key={index}
                                  className="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm text-gray-900">
                                        {event.employeeName}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {event.department}
                                      </div>
                                      {event.startTime && event.endTime && (
                                        <div className="text-xs text-gray-400 mt-1">
                                          {event.startTime} - {event.endTime}
                                        </div>
                                      )}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full shrink-0 ${getLeaveTypeColor(event.leaveType, event.halfDayType)}`}>
                                      {getLeaveTypeText(event.leaveType, event.halfDayType)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
            Chú thích
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full shadow-md"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">Nghỉ cả ngày</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded-full shadow-md"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">Nghỉ sáng</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full shadow-md"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">Nghỉ chiều</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full shadow-md"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">Nghỉ theo giờ</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveCalendar;
