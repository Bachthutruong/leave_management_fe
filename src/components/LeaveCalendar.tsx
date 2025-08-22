import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { leaveRequestAPI } from '@/services/api';
import { CalendarEvent } from '@/types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const LeaveCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await leaveRequestAPI.getCompanyCalendar(year, month);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Lịch nghỉ phép công ty
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: vi })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[80px] p-1 border border-border ${
                    isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                  } ${isToday ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event, index) => (
                      <div
                        key={index}
                        className={`text-xs p-1 rounded truncate ${getLeaveTypeColor(event.leaveType, event.halfDayType)}`}
                        title={`${event.employeeName} - ${event.department} - ${getLeaveTypeText(event.leaveType, event.halfDayType)}`}
                      >
                        <div className="font-medium truncate">{event.employeeName}</div>
                        <div className="text-xs opacity-90 truncate">{event.department}</div>
                        <div className="text-xs opacity-75 truncate">
                          {getLeaveTypeText(event.leaveType, event.halfDayType)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Chú thích:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Nghỉ cả ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Nghỉ sáng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Nghỉ chiều</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Nghỉ theo giờ</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveCalendar;
