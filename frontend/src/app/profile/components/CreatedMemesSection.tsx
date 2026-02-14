'use client';

import React, { useEffect, useState } from 'react';
import { getCreatedMemesByUsername } from '@/services/memeService';
import MemeCard, { MemeData } from '@/components/memes/MemeCard';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import Masonry from 'react-masonry-css';

interface CreatedMemesSectionProps {
  username: string;
  isOwnProfile?: boolean;
  onCountUpdate?: (count: number) => void;
}

const feedBreakpoints = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 2,
  900: 1
};

export const CreatedMemesSection: React.FC<CreatedMemesSectionProps> = ({
  username,
  isOwnProfile = false,
  onCountUpdate,
}) => {
  const [createdMemes, setCreatedMemes] = useState<MemeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const loadCreatedMemes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getCreatedMemesByUsername(username);
        
        // Handle different response structures
        // Response structure: { statusCode: 200, data: { memes: [...] } }
        let memes: any[] = [];
        if (res?.data?.memes && Array.isArray(res.data.memes)) {
          memes = res.data.memes;
        } else if (res?.memes && Array.isArray(res.memes)) {
          memes = res.memes;
        } else if (Array.isArray(res?.data)) {
          memes = res.data;
        } else if (Array.isArray(res)) {
          memes = res;
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

        setCreatedMemes(transformedMemes);
        onCountUpdate?.(transformedMemes.length);
      } catch (err) {
        console.error('Failed to load created memes', err);
        setError('Failed to load created memes');
        setCreatedMemes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCreatedMemes();
  }, [username]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-400">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Loading created memes...
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

  if (!createdMemes || createdMemes.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-sm">
          {isOwnProfile 
            ? "You haven't created any memes yet." 
            : "This user hasn't created any memes yet."}
        </p>
      </div>
    );
  }

  return (
    <Masonry className="my-masonry-grid" columnClassName="my-masonry-grid_column" breakpointCols={feedBreakpoints}>
      {createdMemes.map((meme) => (
        <MemeCard key={meme._id} meme={meme} contentType='CreatedMeme' />
      ))}
    </Masonry>
  );
};
