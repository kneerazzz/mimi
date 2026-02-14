'use client';

import React, { useEffect, useState } from 'react';
import { getLikedMemes } from '@/services/memeService';
import MemeCard, { MemeData } from '@/components/memes/MemeCard';
import { Loader2, Heart } from 'lucide-react';
import Masonry from 'react-masonry-css';


interface LikedMemesSectionProps {
  onCountUpdate?: (count: number) => void;
}

const feedBreakpoints = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 2,
  900: 1
};

export const LikedMemesSection: React.FC<LikedMemesSectionProps> = ({
  onCountUpdate,
}) => {
  const [likedMemes, setLikedMemes] = useState<MemeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLikedMemes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getLikedMemes();
        
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

        setLikedMemes(transformedMemes);
        onCountUpdate?.(transformedMemes.length);
      } catch (err) {
        console.error('Failed to load liked memes', err);
        setError('Failed to load liked memes');
        setLikedMemes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLikedMemes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-400">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Loading liked memes...
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

  if (!likedMemes || likedMemes.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <Heart className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-sm">Memes you like will show up here.</p>
      </div>
    );
  }

  return (
    <Masonry
    breakpointCols={feedBreakpoints}
    className='my-masonry-grid'
    columnClassName='my-masonry-grid_column'>
        {likedMemes.map((meme) => (
          <MemeCard key={meme._id} meme={meme} contentType="CreatedMeme" />
        ))}
    </Masonry>
  );
};
