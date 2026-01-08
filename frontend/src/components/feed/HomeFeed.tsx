'use client';

import React, { useState, useEffect } from 'react';
import MemeCard from '../memes/MemeCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

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

interface HomeFeedProps {
  onLoginRequired?: () => void; // Callback to open login modal
}

// Skeleton loader component
const MemeCardSkeleton = () => (
  <Card className="w-full bg-zinc-900 border-zinc-800 overflow-hidden">
    <div className="flex items-center gap-3 p-4">
      <div className="h-10 w-10 rounded-full bg-zinc-800 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
        <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
      </div>
    </div>
    <div className="px-4 pb-3">
      <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />
    </div>
    <div className="w-full h-96 bg-zinc-800 animate-pulse" />
    <div className="flex items-center gap-4 p-4 border-t border-zinc-800">
      <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
      <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
    </div>
  </Card>
);

const HomeFeed: React.FC<HomeFeedProps> = ({ onLoginRequired }) => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch memes function
  const fetchMemes = async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      const response = await fetch(`/api/memes?page=${pageNum}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch memes');
      }

      const data = await response.json();
      
      // Mock data for demonstration
      const mockMemes: Meme[] = Array.from({ length: 10 }, (_, i) => ({
        _id: `meme-${pageNum}-${i + 1}`,
        title: `Hilarious Meme #${(pageNum - 1) * 10 + i + 1}`,
        author: {
          username: `user${Math.floor(Math.random() * 100)}`,
          profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        },
        imageUrl: `https://picsum.photos/seed/${pageNum}${i}/600/400`,
        originalScore: Math.floor(Math.random() * 10000),
        isLiked: false,
        isSaved: false,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        contentType: 'MemeFeedPost',
      }));

      if (pageNum === 1) {
        setMemes(mockMemes);
      } else {
        setMemes(prev => [...prev, ...mockMemes]);
      }

      // Check if there are more memes to load
      setHasMore(mockMemes.length === 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching memes:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load initial memes
  useEffect(() => {
    fetchMemes(1);
  }, []);

  // Load more memes
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMemes(nextPage);
  };

  // Refresh feed
  const handleRefresh = () => {
    setPage(1);
    fetchMemes(1);
  };

  // Error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                Failed to Load Memes
              </h3>
              <p className="text-sm text-zinc-400 mb-4">{error}</p>
            </div>
            <Button
              onClick={handleRefresh}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-6">
      <div className="max-w-150 mx-auto px-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-100">Meme Feed</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <>
            <MemeCardSkeleton />
            <MemeCardSkeleton />
            <MemeCardSkeleton />
          </>
        )}

        {/* Meme cards */}
        {!isLoading && memes.length > 0 && (
          <>
            {memes.map((meme) => (
              <MemeCard 
                key={meme._id} 
                meme={meme} 
                onLoginRequired={onLoginRequired}
              />
            ))}

            {/* Load more button */}
            {hasMore && (
              <div className="flex justify-center pt-4 pb-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Memes'
                  )}
                </Button>
              </div>
            )}

            {/* End of feed message */}
            {!hasMore && memes.length > 0 && (
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm">
                  You've reached the end of the feed
                </p>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!isLoading && memes.length === 0 && (
          <Card className="w-full bg-zinc-900 border-zinc-800 p-12">
            <div className="text-center space-y-4">
              <div className="text-6xl">😔</div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  No Memes Found
                </h3>
                <p className="text-sm text-zinc-400">
                  The meme feed is empty. Check back later!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HomeFeed;