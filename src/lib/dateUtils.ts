import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

// Utility function to handle date formatting without timezone issues
export const formatDate = (dateString: string | Date, formatString: string = 'dd/MM/yyyy') => {
  try {
    let date: Date;
    
    if (typeof dateString === 'string') {
      // Parse ISO string and create date in local timezone
      date = parseISO(dateString);
    } else {
      date = dateString;
    }
    
    // Ensure we're working with local timezone
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return format(localDate, formatString, { locale: vi });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Utility function to create date without timezone issues
export const createLocalDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // Create date in local timezone by using year, month, date components
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  } catch (error) {
    console.error('Error creating local date:', error);
    return new Date();
  }
};

// Utility function to calculate days between two dates
export const calculateDaysBetween = (startDate: string, endDate: string) => {
  try {
    const start = createLocalDate(startDate);
    const end = createLocalDate(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  } catch (error) {
    console.error('Error calculating days between dates:', error);
    return 1;
  }
};

// Utility function to check if date is in specific month/year
export const isDateInPeriod = (dateString: string, year: number, month: number) => {
  try {
    const date = createLocalDate(dateString);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  } catch (error) {
    console.error('Error checking date period:', error);
    return false;
  }
};

// Utility function to get month name in Traditional Chinese
export const getMonthName = (month: number) => {
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  return months[month - 1] || `第${month}月`;
};

// Utility function to get short month name in Traditional Chinese
export const getShortMonthName = (month: number) => {
  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  return months[month - 1] || `${month}月`;
};
