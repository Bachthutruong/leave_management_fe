import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Department } from '@/types';
import { Building2, Save, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface DepartmentFormData {
  name: string;
  code: string;
  description: string;
}

interface DepartmentFormProps {
  department?: Department;
  onSave: (data: DepartmentFormData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ department, onSave, onCancel, mode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    // watch,
  } = useForm<DepartmentFormData>({
    defaultValues: {
      name: department?.name || '',
      code: department?.code || '',
      description: department?.description || '',
    },
  });

  const onSubmit = async (data: DepartmentFormData) => {
    setIsLoading(true);
    try {
      await onSave(data);
      toast.success(mode === 'create' ? '新增部門成功！' : '更新部門成功！');
    } catch (error) {
      toast.error('發生錯誤！');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          {mode === 'create' ? <Plus className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
          <span>{mode === 'create' ? '新增部門' : '編輯部門'}</span>
        </CardTitle>
        <CardDescription className="text-green-100">
          {mode === 'create' ? '填寫新部門資訊' : '更新部門資訊'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name & Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-green-600" />
                <span>部門名稱 *</span>
              </label>
              <Input
                {...register('name', { required: '部門名稱為必填項' })}
                placeholder="資訊技術部"
                className="border-green-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-green-600" />
                <span>部門代碼 *</span>
              </label>
              <Input
                {...register('code', { 
                  required: '部門代碼為必填項',
                  pattern: {
                    value: /^[A-Z0-9]+$/,
                    message: '部門代碼只能包含大寫字母和數字'
                  }
                })}
                placeholder="IT"
                className="border-green-300 focus:border-green-500 focus:ring-green-500"
                onChange={(e) => setValue('code', e.target.value.toUpperCase())}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              描述
            </label>
            <Textarea
              {...register('description')}
              placeholder="部門描述（可選）"
              className="border-green-300 focus:border-green-500 focus:ring-green-500"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? '儲存中...' : '儲存'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DepartmentForm;
