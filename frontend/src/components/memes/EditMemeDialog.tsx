'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import { editCreatedMeme } from '@/services/memeService';

interface EditMemeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memeId: string;
  initialTags?: string[];
  initialTitle?: string;
  onSuccess?: () => void;
}

export const EditMemeDialog: React.FC<EditMemeDialogProps> = ({
  isOpen,
  onClose,
  memeId,
  initialTags = [],
  initialTitle = "",
  onSuccess,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await editCreatedMeme(memeId, { title: title.trim() || "Untitled Meme", tags });
      toast.success('Meme updated successfully!');
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Edit error:', error);
      toast.error(error.response?.data?.message || 'Failed to update meme');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Edit Meme</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update meme tags
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <Label className="text-zinc-300 mb-2 block">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter meme title"
              maxLength={200}
              className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-600"
            />
            <p className="text-xs text-zinc-500 mt-1">{title.length}/200</p>
          </div>

          {/* Tags Input */}
          <div>
            <Label className="text-zinc-300 mb-2 block">Tags (Optional)</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a tag and press Enter"
                  className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-600"
                />
                <Button
                  onClick={handleAddTag}
                  variant="outline"
                  className="border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:text-zinc-50 hover:bg-zinc-800/80"
                >
                  Add
                </Button>
              </div>

              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-zinc-800 text-zinc-200 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:text-zinc-50 hover:bg-zinc-800/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-zinc-100 hover:bg-zinc-200 text-black font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
