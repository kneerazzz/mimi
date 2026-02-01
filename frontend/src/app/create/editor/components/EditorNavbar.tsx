'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Upload, Download, ArrowLeft, Sparkles, Zap, Settings } from 'lucide-react';

interface EditorNavbarProps {
  advancedMode: boolean;
  setAdvancedMode: (checked: boolean) => void;
  handleImageLayerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: () => void;
  customImage: string | null;
}

export const EditorNavbar: React.FC<EditorNavbarProps> = ({
  advancedMode,
  setAdvancedMode,
  handleImageLayerUpload,
  handleDownload,
  customImage,
}) => {
  const router = useRouter();

  return (
    <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-lg shrink-0 z-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-zinc-500 to-zinc-400 w-8 h-8 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">Meme Studio</span>
            {customImage && (
              <div className="text-[10px] text-purple-400 flex items-center gap-1">
                <Upload className="w-2.5 h-2.5" /> Custom Image
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
          <Zap className={`w-3.5 h-3.5 ${!advancedMode ? 'text-zinc-400' : 'text-purple-400'}`} />
          <Switch
            checked={advancedMode}
            onCheckedChange={setAdvancedMode}
            className="data-[state=checked]:bg-purple-600"
          />
          <Settings className={`w-3.5 h-3.5 ${advancedMode ? 'text-zinc-400' : 'text-purple-400'}`} />
          <span className="text-xs font-medium ml-1">{advancedMode ? 'Advanced' : 'Normal'}</span>
        </div>

        <Button variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-700/50" onClick={() => document.getElementById('file-upload')?.click()}>
          <Upload className="w-4 h-4 mr-2" /> Upload Image
          <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageLayerUpload} />
        </Button>
        <Button onClick={handleDownload} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg shadow-purple-600/20">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>
    </header>
  );
};