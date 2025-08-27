import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isBulkDelete?: boolean;
  count?: number;
  entityType?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isBulkDelete = false,
  count = 0,
  entityType = "entity"
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-lg text-red-900">{title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            {isBulkDelete ? (
              <div className="space-y-2">
                <p className="text-gray-700">
                  Are you sure you want to delete <span className="font-semibold text-red-600">{count}</span> selected {entityType}{count !== 1 ? 's' : ''}?
                </p>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. All selected {entityType}s will be permanently removed.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-700">
                  Are you sure you want to delete <span className="font-semibold text-red-600">{itemName}</span>?
                </p>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. The {entityType} will be permanently removed.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isBulkDelete ? `Delete ${count} ${entityType}s` : `Delete ${entityType}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteConfirmationModal;
