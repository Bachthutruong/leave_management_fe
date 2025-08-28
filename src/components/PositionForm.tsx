import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Position } from '@/types';
import { User, Save, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface PositionFormData {
  name: string;
  code: string;
  description: string;
}

interface PositionFormProps {
  position?: Position;
  onSave: (data: PositionFormData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const PositionForm: React.FC<PositionFormProps> = ({ position, onSave, onCancel, mode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    // watch,
  } = useForm<PositionFormData>({
    defaultValues: {
      name: position?.name || '',
      code: position?.code || '',
      description: position?.description || '',
    },
  });

  const onSubmit = async (data: PositionFormData) => {
    setIsLoading(true);
    try {
      await onSave(data);
      toast.success(mode === 'create' ? '新增職位成功！' : '更新職位成功！');
    } catch (error) {
      toast.error('發生錯誤！');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          {mode === 'create' ? <Plus className="h-5 w-5" /> : <User className="h-5 w-5" />}
          <span>{mode === 'create' ? '新增職位' : '編輯職位'}</span>
        </CardTitle>
        <CardDescription className="text-purple-100">
          {mode === 'create' ? '填寫新職位資訊' : '更新職位資訊'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name & Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <User className="h-4 w-4 text-purple-600" />
                <span>職位名稱 *</span>
              </label>
              <Input
                {...register('name', { required: '職位名稱為必填項' })}
                placeholder="軟體工程師"
                className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <User className="h-4 w-4 text-purple-600" />
                <span>職位代碼 *</span>
              </label>
              <Input
                {...register('code', { 
                  required: '職位代碼為必填項',
                  pattern: {
                    value: /^[A-Z0-9]+$/,
                    message: '職位代碼只能包含大寫字母和數字'
                  }
                })}
                placeholder="SE"
                className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
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
              placeholder="職位描述（可選）"
              className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
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
              className="bg-purple-600 hover:bg-purple-700 text-white"
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

export default PositionForm;
