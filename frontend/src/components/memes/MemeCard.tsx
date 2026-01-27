'use client'
import React, { useState, useRef, useEffect } from 'react';
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
import { Heart, MoreHorizontal, Bookmark, Download, Share2, MessageCircle, Eye, TrendingUp, Award, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { toggleLike, toggleSave, ContentType } from '@/services/memeService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface MemeStats {
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isTrending?: boolean;
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
  isVideo?: boolean;
  tags?: string[];
}

interface MemeCardProps {
  meme: MemeData;
}

const MemeCard: React.FC<MemeCardProps> = ({ meme }) => {
  const { user, setShowLoginModal } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const title = meme.title;
  const imageUrl = meme.contentUrl || meme.imageUrl || "";
  const authorName =
    typeof meme.author === 'string'
      ? meme.author
      : meme.author?.username || 'Anonymous';
  const authorPic =
    typeof meme.author === 'object' ? meme.author?.profilePic : undefined;
  const subreddit = meme.subreddit;
  const initialIsLiked = meme.isLiked ?? meme.isLiked ?? false;
  const initialIsSaved = meme.isSaved ?? meme.isSaved ?? false;
  let rawLikeCount = meme.stats?.likeCount ?? 0;
  if (initialIsLiked && rawLikeCount === 0) {
     rawLikeCount = 1;
  }

  const initialLikeCount = rawLikeCount;
  const viewCount = meme.stats?.viewCount ?? 0;
  const isTrending = meme.stats?.isTrending ?? false;
  const contentType = "MemeFeedPost";
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [commentCount, setCommentCount] = useState(meme.stats?.commentCount || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  useEffect(() => {
    if (isHovered && meme.isVideo && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isHovered, meme.isVideo]);

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
    setLikeCount((prev) => Math.max(0, isLiked ? prev - 1 : prev + 1));
    setIsLikeLoading(true);

    if (!isLiked) {
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
    }

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

  const handleDoubleTapLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLiked) {
      handleLike(e);
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
      toast.success(isSaved ? "Removed from saved" : "Saved to collection");
    } catch (error) {
      setIsSaved(previousSaved);
      toast.error("Failed to save");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(
        `/api/download?url=${encodeURIComponent(imageUrl)}`
      );

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `meme-${meme._id}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch {
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
      toast.success("Link copied to clipboard");
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFullImage(!showFullImage);
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  return (
    <>
      <div 
        className="break-inside-avoid mb-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/feed/${meme._id}`} className="block group">
          <Card className="overflow-hidden bg-linear-to-br from-zinc-800 to-zinc-950 border-zinc-800 hover:border-zinc-400 transition-all duration-300 relative border-2 hover:shadow-xl hover:shadow-zinc-500/10">
            {/* Trending Badge */}
            {isTrending && (
              <div className="absolute top-3 left-3 z-10 bg-linear-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <TrendingUp className="h-3 w-3" />
                Trending
              </div>
            )}

            {/* Image/Video Container */}
            <div className="relative w-full bg-zinc-950 overflow-hidden">
              {meme.isVideo ? (
                <>
                  <video
                    ref={videoRef}
                    src={imageUrl}
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-auto object-contain"
                    onLoadedData={() => setImageLoaded(true)}
                  />
                  {/* Video Controls */}
                  <div className={`absolute bottom-4 right-4 flex gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <Button
                      onClick={toggleMute}
                      className="rounded-full h-10 w-10 p-0 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </>
              ) : imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={title}
                    className={`w-full h-auto object-contain transition-all duration-500 ${imageLoaded ? 'blur-0 scale-100' : 'blur-sm scale-105'}`}
                    onLoad={() => setImageLoaded(true)}
                    onDoubleClick={handleDoubleTapLike}
                  />
                  {/* Skeleton Loader */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-linear-to-br from-zinc-800 to-zinc-900 animate-pulse" />
                  )}
                </>
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-linear-to-br from-zinc-900 to-zinc-950">
                  <p className="text-zinc-600">No Image Available</p>
                </div>
              )}

              {/* Double Tap Like Animation */}
              {showLikeAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Heart className="h-24 w-24 text-pink-500 fill-pink-500 animate-ping" />
                </div>
              )}

              {/* Hover Overlay */}
              <div className={`absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    onClick={handleSave}
                    className={`rounded-lg h-12 px-6 font-semibold shadow-lg backdrop-blur-md transition-all ${
                      isSaved
                        ? 'bg-zinc-700 hover:bg-zinc-800 text-white scale-105'
                        : 'bg-white/90 hover:bg-white text-black'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-white' : ''}`} />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full h-12 w-12 p-0 bg-white/90 hover:bg-white text-black shadow-lg backdrop-blur-md"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 w-56"
                    >
                      <DropdownMenuItem
                        onClick={handleDownload}
                        className="gap-3 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 py-3"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download image</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={toggleFullImage}
                        className="gap-3 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 py-3"
                      >
                        <Maximize2 className="h-4 w-4" />
                        <span>View full size</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* View Count on hover */}
                {viewCount > 0 && (
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Eye className="h-4 w-4 text-zinc-300" />
                    <span className="text-sm font-medium text-zinc-200">{formatNumber(viewCount)} views</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
              {/* Title with gradient on hover */}
              {title && (
                <h3 className="text-zinc-100 font-semibold text-base mb-3 line-clamp-2 group-hover:bg-linear-to-r group-hover:from-zinc-300 group-hover:to-zinc-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {title}
                </h3>
              )}

              {/* Tags */}
              {meme.tags && meme.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {meme.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author & Metadata */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  <Avatar className="h-9 w-9 ring-1 ring-zinc-500/50">
                    <AvatarImage src={authorPic} alt={authorName} />
                    <AvatarFallback className="bg-linear-to-br pt-1 from-zinc-500 to-zinc-600 text-white text-xs font-bold">
                      {getInitials(authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-200">{authorName}</span>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      {subreddit && <span className="text-zinc-400 font-medium">r/{subreddit}</span>}
                      {meme.createdAt && <span>• {getTimeAgo(meme.createdAt)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end pt-3 border-t border-zinc-800">
                  {/* Like Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={isLikeLoading}
                    className={`gap-2 transition-all ${
                      isLiked
                        ? 'text-pink-500 hover:text-pink-600 hover:bg-pink-500/10'
                        : 'text-zinc-400 hover:text-pink-500 hover:bg-zinc-800'
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 transition-all ${
                        isLiked ? 'fill-pink-500 scale-110' : ''
                      }`}
                    />
                    <span className="font-semibold">{formatNumber(likeCount)}</span>
                  </Button>

                  {/* Comment Count */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-semibold">{formatNumber(commentCount)}</span>
                  </Button>

                  {/* Share Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="gap-2 text-zinc-400 hover:text-green-400 hover:bg-zinc-800"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Interaction Bar */}
            </div>
          </Card>
        </Link>
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={toggleFullImage}
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-full object-contain"
          />
          <Button
            onClick={toggleFullImage}
            className="absolute top-4 right-4 rounded-full h-12 w-12 p-0 bg-white/90 hover:bg-white text-black"
          >
            ✕
          </Button>
        </div>
      )}
    </>
  );
};

export default MemeCard;