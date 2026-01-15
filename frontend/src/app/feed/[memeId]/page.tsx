'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Heart,
  Bookmark,
  Share2,
  Download,
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  MessageCircle,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDownload } from '@/hooks/useDownload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getRedditMemeDetails,
  addComment,
  toggleLike,
  toggleSave,
} from '@/services/memeService';
import { useAuth } from '@/context/AuthContext';
import MemeCard from '@/components/memes/MemeCard';
import Masonry from 'react-masonry-css';

const exploreBreakpoints = {
  default: 4,
  1536: 3,
  1280: 3,
  1024: 2,
  768: 2,
  640: 1,
};

const formatCommentDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
};

export default function MemeDetailsPage() {
  const { memeId } = useParams<{ memeId: string }>();
  const searchParams = useSearchParams();
  const { user, setShowLoginModal } = useAuth();
  const { downloadImage, isDownloading } = useDownload();
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageHeight, setImageHeight] = useState(0);

  const contentType = searchParams.get('type') === 'CreatedMeme' ? 'CreatedMeme' : 'MemeFeedPost';

  const [meme, setMeme] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getRedditMemeDetails(memeId, contentType);
        const { meme, comments, stats } = res.data.memeDetails;
        setMeme(meme);
        setComments(comments || []);
        setRelated(res.data.backgroundFeed || []);
        setIsLiked(stats?.isLiked || false);
        setIsSaved(stats?.isSaved || false);
        setLikeCount(stats?.likeCount || 0);
      } catch {
        toast.error('Failed to load meme');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      if (imageRef.current) {
        setImageHeight(imageRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [meme]);

  const requireAuth = () => {
    if (!user?.is_registered) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth()) return;
    setIsLiked(!isLiked);
    setLikeCount((p) => (isLiked ? p - 1 : p + 1));
    try {
      await toggleLike(memeId, contentType);
    } catch {
      toast.error('Like failed');
    }
  };

  const handleSave = async () => {
    if (!requireAuth()) return;
    setIsSaved(!isSaved);
    try {
      await toggleSave(memeId, contentType);
      toast.success(isSaved ? 'Removed from saved' : 'Saved');
    } catch {
      toast.error('Save failed');
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const filename = `mimi-${meme._id}.jpg`;
    await downloadImage(meme.contentUrl || meme.imageUrl, filename);
  };

  const handleComment = async () => {
    if (!commentText.trim() || !requireAuth()) return;
    const temp = {
      _id: Date.now(),
      content: commentText,
      user,
      createdAt: new Date().toISOString(),
    };
    setComments((p) => [...p, temp]);
    setCommentText('');
    try {
      await addComment({ content: temp.content }, memeId, contentType);
      toast.success('Comment added');
    } catch {
      toast.error('Comment failed');
    }
  };

  const handleEditComment = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditText(currentContent);
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editText.trim()) return;
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId ? { ...c, content: editText } : c
      )
    );
    setEditingCommentId(null);
    setEditText('');
    toast.success('Comment updated');
  };

  const handleDeleteComment = async (commentId: number) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    toast.success('Comment deleted');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/feed/${memeId}`;
    if (navigator.share) {
      await navigator.share({ title: meme.title, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied');
    }
  };

  if (loading || !meme) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isCommentOwner = (comment: any) => {
    return user && comment.user?._id === user._id;
  };

  const authorName = typeof meme.author === 'string' 
    ? meme.author 
    : meme.author?.username || 'Anonymous';
  const authorPic = typeof meme.author === 'object' 
    ? meme.author?.profilePic 
    : undefined;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 px-4 sm:px-6 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => history.back()}
            className="rounded-xl hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">{meme.title}</h1>
            <p className="text-xs text-zinc-500">by {authorName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6">
        {/* Split View: Image Left | Comments Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* LEFT: Meme Image */}
          <div className="space-y-4">
            <div 
              ref={imageRef}
              className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl"
            >
              <img
                src={meme.contentUrl || meme.imageUrl}
                alt={meme.title}
                className="w-full h-auto object-contain"
                onLoad={() => {
                  if (imageRef.current) {
                    setImageHeight(imageRef.current.offsetHeight);
                  }
                }}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLike}
                  className={`gap-2 rounded-xl ${
                    isLiked 
                      ? 'text-pink-500 hover:text-pink-600 hover:bg-pink-500/10' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-pink-500' : ''}`} />
                  <span className="font-semibold">{likeCount}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-semibold">{comments.length}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleShare}
                  className="gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSave}
                  className={`gap-2 rounded-xl ${
                    isSaved 
                      ? 'text-purple-400 hover:text-purple-500 hover:bg-purple-500/10' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-purple-400' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
                >
                  <Download className="h-5 w-5" />
                  <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download'}</span>
                </Button>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-12 w-12 ring-2 ring-purple-500/50">
                <AvatarImage src={authorPic} alt={authorName} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                  {authorName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{authorName}</p>
                {meme.subreddit && (
                  <p className="text-xs text-purple-400">r/{meme.subreddit}</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Comments Box */}
          <div 
            className="rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col"
            style={{ height: imageHeight > 0 ? `${imageHeight}px` : 'auto', minHeight: '600px' }}
          >
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-400" />
                Comments ({comments.length})
              </h3>
            </div>

            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((c) => (
                    <div key={c._id} className="flex gap-3 group">
                      <Avatar className="h-9 w-9 ring-2 ring-zinc-800 flex-shrink-0">
                        <AvatarImage src={c.user?.profilePic} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs font-bold">
                          {c.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl px-4 py-3 hover:bg-zinc-800/70 transition-colors">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-zinc-200 truncate">
                                {c.user?.username || 'Anonymous'}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {c.createdAt ? formatCommentDate(c.createdAt) : 'Just now'}
                              </p>
                            </div>
                            {isCommentOwner(c) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-zinc-500 hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-xl">
                                  <DropdownMenuItem onClick={() => handleEditComment(c._id, c.content)} className="gap-2 cursor-pointer hover:bg-zinc-800 rounded-lg">
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteComment(c._id)} className="gap-2 cursor-pointer hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          {editingCommentId === c._id ? (
                            <div className="flex gap-2 mt-2">
                              <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="bg-zinc-900 border-zinc-700 text-sm rounded-xl" autoFocus />
                              <Button size="sm" onClick={() => handleSaveEdit(c._id)} className="bg-purple-600 hover:bg-purple-700 rounded-xl">Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)} className="rounded-xl">Cancel</Button>
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-300 mt-1 break-words">{c.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">No comments yet</p>
                    <p className="text-xs text-zinc-600 mt-1">Be the first to comment!</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t border-zinc-800">
              <div className="flex gap-3">
                <Avatar className="h-9 w-9 ring-2 ring-purple-500/50 flex-shrink-0">
                  <AvatarImage src={user?.profilePic} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold">
                    {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="bg-zinc-800 border-zinc-700 rounded-xl focus:border-purple-500 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleComment();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleComment}
                    size="icon"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl flex-shrink-0"
                    disabled={!commentText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Memes */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              More Memes
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent ml-6"></div>
          </div>
          <Masonry breakpointCols={exploreBreakpoints} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
            {related.map((meme) => (
              <div key={meme._id}>
                <MemeCard meme={meme} />
              </div>
            ))}
          </Masonry>
        </div>
      </main>
    </div>
  );
}