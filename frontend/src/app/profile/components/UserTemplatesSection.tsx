'use client';

import React, { useEffect, useState } from 'react';
import { getAllUserTemplates } from '@/services/templateService';
import UserTemplateCard, { UserTemplate } from '@/components/templates/userTemplateCard';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import Masonry from 'react-masonry-css';

interface UserTemplatesSectionProps {
  onCountUpdate?: (count: number) => void;
}

const feedBreakpoints = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 2,
  900: 1
};

export const UserTemplatesSection: React.FC<UserTemplatesSectionProps> = ({
  onCountUpdate,
}) => {
  const [userTemplates, setUserTemplates] = useState<UserTemplate[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getAllUserTemplates();
      
      // Handle different response structures
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

      // Transform the data - user templates are direct objects
      const transformedTemplates: UserTemplate[] = templates.map((template: any) => ({
        _id: template._id,
        imageUrl: template.imageUrl,
        name: template.name,
        ...template,
      }));

      setUserTemplates(transformedTemplates);
      onCountUpdate?.(transformedTemplates.length);
    } catch (err) {
      console.error('Failed to load user templates', err);
      setError('Failed to load user templates');
      setUserTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserTemplates();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-400">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Loading your templates...
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

  if (!userTemplates || userTemplates.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-sm">Templates you upload from the editor will show up here.</p>
      </div>
    );
  }

  const handleTemplateDeleted = () => {
    loadUserTemplates();
  };

  return (
    <Masonry className="my-masonry-grid" columnClassName="my-masonry-grid_column" breakpointCols={feedBreakpoints}>
      {userTemplates.map((template) => (
        <UserTemplateCard
          key={template._id}
          template={template}
          onDelete={handleTemplateDeleted}
        />
      ))}
    </Masonry>
  );
};
