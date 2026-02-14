'use client';

import React, { useEffect, useState } from 'react';
import { getSavedMemes } from '@/services/memeService';
import MemeCard, { MemeData } from '@/components/memes/MemeCard';
import { Loader2, Bookmark } from 'lucide-react';
import Masonry from 'react-masonry-css';

interface SavedMemesSectionProps {
  onCountUpdate?: (count: number) => void;
}

const feedBreakpoints = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 2,
  900: 1
};

export const SavedMemesSection: React.FC<SavedMemesSectionProps> = ({
  onCountUpdate,
}) => {
  const [savedMemes, setSavedMemes] = useState<MemeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedMemes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getSavedMemes();
        
        // Handle different response structures
        let memes: MemeData[] = [];
        if (Array.isArray(res?.data)) {
          memes = res.data;
        } else if (Array.isArray(res)) {
          memes = res;
        } else if (Array.isArray(res?.memes)) {
          memes = res.memes;
        }

        // Transform the data to match MemeData interface
        const transformedMemes: MemeData[] = memes.map((meme: any) => ({
          _id: meme._id,
          title: meme.clonedTitle || meme.title || '',
          contentUrl: meme.finalImageUrl || meme.contentUrl || meme.clonedContentUrl,
          imageUrl: meme.finalImageUrl || meme.contentUrl || meme.clonedContentUrl,
          author: meme.creator || meme.clonedAuthor || meme.author,
          createdAt: meme.createdAt,
          subreddit: meme.clonedSubreddit || meme.subreddit,
          originalScore: meme.clonedOriginalScore || meme.originalScore,
          redditPostId: meme.originalRedditId || meme.redditPostId,
          ...meme,
        }));

        setSavedMemes(transformedMemes);
        onCountUpdate?.(transformedMemes.length);
      } catch (err) {
        console.error('Failed to load saved memes', err);
        setError('Failed to load saved memes');
        setSavedMemes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedMemes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-400">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Loading saved memes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!savedMemes || savedMemes.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <Bookmark className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-sm">You haven't saved any memes yet.</p>
      </div>
    );
  }

  return (
    <Masonry className="my-masonry-grid" columnClassName="my-masonry-grid_column" breakpointCols={feedBreakpoints}>
      {savedMemes.map((meme) => (
        <MemeCard key={meme._id} meme={meme} contentType='CreatedMeme' />
      ))}
    </Masonry>
  );
};
