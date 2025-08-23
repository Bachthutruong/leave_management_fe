import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, RotateCcw } from 'lucide-react';

interface MiniCalendarProps {
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  onDateSelect: (date: Date) => void;
  onDateRangeSelect: (startDate: Date, endDate: Date) => void;
  onClearDates?: () => void;
  className?: string;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
  onDateRangeSelect,
  onClearDates,
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      if (direction === 'prev') {
        return subMonths(prev, 1);
      } else {
        return addMonths(prev, 1);
      }
    });
  };

  const handleDateClick = (date: Date) => {
    if (!isSelectingRange) {
      // Single date selection
      onDateSelect(date);
    } else {
      // Range selection
      if (!tempStartDate) {
        setTempStartDate(date);
      } else {
        // Complete range selection
        const start = tempStartDate < date ? tempStartDate : date;
        const end = tempStartDate < date ? date : tempStartDate;
        onDateRangeSelect(start, end);
        setTempStartDate(null);
        setIsSelectingRange(false);
      }
    }
  };

  const handleClearDates = () => {
    if (onClearDates) {
      onClearDates();
    }
    setTempStartDate(null);
    setIsSelectingRange(false);
  };

  const handleReset = () => {
    setTempStartDate(null);
    setIsSelectingRange(false);
    if (onClearDates) {
      onClearDates();
    }
  };

  const isInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isRangeStart = (date: Date) => {
    return selectedStartDate && isSameDay(date, selectedStartDate);
  };

  const isRangeEnd = (date: Date) => {
    return selectedEndDate && isSameDay(date, selectedEndDate);
  };

  const isTempStart = (date: Date) => {
    return tempStartDate && isSameDay(date, tempStartDate);
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isCurrentMonth = (date: Date) => {
    return isSameMonth(date, currentMonth);
  };

  const getDateClasses = (date: Date) => {
    let classes = 'w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all duration-200 cursor-pointer hover:bg-blue-100';
    
    if (!isCurrentMonth(date)) {
      classes += ' text-gray-400';
    } else if (isToday(date)) {
      classes += ' bg-blue-500 text-white hover:bg-blue-600 font-bold';
    } else if (isRangeStart(date) || isRangeEnd(date)) {
      classes += ' bg-blue-600 text-white hover:bg-blue-700 font-bold';
    } else if (isInRange(date)) {
      classes += ' bg-blue-200 text-blue-800 hover:bg-blue-300';
    } else if (isTempStart(date)) {
      classes += ' bg-orange-500 text-white hover:bg-orange-600 font-bold';
    } else {
      classes += ' text-gray-700 hover:bg-gray-100';
    }

    return classes;
  };

  const hasSelectedDates = selectedStartDate || selectedEndDate || tempStartDate;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-900">
            {format(currentMonth, 'MMMM yyyy', { locale: vi })}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => (
          <div
            key={day.toISOString()}
            className={getDateClasses(day)}
            onClick={() => handleDateClick(day)}
            title={format(day, 'dd/MM/yyyy', { locale: vi })}
          >
            {format(day, 'd')}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col gap-2">
        <Button
          variant={isSelectingRange ? "default" : "outline"}
          size="sm"
          onClick={() => setIsSelectingRange(!isSelectingRange)}
          className="w-full"
        >
          {isSelectingRange ? 'Đang chọn khoảng thời gian...' : 'Chọn khoảng thời gian'}
        </Button>
        
        {isSelectingRange && tempStartDate && (
          <div className="text-xs text-gray-600 text-center p-2 bg-blue-50 rounded-md">
            Đã chọn: {format(tempStartDate, 'dd/MM/yyyy')} - Chọn ngày kết thúc
          </div>
        )}
        
        {selectedStartDate && selectedEndDate && (
          <div className="text-xs text-green-600 text-center p-2 bg-green-50 rounded-md">
            Khoảng thời gian: {format(selectedStartDate, 'dd/MM/yyyy')} - {format(selectedEndDate, 'dd/MM/yyyy')}
          </div>
        )}

        {/* Clear and Reset Buttons */}
        {hasSelectedDates && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearDates}
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
            >
              <X className="h-3 w-3 mr-1" />
              Xóa ngày
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1 text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniCalendar;
