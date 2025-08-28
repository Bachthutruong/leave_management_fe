import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Department } from '@/types';
import { departmentAPI } from '@/services/api';
import { Building2, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import DepartmentForm from '@/components/DepartmentForm';
import ConfirmDialog from '@/components/ConfirmDialog';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentAPI.getAll();
      setDepartments(data);
    } catch (error) {
      toast.error('載入部門資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    setShowForm(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleDelete = (department: Department) => {
    setDeletingDepartment(department);
    setShowDeleteDialog(true);
  };

  const handleSave = async (data: { name: string; code: string; description: string }) => {
    try {
      if (editingDepartment) {
        await departmentAPI.update(editingDepartment._id, data);
      } else {
        await departmentAPI.create(data);
      }
      setShowForm(false);
      loadDepartments();
    } catch (error: any) {
      const message = error.response?.data?.message || '操作失敗';
      toast.error(message);
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDepartment) return;

    try {
      await departmentAPI.delete(deletingDepartment._id);
      setShowDeleteDialog(false);
      setDeletingDepartment(null);
      loadDepartments();
      toast.success('部門刪除成功');
    } catch (error: any) {
      const message = error.response?.data?.message || '刪除失敗';
      toast.error(message);
    }
  };

  const toggleActive = async (department: Department) => {
    try {
      await departmentAPI.update(department._id, { isActive: !department.isActive });
      loadDepartments();
      toast.success(department.isActive ? '部門已停用' : '部門已啟用');
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">部門管理</h1>
        <p className="text-gray-600">管理公司部門資訊</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-6 w-6" />
                <span>部門列表</span>
              </CardTitle>
              <CardDescription className="text-green-100">
                共 {departments.length} 個部門
              </CardDescription>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-white text-green-600 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              新增部門
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>部門名稱</TableHead>
                <TableHead>代碼</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>建立時間</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    暫無部門資料
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={department._id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {department.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {department.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={department.isActive ? "default" : "secondary"}>
                        {department.isActive ? '啟用' : '停用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(department.createdAt).toLocaleDateString('zh-TW')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(department)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {department.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(department)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(department)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Department Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? '編輯部門' : '新增部門'}
            </DialogTitle>
          </DialogHeader>
          <DepartmentForm
            department={editingDepartment || undefined}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            mode={editingDepartment ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="確認刪除"
        description={`確定要刪除部門「${deletingDepartment?.name}」嗎？此操作無法復原。`}
        onConfirm={handleConfirmDelete}
        confirmText="刪除"
        cancelText="取消"
      />
    </div>
  );
};

export default DepartmentManagement;
