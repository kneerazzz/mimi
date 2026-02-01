'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo, Redo, ZoomIn, ZoomOut } from 'lucide-react';

interface BottomToolbarProps {
  undo: () => void;
  redo: () => void;
  historyIndex: number;
  historyLength: number;
  zoom: number;
  setZoom: (zoom: number | ((prevZoom: number) => number)) => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  undo,
  redo,
  historyIndex,
  historyLength,
  zoom,
  setZoom,
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-zinc-700/50 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl shadow-black/50 z-30">
      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-zinc-800" onClick={undo} disabled={historyIndex === 0}><Undo className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-zinc-800" onClick={redo} disabled={historyIndex === historyLength - 1}><Redo className="w-4 h-4" /></Button>
      <div className="w-px h-4 bg-zinc-700 mx-1" />
      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-zinc-800" onClick={() => setZoom(z => Math.max(10, z - 10))}><ZoomOut className="w-4 h-4" /></Button>
      <span className="text-xs font-mono w-12 text-center text-zinc-400">{zoom}%</span>
      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-zinc-800" onClick={() => setZoom(z => Math.min(200, z + 10))}><ZoomIn className="w-4 h-4" /></Button>
    </div>
  );
};