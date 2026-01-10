'use client'
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
  Share2,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toggleLike, toggleSave, ContentType } from '@/services/memeService';
import { useAuth } from '@/context/AuthContext'; 
import { toast } from 'sonner';

// --- Types based on your Real API Response ---
interface MemeStats {
    likeCount?: number;
    commentCount?: number;
    isLiked?: boolean;
    isSaved?: boolean;
}

interface MemeData {
    _id: string;
    title: string;
    contentUrl?: string; // API uses this
    imageUrl?: string;   // Fallback
    author?: string | { username: string; profilePic?: string }; // Can be string or object
    createdAt?: string;
    subreddit?: string;
    originalScore?: number; // Reddit Score
    stats?: MemeStats;      // Nested stats from details endpoint
    isLiked?: boolean;      // Flat stats from feed endpoint
    isSaved?: boolean;      // Flat stats from feed endpoint
}

interface MemeCardProps {
  meme: MemeData;
}

const MemeCard: React.FC<MemeCardProps> = ({ meme }) => {
  const { user, setShowLoginModal } = useAuth(); 

  // --- 1. DATA NORMALIZATION (The "Smart" Part) ---
  // This ensures the card works with both "Feed Items" and "Detail Items"
  const title = meme.title;
  const imageUrl = meme.contentUrl || meme.imageUrl || "";
  const authorName = typeof meme.author === 'string' ? meme.author : meme.author?.username || 'Anonymous';
  const authorPic = typeof meme.author === 'object' ? meme.author?.profilePic : undefined;
  const subreddit = meme.subreddit;
  
  // Prioritize "stats" object (from details), fall back to root props (from feed)
  const initialIsLiked = meme.stats?.isLiked ?? meme.isLiked ?? false;
  const initialIsSaved = meme.stats?.isSaved ?? meme.isSaved ?? false;
  // If internal like count is 0, maybe show original reddit score? (Optional choice)
  const initialLikeCount = meme.stats?.likeCount ?? 0; 
  const commentCount = meme.stats?.commentCount ?? 0;
  
  const contentType = "MemeFeedPost"; 

  // --- 2. STATE ---
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // --- 3. HANDLERS ---
  const checkAuth = () => {
    if (!user || !user.is_registered) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!checkAuth()) return;
    if (isLikeLoading) return;

    const previousLiked = isLiked;
    
    // Optimistic Update
    setIsLiked(!isLiked);
    setLikeCount((prev) => isLiked ? prev - 1 : prev + 1);
    setIsLikeLoading(true);

    try {
      await toggleLike(meme._id, contentType);
    } catch (error) {
      setIsLiked(previousLiked);
      setLikeCount((prev) => isLiked ? prev + 1 : prev - 1); // Revert count
      toast.error("Failed to like");
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!checkAuth()) return;

    const previousSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      await toggleSave(meme._id, contentType);
      toast.success(isSaved ? "Removed from bookmarks" : "Saved to bookmarks");
    } catch (error) {
      setIsSaved(previousSaved);
      toast.error("Failed to save");
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meme-${meme._id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/feed/${meme._id}`;
    if (navigator.share) {
      await navigator.share({ title: title, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    }
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <Card className="w-full bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden mb-4">
      {/* Header */}
      <Link href={`/feed/${meme._id}?type="MemeFeedPost"`}>
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-zinc-700">
              <AvatarImage src={authorPic} alt={authorName} />
              <AvatarFallback className="bg-zinc-800 text-zinc-300 font-bold">
                {getInitials(authorName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-100">
                  {authorName}
                </span>
                {subreddit && (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full border border-zinc-700">
                    r/{subreddit}
                  </span>
                )}
              </div>
              {meme.createdAt && (
                <span className="text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(meme.createdAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-100">
              <DropdownMenuItem onClick={handleSave} className="cursor-pointer hover:bg-zinc-800">
                <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-zinc-100' : ''}`} />
                {isSaved ? 'Unsave' : 'Save'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} className="cursor-pointer hover:bg-zinc-800">
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare} className="cursor-pointer hover:bg-zinc-800">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>

      {/* Title */}
      {title && (
        <Link href={`/feed/${meme._id}`}>
          <div className="px-4 pb-3 cursor-pointer">
            <h3 className="text-zinc-100 font-medium text-base leading-snug hover:text-blue-400 transition-colors">
              {title}
            </h3>
          </div>
        </Link>
      )}

      {/* Image */}
      <Link href={`/feed/${meme._id}`}>
        <div className="relative bg-black min-h-50 flex items-center justify-center cursor-pointer group">
          {imageUrl ? (
             <img
               src={imageUrl}
               alt={title}
               className="w-full h-auto object-contain max-h-50 group-hover:opacity-90 transition-opacity"
               loading="lazy"
             />
          ) : (
             <div className="p-10 text-zinc-500">No Image Available</div>
          )}
        </div>
      </Link>

      {/* Actions Footer */}
      <div className="flex items-center justify-between p-3 border-t border-zinc-800">
        <div className="flex items-center gap-1">
            {/* Like Button */}
            <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-2 h-9 px-3 ${
                isLiked 
                ? 'text-red-500 hover:text-red-600 hover:bg-red-950/30' 
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">
                {likeCount > 0 ? likeCount : "Like" }
            </span>
            </Button>

            {/* Comment Button */}
            <Link href={`/feed/${meme._id}`}>
            <Button
                variant="ghost"
                size="sm"
                className="gap-2 h-9 px-3 text-zinc-400 hover:text-blue-400 hover:bg-blue-950/20"
            >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                    {commentCount > 0 ? commentCount : "Comment"}
                </span>
            </Button>
            </Link>
        </div>

        {/* Share Button (Quick Access) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 h-9 w-9"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default MemeCard;