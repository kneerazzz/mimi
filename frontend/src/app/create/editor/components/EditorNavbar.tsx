'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Upload, Download, ArrowLeft, Sparkles, Zap, Settings, Crop, Save, FolderOpen, Share2 } from 'lucide-react';

interface EditorNavbarProps {
  advancedMode: boolean;
  setAdvancedMode: (checked: boolean) => void;
  handleImageLayerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: () => void;
  handleSave: () => void;
  handleLoad: () => void;
  customImage: string | null;
  onCropClick: () => void;
  onPublishClick: () => void;
}

export const EditorNavbar: React.FC<EditorNavbarProps> = ({
  advancedMode,
  setAdvancedMode,
  handleImageLayerUpload,
  handleDownload,
  handleSave,
  handleLoad,
  customImage,
  onCropClick,
  onPublishClick,
}) => {
  const router = useRouter();

  return (
    <header className="h-16 border-b border-zinc-800 px-4 md:px-6 flex items-center justify-between bg-zinc-950/90 backdrop-blur-lg shrink-0 z-20">
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="bg-linear-to-br from-zinc-700 to-zinc-500 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline">Meme Studio</span>
            {customImage && (
              <div className="text-[10px] text-purple-400 flex items-center gap-1">
                <Upload className="w-2.5 h-2.5" /> <span className="hidden sm:inline">Custom Image</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar mask-gradient pr-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800 shrink-0">
          <Zap className={`w-3.5 h-3.5 ${!advancedMode ? 'text-zinc-400' : 'text-zinc-100'}`} />
          <Switch
            checked={advancedMode}
            onCheckedChange={setAdvancedMode}
            className="data-[state=checked]:bg-zinc-100 data-[state=checked]:before:bg-zinc-900 scale-75 md:scale-100"
          />
          <Settings className={`w-3.5 h-3.5 ${advancedMode ? 'text-zinc-400' : 'text-zinc-100'}`} />
          <span className="text-xs font-medium ml-1 hidden sm:inline">{advancedMode ? 'Advanced' : 'Normal'}</span>
        </div>

        <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:text-zinc-50 hover:bg-zinc-800/80 shrink-0" onClick={onCropClick}>
          <Crop className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Crop</span>
        </Button>
        <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:text-zinc-50 hover:bg-zinc-800/80 shrink-0" onClick={() => document.getElementById('file-upload')?.click()}>
          <Upload className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Upload</span>
          <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageLayerUpload} />
        </Button>
        <Button variant="outline" size="sm" onClick={handleLoad} className="border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:text-zinc-50 hover:bg-zinc-800/80 shrink-0">
          <FolderOpen className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Load</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleSave} className="border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:text-zinc-50 hover:bg-zinc-800/80 shrink-0">
          <Save className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Save</span>
        </Button>
        <Button onClick={handleDownload} size="sm" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold shadow-md shadow-black/30 shrink-0">
          <Download className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Export</span>
        </Button>
        <Button onClick={onPublishClick} size="sm" className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold shadow-md shadow-black/30 shrink-0">
          <Share2 className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Publish</span>
        </Button>
      </div>
    </header>
  );
};