'use client';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Trash2,
  MousePointer2,
  Type,
  Palette,
  PaintBucket,
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Copy,
} from 'lucide-react';
import { Layer, TextLayer } from '../types';
import { TextContentPanel } from './panels/TextContentPanel';
import { ImagePanel } from './panels/ImagePanel';
import { TypographyPanel } from './panels/TypographyPanel';
import { StylePanel } from './panels/StylePanel';
import { BackgroundPanel } from './panels/BackgroundPanel';
import { EffectsPanel } from './panels/EffectsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { FONTS } from '../types';

interface EditorSidebarProps {
  selectedLayer: Layer | undefined;
  layers: Layer[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  addText: () => void;
  deleteLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  advancedMode: boolean;
  filters: { brightness: number; contrast: number; saturate: number; blur: number };
  setFilters: (filters: { brightness: number; contrast: number; saturate: number; blur: number }) => void;
  onCropClick: () => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  selectedLayer,
  layers,
  selectedId,
  setSelectedId,
  addText,
  deleteLayer,
  updateLayer,
  advancedMode,
  filters,
  setFilters,
  onCropClick,
  onToggleVisibility,
  onToggleLock,
  onBringForward,
  onSendBackward,
  onDuplicateLayer,
}) => {
  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-950/90 backdrop-blur-lg flex flex-col z-20 shadow-2xl shadow-black/50">
      <div className="p-4 border-b border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          <span>Layers</span>
          <span className="text-zinc-600">{layers.length}</span>
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {layers.map((layer, index) => {
            const isActive = layer.id === selectedId;
            const label =
              layer.type === 'text'
                ? (layer as TextLayer).text || 'Text'
                : `Image ${index + 1}`;
            const displayLabel =
              label.length > 24 ? `${label.slice(0, 24)}…` : label;

            return (
              <div
                key={layer.id}
                className={`group flex items-center rounded-md px-2 py-1.5 text-xs cursor-pointer border ${
                  isActive
                    ? 'bg-zinc-900 border-zinc-300 text-zinc-100 shadow-sm shadow-black/40'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                }`}
                onClick={() => setSelectedId(layer.id)}
              >
                <span className="mr-2 text-[10px] text-zinc-500">
                  {layers.length - index}
                </span>
                <span className="flex-1 truncate">
                  {layer.type === 'text' ? 'T • ' : 'Img • '}
                  {displayLabel}
                </span>
                <div className="flex items-center gap-1 ml-2">
                  {advancedMode && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendBackward(layer.id);
                        }}
                        className="hidden group-hover:inline-flex text-zinc-500 hover:text-zinc-200"
                        aria-label="Send backward"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBringForward(layer.id);
                        }}
                        className="hidden group-hover:inline-flex text-zinc-500 hover:text-zinc-200"
                        aria-label="Bring forward"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateLayer(layer.id);
                        }}
                        className="hidden group-hover:inline-flex text-zinc-500 hover:text-zinc-200"
                        aria-label="Duplicate layer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(layer.id);
                    }}
                    className="text-zinc-500 hover:text-zinc-200"
                    aria-label={layer.isLocked ? 'Unlock layer' : 'Lock layer'}
                  >
                    {layer.isLocked ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Unlock className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layer.id);
                    }}
                    className="text-zinc-500 hover:text-zinc-200"
                    aria-label={
                      layer.isVisible ? 'Hide layer' : 'Show layer'
                    }
                  >
                    {layer.isVisible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            onClick={addText}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold shadow-md shadow-black/30"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Text
          </Button>
          <Button
            variant="destructive"
            onClick={() => selectedLayer && deleteLayer(selectedLayer.id)}
            disabled={!selectedLayer}
            className="opacity-90 hover:opacity-100 bg-red-900/50 border border-red-500/30 hover:bg-red-800/50"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {selectedLayer ? (
          <div className="p-5 space-y-6 pb-28">
            {selectedLayer.type === 'image' && (
              <ImagePanel
                selectedLayer={selectedLayer}
                updateLayer={updateLayer}
                advancedMode={advancedMode}
                onCropClick={onCropClick}
              />
            )}

            {selectedLayer.type === 'text' && (
              <>
                <TextContentPanel selectedLayer={selectedLayer as TextLayer} updateLayer={updateLayer} />

                {!advancedMode && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label>Quick Styles</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2 border-zinc-700"
                          onClick={() =>
                            updateLayer(selectedLayer.id, {
                              fontFamily: 'Impact',
                              fontSize: 50,
                              isBold: true,
                              isItalic: false,
                              caseFormat: 'uppercase',
                              fillColor: '#ffffff',
                              strokeColor: '#000000',
                              strokeWidth: 3,
                              backgroundOpacity: 0,
                              shadowEnabled: true,
                            })
                          }
                        >
                          Classic meme
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2 border-zinc-700"
                          onClick={() =>
                            updateLayer(selectedLayer.id, {
                              fontFamily: 'Arial',
                              fontSize: 28,
                              isBold: true,
                              caseFormat: 'none',
                              fillColor: '#ffffff',
                              strokeColor: '#000000',
                              strokeWidth: 1,
                              backgroundOpacity: 40,
                              backgroundColor: '#000000',
                              shadowEnabled: false,
                            })
                          }
                        >
                          Caption bar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2 border-zinc-700"
                          onClick={() =>
                            updateLayer(selectedLayer.id, {
                              fontFamily: 'Helvetica',
                              fontSize: 18,
                              isBold: false,
                              caseFormat: 'none',
                              fillColor: '#ffffff',
                              strokeWidth: 0,
                              opacity: 80,
                              shadowEnabled: false,
                            })
                          }
                        >
                          Watermark
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2 border-zinc-700"
                          onClick={() =>
                            updateLayer(selectedLayer.id, {
                              fontFamily: 'Arial',
                              fontSize: 36,
                              isBold: true,
                              caseFormat: 'uppercase',
                              fillColor: '#39ff14',
                              strokeColor: '#000000',
                              strokeWidth: 2,
                              shadowEnabled: true,
                              shadowColor: '#39ff14',
                              shadowBlur: 18,
                            })
                          }
                        >
                          Neon
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Font</Label>
                      <Select value={(selectedLayer as TextLayer).fontFamily} onValueChange={(v) => updateLayer(selectedLayer.id, { fontFamily: v })}>
                          <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                              {FONTS.map(f => <SelectItem key={f} value={f}><span style={{fontFamily: f}}>{f}</span></SelectItem>)}
                          </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <Label>Size</Label>
                        <span>{(selectedLayer as TextLayer).fontSize}px</span>
                      </div>
                      <Slider value={[(selectedLayer as TextLayer).fontSize]} min={10} max={150} onValueChange={(v) => updateLayer(selectedLayer.id, { fontSize: v[0] })} />
                    </div>

                    <div className="space-y-3">
                        <Label>Text Alignment</Label>
                        <div className="flex bg-zinc-900 p-1 rounded-md border border-zinc-800">
                            <Button variant={(selectedLayer as TextLayer).textAlign === 'left' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-8" onClick={() => updateLayer(selectedLayer.id, { textAlign: 'left' })}><AlignLeft className="w-4 h-4" /></Button>
                            <Button variant={(selectedLayer as TextLayer).textAlign === 'center' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-8" onClick={() => updateLayer(selectedLayer.id, { textAlign: 'center' })}><AlignCenter className="w-4 h-4" /></Button>
                            <Button variant={(selectedLayer as TextLayer).textAlign === 'right' ? 'secondary' : 'ghost'} size="sm" className="flex-1 h-8" onClick={() => updateLayer(selectedLayer.id, { textAlign: 'right' })}><AlignRight className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex gap-2">
                            <div className="h-10 w-10 rounded-md border border-zinc-700 overflow-hidden relative">
                                <input type="color" value={(selectedLayer as TextLayer).fillColor} onChange={(e) => updateLayer(selectedLayer.id, { fillColor: e.target.value })} className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer" />
                            </div>
                            <Input value={(selectedLayer as TextLayer).fillColor} onChange={(e) => updateLayer(selectedLayer.id, { fillColor: e.target.value })} className="bg-zinc-900 border-zinc-800 font-mono" />
                        </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <Label>Outline Width</Label>
                        <span>{(selectedLayer as TextLayer).strokeWidth}px</span>
                      </div>
                      <Slider value={[(selectedLayer as TextLayer).strokeWidth]} min={0} max={10} step={0.5} onValueChange={(v) => updateLayer(selectedLayer.id, { strokeWidth: v[0] })} />
                    </div>
                  </div>
                )}

                {advancedMode && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Quick Styles</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2 border-zinc-700"
                          onClick={() =>
                            updateLayer(selectedLayer.id, {
                              fontFamily: 'Impact',
                              fontSize: 50,
                              isBold: true,
                              isItalic: false,
                              caseFormat: 'uppercase',
                              fillColor: '#ffffff',
                              strokeColor: '#000000',
                              strokeWidth: 3,
                              backgroundOpacity: 0,
                              shadowEnabled: true,
                            })
                          }
                        >
                          Classic meme
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2 border-zinc-700"
                          onClick={() =>
                            updateLayer(selectedLayer.id, {
                              fontFamily: 'Arial',
                              fontSize: 28,
                              isBold: true,
                              caseFormat: 'none',
                              fillColor: '#ffffff',
                              strokeColor: '#000000',
                              strokeWidth: 1,
                              backgroundOpacity: 40,
                              backgroundColor: '#000000',
                              shadowEnabled: false,
                            })
                          }
                        >
                          Caption bar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2 border-zinc-700"
                          onClick={() =>
                            updateLayer(selectedLayer.id, {
                              fontFamily: 'Helvetica',
                              fontSize: 18,
                              isBold: false,
                              caseFormat: 'none',
                              fillColor: '#ffffff',
                              strokeWidth: 0,
                              opacity: 80,
                              shadowEnabled: false,
                            })
                          }
                        >
                          Watermark
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2 border-zinc-700"
                          onClick={() =>
                            updateLayer(selectedLayer.id, {
                              fontFamily: 'Arial',
                              fontSize: 36,
                              isBold: true,
                              caseFormat: 'uppercase',
                              fillColor: '#39ff14',
                              strokeColor: '#000000',
                              strokeWidth: 2,
                              shadowEnabled: true,
                              shadowColor: '#39ff14',
                              shadowBlur: 18,
                            })
                          }
                        >
                          Neon
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="typography" className="w-full">
                      <TabsList className="w-full bg-zinc-900 border border-zinc-800 grid grid-cols-4">
                        <TabsTrigger value="typography"><Type className="w-4 h-4" /></TabsTrigger>
                        <TabsTrigger value="style"><Palette className="w-4 h-4" /></TabsTrigger>
                        <TabsTrigger value="background"><PaintBucket className="w-4 h-4" /></TabsTrigger>
                        <TabsTrigger value="effects"><Sparkles className="w-4 h-4" /></TabsTrigger>
                      </TabsList>

                      <TabsContent value="typography">
                        <TypographyPanel selectedLayer={selectedLayer as TextLayer} updateLayer={updateLayer} />
                      </TabsContent>
                      <TabsContent value="style">
                        <StylePanel selectedLayer={selectedLayer as TextLayer} updateLayer={updateLayer} />
                      </TabsContent>
                      <TabsContent value="background">
                        <BackgroundPanel selectedLayer={selectedLayer as TextLayer} updateLayer={updateLayer} />
                      </TabsContent>
                      <TabsContent value="effects">
                        <EffectsPanel selectedLayer={selectedLayer as TextLayer} updateLayer={updateLayer} filters={filters} setFilters={setFilters} />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
            <MousePointer2 className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-zinc-400">No layer selected</h3>
            <p className="text-sm">Click on text to edit or add a new text layer</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};