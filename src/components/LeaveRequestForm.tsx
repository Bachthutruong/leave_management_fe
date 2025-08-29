import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { leaveRequestAPI, halfDayOptionsAPI } from '@/services/api';
import { HalfDayOption } from '@/types';
import { Upload, X, FileText, Calendar, User, Building2, CalendarDays, Clock, MapPin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import MiniCalendar from './MiniCalendar';

interface LeaveRequestFormData {
  leaveType: 'full_day' | 'half_day' | 'hourly';
  halfDayType?: 'morning' | 'afternoon' | 'evening';
  startTime?: string;
  endTime?: string;
  leaveDate: string; // Changed from startDate/endDate to single leaveDate
  reason?: string;
}

const LeaveRequestForm: React.FC = () => {
  const { user } = useAuthStore();
  const employee = user as any;
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [halfDayOptions, setHalfDayOptions] = useState<HalfDayOption[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
    trigger,
  } = useForm<LeaveRequestFormData>({
    defaultValues: {
      leaveType: 'full_day',
      leaveDate: new Date().toISOString().split('T')[0],
    },
    mode: 'onChange',
  });

  const leaveType = watch('leaveType');
  const leaveDate = watch('leaveDate');

  // Memoized functions for better performance
  const loadHalfDayOptions = useCallback(async () => {
    try {
      const options = await halfDayOptionsAPI.getAll();
      setHalfDayOptions(options);
    } catch (error) {
      console.error('Failed to load half-day options:', error);
    }
  }, []);

  const formatDate = useCallback((date: Date) => {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${weekday}, ${day} ${month}`;
  }, []);

  const isWeekend = useCallback((date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  }, []);

  // Update selectedDates when form date changes
  useEffect(() => {
    if (leaveDate) {
      const date = new Date(leaveDate);
      setSelectedDates([date]);
    } else {
      setSelectedDates([]);
    }
  }, [leaveDate]);

  useEffect(() => {
    loadHalfDayOptions();
  }, [loadHalfDayOptions]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`檔案 ${file.name} 太大（最大 10MB）`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
      toast.success(`已新增 ${validFiles.length} 個檔案`);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSingleDateSelect = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setValue('leaveDate', dateStr);
    setShowMiniCalendar(false);
    trigger(); // Trigger validation
  }, [setValue, trigger]);

  const handleClearDates = useCallback(() => {
    setValue('leaveDate', '');
    setSelectedDates([]);
    trigger(); // Trigger validation
  }, [setValue, trigger]);

  const onSubmit = async (data: LeaveRequestFormData) => {
    if (!isValid) {
      toast.error('請檢查資訊');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Convert leaveDate to startDate and endDate for API compatibility
      formData.append('startDate', data.leaveDate);
      formData.append('endDate', data.leaveDate);
      
      // Add other form data
      formData.append('leaveType', data.leaveType);
      if (data.halfDayType) {
        formData.append('halfDayType', data.halfDayType);
      }
      if (data.startTime) {
        formData.append('startTime', data.startTime);
      }
      if (data.endTime) {
        formData.append('endTime', data.endTime);
      }
      if (data.reason) {
        formData.append('reason', data.reason);
      }

      // Add attachments
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await leaveRequestAPI.create(formData);
      toast.success('排休申請已成功送出！');
      
      // Reset form
      reset();
      setAttachments([]);
      setSelectedDates([]);
      setShowMiniCalendar(false);
      
      // Trigger refresh of parent components
      window.dispatchEvent(new CustomEvent('leaveRequestSubmitted'));
    } catch (error: any) {
      const message = error.response?.data?.message || '送出申請失敗！';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalFileSize = attachments.reduce((total, file) => total + file.size, 0);
  const maxTotalSize = 50 * 1024 * 1024; // 50MB total
  const isFileSizeExceeded = totalFileSize > maxTotalSize;

  return (
    <Card className="w-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <CalendarDays className="h-6 w-6" />
          申請排休
        </CardTitle>
        <CardDescription className="text-green-100">
          請填寫完整資訊以申請排休
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {/* Employee Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">員工資訊</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700">員工編號:</span>  
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                {employee?.phone}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700">姓名:</span>
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                {employee?.name}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">部門:</span>
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                {employee?.department}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Leave Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              排休類型 <span className="text-red-500">*</span>
            </label>
            <Select
              value={leaveType}
              onValueChange={(value: 'full_day' | 'half_day' | 'hourly') => setValue('leaveType', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選擇排休類型" />  
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_day">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    排休全天  
                  </div>
                </SelectItem>
                <SelectItem value="half_day">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    選時段排休
                  </div>
                </SelectItem>
                <SelectItem value="hourly">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    自定時間排休
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Half Day Type (if applicable) */}
          {leaveType === 'half_day' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                排休時段 <span className="text-red-500">*</span>
              </label>
              <Select
                value={watch('halfDayType')}
                onValueChange={(value: 'morning' | 'afternoon' | 'evening') => setValue('halfDayType', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇排休時段" />
                </SelectTrigger>
                <SelectContent>
                  {halfDayOptions.map((option) => (
                    <SelectItem key={option._id} value={option.code}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Time Selection (if hourly) */}
          {leaveType === 'hourly' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  開始時間 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  {...register('startTime', { required: leaveType === 'hourly' })}
                  className="w-full"
                />
                {errors.startTime && (
                  <p className="text-sm text-red-600">請選擇開始時間</p>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  結束時間 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  {...register('endTime', { required: leaveType === 'hourly' })}
                  className="w-full"
                />
                {errors.endTime && (
                  <p className="text-sm text-red-600">請選擇結束時間</p>
                )}
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-green-600" />
                選擇排休日期 <span className="text-red-500">*</span>
              </label>
              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMiniCalendar(!showMiniCalendar)}
                className="text-xs"
              >
                {showMiniCalendar ? '隱藏日曆' : '顯示日曆'}
              </Button> */}
            </div>
            
            {/* Mini Calendar */}
            {showMiniCalendar && (
              <div className="flex justify-center">
                <MiniCalendar
                  selectedStartDate={leaveDate ? new Date(leaveDate) : null}
                  selectedEndDate={leaveDate ? new Date(leaveDate) : null}
                  onDateSelect={handleSingleDateSelect}
                  onClearDates={handleClearDates}
                  className="w-full max-w-sm"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs text-gray-600">排休日期 *</label>
              <Input
                type="date"
                {...register('leaveDate', { required: true })}
                className="w-full"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.leaveDate && (
                <p className="text-sm text-red-600">請選擇排休日期</p>
              )}
            </div>

            {/* Selected Date Preview */}
            {selectedDates.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      已選擇日期:
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearDates}
                    className="h-6 px-2 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                  >
                    <X className="h-3 w-3 mr-1" />
                    刪除
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map((date, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 ${
                        isWeekend(date)
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : 'bg-green-100 text-green-700 border-green-300'
                      }`}
                    >
                      {formatDate(date)}
                      {isWeekend(date) && <span className="ml-1">🌅</span>}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-green-600">
                  {selectedDates.filter(isWeekend).length > 0 && (
                    <span>
                      (週末)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">排休原因 (可選)</label>
            <Textarea
              {...register('reason')}
              placeholder="請輸入排休原因..."
              rows={3}
              className="w-full resize-none"
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-600" />
              附件 (可選)
            </label>
            
            {/* File size warning */}
            {isFileSizeExceeded && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  總文件大小超過限制 ({(totalFileSize / 1024 / 1024).toFixed(1)}MB / 50MB)
                </span>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  點擊選擇文件或拖放至此處
                </span>
                <span className="text-xs text-gray-500">
                  支持: JPG, PNG, PDF, DOC, DOCX (最大 10MB/文件, 總共 50MB)
                </span>
                <span className="text-xs text-gray-400">
                  已使用: {(totalFileSize / 1024 / 1024).toFixed(1)}MB
                </span>
              </label>
            </div>
            
            {/* File List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">已選擇文件 ({attachments.length}):</h4>
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !isValid || isFileSizeExceeded}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                正在提交...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                提交排休申請
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestForm;
