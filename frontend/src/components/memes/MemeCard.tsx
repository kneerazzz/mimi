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
import { Heart, MoreHorizontal, Bookmark, Download, Share2 } from 'lucide-react';
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
  contentUrl?: string;
  imageUrl?: string;
  author?: string | { username: string; profilePic?: string };
  createdAt?: string;
  subreddit?: string;
  originalScore?: number;
  stats?: MemeStats;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface MemeCardProps {
  meme: MemeData;
}

const MemeCard: React.FC<MemeCardProps> = ({ meme }) => {
  const { user, setShowLoginModal } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  // --- DATA NORMALIZATION ---
  const title = meme.title;
  const imageUrl = meme.contentUrl || meme.imageUrl || "";
  const authorName =
    typeof meme.author === 'string'
      ? meme.author
      : meme.author?.username || 'Anonymous';
  const authorPic =
    typeof meme.author === 'object' ? meme.author?.profilePic : undefined;
  const subreddit = meme.subreddit;

  const initialIsLiked = meme.stats?.isLiked ?? meme.isLiked ?? false;
  const initialIsSaved = meme.stats?.isSaved ?? meme.isSaved ?? false;
  const initialLikeCount = meme.stats?.likeCount ?? 0;
  const contentType = "MemeFeedPost";

  // --- STATE ---
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // --- HANDLERS ---
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
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLikeLoading(true);

    try {
      await toggleLike(meme._id, contentType);
    } catch (error) {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
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
      toast.success(isSaved ? "Removed from saved" : "Saved");
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
    <div 
      className="break-inside-avoid mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/feed/${meme._id}`} className="block group">
        <Card className="overflow-hidden bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 relative">
          {/* Image Container - Natural aspect ratio */}
          <div className="relative w-full bg-zinc-950 overflow-hidden">
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-auto object-contain"
                />
                {/* Hover Overlay with Save & More buttons */}
                <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="absolute top-4 right-4 flex gap-2">
                    {/* Save Button */}
                    <Button
                      onClick={handleSave}
                      className={`rounded-full h-12 px-6 font-semibold shadow-lg ${
                        isSaved
                          ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>

                    {/* More Options Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full h-12 w-12 p-0 bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-zinc-900 border-zinc-800 text-zinc-100 w-48"
                      >
                        <DropdownMenuItem
                          onClick={handleDownload}
                          className="gap-3 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 py-3"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download image</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleShare}
                          className="gap-3 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 py-3"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-64 flex items-center justify-center">
                <p className="text-zinc-600">No Image Available</p>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Title */}
            {title && (
              <h3 className="text-zinc-100 font-medium text-base mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
                {title}
              </h3>
            )}

            {/* Author & Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 ring-2 ring-zinc-800">
                  <AvatarImage src={authorPic} alt={authorName} />
                  <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white text-xs font-semibold">
                    {getInitials(authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-300">{authorName}</span>
                  {subreddit && (
                    <span className="text-xs text-purple-400">r/{subreddit}</span>
                  )}
                </div>
              </div>

              {/* Like Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLikeLoading}
                className={`gap-2 ${
                  isLiked
                    ? 'text-pink-500 hover:text-pink-600 hover:bg-pink-500/10'
                    : 'text-zinc-400 hover:text-pink-500 hover:bg-zinc-800'
                }`}
              >
                <Heart
                  className={`h-5 w-5 transition-all ${
                    isLiked ? 'fill-pink-500' : ''
                  }`}
                />
                <span className="font-medium">{likeCount}</span>
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
};

export default MemeCard;