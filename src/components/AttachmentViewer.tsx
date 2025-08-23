import React, { useState } from 'react';
import { Attachment } from '../types';
import { Eye, Download, FileText, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface AttachmentViewerProps {
  attachments: Attachment[];
  canDelete?: boolean;
  onDelete?: (publicId: string) => void;
}

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({ 
  attachments, 
  canDelete = false, 
  onDelete 
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (mimetype: string): boolean => {
    return mimetype.startsWith('image/');
  };

  const getFileIcon = (mimetype: string) => {
    if (isImage(mimetype)) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (mimetype === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDownload = (attachment: Attachment) => {
    // For Cloudinary, we can add download parameters to the URL
    const downloadUrl = attachment.url.replace('/upload/', '/upload/fl_attachment/');
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (attachment: Attachment) => {
    if (isImage(attachment.mimetype)) {
      setPreviewImage(attachment.url);
    } else {
      // For non-images, open in new tab
      window.open(attachment.url, '_blank');
    }
  };

  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Không có tài liệu đính kèm</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Tài liệu đính kèm ({attachments.length})
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((attachment, index) => (
          <div
            key={attachment.publicId || index}
            className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              {getFileIcon(attachment.mimetype)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.originalName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </p>
                
                {/* Preview for images */}
                {isImage(attachment.mimetype) && (
                  <div className="mt-2">
                    <img
                      src={attachment.url}
                      alt={attachment.originalName}
                      className="h-16 w-16 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => handlePreview(attachment)}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(attachment)}
                  className="h-8 w-8 p-0"
                  title="Xem trước"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                  className="h-8 w-8 p-0"
                  title="Tải xuống"
                >
                  <Download className="h-3 w-3" />
                </Button>
                
                {canDelete && onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(attachment.publicId)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
                    title="Xóa"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Xem trước ảnh</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewImage(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {previewImage && (
            <div className="flex justify-center">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttachmentViewer;
