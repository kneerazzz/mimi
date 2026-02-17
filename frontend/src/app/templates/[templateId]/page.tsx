'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Bookmark, 
  Download, 
  Share2, 
  Sparkles, 
  Brush, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import Masonry from 'react-masonry-css';

import { Button } from '@/components/ui/button';

// Services
import { 
  getTemplateById, 
  templateByCategory 
} from '@/services/templateService'; 
import { toggleTemplateSave } from '@/services/templateService'; 

import TemplateCard from '@/components/templates/templateCard';// Ensure correct casing for component import
import { useAuth } from '@/context/AuthContext';

interface Template {
  _id: string;
  templateId: string;
  imageUrl: string;
  name: string;
  category: string;
  subCategory: string;
  createdAt: string;
}

const masonryBreakpoints = {
  default: 5,
  1600: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 2
};

export default function SingleTemplatePage() {
  const { templateId } = useParams<{ templateId: string }>();
  const router = useRouter();
  const { user, setShowLoginModal } = useAuth();

  const [template, setTemplate] = useState<Template | null>(null);
  const [related, setRelated] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction State
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // 1. Fetch Main Template Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Template Details
        const res = await getTemplateById(templateId);
        const data = res.data?.template || res.data; 
        const savedStatus = res.data?.isSaved || false;
        
        setTemplate(data);
        setIsSaved(savedStatus);

        // 2. Fetch Recommendations based on this template's data
        if (data.category) {
          fetchRecommendations(data.category, data.subCategory);
        }
      } catch (error) {
        console.error("Failed to load template:", error);
        toast.error("Template not found");
      } finally {
        setLoading(false);
      }
    };

    if (templateId) fetchData();
  }, [templateId]);

  const fetchRecommendations = async (category: string, subCategory: string) => {
    try {
      const res = await templateByCategory(category, subCategory);
      const recs = res.data?.templates || [];
      // Filter out the current template from recommendations
      setRelated(recs.filter((t: Template) => t.templateId !== templateId));
    } catch (error) {
      console.error("Failed to load related templates");
    }
  };

  // --- Actions ---

  const handleUseTemplate = () => {
    if (!template) return;
    router.push(`/create/editor?templateId=${template.templateId}`);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.is_registered) {
      setShowLoginModal(true);
      return;
    }

    const prevSaved = isSaved;
    setIsSaved(!isSaved); // Optimistic UI
    setSaveLoading(true);

    try {
      const finalTemplateId = template?._id || '';
      await toggleTemplateSave(finalTemplateId); 
      toast.success(isSaved ? "Removed from saved" : "Template saved");
    } catch (error) {
      setIsSaved(prevSaved); // Revert
      toast.error("Failed to save action");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!template) return;
    try {
      const response = await fetch(template.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch {
      toast.error("Download failed");
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: template?.name, url: shareUrl }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      
      {/* --- Header --- */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
        <div className="max-w-480 mx-auto flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-zinc-800 rounded-full">
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-zinc-200 hidden md:block text-lg">{template.name}</h1>
            <div className="w-10" /> 
        </div>
      </div>

      <div className="max-w-480 mx-auto px-6 lg:px-12 mt-8">
        
        {/* --- Main Content Split --- */}
        {/* Changed Grid: 9 cols for Image, 3 cols for Sidebar (Wide Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
            
            {/* Left: Image Display (Larger Area) */}
            <div className="lg:col-span-9">
                <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/30 shadow-2xl flex items-center justify-center min-h-125 lg:min-h-175">
                    {/* Checkerboard pattern for transparent images */}
                    <div className="absolute inset-0 opacity-10" 
                         style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                    />
                    
                    <img 
                        src={template.imageUrl} 
                        alt={template.name} 
                        className="relative z-10 w-full h-auto max-h-[85vh] object-contain"
                    />
                </div>
            </div>

            {/* Right: Actions & Info (Sticky Sidebar) */}
            <div className="lg:col-span-3">
                <div className="sticky top-24 flex flex-col space-y-8 bg-zinc-900/20 p-6 rounded-3xl border border-zinc-800/50">
                    <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 uppercase tracking-wider">
                                {template.category}
                            </span>
                            {template.subCategory && template.subCategory !== 'General' && (
                                <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium border border-zinc-700">
                                    {template.subCategory}
                                </span>
                            )}
                        </div>
                        
                        <h1 className="text-3xl font-bold text-zinc-100 leading-tight mb-4">
                            {template.name}
                        </h1>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            A blank canvas for your chaotic thoughts. Use this template to create something legendary.
                        </p>
                    </div>

                    {/* Primary Actions */}
                    <div className="space-y-4">
                        <Button 
                            onClick={handleUseTemplate}
                            size="lg" 
                            className="w-full cursor-pointer h-14 text-lg font-bold bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5 transition-transform active:scale-95 rounded-xl"
                        >
                            <Brush className="w-5 h-5 mr-2" />
                            Create Meme
                        </Button>
                        
                        {/* Secondary Actions with Zinc Styling */}
                        <div className="grid grid-cols-3 gap-3">
                            <Button 
                                variant="outline" 
                                size="lg" 
                                onClick={handleSave}
                                disabled={saveLoading}
                                className={`cursor-pointer h-12 border-0 rounded-xl transition-colors ${
                                    isSaved 
                                    ? 'bg-white-500/20 text-white-400 hover:bg-white-500/30' 
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                }`}
                            >
                                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="lg" 
                                onClick={handleDownload}
                                className="h-12 cursor-pointer border-0 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 rounded-xl"
                            >
                                <Download className="w-5 h-5" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="lg" 
                                onClick={handleShare}
                                className="h-12 cursor-pointer border-0 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 rounded-xl"
                            >
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- Recommendations --- */}
        {related.length > 0 && (
            <div className="border-t border-zinc-800 pt-10">
                <div className="flex items-center gap-2 mb-8">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    <h2 className="text-2xl font-bold text-zinc-100">Similar Vibes</h2>
                </div>

                <Masonry
                    breakpointCols={masonryBreakpoints}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {related.map((t) => (
                        <div key={t._id} className="mb-6">
                             <TemplateCard 
                                template={t} 
                                onUse={(tmpl) => router.push(`/create/editor?templateId=${tmpl.templateId}`)} 
                            />
                        </div>
                    ))}
                </Masonry>
            </div>
        )}

      </div>
    </div>
  );
}