'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Masonry from 'react-masonry-css';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { getRandomTemplates } from '@/services/templateService'; // Ensure you have this component
import TemplateCard from '@/components/templates/templateCard';
// Type definition based on your JSON response
interface Template {
  _id: string;
  templateId: string;
  imageUrl: string;
  name: string;
  category: string;
  subCategory: string;
}

const breakpointColumnsObj = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 2
};

export default function RandomTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTemplates = async () => {
    try {
      const response = await getRandomTemplates();
      // Accessing data.templates based on your JSON structure:
      // { statusCode: 200, data: { templates: [...] } }
      const newTemplates = response.data?.templates || []; 
      
      setTemplates(newTemplates);
    } catch (error) {
      console.error("Error fetching random templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTemplates();
  };

  const handleUseTemplate = (template: Template) => {
    // Redirect to editor with the specific template ID
    router.push(`/create/editor?templateId=${template.templateId}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-6 px-30">
      <div className="max-w-[1920px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 top-15 bg-zinc-950/90 backdrop-blur-md z-10 py-4 border-b border-none">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="hover:bg-zinc-800 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                The Void
              </h1>
              <p className="text-zinc-500 text-xl">
                Infinite random templates. Good luck.
              </p>
            </div>
          </div>

          <Button 
            onClick={handleRefresh} 
            disabled={refreshing || loading}
            variant="outline"
            className="gap-2 cursor-pointer border-zinc-700 hover:bg-zinc-800 text-zinc-300"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Shuffle
          </Button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          </div>
        ) : (
          <>
            {templates.length > 0 ? (
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                {templates.map((template) => (
                  <TemplateCard 
                    key={template._id} 
                    template={template} 
                    onUse={handleUseTemplate} 
                  />
                ))}
              </Masonry>
            ) : (
              <div className="text-center py-20 text-zinc-500">
                No templates found. The void is empty.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}