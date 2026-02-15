import React, { RefObject } from 'react';
import { Layer, hexToRgba, formatText } from '../types';

interface EditorCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  imageLoaded: boolean;
  template: any;
  customImage: string | null;
  zoom: number;
  isDragging: boolean;
  advancedMode: boolean;
  filters: { brightness: number; contrast: number; saturate: number; blur: number };
  imageObj: HTMLImageElement | null;
  layers: Layer[];
  selectedId: string;
  handleDragStart: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  containerRef,
  canvasRef,
  imageLoaded,
  template,
  customImage,
  zoom,
  isDragging,
  advancedMode,
  filters,
  imageObj,
  layers,
  selectedId,
  handleDragStart,
}) => {
  return (
    <div className="flex-1 bg-[#09090b] flex flex-col relative min-h-0">
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
        <canvas ref={canvasRef} className="hidden" />

        {imageLoaded && template && (
          <div
            ref={containerRef}
            className="relative shadow-2xl shadow-black/50 select-none ring-1 ring-zinc-800 max-h-[50vh] md:max-h-[85vh] max-w-full md:max-w-[85vw]"
            style={{
              transform: `scale(${zoom / 100})`,
              aspectRatio: `${imageObj?.naturalWidth}/${imageObj?.naturalHeight}`,
              filter: advancedMode ? `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) blur(${filters.blur}px)` : 'none',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <img src={customImage || template.imageUrl} alt="" className="w-full h-full object-contain pointer-events-none" />

            {layers.filter(l => l.isVisible).map((layer) => {
              // ... (Keep existing layer rendering logic exactly as is)
               if (layer.type === 'image') {
                return (
                  <div
                    key={layer.id}
                    onMouseDown={(e) => handleDragStart(e, layer.id)}
                    onTouchStart={(e) => handleDragStart(e, layer.id)}
                    style={{
                      position: 'absolute',
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                      opacity: layer.opacity / 100,
                      cursor: isDragging ? 'grabbing' : 'grab',
                      zIndex: selectedId === layer.id ? 50 : 10,
                      width: `${layer.width}px`,
                      height: `${layer.height}px`,
                    }}
                    className={`group hover:scale-[1.02] transition-transform ${
                      selectedId === layer.id
                        ? 'ring-1 ring-zinc-100/80 shadow-lg shadow-black/40 rounded-md'
                        : 'hover:ring-1 hover:ring-zinc-400/60 rounded-md'
                    }`}
                  >
                    <img
                      src={layer.imageUrl}
                      alt="Layer"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'fill',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                );
              }

              // Text layer
              const text = layer;
              const bgStyle = text.backgroundOpacity > 0 ? {
                backgroundColor: hexToRgba(text.backgroundColor, text.backgroundOpacity),
                padding: `${text.backgroundPadding}px`,
                borderRadius: `${text.backgroundRadius}px`,
              } : {};

              const hasExplicitWidth = typeof text.width === 'number' && text.width > 0;
              const hasExplicitHeight = typeof text.height === 'number' && text.height > 0;

              return (
                <div
                  key={text.id}
                  onMouseDown={(e) => handleDragStart(e, text.id)}
                  onTouchStart={(e) => handleDragStart(e, text.id)}
                  style={{
                    position: 'absolute',
                    left: `${text.x}%`,
                    top: `${text.y}%`,
                    transform: `translate(-50%, -50%) rotate(${text.rotation}deg)`,
                    fontSize: `${text.fontSize}px`,
                    color: text.fillColor,
                    fontFamily: text.fontFamily,
                    textAlign: text.textAlign,
                    opacity: text.opacity / 100,
                    lineHeight: text.lineHeight,
                    letterSpacing: `${text.letterSpacing}px`,
                    fontWeight: text.isBold ? '900' : 'normal',
                    fontStyle: text.isItalic ? 'italic' : 'normal',
                    WebkitTextStroke: `${text.strokeWidth}px ${text.strokeColor}`,
                    textShadow: text.shadowEnabled ? `${text.shadowOffsetX}px ${text.shadowOffsetY}px ${text.shadowBlur}px ${text.shadowColor}` : 'none',
                    ...bgStyle,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    whiteSpace: 'pre-wrap',
                    width: hasExplicitWidth ? `${text.width}px` : 'max-content',
                    maxWidth: '100%',
                    ...(hasExplicitHeight ? { maxHeight: `${text.height}px` } : {}),
                    overflow: 'hidden',
                    zIndex: selectedId === text.id ? 50 : 10
                  }}
                  className={`group hover:scale-[1.02] transition-transform ${
                    selectedId === text.id
                      ? 'ring-1 ring-zinc-100/80 shadow-lg shadow-black/40 rounded-md'
                      : 'hover:ring-1 hover:ring-zinc-400/60 rounded-md'
                  }`}
                >
                  {formatText(text.text, text.caseFormat)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};