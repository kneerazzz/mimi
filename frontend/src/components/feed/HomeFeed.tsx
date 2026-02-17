'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import MemeCard from '../memes/MemeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Search, Flame, Clock, Loader2, Coffee, Server } from 'lucide-react';
import { getHomeMemes } from '@/services/memeService';
import Masonry from 'react-masonry-css';
import ColdStartLoader from '../ui/coldstart';
/* ---------------- Masonry Breakpoints ---------------- */
const breakpointColumnsObj = {
  default: 5,  // 1920px and up (Ultra wide)
  1536: 4,     // 2xl: 1536px (Large Desktop)
  1280: 3,     // xl: 1280px (Standard Desktop)
  1024: 3,     // lg: 1024px (Small Desktop/Laptop)
  768: 2,      // md: 768px (Tablets)
  640: 2,      // sm: 640px (Small tablets / large phones — 2 cols)
  480: 1,      // xs: 480px (Mobile portrait — 1 col for comfort)
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
  <div className="animate-pulse rounded-xl bg-zinc-800 w-full" style={{ height: `${Math.floor(Math.random() * 120) + 180}px` }} />
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

  /* ---------------- Render ---------------- */
  return (
    <div className="w-full min-h-screen px-2 sm:px-4 md:px-6 lg:px-8">

      {/* ── Search & Feed Options Header ─────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 py-2 px-2 sm:px-0">

        {/* Feed tabs */}
        <div className="flex items-center gap-1 sm:gap-2 mb-2 overflow-x-auto scrollbar-none">
          <Link href="/feed">
            <Button
              variant={isActive('/feed') ? 'default' : 'ghost'}
              size="sm"
              className="shrink-0 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
            >
              <Flame className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Home
            </Button>
          </Link>
          <Link href="/feed/trending">
            <Button
              variant={isActive('/feed/trending') ? 'default' : 'ghost'}
              size="sm"
              className="shrink-0 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
            >
              <Flame className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Trending
            </Button>
          </Link>
          <Link href="/feed/latest">
            <Button
              variant={isActive('/feed/latest') ? 'default' : 'ghost'}
              size="sm"
              className="shrink-0 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
            >
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Latest
            </Button>
          </Link>
        </div>

        {/* Search bar — full width on mobile */}
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <Input
              placeholder="Search memes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8 h-8 sm:h-9 text-sm w-full"
            />
          </div>
          <Button
            onClick={handleSearch}
            size="sm"
            className="shrink-0 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
          >
            Search
          </Button>
          {searchQuery && (
            <Button
              onClick={handleClearSearch}
              variant="ghost"
              size="sm"
              className="shrink-0 h-8 sm:h-9 text-xs sm:text-sm px-2"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="mt-3">

        {/* Cold Start Loader */}
        {isLoading && memes.length === 0 && !error && <ColdStartLoader />}

        {/* Error State */}
        {error && memes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-zinc-200 font-medium">Failed to load feed</p>
            <p className="text-zinc-400 text-sm">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        )}

        {/* Meme Feed */}
        {memes.length > 0 && (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-2 sm:-ml-3"
            columnClassName="pl-2 sm:pl-3 bg-clip-padding"
          >
            {memes.map((meme, index) => {
              const isLast = memes.length === index + 1;
              return (
                <div
                  key={meme._id}
                  ref={isLast ? lastMemeRef : undefined}
                  className="mb-2 sm:mb-3"
                >
                  <MemeCard meme={meme} contentType='MemeFeedPost' />
                </div>
              );
            })}

            {/* Bottom skeletons while fetching more */}
            {isFetchingMore &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`skel-${i}`} className="mb-2 sm:mb-3">
                  <MasonrySkeleton />
                </div>
              ))}
          </Masonry>
        )}

        {/* End of Feed */}
        {!hasMore && !isLoading && memes.length > 0 && (
          <p className="text-center text-zinc-500 text-sm py-8">
            You&apos;ve reached the end 🏁
          </p>
        )}
      </div>
    </div>
  );
};

export default HomeFeed;