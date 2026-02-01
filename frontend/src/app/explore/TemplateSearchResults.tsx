'use client';

import React from 'react';
import TemplateCard, { Template } from '@/components/templates/templateCard';
import { Loader2, SearchX } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TemplateSearchResultsProps {
  templates: Template[];
  isLoading: boolean;
  query: string;
}

export default function TemplateSearchResults({ templates, isLoading, query }: TemplateSearchResultsProps) {
  const router = useRouter();

  const handleUseTemplate = (template: Template) => {
    router.push(`/create/editor?templateId=${template.templateId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (templates.length === 0 && query) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl">
        <SearchX className="w-16 h-16 text-zinc-500 mb-4" />
        <h2 className="text-2xl font-semibold text-zinc-300">No results for &quot;{query}&quot;</h2>
        <p className="text-zinc-500 mt-2">Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
      {templates.map((template) => (
        <TemplateCard key={template._id} template={template} onUse={handleUseTemplate} />
      ))}
    </div>
  );
}
