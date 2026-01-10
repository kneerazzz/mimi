'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  ArrowLeft, 
  Download,
  Bookmark,
  MoreVertical,
  Copy,
  Flag,
  Check,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

// Services & Context
import { getRedditMemeDetails, addComment, ContentType, toggleLike } from '@/services/memeService';
import { useAuth } from '@/context/AuthContext';

// Mini Meme Card for Related Feed
interface MiniMemeCardProps {
  meme: any;
}

const MiniMemeCard: React.FC<MiniMemeCardProps> = ({ meme }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      href={`/feed/${meme._id}?type=${meme.contentType || 'MemeFeedPost'}`}
      className="group relative block rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-black">
        <img 
          src={meme.contentUrl || meme.imageUrl} 
          alt={meme.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className={`absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {isHovered && (
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h3 className="text-sm font-medium line-clamp-2 mb-2">{meme.title}</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {meme.originalScore || 0}
              </span>
              <span className="text-zinc-400">by {meme.author || 'Anonymous'}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default function MemeDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, setShowLoginModal } = useAuth();
  const commentsScrollRef = useRef<HTMLDivElement>(null);
  
  const memeId = params.memeId as string;
  const typeParam = searchParams.get('type');
  const contentType = (typeParam === 'CreatedMeme' ? 'CreatedMeme' : 'MemeFeedPost') as ContentType;

  // State
  const [meme, setMeme] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [relatedMemes, setRelatedMemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getRedditMemeDetails(memeId, contentType);
        const { meme: memeData, comments: commentsData, stats } = response.data.memeDetails;
        const backgroundFeed = response.data.backgroundFeed || [];
        
        setMeme(memeData);
        setComments(commentsData || []);
        setRelatedMemes(backgroundFeed);
        
        setLikeCount(stats?.likeCount ?? 0);
        setIsLiked(stats?.isLiked ?? false);
        setIsSaved(stats?.isSaved ?? false);
        setCommentCount(stats?.commentCount ?? commentsData?.length ?? 0);
        
      } catch (error) {
        console.error("Failed to load meme", error);
        toast.error("Could not load meme details");
      } finally {
        setLoading(false);
      }
    };

    if (memeId) fetchData();
  }, [memeId, contentType]);

  // Handle Like
  const handleLike = async () => {
    if (!user?.is_registered) {
      setShowLoginModal(true);
      return;
    }
    
    const prevLiked = isLiked;
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await toggleLike(memeId, contentType);
      toast.success(isLiked ? 'Removed from likes' : 'Liked!');
    } catch (error) {
      setIsLiked(prevLiked);
      setLikeCount(prev => prevLiked ? prev + 1 : prev - 1);
      toast.error('Failed to update like');
    }
  };

  // Handle Save
  const handleSave = async () => {
    if (!user?.is_registered) {
      setShowLoginModal(true);
      return;
    }

    const prevSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      // TODO: Call your save API endpoint
      toast.success(isSaved ? 'Unsaved' : 'Saved!');
    } catch (error) {
      setIsSaved(prevSaved);
      toast.error('Failed to save');
    }
  };

  // Handle Download
  const handleDownload = async () => {
    try {
      const imageUrl = meme.contentUrl || meme.imageUrl;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${meme.title || 'meme'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  // Handle Copy Link
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/memes/${memeId}?type=${contentType}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  // Handle Share
  const handleShare = async () => {
    const url = `${window.location.origin}/memes/${memeId}?type=${contentType}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: meme.title, url });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  // Handle Add Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user?.is_registered) {
      setShowLoginModal(true);
      return;
    }

    setIsSubmitting(true);
    const tempId = Date.now().toString();
    const newCommentObj = {
      _id: tempId,
      content: commentText,
      user: user,
      createdAt: new Date().toISOString(),
    };
    
    try {
      setComments(prev => [...prev, newCommentObj]);
      setCommentCount(prev => prev + 1);
      setCommentText('');

      await addComment({ content: commentText }, memeId, contentType);
      toast.success('Comment posted');
      
    } catch (error) {
      toast.error("Failed to post");
      setComments(prev => prev.filter(c => c._id !== tempId));
      setCommentCount(prev => prev - 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (!meme) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">😔</div>
          <h2 className="text-xl font-semibold text-zinc-100">Meme not found</h2>
          <Link href="/feed">
            <Button className="mt-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = meme.contentUrl || meme.imageUrl;
  const authorName = typeof meme.author === 'string' ? meme.author : meme.author?.username || 'Anonymous';
  const authorPic = typeof meme.author === 'object' ? meme.author?.profilePic : undefined;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-lg border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/feed">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-sm font-semibold text-zinc-100 truncate max-w-50">{meme.title}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
              <DropdownMenuItem onClick={handleSave}>
                <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-zinc-100' : ''}`} />
                {isSaved ? 'Unsave' : 'Save'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        
        {/* LEFT SECTION: 2/3 - Meme + Comments */}
        <div className="w-full lg:w-2/3 flex flex-col border-r border-zinc-800">
          
          {/* Meme Section */}
          <div className="relative bg-black flex items-center justify-center">
            {/* Desktop Back Button */}
            <Link href="/feed" className="hidden lg:block absolute top-6 left-6 z-10">
              <Button variant="secondary" size="icon" className="rounded-full bg-black/60 hover:bg-black/80 text-white border border-zinc-700 backdrop-blur-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>

            {/* Action Buttons - Desktop */}
            <div className="hidden lg:flex absolute top-6 right-6 z-10 gap-2">
              <Button variant="secondary" size="icon" onClick={handleSave}
                className={`rounded-full backdrop-blur-sm border ${isSaved ? 'bg-zinc-100 text-zinc-900 border-zinc-300' : 'bg-black/60 text-white border-zinc-700'}`}>
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-zinc-900' : ''}`} />
              </Button>
              <Button variant="secondary" size="icon" onClick={handleDownload}
                className="rounded-full bg-black/60 hover:bg-black/80 text-white border border-zinc-700 backdrop-blur-sm">
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" onClick={handleShare}
                className="rounded-full bg-black/60 hover:bg-black/80 text-white border border-zinc-700 backdrop-blur-sm">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Image */}
            <div className="w-full p-6 flex items-center justify-center min-h-100 max-h-150">
              <img src={imageUrl} alt={meme.title} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            </div>
          </div>

          {/* Meme Info */}
          <div className="bg-zinc-900 border-t border-zinc-800 p-4 lg:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-11 w-11 border-2 border-zinc-700">
                  <AvatarImage src={authorPic} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-300 font-semibold">
                    {authorName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-100 truncate">{authorName}</h3>
                  <p className="text-xs text-zinc-500">
                    {formatDistanceToNow(new Date(meme.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>

            <h1 className="text-lg font-semibold text-zinc-100 mb-4 leading-snug">{meme.title}</h1>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleLike}
                className={`gap-2 ${isLiked ? 'text-red-500 bg-red-950/30 border-red-900/50' : 'border-zinc-700 text-zinc-300'}`}>
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500' : ''}`} />
                <span className="font-medium">{likeCount}</span>
              </Button>
              
              <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300">
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">{commentCount}</span>
              </Button>
              
              <Button variant="outline" size="icon" onClick={handleShare} className="border-zinc-700 text-zinc-300">
                <Share2 className="h-4 w-4" />
              </Button>

              <div className="flex-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem onClick={handleCopyLink}>
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400">
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 bg-zinc-900 border-t border-zinc-800">
            <div className="px-4 lg:px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Comments ({commentCount})
              </h2>
            </div>

            <ScrollArea ref={commentsScrollRef} className="h-100 lg:h-125 px-4 lg:px-6 py-4">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                  <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium">No comments yet</p>
                  <p className="text-xs mt-1">Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 items-start group">
                      <Avatar className="h-8 w-8 mt-0.5 border border-zinc-700 shrink-0">
                        <AvatarImage src={comment.user?.profilePic} />
                        <AvatarFallback className="text-xs bg-zinc-800 text-zinc-400">
                          {comment.user?.username?.substring(0, 2).toUpperCase() || 'AN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="bg-zinc-800/50 rounded-2xl rounded-tl-sm px-4 py-3 group-hover:bg-zinc-800/70 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-zinc-200">
                              {comment.user?.username || 'Anonymous'}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                          </div>
                          <p className="text-sm text-zinc-300 leading-relaxed wrap-break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Comment Input */}
            <div className="p-4 lg:p-6 border-t border-zinc-800 bg-zinc-900">
              <form onSubmit={handlePostComment} className="flex gap-2">
                <Avatar className="h-9 w-9 border border-zinc-700 shrink-0">
                  <AvatarImage src={user?.profilePic} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                    {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input placeholder="Write a comment..." 
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-600"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <Button type="submit" size="icon" 
                    disabled={!commentText.trim() || isSubmitting}
                    className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50">
                    {isSubmitting ? (
                      <div className="h-4 w-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: 1/3 - Related Memes (Pinterest Style) */}
        <div className="hidden lg:block w-1/3 bg-zinc-950 overflow-hidden">
          <div className="sticky top-0 p-6 border-b border-zinc-800 bg-zinc-950 z-10">
            <h2 className="text-sm font-semibold text-zinc-100">More Memes</h2>
            <p className="text-xs text-zinc-500 mt-1">Discover similar content</p>
          </div>
          
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4 grid grid-cols-2 gap-3">
              {relatedMemes.map((relatedMeme) => (
                <MiniMemeCard key={relatedMeme._id} meme={relatedMeme} />
              ))}
            </div>
          </ScrollArea>
        </div>

      </div>
    </div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <div className="w-2/3 border-r border-zinc-800">
        <div className="bg-black h-96 animate-pulse" />
        <div className="p-6 space-y-4 bg-zinc-900">
          <div className="flex gap-3">
            <Skeleton className="h-11 w-11 rounded-full bg-zinc-800" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-zinc-800" />
              <Skeleton className="h-3 w-24 bg-zinc-800" />
            </div>
          </div>
          <Skeleton className="h-6 w-3/4 bg-zinc-800" />
        </div>
      </div>
      <div className="w-1/3 p-6">
        <Skeleton className="h-6 w-32 bg-zinc-800 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-square bg-zinc-800" />)}
        </div>
      </div>
    </div>
  );
}