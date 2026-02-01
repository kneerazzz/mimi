'use client';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MousePointer2, Type, Palette, PaintBucket, Sparkles } from 'lucide-react';
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
  addText: () => void;
  deleteLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  advancedMode: boolean;
  filters: { brightness: number; contrast: number; saturate: number; blur: number };
  setFilters: (filters: { brightness: number; contrast: number; saturate: number; blur: number }) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  selectedLayer,
  addText,
  deleteLayer,
  updateLayer,
  advancedMode,
  filters,
  setFilters,
}) => {
  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-950/90 backdrop-blur-lg flex flex-col z-20 shadow-2xl shadow-black/50">
      <div className="p-4 border-b border-zinc-800 grid grid-cols-2 gap-2">
        <Button onClick={addText} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg shadow-purple-600/20">
          <Plus className="w-4 h-4 mr-2" /> Add Text
        </Button>
        <Button variant="destructive" onClick={() => selectedLayer && deleteLayer(selectedLayer.id)} disabled={!selectedLayer} className="opacity-90 hover:opacity-100 bg-red-900/50 border border-red-500/30 hover:bg-red-800/50">
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {selectedLayer ? (
          <div className="p-5 space-y-6">
            {selectedLayer.type === 'image' && (
              <ImagePanel
                selectedLayer={selectedLayer}
                updateLayer={updateLayer}
                advancedMode={advancedMode}
              />
            )}

            {selectedLayer.type === 'text' && (
              <>
                <TextContentPanel selectedLayer={selectedLayer as TextLayer} updateLayer={updateLayer} />

                {!advancedMode && (
                  <div className="space-y-5">
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