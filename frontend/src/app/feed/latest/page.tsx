'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  Clock,
  Search,
  Flame
} from 'lucide-react';
import Masonry from 'react-masonry-css';

import MemeCard from '@/components/memes/MemeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getLatestMemes } from '@/services/memeService';

// --- Types (Ensure these match your MemeCard expectations) ---
interface MemeStats {
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface Meme {
  _id: string;
  title: string;
  contentUrl: string; // ← Main field for image URL
  cloudinaryImageUrl?: string; // ← New optional Cloudinary URL
  author?: {
    username: string;
    profilePic?: string;
  };
  stats?: MemeStats;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt?: string;
  contentType?: string;
  isVideo?: boolean;
  tags?: string[];
}

// --- Config ---
const breakpointColumnsObj = {
  default: 4,
  1600: 4,
  1100: 3,
  900: 2,
  700: 2,
  500: 1
};

export default function LatestMemesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isActive = (path: string) => pathname === path;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastMemeRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // --- Fetch Logic ---
  const fetchMemes = async (pageNum: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const res = await getLatestMemes(pageNum);
      const newMemes = res.data?.memes || res.data?.feed || [];
      
      if (isRefresh) {
        // Replace all memes on refresh
        setMemes(newMemes);
        setPage(1);
        setHasMore(true);
      } else {
        // Append for pagination
        setMemes(prev => {
          const ids = new Set(prev.map(m => m._id));
          return [...prev, ...newMemes.filter((m: Meme) => !ids.has(m._id))];
        });
      }
      
      if (newMemes.length === 0) setHasMore(false);
    } catch (error) {
      console.error("Failed to load latest memes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMemes(1);
  }, []);

  // Load more on page increment
  useEffect(() => {
    if (page > 1) fetchMemes(page);
  }, [page]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      router.push(`/feed/search/memes?q=${encodedQuery}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="w-full min-h-screen px-2 sm:px-4 md:px-6 lg:px-8 bg-zinc-950 text-zinc-100 ">
      
      {/* --- Feed Navigation --- */}
      <div className="flex items-center gap-1 sm:gap-2 mb-2 overflow-x-auto scrollbar-none">
        <Link href="/feed">
          <Button
            variant={isActive('/feed') || isActive('/') ? 'default' : 'ghost'}
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
      {/* --- Header Section --- */}
        <div className="flex items-center gap-2 w-full mt-3">
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
      {/* --- Main Content --- */}
      <div className="mt-3">
        
        {/* Empty State */}
        {!loading && memes.length === 0 && (
            <div className="py-20 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-10 h-10 text-zinc-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-300 mb-2">No memes yet</h3>
                    <p className="text-zinc-600">Check back soon for fresh content!</p>
                </div>
            </div>
        )}

        {/* Memes Grid */}
        {memes.length > 0 && (
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid flex w-auto -ml-2 sm:-ml-3"
                columnClassName="pl-2 sm:pl-3 bg-clip-padding"
            >
                {memes.map((meme, index) => {
                    // Prepare meme data with proper image URL priority
                    const memeData = {
                        ...meme,
                        // Use Cloudinary URL if available, fallback to contentUrl
                        imageUrl: meme.cloudinaryImageUrl || meme.contentUrl
                    };

                    return (
                        <div 
                            key={`${meme._id}-${index}`} 
                            ref={index === memes.length - 1 ? lastMemeRef : undefined}
                            className="mb-2 sm:mb-3"
                        >
                            <MemeCard 
                                meme={memeData as any} 
                                contentType='MemeFeedPost' 
                            />
                        </div>
                    );
                })}
            </Masonry>
        )}
        
        {/* Loading State */}
        {loading && !refreshing && (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-zinc-500 animate-pulse">Loading fresh memes...</p>
            </div>
        )}

        {/* End of Feed */}
        {!hasMore && !loading && memes.length > 0 && (
            <div className="py-20 text-center">
                <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-zinc-800 mb-2">You&apos;ve reached the bottom!</h3>
                    <p className="text-zinc-600 mb-4">No more memes to load right now</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}