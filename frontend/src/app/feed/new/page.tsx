'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  Clock,
  RefreshCw,
  Flame
} from 'lucide-react';
import Masonry from 'react-masonry-css';

import MemeCard from '@/components/memes/MemeCard';
import { Button } from '@/components/ui/button';
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

  // Manual refresh handler
  const handleRefresh = () => {
    fetchMemes(1, true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      
      {/* --- Feed Navigation --- */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 py-3 px-6">
        <div className="max-w-480 mx-auto px-6 flex gap-2">
          <Button 
            asChild
            variant={isActive('/feed') ? 'default' : 'ghost'}
            size="sm"
            className={isActive('/feed') ? '' : 'text-zinc-400 hover:text-zinc-200'}
          >
            <Link href="/feed">
              Home
            </Link>
          </Button>
          <Button 
            asChild
            variant={isActive('/feed/trending') ? 'default' : 'ghost'}
            size="sm"
            className={isActive('/feed/trending') ? 'gap-2' : 'gap-2 text-zinc-400 hover:text-zinc-200'}
          >
            <Link href="/feed/trending">
              <Flame className="h-4 w-4" />
              Trending
            </Link>
          </Button>
          <Button 
            asChild
            variant={isActive('/feed/new') ? 'default' : 'ghost'}
            size="sm"
            className={isActive('/feed/new') ? 'gap-2' : 'gap-2 text-zinc-400 hover:text-zinc-200'}
          >
            <Link href="/feed/new">
              <Clock className="h-4 w-4" />
              Latest
            </Link>
          </Button>
        </div>
      </div>

      {/* --- Header Section --- */}
      <div className="sticky top-16 border-b border-zinc-900 bg-zinc-950/95 backdrop-blur-xl z-20">
        <div className="max-w-480 mx-auto px-6 py-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 italic tracking-tighter">
                        <Sparkles className="w-10 h-10 text-zinc-500 fill-zinc-500/20" />
                        <span className="bg-linear-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                            LATEST MEMES
                        </span>
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1 ml-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Fresh off the internet
                    </p>
                </div>

                {/* Refresh Button */}
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    <span className="font-semibold text-sm">
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </span>
                </button>
            </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-480 mx-auto px-6 py-8">
        
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
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
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
                            className="break-inside-avoid mb-6"
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
                    <button
                        onClick={handleRefresh}
                        className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all font-semibold text-sm"
                    >
                        Refresh for more
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}