'use client';
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { TextLayer, Layer } from '../types';

interface BackgroundPanelProps {
  selectedLayer: TextLayer;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
}

export const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ selectedLayer, updateLayer }) => {
  return (
    <div className="space-y-5 pt-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Background Opacity</Label>
          <span className="text-xs text-zinc-400">{selectedLayer.backgroundOpacity}%</span>
        </div>
        <Slider value={[selectedLayer.backgroundOpacity]} min={0} max={100} step={1} onValueChange={(v) => updateLayer(selectedLayer.id, { backgroundOpacity: v[0] })} />
      </div>

      <div className="space-y-2">
        <Label>Background Color</Label>
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-md border border-zinc-700 overflow-hidden relative">
            <input type="color" value={selectedLayer.backgroundColor} onChange={(e) => updateLayer(selectedLayer.id, { backgroundColor: e.target.value })} className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer" />
          </div>
          <Input value={selectedLayer.backgroundColor} onChange={(e) => updateLayer(selectedLayer.id, { backgroundColor: e.target.value })} className="bg-zinc-900 border-zinc-800 font-mono" />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex justify-between text-xs text-zinc-400"><Label>Padding</Label> <span>{selectedLayer.backgroundPadding}px</span></div>
        <Slider value={[selectedLayer.backgroundPadding]} min={0} max={50} step={1} onValueChange={(v) => updateLayer(selectedLayer.id, { backgroundPadding: v[0] })} />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-zinc-400"><Label>Corner Radius</Label> <span>{selectedLayer.backgroundRadius}px</span></div>
        <Slider value={[selectedLayer.backgroundRadius]} min={0} max={50} step={1} onValueChange={(v) => updateLayer(selectedLayer.id, { backgroundRadius: v[0] })} />
      </div>
    </div>
  );
};