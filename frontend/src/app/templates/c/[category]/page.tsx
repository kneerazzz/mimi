'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { templateByCategory } from '@/services/templateService';
import TemplateCard, { Template } from '@/components/templates/templateCard';
import { Loader2, ServerCrash, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Masonry from 'react-masonry-css';

const breakpointColumnsObj = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 2
};

export default function TemplatesByCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const encodedCategory = params.category as string;

  const category = decodeURIComponent(encodedCategory);

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
      const subCategory = category;

      const response = await templateByCategory(mainCategory, subCategory, pageNum, 40);

      if (response.success) {
        setTemplates(prev =>
          pageNum === 1 ? response.data.templates : [...prev, ...response.data.templates]
        );
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
    router.push(`/templates/${template.templateId}`);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTemplates(nextPage);
    }
  };

  const getCategoryDisplayName = () => {
    if (category === 'General') return 'All Templates';
    return category.replace(/-/g, ' / ');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-full mx-auto px-7 sm:px-6 lg:px-8 py-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Explore</span>
          </Link>

          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-linear-to-r from-zinc-50 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              {getCategoryDisplayName()}
            </h1>
          </div>

          {templates.length > 0 && !loading && (
            <p className="text-zinc-400 mt-2 text-xl">
              {templates.length} {templates.length === 1 ? 'template' : 'templates'} found
            </p>
          )}
        </div>
      </div>

      {/* MAIN */}
      <main className="flex-1 max-w-full mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading && templates.length === 0 ? (
          <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="text-zinc-400 text-lg">Loading templates...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96 bg-zinc-900/30 border-2 border-dashed border-red-500/20 rounded-2xl">
            <ServerCrash className="w-16 h-16 text-red-500/70 mb-4" />
            <h2 className="text-2xl font-semibold text-zinc-300">Oops! Something went wrong.</h2>
            <p className="text-zinc-500 mt-2 max-w-md text-center">{error}</p>
            <button
              onClick={() => fetchTemplates(1)}
              className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : templates.length > 0 ? (
          <>
            {/* GRID – BIG CARDS */}
            <Masonry
              className="
                my-masonry-grid
              "
              columnClassName="my-masonry-grid_column"
              breakpointCols={breakpointColumnsObj}
            >
              {templates.map(template => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onUse={handleUseTemplate}
                />
              ))}
            </Masonry>

            {/* LOAD MORE */}
            {page < totalPages && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="group relative px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/50 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-purple-600/10 to-fuchsia-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Templates
                        <span className="text-zinc-500 text-sm">
                          ({templates.length} of {totalPages * 40})
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}

            {page >= totalPages && (
              <div className="text-center mt-12 py-8 border-t border-zinc-800">
                <p className="text-zinc-400">You've reached the end! 🎉</p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Explore more categories
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-2xl">
            <Sparkles className="w-16 h-16 text-zinc-700 mb-4" />
            <h2 className="text-2xl font-semibold text-zinc-300">No templates found</h2>
            <p className="text-zinc-500 mt-2 max-w-md text-center">
              We couldn't find any templates in this category.
            </p>
            <Link
              href="/explore"
              className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-colors"
            >
              Back to Explore
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
