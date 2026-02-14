'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import TemplateCard, { Template } from '@/components/templates/templateCard';
import { Loader2, SearchX, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchTemplates } from '@/services/templateService';
import Masonry from 'react-masonry-css';

interface TemplateSearchResultsProps {
  templates?: Template[];
  isLoading?: boolean;
  query: string;
}
const breakpointColumnsObj = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 2,
};

const TemplateSkeleton = () => (
  <div className="rounded-lg bg-zinc-900/60 animate-pulse overflow-hidden break-inside-avoid">
    <div className="h-48 bg-zinc-800/40" />
    <div className="p-4 space-y-2">
      <div className="h-4 w-3/4 bg-zinc-800 rounded" />
      <div className="h-3 w-1/2 bg-zinc-800 rounded" />
    </div>
  </div>
);

export default function TemplateSearchResults({ templates: initialTemplates = [], isLoading: initialLoading = false, query }: TemplateSearchResultsProps) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 40;

  useEffect(() => {
    if (!query) return;

    const fetchTemplates = async (pageNum: number) => {
      try {
        setIsLoading(true);
        const res = await searchTemplates(query, pageNum, limit);
        
        if (res.success || res.data) {
          const data = res.data || res;
          setTemplates(data.templates || []);
          const pagination = data.pagination;
          if (pagination) {
            setTotalPages(pagination.totalPages);
          }
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setTemplates([]);
          setTotalPages(0);
        } else {
          setTemplates([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates(page);
  }, [query, page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (isLoading && templates.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (templates.length === 0 && query && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl">
        <SearchX className="w-16 h-16 text-zinc-500 mb-4" />
        <h2 className="text-2xl font-semibold text-zinc-300">No results for &quot;{query}&quot;</h2>
        <p className="text-zinc-500 mt-2">Try a different search term.</p>
      </div>
    );
  }

  return (
    <div>
      {templates.length > 0 && (
        <>
          <Masonry className="my-masonry-grid" columnClassName="my-masonry-grid_column" breakpointCols={breakpointColumnsObj}>
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <TemplateSkeleton key={i} />
              ))
            ) : (
              templates.map((template) => (
                <TemplateCard 
                  key={template._id} 
                  template={{ 
                    ...template,
                    templateId: template.templateId || template._id,
                    subCategory: template.subCategory || 'General'
                  }} 
                  onUse={() => {}} 
                />
              ))
            )}
          </Masonry>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                onClick={handlePreviousPage}
                disabled={page === 1}
                variant="outline"
                className="border-zinc-700 text-zinc-300 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">
                  Page <span className="text-zinc-200 font-semibold">{page}</span> of <span className="text-zinc-200 font-semibold">{totalPages}</span>
                </span>
              </div>

              <Button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                variant="outline"
                className="border-zinc-700 text-zinc-300 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
