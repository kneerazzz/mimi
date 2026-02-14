'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MemeCard from '@/components/memes/MemeCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { searchMemes } from '@/services/memeService';
import Masonry from 'react-masonry-css';

const breakpointColumnsObj = {
  default: 5,
  1536: 4,
  1280: 3,
  1024: 2,
  768: 2,
  640: 1,
};

interface Meme {
  _id: string;
  title: string;
  imageUrl: string;
  author?: {
    username: string;
    profilePic?: string;
  };
  originalScore?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt?: string;
  contentType?: string;
}

const MasonrySkeleton = () => (
  <div className="break-inside-avoid mb-6">
    <div className="rounded-xl bg-zinc-900/60 animate-pulse overflow-hidden">
      <div className="h-55 bg-zinc-800/40" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 bg-zinc-800 rounded" />
        <div className="flex items-center gap-2 mt-3">
          <div className="h-7 w-7 rounded-full bg-zinc-800" />
          <div className="h-3 w-24 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  </div>
);

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastMemeRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetchingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((p) => p + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingMore, hasMore]
  );

  const fetchMemes = async (pageNum: number) => {
    if (!query) return;
    
    try {
      pageNum === 1 ? setIsLoading(true) : setIsFetchingMore(true);
      setError(null);

      const res = await searchMemes(query, pageNum);
      const newMemes = res.data?.feed || [];

      setMemes((prev) => {
        const ids = new Set(prev.map((m) => m._id));
        return [...prev, ...newMemes.filter((m: Meme) => !ids.has(m._id))];
      });

      if (newMemes.length === 0) setHasMore(false);
    } catch (err: any) {
      setError(err.message || 'Failed to search memes');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (!query) {
      setError('No search query provided');
      return;
    }
    fetchMemes(page);
  }, [page, query]);

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    setMemes([]);
    fetchMemes(1);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!query) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-zinc-200 font-semibold mb-2">
          No search query provided
        </h3>
        <Button
          onClick={handleGoBack}
          variant="outline"
          className="border-zinc-700 text-zinc-300 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (error && memes.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-zinc-200 font-semibold mb-2">
          {error}
        </h3>
        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-zinc-700 text-zinc-300 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="border-zinc-700 text-zinc-300 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Search Results</h1>
            <p className="text-zinc-400">
              Memes matching "<span className="text-zinc-200 font-semibold">{query}</span>"
              {memes.length > 0 && ` - ${memes.length} found`}
            </p>
          </div>
          {memes.length > 0 && (
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>

        {/* Results */}
        {memes.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 mb-4">
              No memes found for "{query}"
            </p>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="border-zinc-700 text-zinc-300 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {memes.map((meme, index) => {
              const isLast = memes.length === index + 1;
              return (
                <div
                  key={meme._id}
                  ref={isLast ? lastMemeRef : undefined}
                  className="break-inside-avoid mb-6"
                >
                  <div className="rounded-xl bg-zinc-900 shadow-md hover:shadow-xl transition-shadow">
                    <MemeCard meme={meme} contentType='MemeFeedPost' />
                  </div>
                </div>
              );
            })}

            {(isLoading || isFetchingMore) &&
              Array.from({ length: 6 }).map((_, i) => (
                <MasonrySkeleton key={i} />
              ))}
          </Masonry>
        )}

        {!hasMore && memes.length > 0 && !isLoading && (
          <div className="py-16 text-center text-zinc-500">
            No more results 🏁
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchMemesPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-400">
          <Loader2 className="mr-4 h-10 w-10 animate-spin" />
          <span className="text-lg font-medium">Loading Memes...</span>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}