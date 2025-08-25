import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Building2, User, Lock, LogIn } from 'lucide-react';

interface LoginFormData {
  username?: string;
  password?: string;
  employeeId?: string;
}

const LoginForm: React.FC = () => {
  const [loginType, setLoginType] = useState<'admin' | 'employee'>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      let response;
      
      if (loginType === 'admin') {
        response = await authAPI.adminLogin({
          username: data.username!,
          password: data.password!,
        });
        login(response.token, response.admin!, 'admin');
        toast.success('登入成功！');
      } else {
        response = await authAPI.employeeAuth(data.employeeId!);
        login(response.token, response.employee!, 'employee');
        toast.success('驗證成功！');
      }
      
      reset();
    } catch (error: any) {
      const message = error.response?.data?.message || '登入失敗！';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">請假管理系統</CardTitle>
          <CardDescription className="text-blue-100">
            請選擇登入類型並輸入資訊
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <Select value={loginType} onValueChange={(value: 'admin' | 'employee') => setLoginType(value)}>
              <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="選擇登入類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">👤 員工</SelectItem>
                <SelectItem value="admin">🔧 管理員</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {loginType === 'admin' ? (
              <>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                    <Input
                      {...register('username', { required: '用戶名為必填項' })}
                      placeholder="用戶名"
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                    <Input
                      {...register('password', { required: '密碼為必填項' })}
                      type="password"
                      placeholder="密碼"
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                  <Input
                    {...register('employeeId', { required: '員工編號為必填項' })}
                    placeholder="輸入員工編號"
                    className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {errors.employeeId && (
                  <p className="text-sm text-red-500">{errors.employeeId.message}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>處理中...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>{loginType === 'admin' ? '登入' : '驗證'}</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p>
              {loginType === 'admin' 
                ? '🔧 使用管理員帳號登入'
                : '👤 輸入員工編號進行驗證'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
