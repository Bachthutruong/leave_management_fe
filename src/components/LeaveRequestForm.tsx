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
import { Upload, X, FileText, Calendar, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    loadHalfDayOptions();
  }, []);

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
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gửi đơn thất bại!';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getHalfDayLabel = (code: string) => {
    const option = halfDayOptions.find(opt => opt.code === code);
    return option ? option.label : code;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Đăng ký Nghỉ phép</span>
        </CardTitle>
        <CardDescription>
          Vui lòng điền đầy đủ thông tin để đăng ký nghỉ phép
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Employee Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{employee?.name}</p>
              <p className="text-sm text-muted-foreground flex items-center space-x-1">
                <Building2 className="h-3 w-3" />
                <span>{employee?.department}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Leave Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại nghỉ phép</label>
            <Select value={leaveType} onValueChange={(value: 'full_day' | 'half_day' | 'hourly') => setValue('leaveType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại nghỉ phép" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_day">Nghỉ cả ngày</SelectItem>
                <SelectItem value="half_day">Nghỉ nửa ngày</SelectItem>
                <SelectItem value="hourly">Nghỉ theo giờ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Half Day Type */}
          {leaveType === 'half_day' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Thời gian nghỉ</label>
              <Select onValueChange={(value: 'morning' | 'afternoon' | 'evening') => setValue('halfDayType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thời gian nghỉ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">{getHalfDayLabel('morning')}</SelectItem>
                  <SelectItem value="afternoon">{getHalfDayLabel('afternoon')}</SelectItem>
                  <SelectItem value="evening">{getHalfDayLabel('evening')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Time Range for Hourly */}
          {leaveType === 'hourly' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Giờ bắt đầu</label>
                <Input
                  type="time"
                  {...register('startTime', { required: leaveType === 'hourly' })}
                />
                {errors.startTime && (
                  <p className="text-sm text-red-500">{errors.startTime.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Giờ kết thúc</label>
                <Input
                  type="time"
                  {...register('endTime', { required: leaveType === 'hourly' })}
                />
                {errors.endTime && (
                  <p className="text-sm text-red-500">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Từ ngày</span>
              </label>
              <Input
                type="date"
                {...register('startDate', { required: 'Ngày bắt đầu là bắt buộc' })}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Đến ngày</span>
              </label>
              <Input
                type="date"
                {...register('endDate', { required: 'Ngày kết thúc là bắt buộc' })}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do nghỉ (tùy chọn)</label>
            <Textarea
              placeholder="Nhập lý do nghỉ phép..."
              {...register('reason')}
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-1">
              <Upload className="h-4 w-4" />
              <span>Tài liệu đính kèm (tùy chọn)</span>
            </label>
            <Input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tệp đã chọn:</p>
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Đang gửi...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Gửi đơn xin nghỉ</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestForm;
