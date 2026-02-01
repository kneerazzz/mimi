
'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Upload, ArrowLeft, LayoutTemplate } from 'lucide-react';

import { useEditorState } from './hooks/useEditorState';
import { useCanvas } from './hooks/useCanvas';

import { EditorNavbar } from './components/EditorNavbar';
import { EditorCanvas } from './components/EditorCanvas';
import { EditorSidebar } from './components/EditorSidebar';
import { BottomToolbar } from './components/BottomToolbar';

export default function AdvancedMemeEditor() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    loading,
    template,
    imageLoaded,
    imageObj,
    advancedMode,
    setAdvancedMode,
    layers,
    selectedId,
    isDragging,
    zoom,
    setZoom,
    filters,
    setFilters,
    loadedImages,
    customImage,
    addText,
    handleImageLayerUpload,
    updateLayer,
    deleteLayer,
    handleImageUpload,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    selectedLayer,
    undo,
    redo,
    historyIndex,
    history,
    templateId
  } = useEditorState(containerRef);

  const { generateCanvas } = useCanvas(canvasRef, imageObj, imageLoaded, layers, filters, loadedImages);

  const handleDownload = () => {
    generateCanvas();
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    toast.success("Meme generated successfully!");
  };

  if (!templateId && !customImage) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight">Create your masterpiece</h1>
            <p className="mt-4 text-lg text-zinc-400">Choose your starting point to get the memes flowing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Option 1: Upload */}
            <div
              onClick={() => document.getElementById('initial-upload')?.click()}
              className="group relative p-8 bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl shadow-lg hover:border-zinc-500 hover:bg-zinc-900 transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-linear-to-br from-zinc-600 to-zinc-700 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-100">Upload an Image</h2>
                <p className="mt-2 text-zinc-400">Start from scratch with your own picture.</p>
              </div>
            </div>

            {/* Option 2: Templates */}
            <Link href="/templates" className="group relative p-8 bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl shadow-lg hover:border-green-500 hover:bg-zinc-900 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="bg-linear-to-br from-green-600 to-green-700 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                  <LayoutTemplate className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-100">Browse Templates</h2>
                <p className="mt-2 text-zinc-400">Use a popular meme format to get started.</p>
              </div>
            </Link>
          </div>

          <div className="mt-12 text-center border-t border-zinc-800 pt-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/create')}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Create
            </Button>
          </div>
          
          <input
            id="initial-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden selection:bg-purple-500/30">
      <EditorNavbar
        advancedMode={advancedMode}
        setAdvancedMode={setAdvancedMode}
        handleImageLayerUpload={handleImageLayerUpload}
        handleDownload={handleDownload}
        customImage={customImage}
      />

      <div
        className="flex-1 flex overflow-hidden relative"
        onMouseMove={handleDragMove}
        onTouchMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <EditorCanvas
          containerRef={containerRef}
          canvasRef={canvasRef}
          imageLoaded={imageLoaded}
          template={template}
          customImage={customImage}
          zoom={zoom}
          isDragging={isDragging}
          advancedMode={advancedMode}
          filters={filters}
          imageObj={imageObj}
          layers={layers}
          selectedId={selectedId}
          handleDragStart={handleDragStart}
        />

        <EditorSidebar
          selectedLayer={selectedLayer}
          addText={addText}
          deleteLayer={deleteLayer}
          updateLayer={updateLayer}
          advancedMode={advancedMode}
          filters={filters}
          setFilters={setFilters}
        />

        <BottomToolbar
          undo={undo}
          redo={redo}
          historyIndex={historyIndex}
          historyLength={history.length}
          zoom={zoom}
          setZoom={setZoom}
        />
      </div>
    </div>
  );
}
