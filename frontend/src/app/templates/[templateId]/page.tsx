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
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Services
import { 
  getTemplateById, 
  templateByCategory 
} from '@/services/templateService'; // Ensure path is correct
import { toggleTemplateSave } from '@/services/templateService'; // Assuming you reuse this or have a specific template save

import TemplateCard from '../../../components/templates/templateCard';
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
  default: 4,
  1536: 4,
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
        const data = res.data?.template || res.data; // Handle response structure
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
      // Assuming 'Template' is the contentType for saving templates
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
      console.log(response);
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-zinc-800 rounded-full">
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-zinc-200 hidden md:block">{template.name}</h1>
            <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        
        {/* --- Main Content Split --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
            
            {/* Left: Image Display */}
            <div className="lg:col-span-7">
                <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/50 shadow-2xl">
                    {/* Checkerboard pattern for transparent images */}
                    <div className="absolute inset-0 opacity-10" 
                         style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                    />
                    
                    <img 
                        src={template.imageUrl} 
                        alt={template.name} 
                        className="relative z-10 w-full h-auto max-h-[70vh] object-contain mx-auto"
                    />
                </div>
            </div>

            {/* Right: Actions & Info */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
                <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">
                            {template.category}
                        </span>
                        {template.subCategory && template.subCategory !== 'General' && (
                             <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium border border-zinc-700">
                                {template.subCategory}
                            </span>
                        )}
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 leading-tight mb-4">
                        {template.name}
                    </h1>
                    <p className="text-zinc-500">
                        Ready to cook? Add your text and unleash this meme into the void.
                    </p>
                </div>

                {/* Primary Actions */}
                <div className="space-y-3">
                    <Button 
                        onClick={handleUseTemplate}
                        size="lg" 
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20"
                    >
                        <Brush className="w-5 h-5 mr-2" />
                        Create Meme
                    </Button>
                    
                    <div className="grid grid-cols-3 gap-3">
                         <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={handleSave}
                            disabled={saveLoading}
                            className={`h-12 border-zinc-700 hover:bg-zinc-800 ${isSaved ? 'text-purple-400 border-purple-500/50 bg-purple-500/10' : 'text-zinc-300'}`}
                        >
                            <Bookmark className={`w-5 h-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                            {isSaved ? 'Saved' : 'Save'}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={handleDownload}
                            className="h-12 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Download
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={handleShare}
                            className="h-12 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                        >
                            <Share2 className="w-5 h-5 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- Recommendations --- */}
        {related.length > 0 && (
            <div className="border-t border-zinc-800 pt-10">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-zinc-200">More like this</h2>
                </div>

                <Masonry
                    breakpointCols={masonryBreakpoints}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {related.map((t) => (
                        <TemplateCard 
                            key={t._id} 
                            template={t} 
                            onUse={(tmpl) => router.push(`/create/editor?templateId=${tmpl.templateId}`)} 
                        />
                    ))}
                </Masonry>
            </div>
        )}

      </div>
    </div>
  );
}