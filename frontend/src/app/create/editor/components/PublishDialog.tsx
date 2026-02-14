'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import { createMemeManyally } from '@/services/memeService';
import { useRouter } from 'next/navigation';

interface PublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  textLayers: any[];
  templateId: string | null;
  username: string | null;
  type?: string;
}

export const PublishDialog: React.FC<PublishDialogProps> = ({
  isOpen,
  onClose,
  canvasRef,
  textLayers,
  templateId,
  username,
  type = 'public',
}) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

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

  // Generate preview image when dialog opens
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setPreviewDataUrl(dataUrl);
    }
  }, [isOpen, canvasRef]);

  const handlePublish = async () => {
    try {
      if (!canvasRef.current) {
        toast.error('Canvas not ready. Please try again.');
        return;
      }

      if (textLayers.length === 0) {
        toast.error('Please add at least one text layer');
        return;
      }

      if (!title.trim()) {
        toast.error('Please enter a title for your meme');
        return;
      }

      setIsPublishing(true);

      // Convert canvas to blob
      const canvasBlob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current?.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png');
      });

      // Transform textLayers to match backend schema
      // Frontend: fontSize, width -> Backend: size, layerWidth
      const transformedTextLayers = textLayers.map(layer => ({
        x: layer.x ?? 50,
        y: layer.y ?? 10,
        size: layer.fontSize ?? layer.size ?? 24,
        layerWidth: layer.width ?? layer.layerWidth ?? 90,
        text: layer.text || '',
        fontFamily: layer.fontFamily || 'Impact',
        fillColor: layer.fillColor || '#ffffff',
        strokeColor: layer.strokeColor || '#000000',
        strokeWidth: layer.strokeWidth || 2,
        textAlign: layer.textAlign || 'center',
        opacity: layer.opacity ?? 100,
      }));

      // Create FormData
      const formData = new FormData();
      formData.append('memeImage', canvasBlob, `meme-${Date.now()}.png`);
      formData.append('title', title.trim());
      formData.append('textLayers', JSON.stringify(transformedTextLayers));
      formData.append('tags', JSON.stringify(tags));
      
      // Only add templateId if it exists and is not 'null'
      if (templateId && templateId !== 'null') {
        formData.append('templateId', templateId);
        formData.append('type', type);
      }

      // Call API
      const response = await createMemeManyally(formData);
      
      toast.success('Meme published successfully!');
      onClose();
      
      // Redirect to the meme page
      setTimeout(() => {
        router.push(`/feed/${response.data._id}?type=CreatedMeme`);
      }, 500);
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error(error.response?.data?.message || 'Failed to publish meme');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Publish Your Meme</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Review your meme details before publishing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div>
            <Label className="text-zinc-300 mb-2 block">Preview</Label>
            <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800 flex items-center justify-center">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Meme preview"
                  className="max-w-full max-h-64 object-contain rounded"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-zinc-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <Label className="text-zinc-300 mb-2 block">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your meme"
              maxLength={200}
              className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-600"
            />
            <p className="text-xs text-zinc-500 mt-1">{title.length}/200</p>
          </div>

          {/* User Info (Read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300 text-sm">Creator</Label>
              <div className="mt-1 px-3 py-2 bg-zinc-950 rounded border border-zinc-800 text-zinc-400">
                {username || 'Anonymous'}
              </div>
            </div>
            {templateId && templateId !== 'null' && (
              <div>
                <Label className="text-zinc-300 text-sm">Template ID</Label>
                <div className="mt-1 px-3 py-2 bg-zinc-950 rounded border border-zinc-800 text-zinc-400 truncate text-xs">
                  {templateId}
                </div>
              </div>
            )}
          </div>

          {/* Text Layers Info (Read-only) */}
          <div>
            <Label className="text-zinc-300 text-sm mb-2 block">Text Layers ({textLayers.length})</Label>
            <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800 max-h-48 overflow-y-auto">
              {textLayers.map((layer, idx) => (
                <div key={idx} className="text-xs text-zinc-400 py-1 border-b border-zinc-800 last:border-0">
                  <span className="font-semibold">{layer.text || 'Text Layer'}</span>
                  <span className="text-zinc-500 ml-2">
                    ({layer.fontSize}px, {layer.fontFamily})
                  </span>
                </div>
              ))}
            </div>
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
              onClick={handlePublish}
              disabled={isPublishing || textLayers.length === 0 || !title.trim()}
              className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Meme'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
