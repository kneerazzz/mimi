'use client';

import React, { useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Upload, ArrowLeft, LayoutTemplate, Loader2 } from 'lucide-react';

import { useEditorState } from './hooks/useEditorState';
import { useCanvas } from './hooks/useCanvas';
import type { Layer, TextLayer, ImageLayer } from './types';

import { EditorNavbar } from './components/EditorNavbar';
import { EditorCanvas } from './components/EditorCanvas';
import { EditorSidebar } from './components/EditorSidebar';
import { BottomToolbar } from './components/BottomToolbar';
import { CropDialog } from './components/CropDialog';
import { PublishDialog } from './components/PublishDialog';
import { useAuth } from '@/context/AuthContext';

function EditorContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [isCropDialogOpen, setIsCropDialogOpen] = React.useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = React.useState(false);
  const [croppingLayerId, setCroppingLayerId] = React.useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layersRef = useRef<Layer[]>([]);

  const {
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
    setCustomImage,
    addText,
    handleImageLayerUpload,
    updateLayer,
    deleteLayer,
    handleImageUpload,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    selectedLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    bringLayerForward,
    sendLayerBackward,
    duplicateLayer,
    loadSavedState,
    undo,
    redo,
    historyIndex,
    history,
    setSelectedId,
    templateId,
    type
  } = useEditorState(containerRef);

  // ✅ nullable-safe hook usage
  const { generateCanvas } = useCanvas(
    canvasRef,
    imageObj,
    imageLoaded,
    layers,
    filters,
    loadedImages
  );

  const handleLoad = () => {
    try {
      const savedData = localStorage.getItem('meme-editor-save');
      if (!savedData) {
        toast.error('No saved meme found');
        return;
      }
      
      const parsed = JSON.parse(savedData);
      const success = loadSavedState(parsed);
      
      if (success) {
        toast.success('Meme loaded successfully!');
      } else {
        toast.error('Invalid save data');
      }
    } catch (error) {
      toast.error('Failed to load saved meme');
      console.error('Load error:', error);
    }
  };

  // Keep layersRef in sync with layers
  React.useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  const handleSave = async () => {
    if (!imageLoaded) {
      toast.error('Please wait for the image to load');
      return;
    }

    try {
      // Use the ref to get the absolute latest layers state
      const currentLayers = layersRef.current.length > 0 ? layersRef.current : layers;
      
      // Deep clone layers to ensure all properties are saved
      const layersToSave = JSON.parse(JSON.stringify(currentLayers)).map((layer: Layer) => {
        if (layer.type === 'text') {
          const textLayer = layer as TextLayer;
          return {
            ...textLayer,
            // Ensure all text properties are included
            text: textLayer.text,
            fontSize: textLayer.fontSize,
            fontFamily: textLayer.fontFamily,
            width: textLayer.width,
            height: textLayer.height,
            x: textLayer.x,
            y: textLayer.y,
            textAlign: textLayer.textAlign,
            letterSpacing: textLayer.letterSpacing,
            lineHeight: textLayer.lineHeight,
            caseFormat: textLayer.caseFormat,
            isBold: textLayer.isBold,
            isItalic: textLayer.isItalic,
            fillColor: textLayer.fillColor,
            strokeColor: textLayer.strokeColor,
            strokeWidth: textLayer.strokeWidth,
            opacity: textLayer.opacity,
            rotation: textLayer.rotation,
            backgroundColor: textLayer.backgroundColor,
            backgroundOpacity: textLayer.backgroundOpacity,
            backgroundPadding: textLayer.backgroundPadding,
            backgroundRadius: textLayer.backgroundRadius,
            shadowEnabled: textLayer.shadowEnabled,
            shadowColor: textLayer.shadowColor,
            shadowBlur: textLayer.shadowBlur,
            shadowOffsetX: textLayer.shadowOffsetX,
            shadowOffsetY: textLayer.shadowOffsetY,
            isVisible: textLayer.isVisible,
            isLocked: textLayer.isLocked,
          };
        } else {
          const imageLayer = layer as ImageLayer;
          return {
            ...imageLayer,
            // Ensure all image properties are included
            imageUrl: imageLayer.imageUrl,
            width: imageLayer.width,
            height: imageLayer.height,
            x: imageLayer.x,
            y: imageLayer.y,
            opacity: imageLayer.opacity,
            rotation: imageLayer.rotation,
            isVisible: imageLayer.isVisible,
            isLocked: imageLayer.isLocked,
          };
        }
      });
      
      // Save to localStorage with all data
      const saveData = {
        layers: layersToSave,
        filters: { ...filters },
        customImage,
        templateId,
        template: template ? { imageUrl: template.imageUrl, name: template.name } : null,
        zoom,
        selectedId,
        advancedMode,
        timestamp: Date.now(),
      };
      
      localStorage.setItem('meme-editor-save', JSON.stringify(saveData));
      toast.success('Meme saved successfully! All changes preserved.');
    } catch (error) {
      toast.error('Failed to save meme');
      console.error('Save error:', error);
    }
  };

  const handleDownload = async () => {
    if (!canvasRef.current || !imageLoaded) {
      toast.error('Please wait for the image to load');
      return;
    }

    try {
      // Generate canvas first to ensure everything is rendered
      generateCanvas();
      
      // Wait a bit for canvas to render, especially for text
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Ensure canvas is ready
      if (!canvasRef.current) return;
      
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();

      toast.success('Meme exported successfully!');
    } catch (error) {
      toast.error('Failed to export meme');
      console.error('Export error:', error);
    }
  };

  const handleCrop = (croppedImageUrl: string) => {
    if (croppingLayerId) {
      updateLayer(croppingLayerId, { imageUrl: croppedImageUrl });
    } else {
      setCustomImage(croppedImageUrl);
    }
  };

  const openCropDialog = (layerId: string | null) => {
    setCroppingLayerId(layerId);
    setIsCropDialogOpen(true);
  }

  if (!templateId && !customImage) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight">
              Create your masterpiece
            </h1>
            <p className="mt-4 text-lg text-zinc-400">
              Choose your starting point to get the memes flowing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div
              onClick={() => document.getElementById('initial-upload')?.click()}
              className="group relative p-8 bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl shadow-lg hover:border-zinc-500 hover:bg-zinc-900 transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-linear-to-br from-zinc-600 to-zinc-700 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-100">
                  Upload an Image
                </h2>
                <p className="mt-2 text-zinc-400">
                  Start from scratch with your own picture.
                </p>
              </div>
            </div>

            <Link
              href="/templates"
              className="group relative p-8 bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl shadow-lg hover:border-green-500 hover:bg-zinc-900 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-linear-to-br from-green-600 to-green-700 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                  <LayoutTemplate className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-100">
                  Browse Templates
                </h2>
                <p className="mt-2 text-zinc-400">
                  Use a popular meme format to get started.
                </p>
              </div>
            </Link>
          </div>

          <div className="mt-12 text-center border-t border-zinc-800 pt-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/create')}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Create
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
    );
  }

  const getImageUrlToCrop = () => {
    if (croppingLayerId) {
      const layer = layers.find(l => l.id === croppingLayerId);
      if (layer?.type === 'image') {
        return layer.imageUrl;
      }
    }
    return customImage || template?.imageUrl;
  }
  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <EditorNavbar
        advancedMode={advancedMode}
        setAdvancedMode={setAdvancedMode}
        handleImageLayerUpload={handleImageLayerUpload}
        handleDownload={handleDownload}
        handleSave={handleSave}
        handleLoad={handleLoad}
        customImage={customImage}
        onCropClick={() => openCropDialog(null)}
        onPublishClick={() => {
          if (!user) {
            toast.error('Please login to publish');
            return;
          }
          generateCanvas();
          setIsPublishDialogOpen(true);
        }}
      />

      <CropDialog
        isOpen={isCropDialogOpen}
        onClose={() => setIsCropDialogOpen(false)}
        imageSrc={getImageUrlToCrop()}
        onCrop={handleCrop}
      />

      <PublishDialog
        isOpen={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        canvasRef={canvasRef}
        textLayers={layers.filter(l => l.type === 'text')}
        templateId={templateId}
        username={user?.username || null}
        type={type}
      />

      <div
        className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
        onMouseMove={(e) => {
          handleDragMove(e);
        }}
        onTouchMove={(e) => {
          handleDragMove(e);
        }}
        onMouseUp={() => {
          handleDragEnd();
        }}
        onTouchEnd={() => {
          handleDragEnd();
        }}
        onMouseLeave={() => {
          handleDragEnd();
        }}
      >
        <div className="flex-1 relative flex flex-col min-h-0">
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
          
          <BottomToolbar
            undo={undo}
            redo={redo}
            historyIndex={historyIndex}
            historyLength={history.length}
            zoom={zoom}
            setZoom={setZoom}
          />
        </div>

        <EditorSidebar
          layers={layers}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          selectedLayer={selectedLayer}
          addText={addText}
          deleteLayer={deleteLayer}
          updateLayer={updateLayer}
          advancedMode={advancedMode}
          filters={filters}
          setFilters={setFilters}
          onCropClick={() => openCropDialog(selectedLayer?.id || null)}
          onToggleVisibility={toggleLayerVisibility}
          onToggleLock={toggleLayerLock}
          onBringForward={bringLayerForward}
          onSendBackward={sendLayerBackward}
          onDuplicateLayer={duplicateLayer}
        />
      </div>
    </div>
  );
}

export default function AdvancedMemeEditor() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-400">
          <Loader2 className="mr-4 h-10 w-10 animate-spin" />
          <span className="text-lg font-medium">Loading Studio...</span>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}