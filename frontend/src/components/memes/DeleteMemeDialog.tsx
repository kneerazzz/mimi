'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { deleteCreatedMeme } from '@/services/memeService';
import { useRouter } from 'next/navigation';

interface DeleteMemeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memeId: string;
  onSuccess?: () => void;
  redirectAfterDelete?: boolean;
}

export const DeleteMemeDialog: React.FC<DeleteMemeDialogProps> = ({
  isOpen,
  onClose,
  memeId,
  onSuccess,
  redirectAfterDelete = false,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteCreatedMeme(memeId);
      toast.success('Meme deleted successfully!');
      onClose();
      onSuccess?.();
      
      if (redirectAfterDelete) {
        setTimeout(() => {
          router.push('/feed');
        }, 500);
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete meme');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-red-500 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Meme
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Are you sure you want to delete this meme? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
            className="border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:text-zinc-50 hover:bg-zinc-800/80"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Permanently'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
