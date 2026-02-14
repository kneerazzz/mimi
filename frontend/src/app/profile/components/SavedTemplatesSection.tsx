'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSavedTemplates } from '@/services/templateService';
import TemplateCard, { Template as TemplateType } from '@/components/templates/templateCard';
import { Loader2, Bookmark } from 'lucide-react';
import Masonry from 'react-masonry-css';

interface SavedTemplatesSectionProps {
  onCountUpdate?: (count: number) => void;
}

const feedBreakpoints = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 2,
  900: 1
};

export const SavedTemplatesSection: React.FC<SavedTemplatesSectionProps> = ({
  onCountUpdate,
}) => {
  const router = useRouter();
  const [savedTemplates, setSavedTemplates] = useState<TemplateType[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getSavedTemplates();
        
        // Handle different response structures
        // Response structure: { statusCode: 200, data: { templates: [...] } }
        let templates: any[] = [];
        if (res?.data?.templates && Array.isArray(res.data.templates)) {
          templates = res.data.templates;
        } else if (res?.templates && Array.isArray(res.templates)) {
          templates = res.templates;
        } else if (Array.isArray(res?.data)) {
          templates = res.data;
        } else if (Array.isArray(res)) {
          templates = res;
        }

        // Transform the data - saved templates have a nested template object
        const transformedTemplates: TemplateType[] = templates.map((item: any) => {
          // If it has a nested template property, use that
          const template = item.template || item;
          return {
            _id: template._id || item._id,
            templateId: template.templateId || item.templateId,
            imageUrl: template.imageUrl || item.imageUrl,
            name: template.name || item.name,
            category: template.category || item.category,
            subCategory: template.subCategory || item.subCategory,
            ...template,
          };
        });

        setSavedTemplates(transformedTemplates);
        onCountUpdate?.(transformedTemplates.length);
      } catch (err) {
        console.error('Failed to load saved templates', err);
        setError('Failed to load saved templates');
        setSavedTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedTemplates();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-400">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Loading saved templates...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!savedTemplates || savedTemplates.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <Bookmark className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-sm">Templates you save will appear here.</p>
      </div>
    );
  }

  return (
    <Masonry className="my-masonry-grid" columnClassName="my-masonry-grid_column" breakpointCols={feedBreakpoints}>
      {savedTemplates.map((tpl) => (
        <TemplateCard
          key={tpl._id || tpl.templateId}
          template={tpl}
          onUse={(t) => router.push(`/create?templateId=${t.templateId}`)}
        />
      ))}
    </Masonry>
  );
};
