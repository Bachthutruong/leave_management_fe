import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types';
import { User, Building2, Mail, Phone, Calendar, Save, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmployeeFormData {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

interface EmployeeFormProps {
  employee?: Employee;
  onSave: (data: EmployeeFormData) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave, onCancel, mode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EmployeeFormData>({
    defaultValues: {
      employeeId: employee?.employeeId || '',
      name: employee?.name || '',
      department: employee?.department || '',
      position: employee?.position || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      status: employee?.status || 'active',
      joinDate: employee?.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  const status = watch('status');

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    try {
      await onSave(data);
      toast.success(mode === 'create' ? 'Thêm nhân viên thành công!' : 'Cập nhật nhân viên thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra!');
    } finally {
      setIsLoading(false);
    }
  };

  const departments = [
    'Kế toán', 'Nhân sự', 'Kinh doanh', 'Marketing', 'Công nghệ', 'Vận hành', 'Chăm sóc khách hàng'
  ];

  const positions = [
    'Nhân viên', 'Trưởng nhóm', 'Quản lý', 'Giám đốc', 'Thực tập sinh'
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          {mode === 'create' ? <Plus className="h-5 w-5" /> : <User className="h-5 w-5" />}
          <span>{mode === 'create' ? 'Thêm Nhân viên mới' : 'Chỉnh sửa Nhân viên'}</span>
        </CardTitle>
        <CardDescription className="text-blue-100">
          {mode === 'create' ? 'Điền thông tin nhân viên mới' : 'Cập nhật thông tin nhân viên'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Employee ID & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>Mã nhân viên *</span>
              </label>
              <Input
                {...register('employeeId', { required: 'Mã nhân viên là bắt buộc' })}
                placeholder="NV001"
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.employeeId && (
                <p className="text-sm text-red-500">{errors.employeeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>Họ và tên *</span>
              </label>
              <Input
                {...register('name', { required: 'Họ tên là bắt buộc' })}
                placeholder="Nguyễn Văn A"
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Department & Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-green-600" />
                <span>Phòng ban *</span>
              </label>
              <Select value={watch('department')} onValueChange={(value) => setValue('department', value)}>
                <SelectTrigger className="border-green-300 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <User className="h-4 w-4 text-purple-600" />
                <span>Chức vụ *</span>
              </label>
              <Select value={watch('position')} onValueChange={(value) => setValue('position', value)}>
                <SelectTrigger className="border-purple-300 focus:border-purple-500 focus:ring-purple-500">
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && (
                <p className="text-sm text-red-500">{errors.position.message}</p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-orange-600" />
                <span>Email *</span>
              </label>
              <Input
                {...register('email', { 
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ'
                  }
                })}
                type="email"
                placeholder="example@company.com"
                className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Phone className="h-4 w-4 text-teal-600" />
                <span>Số điện thoại *</span>
              </label>
              <Input
                {...register('phone', { 
                  required: 'Số điện thoại là bắt buộc',
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: 'Số điện thoại không hợp lệ'
                  }
                })}
                placeholder="0123456789"
                className="border-teal-300 focus:border-teal-500 focus:ring-teal-500"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Join Date & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span>Ngày vào làm *</span>
              </label>
              <Input
                {...register('joinDate', { required: 'Ngày vào làm là bắt buộc' })}
                type="date"
                className="border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.joinDate && (
                <p className="text-sm text-red-500">{errors.joinDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Trạng thái *</span>
              </label>
              <Select value={status} onValueChange={(value: 'active' | 'inactive') => setValue('status', value)}>
                <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang làm việc</SelectItem>
                  <SelectItem value="inactive">Đã nghỉ việc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
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
                  <span>{mode === 'create' ? 'Thêm nhân viên' : 'Cập nhật'}</span>
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
};

export default EmployeeForm;
