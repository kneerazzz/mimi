'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import MemeCard from '../memes/MemeCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { getHomeMemes } from '@/services/memeService';

import Masonry from 'react-masonry-css'; // Import the library

// Define how many columns you want at specific screen widths
const breakpointColumnsObj = {
  default: 4,   // 5 columns on huge screens
  1536: 3,      // 4 columns on 2xl screens
  1280: 3,      // 3 columns on xl screens
  1024: 2,      // 3 columns on lg screens
  768: 2,       // 2 columns on md screens
  640: 1        // 1 column on mobile
};

interface Meme {
  _id: string;
  title: string;
  author?: {
    username: string;
    profilePic?: string;
  };
  imageUrl: string;
  originalScore?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt?: string;
  contentType?: string;
}

// 1. Updated Skeleton for Masonry Grid
const MasonrySkeleton = () => (
  <div className="break-inside-avoid mb-4 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
    <div className="h-75 w-full bg-zinc-800/30" />
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-zinc-800" />
        <div className="h-3 w-24 bg-zinc-800 rounded" />
      </div>
    </div>
  </div>
);

const HomeFeed = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Initial load
  const [isFetchingMore, setIsFetchingMore] = useState(false); // Background scroll load
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 2. The "Observer" Ref for Infinite Scroll
  const observer = useRef<IntersectionObserver | null>(null);
  
  // This callback attaches to the LAST element in the list
  const lastMemeElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isFetchingMore) return;
    
    // Disconnect previous observer
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      // If the last element is visible AND we have more data
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, hasMore]);


  const fetchMemes = async (pageNum: number) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsFetchingMore(true);
      
      setError(null);

      const response = await getHomeMemes(pageNum);
      const newMemes = response.data?.memes || response.data?.feed || []; 

      setMemes(prev => {
        // Safety: Filter out duplicates based on _id just in case
        const existingIds = new Set(prev.map(m => m._id));
        const uniqueNewMemes = newMemes.filter((m: Meme) => !existingIds.has(m._id));
        return [...prev, ...uniqueNewMemes];
      });

      // If we got 0 items, we are done
      if (newMemes.length === 0) {
        setHasMore(false);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load memes');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  // Trigger fetch whenever "page" number updates
  useEffect(() => {
    fetchMemes(page);
  }, [page]);


  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    setMemes([]); // Clear current list
    fetchMemes(1);
  };

  // Error State
  if (error && memes.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-zinc-200 font-semibold mb-2">Could not load feed</h3>
        <Button onClick={handleRefresh} variant="outline" className="border-zinc-700 text-zinc-300">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 w-full">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
         <h1 className="text-xl font-bold bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Mimi
         </h1>
         <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className="text-zinc-400 hover:text-white"
         >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
         </Button>
      </header>

      <main className="mx-auto px-8 py-6">
        
        {/* 3. The Masonry Grid Layout (CSS Columns) */}
        {/* Mobile: 2 cols | Tablet: 3 cols | Desktop: 4 cols | Large: 5 cols | XL: 6 cols */}
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className='my-masonry-grid'
          columnClassName='my-masonry-grid_column'
        >
          
          {memes.map((meme, index) => {
            // Check if this is the last element to attach the observer
            if (memes.length === index + 1) {
              return (
                <div ref={lastMemeElementRef} key={meme._id} className='break-inside-avoid mb-4 px-2 py-3' >
                  <MemeCard meme={meme} />
                </div>
              );
            } else {
              return (
                <div key={meme._id} className="break-inside-avoid mb-6 mx-1">
                  <MemeCard meme={meme} />
                </div>
              );
            }
          })}

          {/* Skeleton Loaders (Show when loading initial OR more) */}
          {(isLoading || isFetchingMore) && (
            <>
              <MasonrySkeleton />
              <MasonrySkeleton />
              <MasonrySkeleton />
              <MasonrySkeleton />
              <MasonrySkeleton />
              <MasonrySkeleton />
            </>
          )}
        </Masonry>

        {/* End of Feed Message */}
        {!hasMore && !isLoading && (
          <div className="py-12 text-center text-zinc-500">
              <p>You've reached the end of the internet 🏁</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default HomeFeed;