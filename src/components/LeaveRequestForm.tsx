import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { leaveRequestAPI, halfDayOptionsAPI } from '@/services/api';
import { HalfDayOption } from '@/types';
import { Upload, X, FileText, Calendar, User, Building2, CalendarDays, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import MiniCalendar from './MiniCalendar';

interface LeaveRequestFormData {
  leaveType: 'full_day' | 'half_day' | 'hourly';
  halfDayType?: 'morning' | 'afternoon' | 'evening';
  startTime?: string;
  endTime?: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

const LeaveRequestForm: React.FC = () => {
  const { user } = useAuthStore();
  const employee = user as any;
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [halfDayOptions, setHalfDayOptions] = useState<HalfDayOption[]>([]);
  // const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<LeaveRequestFormData>({
    defaultValues: {
      leaveType: 'full_day',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  });

  const leaveType = watch('leaveType');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    loadHalfDayOptions();
  }, []);

  // Update selectedDates when form dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dates = [];
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      
      setSelectedDates(dates);
    }
  }, [startDate, endDate]);

  const loadHalfDayOptions = async () => {
    try {
      const options = await halfDayOptionsAPI.getAll();
      setHalfDayOptions(options);
    } catch (error) {
      console.error('Failed to load half-day options:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const handleSingleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setValue('startDate', dateStr);
    setValue('endDate', dateStr);
    setShowMiniCalendar(false);
  };

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    setValue('startDate', startStr);
    setValue('endDate', endStr);
    setShowMiniCalendar(false);
  };

  const handleClearDates = () => {
    setValue('startDate', '');
    setValue('endDate', '');
    setSelectedDates([]);
  };

  const onSubmit = async (data: LeaveRequestFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Add form data
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      // Add attachments
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await leaveRequestAPI.create(formData);
      toast.success('Đơn xin nghỉ đã được gửi thành công!');
      reset();
      setAttachments([]);
      setSelectedDates([]);
      setShowMiniCalendar(false);
      
      // Trigger refresh of parent components
      window.dispatchEvent(new CustomEvent('leaveRequestSubmitted'));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gửi đơn thất bại!';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <CalendarDays className="h-6 w-6" />
          Đăng ký nghỉ phép
        </CardTitle>
        <CardDescription className="text-green-100">
          Vui lòng điền đầy đủ thông tin để đăng ký nghỉ phép
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Employee Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Thông tin nhân viên</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700">Mã nhân viên:</span>
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                {employee?.employeeId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700">Họ tên:</span>
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                {employee?.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Phòng ban:</span>
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
              Loại nghỉ phép
            </label>
            <Select
              value={leaveType}
              onValueChange={(value: 'full_day' | 'half_day' | 'hourly') => setValue('leaveType', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại nghỉ phép" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_day">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Nghỉ cả ngày
                  </div>
                </SelectItem>
                <SelectItem value="half_day">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    Nghỉ nửa ngày
                  </div>
                </SelectItem>
                <SelectItem value="hourly">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Nghỉ theo giờ
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Half Day Type (if applicable) */}
          {leaveType === 'half_day' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Buổi nghỉ</label>
              <Select
                value={watch('halfDayType')}
                onValueChange={(value: 'morning' | 'afternoon' | 'evening') => setValue('halfDayType', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn buổi nghỉ" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Giờ bắt đầu
                </label>
                <Input
                  type="time"
                  {...register('startTime', { required: leaveType === 'hourly' })}
                  className="w-full"
                />
                {errors.startTime && (
                  <p className="text-sm text-red-600">Vui lòng chọn giờ bắt đầu</p>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Giờ kết thúc
                </label>
                <Input
                  type="time"
                  {...register('endTime', { required: leaveType === 'hourly' })}
                  className="w-full"
                />
                {errors.endTime && (
                  <p className="text-sm text-red-600">Vui lòng chọn giờ kết thúc</p>
                )}
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-green-600" />
                Chọn ngày nghỉ
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMiniCalendar(!showMiniCalendar)}
                className="text-xs"
              >
                {showMiniCalendar ? 'Ẩn lịch' : 'Hiện lịch'}
              </Button>
            </div>
            
            {/* Mini Calendar */}
            {showMiniCalendar && (
              <div className="flex justify-center">
                <MiniCalendar
                  selectedStartDate={startDate ? new Date(startDate) : null}
                  selectedEndDate={endDate ? new Date(endDate) : null}
                  onDateSelect={handleSingleDateSelect}
                  onDateRangeSelect={handleDateRangeSelect}
                  onClearDates={handleClearDates}
                  className="w-full max-w-sm"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-600">Từ ngày</label>
                <Input
                  type="date"
                  {...register('startDate', { required: true })}
                  className="w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600">Vui lòng chọn ngày bắt đầu</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-600">Đến ngày</label>
                <Input
                  type="date"
                  {...register('endDate', { required: true })}
                  className="w-full"
                  min={startDate}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600">Vui lòng chọn ngày kết thúc</p>
                )}
              </div>
            </div>

            {/* Selected Dates Preview */}
            {selectedDates.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Đã chọn {selectedDates.length} ngày nghỉ:
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
                    Xóa
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
                  <span className="font-medium">Tổng cộng:</span> {selectedDates.length} ngày
                  {selectedDates.filter(isWeekend).length > 0 && (
                    <span className="ml-2">
                      (bao gồm {selectedDates.filter(isWeekend).length} ngày cuối tuần)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Lý do nghỉ phép (tùy chọn)</label>
            <Textarea
              {...register('reason')}
              placeholder="Nhập lý do nghỉ phép..."
              rows={3}
              className="w-full resize-none"
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-600" />
              Tài liệu đính kèm (tùy chọn)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
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
                  Click để chọn file hoặc kéo thả vào đây
                </span>
                <span className="text-xs text-gray-500">
                  Hỗ trợ: JPG, PNG, PDF, DOC, DOCX (tối đa 10MB/file)
                </span>
              </label>
            </div>
            
            {/* File List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Files đã chọn:</h4>
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
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
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang gửi đơn...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Gửi đơn xin nghỉ phép
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestForm;
