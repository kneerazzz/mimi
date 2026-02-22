'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Flame, 
  Search,
  Clock
} from 'lucide-react';
import Masonry from 'react-masonry-css';
import { Input } from '@/components/ui/input';

import MemeCard from '@/components/memes/MemeCard';
import { Button } from '@/components/ui/button';
import { getTrendingMemes } from '@/services/memeService';

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
  imageUrl: string;
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
  700: 2,
  500: 1,
};

// Fake trending topics for the header
const TRENDING_TOPICS = [
  "AI Fails", "Coding", "Cats", "GTA VI", "Elden Ring", "Politics"
];

export default function TrendingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('week'); // 'day', 'week', 'month'

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      router.push(`/feed/search/memes?q=${encodedQuery}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // --- Fetch Logic ---
  const fetchMemes = async (pageNum: number) => {
    try {
      setLoading(true);
      // Pass 'timeFilter' to your API if your backend supports it: getTrendingMemes(pageNum, timeFilter)
      const res = await getTrendingMemes(pageNum);
      const newMemes = res.data?.memes || res.data?.feed || [];
      
      setMemes(prev => {
        const ids = new Set(prev.map(m => m._id));
        return [...prev, ...newMemes.filter((m: Meme) => !ids.has(m._id))];
      });
      
      if (newMemes.length === 0) setHasMore(false);
    } catch (error) {
      console.error("Failed to load trending:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset and Refetch when filter changes
  useEffect(() => {
    setMemes([]);
    setPage(1);
    setHasMore(true);
    fetchMemes(1);
  }, [timeFilter]);

  // Load more on page increment
  useEffect(() => {
    if (page > 1) fetchMemes(page);
  }, [page]);


  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
      
      {/* --- Feed Navigation --- */}
      <div className="flex mt-3 items-center gap-1 sm:gap-2 mb-2 overflow-x-auto scrollbar-none">
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

      {/* Search bar — full width on mobile */}
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

      {/* --- 2. Main Content --- */}
      <div className="mt-3">
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-2 sm:-ml-3"
            columnClassName="pl-2 sm:pl-3 bg-clip-padding"
        >
            {memes.map((meme, index) => {
                const isTop3 = index < 3;
                
                return (
                    <div 
                        key={`${meme._id}-${index}`} 
                        ref={index === memes.length - 1 ? lastMemeRef : undefined}
                        className="mb-2 sm:mb-3"
                    >
                        {/* Rank Badge for Top 3 */}
                        {isTop3 && (
                            <div className="absolute -top-3 -left-3 z-20 w-10 h-10 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center font-black text-lg shadow-xl rotate-[-10deg] group-hover:scale-110 transition-transform">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </div>
                        )}
                        
                        {/* Special styling for #1 Meme: 
                           Maybe add a subtle glow border or ring 
                        */}
                        <div className={`${index === 0 ? 'ring-2 ring-orange-500/20 rounded-xl' : ''}`}>
                             <MemeCard meme={meme as any} contentType='MemeFeedPost' />
                        </div>
                    </div>
                );
            })}
        </Masonry>
        
        {/* Load More / Loading State */}
        {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-zinc-800 border-t-zinc-500 rounded-full animate-spin" />
                <p className="text-zinc-500 animate-pulse">Checking the vibe...</p>
            </div>
        )}

        {!hasMore && !loading && (
            <div className="py-20 text-center">
                <h3 className="text-xl font-bold text-zinc-800">You have reached the bottom</h3>
                <p className="text-zinc-600">Go touch some grass 🌱</p>
            </div>
        )}

      </div>
    </div>
  );
}