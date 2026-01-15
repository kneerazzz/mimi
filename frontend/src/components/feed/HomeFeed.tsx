'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MemeCard from '../memes/MemeCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { getHomeMemes } from '@/services/memeService';
import Masonry from 'react-masonry-css';

/* ---------------- Masonry Breakpoints ---------------- */

const breakpointColumnsObj = {
  default: 5,
  1536: 4,
  1280: 3,
  1024: 2,
  768: 2,
  640: 1,
};

/* ---------------- Types ---------------- */

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

/* ---------------- Skeleton ---------------- */

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

/* ---------------- Home Feed ---------------- */

const HomeFeed = () => {
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
    try {
      pageNum === 1 ? setIsLoading(true) : setIsFetchingMore(true);
      setError(null);

      const res = await getHomeMemes(pageNum);
      const newMemes = res.data?.memes || res.data?.feed || [];

      setMemes((prev) => {
        const ids = new Set(prev.map((m) => m._id));
        return [...prev, ...newMemes.filter((m: Meme) => !ids.has(m._id))];
      });

      if (newMemes.length === 0) setHasMore(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchMemes(page);
  }, [page]);

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    setMemes([]);
    fetchMemes(1);
  };

  /* ---------------- Error ---------------- */

  if (error && memes.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-zinc-200 font-semibold mb-2">
          Failed to load feed
        </h3>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="border-zinc-700 text-zinc-300"
        >
          Retry
        </Button>
      </div>
    );
  }

  /* ---------------- Render ---------------- */

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Feed */}
      <main className="max-w-600 mx-auto px-10 py-8">
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
                  <MemeCard meme={meme} />
                </div>
              </div>
            );
          })}

          {(isLoading || isFetchingMore) &&
            Array.from({ length: 6 }).map((_, i) => (
              <MasonrySkeleton key={i} />
            ))}
        </Masonry>

        {!hasMore && !isLoading && (
          <div className="py-16 text-center text-zinc-500">
            You’ve reached the end 🏁
          </div>
        )}
      </main>
    </div>
  );
};

export default HomeFeed;
