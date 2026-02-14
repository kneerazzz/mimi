'use client';

import { Plus, ArrowUpRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation"
import Link from "next/link";
// Match this interface to your API response
export interface Template {
  _id: string;
  templateId: string;
  imageUrl: string;
  name: string;
  category: string;
  subCategory: string;
}

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
}

export default function TemplateCard({ template, onUse }: TemplateCardProps) {
  
  const router = useRouter();

  const handleUseTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/create/editor?templateId=${template.templateId}`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/templates/${template.templateId}`;
    if (navigator.share) {
      await navigator.share({ title: template.name, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="cursor-pointer group relative break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/50">
      <img 
          src={template.imageUrl} 
          alt={template.name}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 block"
          loading="lazy"
      />
      {/* 2. Hover Overlay */}
      <Link href={`/templates/${template.templateId}`} className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
        
        {/* Template Name */}
        <p className="text-zinc-100 font-bold text-sm line-clamp-2 mb-3 drop-shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {template.name}
        </p>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
            <Button 
                onClick={handleUseTemplate}
                title="Create Mimi With Template"
                className="flex-1 cursor-pointer bg-zinc-600 hover:bg-zinc-700 text-white font-semibold h-9 rounded-lg text-xs"
            >
                <Plus className="w-4 h-4" /> 
                Create
            </Button>
            
            <Button
                onClick={handleShare}
                variant="secondary"
                title="Share Template"
                size="icon"
                className="h-9 w-9 cursor-pointer bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"    
            >
                <Share2 className="w-4 h-4" />
            </Button>
             <Button 
                size="icon" 
                variant="secondary"
                className="h-9 w-9 cursor-pointer bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
                onClick={() => router.push(`/templates/${template.templateId}`)}
                title="Open Template"
            >
                <ArrowUpRight className="w-4 h-4" />
            </Button>
        </div>
      </Link>
      
      {/* 3. Category Badge (Optional - visible always or on hover) */}
      {/* <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
        {template.subCategory}
      </div> */}
    </div>
  );
}