import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Employee, LeaveRequest, HalfDayOption } from '@/types';
import { Calendar, User, Building2, Clock, FileText, Save, X, Plus, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';
import AttachmentViewer from '@/components/AttachmentViewer';

interface AdminLeaveFormData {
  employeeId: string;
  leaveType: 'full_day' | 'half_day' | 'hourly';
  halfDayType?: 'morning' | 'afternoon' | 'evening';
  startTime?: string;
  endTime?: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AdminLeaveFormProps {
  leaveRequest?: LeaveRequest;
  employees: Employee[];
  onSave: (data: AdminLeaveFormData) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
  onFormRefresh?: () => void; // Callback to notify parent component
}

export interface AdminLeaveFormRef {
  refreshForm: () => void;
  forceRefresh: () => void; // Force refresh even if not initialized
}

const AdminLeaveForm = forwardRef<AdminLeaveFormRef, AdminLeaveFormProps>(({ 
  leaveRequest, 
  employees, 
  onSave, 
  onCancel, 
  mode,
  onFormRefresh
}, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [halfDayOptions, setHalfDayOptions] = useState<HalfDayOption[]>([]);
  const [isInitialized, setIsInitialized] = useState(false); // Flag to prevent overwriting
  const [formData, setFormData] = useState<AdminLeaveFormData>({
    employeeId: '',
    leaveType: 'full_day',
    halfDayType: undefined,
    startTime: '',
    endTime: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'pending',
  });

  useEffect(() => {
    loadHalfDayOptions();
  }, []);

  // Main useEffect for form data population - only run once when component mounts or key props change
  useEffect(() => {
    if (mode === 'edit' && leaveRequest && employees.length > 0 && !isInitialized) {
      console.log('Initial form data population:', leaveRequest);
      console.log('Available employees:', employees);
      
      // Find employee by employeeId (mã nhân viên) first
      let employeeId = '';
      if (leaveRequest.employeeId) {
        console.log('Looking for employee with employeeId:', leaveRequest.employeeId);
        console.log('Available employees employeeIds:', employees.map(emp => emp.employeeId));
        
        const foundEmployee = employees.find(emp => emp.employeeId === leaveRequest.employeeId);
        if (foundEmployee) {
          employeeId = foundEmployee._id; // Use MongoDB _id for form
          console.log('Found employee by employeeId:', foundEmployee);
        } else {
          console.log('No employee found with employeeId:', leaveRequest.employeeId);
        }
      }
      
      // If not found by employeeId, try by name
      if (!employeeId && leaveRequest.employeeName) {
        const foundEmployee = employees.find(emp => emp.name === leaveRequest.employeeName);
        if (foundEmployee) {
          employeeId = foundEmployee._id;
          console.log('Found employee by name:', foundEmployee);
        }
      }
      
      // If still no employeeId, try to find by exact name match
      if (!employeeId && leaveRequest.employeeName) {
        const exactMatch = employees.find(emp => 
          emp.name.toLowerCase() === leaveRequest.employeeName.toLowerCase()
        );
        if (exactMatch) {
          employeeId = exactMatch._id;
          console.log('Found employee by exact name match:', exactMatch);
        }
      }
      
      const formDataToSet = {
        employeeId: employeeId || '',
        leaveType: leaveRequest.leaveType || 'full_day',
        halfDayType: leaveRequest.halfDayType,
        startTime: leaveRequest.startTime || '',
        endTime: leaveRequest.endTime || '',
        startDate: leaveRequest.startDate ? new Date(leaveRequest.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: leaveRequest.endDate ? new Date(leaveRequest.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reason: leaveRequest.reason || '',
        status: leaveRequest.status || 'pending',
      };
      
      // Ensure employeeId is not empty
      if (!formDataToSet.employeeId) {
        console.error('ERROR: employeeId is empty! This should not happen.');
        console.error('leaveRequest:', leaveRequest);
        console.error('employees:', employees);
        console.error('formDataToSet:', formDataToSet);
      }
      
      console.log('Setting form data:', formDataToSet);
      setFormData(formDataToSet);
      setIsInitialized(true); // Mark form as initialized
      console.log('Form initialized successfully');
    }
  }, [mode, leaveRequest?._id, employees.length, isInitialized]); // Only depend on key changes, not all props

  // Watch for leaveRequest changes and update form when new data arrives
  useEffect(() => {
    if (mode === 'edit' && leaveRequest && isInitialized) {
      console.log('leaveRequest prop updated, checking for changes...');
      
      // Only update if there are actual changes from current form data
      const updates: Partial<AdminLeaveFormData> = {};
      
      // Check if status changed
      if (leaveRequest.status !== formData.status) {
        updates.status = leaveRequest.status;
        console.log('Status changed from', formData.status, 'to', leaveRequest.status);
      }
      
      // Check if reason changed
      if (leaveRequest.reason !== formData.reason) {
        updates.reason = leaveRequest.reason || '';
        console.log('Reason changed from', formData.reason, 'to', leaveRequest.reason);
      }
      
      // Check if dates changed
      const newStartDate = leaveRequest.startDate ? new Date(leaveRequest.startDate).toISOString().split('T')[0] : '';
      const newEndDate = leaveRequest.endDate ? new Date(leaveRequest.endDate).toISOString().split('T')[0] : '';
      
      if (newStartDate !== formData.startDate) {
        updates.startDate = newStartDate;
        console.log('Start date changed from', formData.startDate, 'to', newStartDate);
      }
      
      if (newEndDate !== formData.endDate) {
        updates.endDate = newEndDate;
        console.log('End date changed from', formData.endDate, 'to', newEndDate);
      }
      
      // Check if times changed
      if (leaveRequest.startTime !== formData.startTime) {
        updates.startTime = leaveRequest.startTime || '';
        console.log('Start time changed from', formData.startTime, 'to', leaveRequest.startTime);
      }
      
      if (leaveRequest.endTime !== formData.endTime) {
        updates.endTime = leaveRequest.endTime || '';
        console.log('End time changed from', formData.endTime, 'to', leaveRequest.endTime);
      }
      
      // Check if leave type changed
      if (leaveRequest.leaveType !== formData.leaveType) {
        updates.leaveType = leaveRequest.leaveType;
        console.log('Leave type changed from', formData.leaveType, 'to', leaveRequest.leaveType);
      }
      
      // Check if half day type changed
      if (leaveRequest.halfDayType !== formData.halfDayType) {
        updates.halfDayType = leaveRequest.halfDayType;
        console.log('Half day type changed from', formData.halfDayType, 'to', leaveRequest.halfDayType);
      }
      
      // Only update if there are actual changes
      if (Object.keys(updates).length > 0) {
        console.log('Applying updates to form:', updates);
        setFormData(prev => {
          // Never overwrite employeeId - it should always remain the same
          const newFormData = {
            ...prev,
            ...updates
          };
          
          // Ensure employeeId is preserved
          if (prev.employeeId && !updates.employeeId) {
            newFormData.employeeId = prev.employeeId;
            console.log('Preserving employeeId:', prev.employeeId);
          }
          
          return newFormData;
        });
      } else {
        console.log('No changes detected, form data remains the same');
      }
    }
  }, [leaveRequest?.updatedAt, leaveRequest?.status, leaveRequest?.reason, leaveRequest?.startDate, leaveRequest?.endDate, leaveRequest?.startTime, leaveRequest?.endTime, leaveRequest?.leaveType, leaveRequest?.halfDayType, mode, isInitialized]); // Watch specific fields for changes

  const loadHalfDayOptions = async () => {
    try {
      // This would typically come from an API call
      const options: HalfDayOption[] = [
        { _id: '1', code: 'morning', label: 'Sáng (8:00 - 12:00)', createdAt: '', updatedAt: '' },
        { _id: '2', code: 'afternoon', label: 'Chiều (13:00 - 17:00)', createdAt: '', updatedAt: '' },
        { _id: '3', code: 'evening', label: 'Tối (18:00 - 22:00)', createdAt: '', updatedAt: '' },
      ];
      setHalfDayOptions(options);
    } catch (error) {
      console.error('Failed to load half-day options:', error);
    }
  };

  // Reset form when needed
  const resetForm = () => {
    if (mode === 'edit' && leaveRequest) {
      console.log('Resetting form to initial state...');
      setIsInitialized(false);
      // This will trigger the main useEffect to re-populate form data
    }
  };

  // Force refresh form with latest data
  const forceRefreshForm = () => {
    if (mode === 'edit' && leaveRequest) {
      console.log('Force refreshing form with latest data...');
      
      // Find employee by employeeId
      let employeeId = '';
      if (leaveRequest.employeeId) {
        const foundEmployee = employees.find(emp => emp.employeeId === leaveRequest.employeeId);
        if (foundEmployee) {
          employeeId = foundEmployee._id;
          console.log('Found employee for force refresh:', foundEmployee);
        }
      }
      
      // Preserve current employeeId if available
      if (!employeeId && formData.employeeId) {
        employeeId = formData.employeeId;
        console.log('Preserving current employeeId:', employeeId);
      }
      
      const formDataToSet = {
        employeeId: employeeId || '',
        leaveType: leaveRequest.leaveType || 'full_day',
        halfDayType: leaveRequest.halfDayType,
        startTime: leaveRequest.startTime || '',
        endTime: leaveRequest.endTime || '',
        startDate: leaveRequest.startDate ? new Date(leaveRequest.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: leaveRequest.endDate ? new Date(leaveRequest.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reason: leaveRequest.reason || '',
        status: leaveRequest.status || 'pending',
      };
      
      console.log('Force refreshing form with data:', formDataToSet);
      setFormData(formDataToSet);
    }
  };

  const handleInputChange = (field: keyof AdminLeaveFormData, value: any) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };
      
      // Never allow employeeId to be empty
      if (field === 'employeeId' && !value) {
        console.error('ERROR: Attempting to set employeeId to empty value!');
        console.error('Current formData:', prev);
        console.error('Field:', field, 'Value:', value);
        return prev; // Don't update if trying to set employeeId to empty
      }
      
      console.log(`Updating field ${field} from "${prev[field]}" to "${value}"`);
      return newFormData;
    });
  };

  const validateForm = (): boolean => {
    if (!formData.employeeId) {
      console.error('VALIDATION ERROR: employeeId is empty!');
      console.error('Current formData:', formData);
      console.error('Selected employee:', selectedEmployee);
      toast.error('Vui lòng chọn nhân viên');
      return false;
    }
    if (!formData.startDate) {
      toast.error('Vui lòng chọn ngày bắt đầu');
      return false;
    }
    if (!formData.endDate) {
      toast.error('Vui lòng chọn ngày kết thúc');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return false;
    }
    if (formData.leaveType === 'half_day' && !formData.halfDayType) {
      toast.error('Vui lòng chọn thời gian nghỉ cho loại nghỉ nửa ngày');
      return false;
    }
    if (formData.leaveType === 'hourly') {
      if (!formData.startTime) {
        toast.error('Vui lòng chọn giờ bắt đầu');
        return false;
      }
      if (!formData.endTime) {
        toast.error('Vui lòng chọn giờ kết thúc');
        return false;
      }
      if (formData.startTime >= formData.endTime) {
        toast.error('Giờ kết thúc phải sau giờ bắt đầu');
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      toast.success(mode === 'create' ? 'Thêm lịch nghỉ thành công!' : 'Cập nhật lịch nghỉ thành công!');
      
      // If editing, notify parent component to refresh data
      // Don't refresh form immediately - wait for new leaveRequest prop
      if (mode === 'edit' && onFormRefresh) {
        console.log('Requesting parent to refresh data...');
        onFormRefresh();
      }
    } catch (error) {
      console.error('Error saving leave request:', error);
      toast.error('Có lỗi xảy ra!');
    } finally {
      setIsLoading(false);
    }
  };

  const getHalfDayLabel = (code: string) => {
    const option = halfDayOptions.find(opt => opt.code === code);
    return option ? option.label : code;
  };

  const selectedEmployee = employees.find(emp => emp._id === formData.employeeId);
  
  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    refreshForm: resetForm, // Reset form to trigger re-population
    forceRefresh: forceRefreshForm // Force refresh with latest data
  }));
  
  // Debug logs - only log when formData actually changes
  useEffect(() => {
    if (mode === 'edit' && isInitialized) {
      console.log('Form data updated:', formData);
      console.log('Selected employee:', selectedEmployee);
      
      // Debug employeeId changes
      if (formData.employeeId === '') {
        console.error('CRITICAL ERROR: employeeId became empty!');
        console.error('This should never happen. Debugging...');
        console.error('Current formData:', formData);
        console.error('Selected employee:', selectedEmployee);
        console.error('isInitialized:', isInitialized);
        console.error('mode:', mode);
      }
    }
  }, [formData.employeeId, formData.leaveType, formData.startDate, formData.endDate, formData.startTime, formData.endTime, formData.reason, formData.status, mode, isInitialized]);

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          {mode === 'create' ? <Plus className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
          <span>{mode === 'create' ? 'Thêm Lịch nghỉ mới' : 'Chỉnh sửa Lịch nghỉ'}</span>
        </CardTitle>
        <CardDescription className="text-green-100">
          {mode === 'create' ? 'Tạo lịch nghỉ cho nhân viên' : 'Cập nhật thông tin lịch nghỉ'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <User className="h-4 w-4 text-green-600" />
              <span>Chọn nhân viên *</span>
            </label>
            <Select 
              value={formData.employeeId} 
              onValueChange={(value) => handleInputChange('employeeId', value)}
            >
              <SelectTrigger className="border-green-300 focus:border-green-500 focus:ring-green-500">
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {employees.filter(emp => emp.status === 'active').map((employee) => (
                  <SelectItem key={employee._id} value={employee._id}>
                    {employee.employeeId} - {employee.name} ({employee.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedEmployee ? (
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{selectedEmployee.name}</p>
                    <p className="text-sm text-green-600 flex items-center space-x-1">
                      <span className="font-medium">Mã: {selectedEmployee.employeeId}</span>
                      <span className="mx-2">•</span>
                      <Building2 className="h-3 w-3" />
                      <span>{selectedEmployee.department}</span>
                      <span className="mx-2">•</span>
                      <span>{selectedEmployee.position}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : mode === 'edit' && leaveRequest?.employeeName ? (
              <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">{leaveRequest.employeeName}</p>
                    <p className="text-sm text-yellow-600">
                      Mã nhân viên: {leaveRequest.employeeId} • {leaveRequest.department}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      ⚠️ Không thể tìm thấy nhân viên trong danh sách. Vui lòng chọn lại từ dropdown.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Leave Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Loại nghỉ phép *</span>
            </label>
            <Select 
              value={formData.leaveType} 
              onValueChange={(value: 'full_day' | 'half_day' | 'hourly') => handleInputChange('leaveType', value)}
            >
              <SelectTrigger className="border-blue-300 focus:border-blue-500 focus:ring-blue-500">
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
          {formData.leaveType === 'half_day' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>Thời gian nghỉ *</span>
              </label>
              <Select 
                value={formData.halfDayType || ''} 
                onValueChange={(value: 'morning' | 'afternoon' | 'evening') => handleInputChange('halfDayType', value)}
              >
                <SelectTrigger className="border-orange-300 focus:border-orange-500 focus:ring-orange-500">
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
          {formData.leaveType === 'hourly' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>Giờ bắt đầu *</span>
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>Giờ kết thúc *</span>
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span>Từ ngày *</span>
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span>Đến ngày *</span>
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="border-green-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FileText className="h-4 w-4 text-teal-600" />
              <span>Lý do nghỉ (tùy chọn)</span>
            </label>
            <Textarea
              placeholder="Nhập lý do nghỉ phép..."
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={3}
              className="border-teal-300 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${formData.status === 'approved' ? 'bg-green-500' : formData.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
              <span>Trạng thái *</span>
            </label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'pending' | 'approved' | 'rejected') => handleInputChange('status', value)}
            >
              <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attachments Display (Read-only) */}
          {mode === 'edit' && leaveRequest?.attachments && leaveRequest.attachments.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Paperclip className="h-4 w-4 text-purple-600" />
                <span>Tài liệu đính kèm</span>
                <span className="text-xs text-gray-500">({leaveRequest.attachments.length} tài liệu)</span>
              </label>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <AttachmentViewer 
                  attachments={leaveRequest.attachments} 
                  canDelete={false}
                />
                <p className="text-xs text-gray-600 mt-2">
                  Tài liệu đính kèm chỉ có thể xem, không thể chỉnh sửa từ form này
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{mode === 'create' ? 'Thêm lịch nghỉ' : 'Cập nhật'}</span>
                </div>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              <div className="flex items-center space-x-2">
                <X className="h-4 w-4" />
                <span>Hủy</span>
              </div>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

export default AdminLeaveForm;
