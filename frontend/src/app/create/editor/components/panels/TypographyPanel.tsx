'use client';
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, CaseUpper, CaseLower, CaseSensitive } from 'lucide-react';
import { TextLayer, Layer, FONTS } from '../../types';

interface TypographyPanelProps {
  selectedLayer: TextLayer;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
}

export const TypographyPanel: React.FC<TypographyPanelProps> = ({ selectedLayer, updateLayer }) => {
  return (
    <div className="space-y-5 pt-4">
      <div className="space-y-3">
        <Label>Font Family</Label>
        <Select value={selectedLayer.fontFamily} onValueChange={(v) => updateLayer(selectedLayer.id, { fontFamily: v })}>
          <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            {FONTS.map(f => <SelectItem key={f} value={f}><span style={{ fontFamily: f }}>{f}</span></SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Size (px)</Label>
          <Input type="number" value={selectedLayer.fontSize} onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })} className="bg-zinc-900 h-8" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Rotate (°)</Label>
          <Input type="number" value={selectedLayer.rotation} onChange={(e) => updateLayer(selectedLayer.id, { rotation: Number(e.target.value) })} className="bg-zinc-900 h-8" />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Formatting</Label>
        <div className="flex bg-zinc-900 p-1 rounded-md border border-zinc-800 gap-1">
          <Button variant={selectedLayer.textAlign === 'left' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-7" onClick={() => updateLayer(selectedLayer.id, { textAlign: 'left' })}><AlignLeft className="w-4 h-4" /></Button>
          <Button variant={selectedLayer.textAlign === 'center' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-7" onClick={() => updateLayer(selectedLayer.id, { textAlign: 'center' })}><AlignCenter className="w-4 h-4" /></Button>
          <Button variant={selectedLayer.textAlign === 'right' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-7" onClick={() => updateLayer(selectedLayer.id, { textAlign: 'right' })}><AlignRight className="w-4 h-4" /></Button>
        </div>
        <div className="flex bg-zinc-900 p-1 rounded-md border border-zinc-800 gap-1">
          <Button variant={selectedLayer.isBold ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-7" onClick={() => updateLayer(selectedLayer.id, { isBold: !selectedLayer.isBold })}><Bold className="w-4 h-4" /></Button>
          <Button variant={selectedLayer.isItalic ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-7" onClick={() => updateLayer(selectedLayer.id, { isItalic: !selectedLayer.isItalic })}><Italic className="w-4 h-4" /></Button>
        </div>
        <div className="flex bg-zinc-900 p-1 rounded-md border border-zinc-800 gap-1">
          <Button variant={selectedLayer.caseFormat === 'uppercase' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-7" onClick={() => updateLayer(selectedLayer.id, { caseFormat: 'uppercase' })}><CaseUpper className="w-3.5 h-3.5" /></Button>
          <Button variant={selectedLayer.caseFormat === 'lowercase' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-7" onClick={() => updateLayer(selectedLayer.id, { caseFormat: 'lowercase' })}><CaseLower className="w-3.5 h-3.5" /></Button>
          <Button variant={selectedLayer.caseFormat === 'capitalize' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-7" onClick={() => updateLayer(selectedLayer.id, { caseFormat: 'capitalize' })}><CaseSensitive className="w-3.5 h-3.5" /></Button>
          <Button variant={selectedLayer.caseFormat === 'none' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-7 text-[10px]" onClick={() => updateLayer(selectedLayer.id, { caseFormat: 'none' })}>Aa</Button>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-400"><Label>Letter Spacing</Label> <span>{selectedLayer.letterSpacing}px</span></div>
          <Slider value={[selectedLayer.letterSpacing]} min={-5} max={50} step={1} onValueChange={(v) => updateLayer(selectedLayer.id, { letterSpacing: v[0] })} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-400"><Label>Line Height</Label> <span>{selectedLayer.lineHeight.toFixed(1)}</span></div>
          <Slider value={[selectedLayer.lineHeight]} min={0.5} max={3} step={0.1} onValueChange={(v) => updateLayer(selectedLayer.id, { lineHeight: v[0] })} />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <Label>Box Width</Label>
              <span>{selectedLayer.width}px</span>
            </div>
            <Slider
              value={[selectedLayer.width]}
              min={80}
              max={800}
              step={5}
              onValueChange={(v) => updateLayer(selectedLayer.id, { width: v[0] })}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <Label>Box Height</Label>
              <span>{selectedLayer.height}px</span>
            </div>
            <Slider
              value={[selectedLayer.height]}
              min={40}
              max={400}
              step={5}
              onValueChange={(v) => updateLayer(selectedLayer.id, { height: v[0] })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};