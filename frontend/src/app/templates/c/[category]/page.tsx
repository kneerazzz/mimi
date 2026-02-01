'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { templateByCategory } from '@/services/templateService';
import TemplateCard, { Template } from '@/components/templates/templateCard';
import { Loader2, ServerCrash } from 'lucide-react';

export default function TemplatesByCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (category) {
      fetchTemplates(1);
    }
  }, [category]);

  const fetchTemplates = async (pageNum: number) => {
    setLoading(true);

    try {
      const mainCategory = category === 'General' ? 'Other' : 'Reaction';
      const subCategory = category.replace("_", "-");
      console.log(subCategory)

      const response = await templateByCategory(mainCategory, subCategory, pageNum, 40);
      if (response.success) {
        setTemplates(prev => pageNum === 1 ? response.data.templates : [...prev, ...response.data.templates]);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.message || 'Failed to fetch templates.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template: Template) => {
    router.push(`/create/editor?templateId=${template.templateId}`);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTemplates(nextPage);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 capitalize mb-8">
          {category} Templates
        </h1>

        {loading && templates.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-zinc-900/50 border-2 border-dashed border-red-500/30 rounded-2xl">
            <ServerCrash className="w-16 h-16 text-red-500/70 mb-4" />
            <h2 className="text-2xl font-semibold text-zinc-300">Oops! Something went wrong.</h2>
            <p className="text-zinc-500 mt-2">{error}</p>
          </div>
        ) : templates.length > 0 ? (
          <>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
              {templates.map((template) => (
                <TemplateCard key={template._id} template={template} onUse={handleUseTemplate} />
              ))}
            </div>
            {page < totalPages && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg disabled:bg-zinc-700"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl">
            <h2 className="text-2xl font-semibold text-zinc-300">No templates found.</h2>
            <p className="text-zinc-500 mt-2">Try a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
