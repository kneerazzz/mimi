'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import MemeCard from '../memes/MemeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Search, Flame, Clock } from 'lucide-react';
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
  const router = useRouter();
  const pathname = usePathname();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const observer = useRef<IntersectionObserver | null>(null);

  const isActive = (path: string) => pathname === path;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      router.push(`/feed/search/memes?q=${encodedQuery}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

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
      {/* Search and Feed Options Header */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-10xl mx-auto">
          {/* Feed Options */}
          <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
            <Button 
              asChild
              variant={isActive('/feed') ? 'default' : 'ghost'}
              size="sm"
              className={`text-xs sm:text-sm h-8 sm:h-10 ${isActive('/feed') ? '' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Link href="/feed">
                Home
              </Link>
            </Button>
            <Button 
              asChild
              variant={isActive('/feed/trending') ? 'default' : 'ghost'}
              size="sm"
              className={`gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10 ${isActive('/feed/trending') ? '' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Link href="/feed/trending">
                <Flame className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Trending</span>
              </Link>
            </Button>
            <Button 
              asChild
              variant={isActive('/feed/new') ? 'default' : 'ghost'}
              size="sm"
              className={`gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10 ${isActive('/feed/new') ? '' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Link href="/feed/new">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Latest</span>
              </Link>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 group flex gap-2 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
              <Input 
                placeholder="Search memes..." 
                className="pl-10 sm:pl-12 h-9 sm:h-12 bg-zinc-900/80 border-zinc-800 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 rounded-xl text-xs sm:text-base transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="px-4 sm:px-6 h-9 sm:h-12 rounded-xl text-xs sm:text-base w-full sm:w-auto"
            >
              Search
            </Button>
            {searchQuery && (
              <Button 
                onClick={handleClearSearch}
                variant="ghost"
                className="px-3 sm:px-4 h-9 sm:h-12 text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 w-full sm:w-auto"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Feed */}
      <main className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

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
