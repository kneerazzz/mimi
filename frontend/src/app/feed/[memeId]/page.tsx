'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Heart,
  Bookmark,
  Share2,
  Download,
  ArrowLeft,
  MessageCircle,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useDownload } from '@/hooks/useDownload';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import MemeCard from '@/components/memes/MemeCard';
import CommentsSection from '@/components/comments/CommentSection';

import Masonry from 'react-masonry-css';

import {
  getRedditMemeDetails,
  toggleLike,
  toggleSave,
} from '@/services/memeService';

const feedBreakpoints = {
  default: 3,
  1536: 3,
  1280: 2,
  1024: 2,
  900: 1
};

export default function MemeDetailsPage() {
  const { memeId } = useParams<{ memeId: string }>();
  const searchParams = useSearchParams();
  const commentsRef = useRef<HTMLDivElement | null>(null);


  const contentType =
    searchParams.get('type') === 'CreatedMeme'
      ? 'CreatedMeme'
      : 'MemeFeedPost';

  const { user, setShowLoginModal } = useAuth();
  const { downloadImage, isDownloading } = useDownload();

  const [meme, setMeme] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const requireAuth = () => {
    if (!user?.is_registered) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const loadData = async () => {
    try {
      const res = await getRedditMemeDetails(memeId, contentType);
      const { meme, comments, stats } = res.data.memeDetails;

      setMeme(meme);

      // only top-level comments
      const topLevel = (comments || []).filter(
        (c: any) => !c.parentComment
      );
      setComments(topLevel);

      setRelated(res.data.backgroundFeed || []);
      setIsLiked(stats?.isLiked || false);
      setIsSaved(stats?.isSaved || false);
      setLikeCount(stats?.likeCount || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load meme');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLike = async () => {
    if (!requireAuth()) return;

    setIsLiked((p) => !p);
    setLikeCount((p) => (isLiked ? p - 1 : p + 1));

    try {
      await toggleLike(memeId, contentType);
    } catch {
      toast.error('Like failed');
    }
  };

  const handleSave = async () => {
    if (!requireAuth()) return;

    setIsSaved((p) => !p);
    try {
      await toggleSave(memeId, contentType);
    } catch {
      toast.error('Save failed');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/feed/${memeId}`;
    if (navigator.share) {
      await navigator.share({ title: meme.title, url: shareUrl }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied');
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const filename = `mimi-${meme._id}.jpg`;
    await downloadImage(meme.contentUrl || meme.imageUrl, filename);
  };

  if (loading || !meme) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const authorName =
    typeof meme.author === 'string'
      ? meme.author
      : meme.author?.username || 'Anonymous';

  const authorPic =
    typeof meme.author === 'object'
      ? meme.author?.profilePic
      : undefined;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 px-4 py-3">
        <div className="max-w-500 mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">{meme.title}</h1>
            <p className="text-xs text-zinc-500">by {authorName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-500 mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-5 space-y-6">
            {/* IMAGE */}
            <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <img
                src={meme.contentUrl || meme.imageUrl}
                alt={meme.title}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* AUTHOR + ACTIONS */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={authorPic} />
                    <AvatarFallback>
                      {authorName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{authorName}</p>
                    {meme.subreddit && (
                      <p className="text-xs text-purple-400">
                        r/{meme.subreddit}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex gap-3">
                  <button onClick={handleLike}>
                    <Heart
                      className={`h-7 w-7 ${
                        isLiked ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </button>
                  <button onClick={() => {
                    if(!requireAuth()) return;
                    commentsRef.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}>
                    <MessageCircle className="h-7 w-7" />
                  </button>
                  <button onClick={handleShare}>
                    <Share2 className="h-7 w-7" />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSave}>
                    <Bookmark
                      className={`h-7 w-7 ${
                        isSaved ? 'fill-white' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    <Download className="h-7 w-7" />
                  </button>
                </div>
              </div>

              {likeCount > 0 && (
                <p className="font-semibold text-md mt-3">
                  {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                </p>
              )}
            </div>

            {/* COMMENTS (OUTSOURCED) */}
            <div ref={commentsRef}>
              <CommentsSection
                comments={comments}
                memeId={memeId}
                contentType={contentType}
                user={user}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold mb-6">More to Explore</h2>
            <Masonry
              breakpointCols={feedBreakpoints}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {related.map((m) => (
                <MemeCard key={m._id} meme={m} />
              ))}
            </Masonry>
          </div>
        </div>
      </main>
    </div>
  );
}
