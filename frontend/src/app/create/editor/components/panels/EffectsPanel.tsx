'use client';
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Move, Image as ImageIcon } from 'lucide-react';
import { TextLayer, Layer } from '../../types';

interface EffectsPanelProps {
  selectedLayer: TextLayer;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  filters: { brightness: number; contrast: number; saturate: number; blur: number };
  setFilters: (filters: { brightness: number; contrast: number; saturate: number; blur: number }) => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ selectedLayer, updateLayer, filters, setFilters }) => {
  return (
    <div className="space-y-5 pt-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2"><Move className="w-3 h-3" /> Drop Shadow</Label>
          <Switch checked={selectedLayer.shadowEnabled} onCheckedChange={(c) => updateLayer(selectedLayer.id, { shadowEnabled: c })} />
        </div>

        {selectedLayer.shadowEnabled && (
          <div className="space-y-4 pl-2 border-l-2 border-zinc-800">
            <div className="flex gap-2 items-center">
              <input type="color" value={selectedLayer.shadowColor} onChange={(e) => updateLayer(selectedLayer.id, { shadowColor: e.target.value })} className="h-8 w-8 rounded" />
              <Label className="text-xs">Shadow Color</Label>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between"><Label className="text-xs text-zinc-400">Blur</Label><span className="text-xs">{selectedLayer.shadowBlur}px</span></div>
              <Slider value={[selectedLayer.shadowBlur]} min={0} max={50} onValueChange={(v) => updateLayer(selectedLayer.id, { shadowBlur: v[0] })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-zinc-400">Offset X</Label>
                <Slider value={[selectedLayer.shadowOffsetX]} min={-50} max={50} onValueChange={(v) => updateLayer(selectedLayer.id, { shadowOffsetX: v[0] })} />
                <span className="text-xs text-zinc-500">{selectedLayer.shadowOffsetX}px</span>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-zinc-400">Offset Y</Label>
                <Slider value={[selectedLayer.shadowOffsetY]} min={-50} max={50} onValueChange={(v) => updateLayer(selectedLayer.id, { shadowOffsetY: v[0] })} />
                <span className="text-xs text-zinc-500">{selectedLayer.shadowOffsetY}px</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-zinc-800 space-y-4">
        <Label className="flex items-center gap-2 text-zinc-400"><ImageIcon className="w-3 h-3" /> Image Filters</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between"><span className="text-xs">Brightness</span> <span className="text-xs text-zinc-500">{filters.brightness}%</span></div>
          <Slider value={[filters.brightness]} min={0} max={200} onValueChange={(v) => setFilters({ ...filters, brightness: v[0] })} />

          <div className="flex items-center justify-between"><span className="text-xs">Contrast</span> <span className="text-xs text-zinc-500">{filters.contrast}%</span></div>
          <Slider value={[filters.contrast]} min={0} max={200} onValueChange={(v) => setFilters({ ...filters, contrast: v[0] })} />

          <div className="flex items-center justify-between"><span className="text-xs">Saturation</span> <span className="text-xs text-zinc-500">{filters.saturate}%</span></div>
          <Slider value={[filters.saturate]} min={0} max={200} onValueChange={(v) => setFilters({ ...filters, saturate: v[0] })} />

          <div className="flex items-center justify-between"><span className="text-xs">Blur</span> <span className="text-xs text-zinc-500">{filters.blur}px</span></div>
          <Slider value={[filters.blur]} min={0} max={20} step={0.5} onValueChange={(v) => setFilters({ ...filters, blur: v[0] })} />
        </div>
      </div>
    </div>
  );
};