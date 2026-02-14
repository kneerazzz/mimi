
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCrop: (croppedImageUrl: string) => void;
}

export function CropDialog({ isOpen, onClose, imageSrc, onCrop }: CropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const imageRef = React.useRef<HTMLImageElement>(null);

  const getCroppedImg = () => {
    if (!imageRef.current || !crop || !crop.width || !crop.height) {
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise<string>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const fileUrl = window.URL.createObjectURL(blob);
        resolve(fileUrl);
      }, 'image/png');
    });
  };

  const handleCrop = async () => {
    const croppedImageUrl = await getCroppedImg();
    if (croppedImageUrl) {
      onCrop(croppedImageUrl);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        {imageSrc && (
          <ReactCrop crop={crop} onChange={c => setCrop(c)}>
            <img ref={imageRef} src={imageSrc} />
          </ReactCrop>
        )}
        <DialogFooter>
          <Button onClick={handleCrop}>Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
