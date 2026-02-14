'use client';
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Crop } from 'lucide-react';
import { ImageLayer, Layer } from '../../types';

interface ImagePanelProps {
  selectedLayer: ImageLayer;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  advancedMode: boolean;
  onCropClick: () => void;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({ selectedLayer, updateLayer, advancedMode, onCropClick }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>Image Layer</span>
        </div>
        <Button variant="outline" size="sm" onClick={onCropClick}>
            <Crop className="w-3 h-3 mr-1.5" />
            Crop
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-zinc-400">
            <Label>Width</Label>
            <span>{selectedLayer.width}px</span>
          </div>
          <Slider
            value={[selectedLayer.width]}
            min={50}
            max={800}
            step={10}
            onValueChange={(v) => updateLayer(selectedLayer.id, { width: v[0] })}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs text-zinc-400">
            <Label>Height</Label>
            <span>{selectedLayer.height}px</span>
          </div>
          <Slider
            value={[selectedLayer.height]}
            min={50}
            max={800}
            step={10}
            onValueChange={(v) => updateLayer(selectedLayer.id, { height: v[0] })}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs text-zinc-400">
            <Label>Opacity</Label>
            <span>{selectedLayer.opacity}%</span>
          </div>
          <Slider
            value={[selectedLayer.opacity]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => updateLayer(selectedLayer.id, { opacity: v[0] })}
          />
        </div>

        {advancedMode && (
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-zinc-400">
              <Label>Rotation</Label>
              <span>{selectedLayer.rotation}°</span>
            </div>
            <Slider
              value={[selectedLayer.rotation]}
              min={-180}
              max={180}
              step={1}
              onValueChange={(v) => updateLayer(selectedLayer.id, { rotation: v[0] })}
            />
          </div>
        )}
      </div>
    </div>
  );
};