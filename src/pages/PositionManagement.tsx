import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Position } from '@/types';
import { positionAPI } from '@/services/api';
import { User, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import PositionForm from '@/components/PositionForm';
import ConfirmDialog from '@/components/ConfirmDialog';

const PositionManagement = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await positionAPI.getAll();
      setPositions(data);
    } catch (error) {
      toast.error('載入職位資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPosition(null);
    setShowForm(true);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setShowForm(true);
  };

  const handleDelete = (position: Position) => {
    setDeletingPosition(position);
    setShowDeleteDialog(true);
  };

  const handleSave = async (data: { name: string; code: string; description: string }) => {
    try {
      if (editingPosition) {
        await positionAPI.update(editingPosition._id, data);
      } else {
        await positionAPI.create(data);
      }
      setShowForm(false);
      loadPositions();
    } catch (error: any) {
      const message = error.response?.data?.message || '操作失敗';
      toast.error(message);
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPosition) return;

    try {
      await positionAPI.delete(deletingPosition._id);
      setShowDeleteDialog(false);
      setDeletingPosition(null);
      loadPositions();
      toast.success('職位刪除成功');
    } catch (error: any) {
      const message = error.response?.data?.message || '刪除失敗';
      toast.error(message);
    }
  };

  const toggleActive = async (position: Position) => {
    try {
      await positionAPI.update(position._id, { isActive: !position.isActive });
      loadPositions();
      toast.success(position.isActive ? '職位已停用' : '職位已啟用');
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">職位管理</h1>
        <p className="text-gray-600">管理公司職位資訊</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-6 w-6" />
                <span>職位列表</span>
              </CardTitle>
              <CardDescription className="text-purple-100">
                共 {positions.length} 個職位
              </CardDescription>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              新增職位
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>職位名稱</TableHead>
                <TableHead>代碼</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>建立時間</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    暫無職位資料
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((position) => (
                  <TableRow key={position._id}>
                    <TableCell className="font-medium">{position.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {position.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {position.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={position.isActive ? "default" : "secondary"}>
                        {position.isActive ? '啟用' : '停用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(position.createdAt).toLocaleDateString('zh-TW')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(position)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {position.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(position)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(position)}
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

      {/* Position Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingPosition ? '編輯職位' : '新增職位'}
            </DialogTitle>
          </DialogHeader>
          <PositionForm
            position={editingPosition || undefined}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            mode={editingPosition ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="確認刪除"
        description={`確定要刪除職位「${deletingPosition?.name}」嗎？此操作無法復原。`}
        onConfirm={handleConfirmDelete}
        confirmText="刪除"
        cancelText="取消"
      />
    </div>
  );
};

export default PositionManagement;
