import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee, Department } from '@/types';
import { departmentAPI } from '@/services/api';
import { User, Building2, Phone, Car, Save, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmployeeFormData {
  phone: string;
  name: string;
  department: string;
  licensePlate: string;
  role?: 'employee' | 'department_head';
  status: 'active' | 'inactive';
}

interface EmployeeFormProps {
  employee?: Employee;
  onSave: (data: EmployeeFormData) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave, onCancel, mode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EmployeeFormData>({
    defaultValues: {
      phone: employee?.phone || '',
      name: employee?.name || '',
      department: employee?.department || '',
      licensePlate: employee?.licensePlate || '',
      role: employee?.role || 'employee',
      status: employee?.status || 'active',
    },
  });

  const status = watch('status');
  const role = watch('role');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const deptData = await departmentAPI.getActive();
        setDepartments(deptData);
      } catch (error) {
        toast.error('載入部門資料失敗');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    try {
      await onSave(data);
      toast.success(mode === 'create' ? '新增員工成功！' : '更新員工成功！');
    } catch (error) {
      toast.error('發生錯誤！');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">載入部門資料中...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          {mode === 'create' ? <Plus className="h-5 w-5" /> : <User className="h-5 w-5" />}
          <span>{mode === 'create' ? '新增員工' : '編輯員工'}</span>
        </CardTitle>
        <CardDescription className="text-blue-100">
          {mode === 'create' ? '填寫新員工資訊' : '更新員工資訊'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Phone & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>電話號碼 *</span>
              </label>
              <Input
                {...register('phone', { required: '電話號碼為必填項' })}
                placeholder="0123456789"
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>姓名 *</span>
              </label>
              <Input
                {...register('name', { required: '姓名為必填項' })}
                placeholder="張三"
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* License Plate & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Car className="h-4 w-4 text-green-600" />
                <span>車牌號碼 *</span>
              </label>
              <Input
                {...register('licensePlate', { required: '車牌號碼為必填項' })}
                placeholder="ABC-123"
                className="border-green-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.licensePlate && (
                <p className="text-sm text-red-500">{errors.licensePlate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-green-600" />
                <span>部門 *</span>
              </label>
              <Select value={watch('department')} onValueChange={(value) => setValue('department', value)}>
                <SelectTrigger className="border-green-300 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="選擇部門" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department.message}</p>
              )}
            </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <User className="h-4 w-4 text-purple-600" />
                <span>角色 *</span>
              </label>
              <Select value={role} onValueChange={(value: 'employee' | 'department_head') => setValue('role', value)}>
                <SelectTrigger className="border-purple-300 focus:border-purple-500 focus:ring-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">員工</SelectItem>
                  <SelectItem value="department_head">隊長</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>狀態 *</span> 
              </label>
              <Select value={status} onValueChange={(value: 'active' | 'inactive') => setValue('status', value)}>
                <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">在職</SelectItem>
                  <SelectItem value="inactive">離職</SelectItem>
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
                  <span>正在處理...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{mode === 'create' ? '新增員工' : '更新'}</span>
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
                <span>取消</span>
              </div>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeForm;
