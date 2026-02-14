'use client';
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Type } from 'lucide-react';
import { TextLayer, Layer } from '../../types';

interface TextContentPanelProps {
  selectedLayer: TextLayer;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
}

export const TextContentPanel: React.FC<TextContentPanelProps> = ({ selectedLayer, updateLayer }) => {
  return (
    <div className="space-y-3">
      <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
        <Type className="w-3 h-3" /> Text Content
      </Label>
      <Textarea
        value={selectedLayer.text}
        onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
        className="bg-zinc-900 border-zinc-800 min-h-20 font-medium resize-none"
        placeholder="Enter your meme text..."
      />
    </div>
  );
};