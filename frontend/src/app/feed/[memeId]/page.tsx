'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  Bookmark,
  Share2,
  Download,
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
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
  default: 3,
  1280: 3,
  1024: 2,
  768: 2,
  640: 1,
};

// Utility function to format date like YouTube
const formatCommentDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
};

/* ---------------- Page ---------------- */
export default function MemeDetailsPage() {
  const { memeId } = useParams<{ memeId: string }>();
  const searchParams = useSearchParams();
  const { user, setShowLoginModal } = useAuth();
  const { downloadImage, isDownloading } = useDownload();

  const contentType =
    searchParams.get('type') === 'CreatedMeme'
      ? 'CreatedMeme'
      : 'MemeFeedPost';

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

  /* ---------------- Fetch ---------------- */
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

  /* ---------------- Actions ---------------- */
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

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
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

    try {
      // Call your API to update comment
      // await updateComment(commentId, editText);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));

    try {
      // Call your API to delete comment
      // await deleteComment(commentId);
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
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
        <div className="h-10 w-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const isCommentOwner = (comment: any) => {
    return user && comment.user?._id === user._id;
  };

  /* ---------------- Layout ---------------- */
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => history.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="font-semibold truncate">{meme.title}</h1>
      </header>

      <main className="max-w-400 mx-auto px-6 py-6 grid grid-cols-12 gap-8">
        {/* LEFT – 1/3 */}
        <section className="col-span-12 lg:col-span-5 space-y-6">
          {/* Meme */}
          <div className="cursor-pointer group relative rounded-2xl overflow-hidden bg-black">
            <img
              src={meme.contentUrl || meme.imageUrl}
              alt={meme.title}
              className="w-full object-contain"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleLike}>
              <Heart className={isLiked ? 'fill-red-500 text-red-500' : ''} />
              <span className="ml-2">{likeCount}</span>
            </Button>
            <Button variant="ghost" onClick={handleShare}>
              <Share2 />
            </Button>
            <Button variant="ghost" onClick={handleSave}>
              <Bookmark className={isSaved ? 'fill-white' : ''} />
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="cursor-pointer hover:bg-zinc-800"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          </div>

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Comments ({comments.length})
            </h3>

            <form onSubmit={handleComment} className="flex gap-3">
              <Avatar>
                <AvatarImage src={user?.profilePic} />
                <AvatarFallback>
                  {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="bg-zinc-900 border-zinc-700"
              />
              <Button type="submit">Post</Button>
            </form>

            <ScrollArea className="max-h-105">
              <div className="space-y-4 pr-2">
                {comments.length > 0 ? (
                  comments.map((c) => (
                    <div key={c._id} className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={c.user?.profilePic} />
                        <AvatarFallback>
                          {c.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium">
                                {c.user?.username || 'Anonymous'}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {c.createdAt ? formatCommentDate(c.createdAt) : 'Just now'}
                              </p>
                            </div>

                            {/* Three dots menu for comment owner */}
                            {isCommentOwner(c) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-zinc-900 border-zinc-800 text-zinc-100"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleEditComment(c._id, c.content)}
                                    className="gap-2 cursor-pointer hover:bg-zinc-800"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteComment(c._id)}
                                    className="gap-2 cursor-pointer hover:bg-zinc-800 text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>

                          {/* Edit mode or display mode */}
                          {editingCommentId === c._id ? (
                            <div className="flex gap-2 mt-2">
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-sm"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(c._id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingCommentId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-300">{c.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-zinc-400 text-center py-8">
                    No comments yet. Be the first to comment! 💬
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="pt-8">
            <h4 className="text-sm font-semibold text-zinc-400 mb-4">
              Keep exploring
            </h4>

            <Masonry
              breakpointCols={{ default: 2, 768: 1 }}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {related.slice(0, 6).map((m) => (
                <MemeCard key={m._id} meme={m} />
              ))}
            </Masonry>
          </div>
        </section>

        {/* RIGHT – 2/3 */}
        <aside className="col-span-12 lg:col-span-7">
          <h2 className="font-semibold mb-4">More memes</h2>
          <Masonry
            breakpointCols={exploreBreakpoints}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {related.map((meme) => (
              <div key={meme._id} className="mb-6">
                <MemeCard meme={meme} />
              </div>
            ))}
          </Masonry>
        </aside>
      </main>
    </div>
  );
}