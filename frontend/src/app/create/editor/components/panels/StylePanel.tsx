'use client';
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { TextLayer, Layer, COLORS } from '../../types'

interface StylePanelProps {
  selectedLayer: TextLayer;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
}

export const StylePanel: React.FC<StylePanelProps> = ({ selectedLayer, updateLayer }) => {
  return (
    <div className="space-y-5 pt-4">
      <div className="space-y-2">
        <Label>Fill Color</Label>
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-md border border-zinc-700 overflow-hidden relative">
            <input type="color" value={selectedLayer.fillColor} onChange={(e) => updateLayer(selectedLayer.id, { fillColor: e.target.value })} className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer" />
          </div>
          <Input value={selectedLayer.fillColor} onChange={(e) => updateLayer(selectedLayer.id, { fillColor: e.target.value })} className="bg-zinc-900 border-zinc-800 font-mono" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {COLORS.map(c => <button key={c} onClick={() => updateLayer(selectedLayer.id, { fillColor: c })} className={`w-6 h-6 rounded-full border border-zinc-700 hover:scale-110 transition ${selectedLayer.fillColor === c ? 'ring-2 ring-purple-500' : ''}`} style={{ backgroundColor: c }} />)}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-zinc-800">
        <Label>Stroke / Outline</Label>
        <div className="flex gap-2 mb-2">
          <div className="h-9 w-9 rounded-md border border-zinc-700 overflow-hidden relative">
            <input type="color" value={selectedLayer.strokeColor} onChange={(e) => updateLayer(selectedLayer.id, { strokeColor: e.target.value })} className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer" />
          </div>
          <Input value={selectedLayer.strokeColor} onChange={(e) => updateLayer(selectedLayer.id, { strokeColor: e.target.value })} className="bg-zinc-900 border-zinc-800 font-mono" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-400"><Label>Width</Label> <span>{selectedLayer.strokeWidth}px</span></div>
          <Slider value={[selectedLayer.strokeWidth]} min={0} max={20} step={0.5} onValueChange={(v) => updateLayer(selectedLayer.id, { strokeWidth: v[0] })} />
        </div>
      </div>

      <div className="space-y-1 pt-2 border-t border-zinc-800">
        <div className="flex justify-between text-xs text-zinc-400"><Label>Opacity</Label> <span>{selectedLayer.opacity}%</span></div>
        <Slider value={[selectedLayer.opacity]} min={0} max={100} step={1} onValueChange={(v) => updateLayer(selectedLayer.id, { opacity: v[0] })} />
      </div>
    </div>
  );
};