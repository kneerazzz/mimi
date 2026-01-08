'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Bookmark,
  Download,
  Share2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Mock useAuth hook - replace with your actual auth hook
const useAuth = () => {
  // Replace this with your actual auth logic
  const [isLoggedIn] = useState(false); // Change to true to test logged-in state
  return { isLoggedIn };
};

interface MemeCardProps {
  meme: {
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
  };
  onLoginRequired?: () => void; // Callback to open login modal
}

const MemeCard: React.FC<MemeCardProps> = ({ meme, onLoginRequired }) => {
  const { isLoggedIn } = useAuth();
  const [isLiked, setIsLiked] = useState(meme.isLiked || false);
  const [isSaved, setIsSaved] = useState(meme.isSaved || false);
  const [likeCount, setLikeCount] = useState(meme.originalScore || 0);

  // Handle like action
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      // TODO: Call your like API endpoint
      // await fetch(`/api/memes/${meme._id}/like`, { method: 'POST' });
      console.log('Like toggled for meme:', meme._id);
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      console.error('Failed to toggle like:', error);
    }
  };

  // Handle save action
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }

    // Optimistic update
    setIsSaved(!isSaved);

    try {
      // TODO: Call your save API endpoint
      // await fetch(`/api/memes/${meme._id}/save`, { method: 'POST' });
      console.log('Save toggled for meme:', meme._id);
    } catch (error) {
      // Revert on error
      setIsSaved(isSaved);
      console.error('Failed to toggle save:', error);
    }
  };

  // Handle download - publicly accessible
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(meme.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meme-${meme._id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Download initiated for meme:', meme._id);
    } catch (error) {
      console.error('Failed to download meme:', error);
    }
  };

  // Handle share
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.title,
          url: `${window.location.origin}/memes/${meme._id}`,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/memes/${meme._id}`);
      console.log('Link copied to clipboard');
    }
  };

  const getInitials = (username: string) => {
    return username?.substring(0, 2).toUpperCase() || 'AN';
  };

  return (
    <Card className="w-full bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden">
      {/* Header */}
      <Link href={`/memes/${meme._id}`}>
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-zinc-700">
              <AvatarImage src={meme.author?.profilePic} alt={meme.author?.username} />
              <AvatarFallback className="bg-zinc-800 text-zinc-300">
                {getInitials(meme.author?.username || 'Anonymous')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-100">
                {meme.author?.username || 'Anonymous'}
              </span>
              {meme.createdAt && (
                <span className="text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(meme.createdAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="bg-zinc-900 border-zinc-800 text-zinc-100"
            >
              <DropdownMenuItem 
                onClick={handleSave}
                className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
              >
                <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-zinc-100' : ''}`} />
                {isSaved ? 'Unsave' : 'Save'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDownload}
                className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleShare}
                className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>

      {/* Title */}
      {meme.title && (
        <Link href={`/memes/${meme._id}`}>
          <div className="px-4 pb-3 cursor-pointer">
            <h3 className="text-zinc-100 font-medium text-base line-clamp-2 hover:text-zinc-300 transition-colors">
              {meme.title}
            </h3>
          </div>
        </Link>
      )}

      {/* Image */}
      <Link href={`/memes/${meme._id}`}>
        <div className="relative bg-black cursor-pointer group">
          <img
            src={meme.imageUrl}
            alt={meme.title}
            className="w-full h-auto object-contain max-h-150 group-hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-1 p-4 border-t border-zinc-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`gap-2 ${
            isLiked 
              ? 'text-red-500 hover:text-red-600 hover:bg-red-950/20' 
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
          }`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500' : ''}`} />
          <span className="text-sm font-medium">{likeCount}</span>
        </Button>

        <Link href={`/memes/${meme._id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Comment</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default MemeCard;