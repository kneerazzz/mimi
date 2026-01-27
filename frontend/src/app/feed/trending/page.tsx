'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Flame, 
  TrendingUp, 
  Calendar, 
  Award, 
  Hash, 
  ArrowUpRight 
} from 'lucide-react';
import Masonry from 'react-masonry-css';

import MemeCard from '@/components/memes/MemeCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  1600: 3,
  1100: 2,
  700: 1
};

// Fake trending topics for the header
const TRENDING_TOPICS = [
  "AI Fails", "Coding", "Cats", "GTA VI", "Elden Ring", "Politics"
];

export default function TrendingPage() {
  const router = useRouter();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [timeFilter, setTimeFilter] = useState('week'); // 'day', 'week', 'month'

  // --- Infinite Scroll Observer ---
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      
      {/* --- 1. Hero / Header Section --- */}
      <div className="relative border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl z-20 top-0">
        <div className="max-w-480 mx-auto px-6 py-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 italic tracking-tighter">
                        <Flame className="w-10 h-10 text-zinc-500 fill-zinc-500" />
                        <span className="bg-linear-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                            TRENDING
                        </span>
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1 ml-1">
                        What the internet is laughing at right now.
                    </p>
                </div>

                {/* Time Filter Tabs */}
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    {['Today', 'This Week', 'All Time'].map((label) => {
                        const val = label.toLowerCase().replace(' ', '');
                        const isActive = timeFilter === (label === 'This Week' ? 'week' : val === 'alltime' ? 'all' : 'day');
                        return (
                            <button
                                key={label}
                                onClick={() => setTimeFilter(label === 'This Week' ? 'week' : val === 'alltime' ? 'all' : 'day')}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                                    isActive 
                                    ? 'bg-zinc-800 text-white shadow-sm' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Hot Topics Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient-right">
                <div className="flex items-center gap-2 pr-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <TrendingUp className="w-4 h-4" />
                    Hot Topics:
                </div>
                {TRENDING_TOPICS.map((topic, i) => (
                    <Badge 
                        key={topic}
                        variant="secondary"
                        className="bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 px-3 py-1 cursor-pointer whitespace-nowrap transition-colors"
                    >
                        # {topic}
                    </Badge>
                ))}
            </div>
        </div>
      </div>

      {/* --- 2. Main Content --- */}
      <div className="max-w-480 mx-auto px-6 py-8">
        
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
        >
            {memes.map((meme, index) => {
                const isTop3 = index < 3;
                
                return (
                    <div 
                        key={`${meme._id}-${index}`} 
                        ref={index === memes.length - 1 ? lastMemeRef : undefined}
                        className="break-inside-avoid mb-6 relative group"
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
                             <MemeCard meme={meme as any} />
                        </div>
                    </div>
                );
            })}
        </Masonry>
        
        {/* Load More / Loading State */}
        {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-zinc-800 border-t-orange-500 rounded-full animate-spin" />
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