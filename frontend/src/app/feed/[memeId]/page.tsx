'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  Heart,
  Bookmark,
  Share2,
  Download,
  ArrowLeft,
  MessageCircle,
  Maximize2,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useDownload } from '@/hooks/useDownload';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import MemeCard from '@/components/memes/MemeCard';
import CommentsSection from '@/components/comments/CommentSection';
import { EditMemeDialog } from '@/components/memes/EditMemeDialog';
import { DeleteMemeDialog } from '@/components/memes/DeleteMemeDialog';

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
  const router = useRouter();
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
  const [commentCount, setCommentCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Check if current user is the creator
  const isCreator = () => {
    if (!user?.is_registered || contentType !== 'CreatedMeme') return false;
    
    if (typeof meme?.creator === 'object' && meme?.creator?._id) {
      return meme.creator._id === user._id;
    } else if (typeof meme?.creator === 'string') {
      return meme.creator === user._id || meme.creator === user.username;
    }
    return false;
  };

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
      setCommentCount(stats?.commentCount || 0);
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
    const shareUrl = `${window.location.origin}/feed/${memeId}?type=${contentType}`;
    if (navigator.share) {
      await navigator.share({ title: getMemeTitle(), url: shareUrl }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied');
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const imageUrl = getMemeImageUrl();
    const filename = `mimi-${getMemeTitle().replace(/[^a-z0-9]/gi, '_')}.jpg`;
    await downloadImage(imageUrl, filename);
  };

  // Helper function to get the correct image URL based on content type
  const getMemeImageUrl = () => {
    if (!meme) return '';
    
    if (contentType === 'CreatedMeme') {
      // For CreatedMeme: prioritize finalImageUrl, then clonedContentUrl
      return meme.finalImageUrl || meme.clonedContentUrl || '';
    } else {
      // For MemeFeedPost: use contentUrl or imageUrl
      return meme.contentUrl || meme.imageUrl || '';
    }
  };

  // Helper function to get the correct title based on content type
  const getMemeTitle = () => {
    if (!meme) return '';
    
    if (contentType === 'CreatedMeme') {
      return meme.clonedTitle || meme.title || 'Untitled Meme';
    } else {
      return meme.title || 'Untitled Meme';
    }
  };

  // Helper function to get the correct author based on content type
  const getAuthorInfo = () => {
    if (!meme) return { name: 'Anonymous', pic: undefined };
    
    if (contentType === 'CreatedMeme') {
      // For CreatedMeme, creator can be populated or just an ID
      if (typeof meme.creator === 'object' && meme.creator !== null) {
        // Creator is populated
        const authorName = meme.creator.name || meme.creator.username || meme.clonedAuthor || 'Anonymous';
        const authorPic = meme.creator.profilePic || meme.creator.profile_pic;
        return { name: authorName, pic: authorPic };
      } else {
        // Creator is just an ID, use cloned data
        return { 
          name: meme.clonedAuthor || 'Anonymous', 
          pic: undefined 
        };
      }
    } else {
      // For MemeFeedPost, author is a string or User object
      const authorName = typeof meme.author === 'string'
        ? meme.author
        : meme.author?.username || meme.author?.name || 'Anonymous';
      
      const authorPic = typeof meme.author === 'object'
        ? meme.author?.profilePic || meme.author?.profile_pic
        : undefined;
      
      return { name: authorName, pic: authorPic };
    }
  };

  // Helper function to get subreddit
  const getSubreddit = () => {
    if (!meme) return null;
    
    if (contentType === 'CreatedMeme') {
      return meme.clonedSubreddit || null;
    } else {
      return meme.subreddit || null;
    }
  };

  // Handle profile click - redirect to creator profile or default to troyy
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Stop event bubbling

    let username: string | undefined;

    // Check if creator exists (for CreatedMeme)
    if (meme.creator) {
      // Check creator object
      if (typeof meme.creator === 'object' && meme.creator?.username) {
        username = meme.creator.username;
      } 
      // Check creator string
      else if (typeof meme.creator === 'string') {
        username = meme.creator;
      }
    }
    
    // If no valid creator username found, default to 'troyy'
    if (!username || username === 'Anonymous') {
      username = 'troyy';
    }

    // Navigate to profile
    router.push(`/u/${username}`);
  };

  if (loading || !meme) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const imageUrl = getMemeImageUrl();
  const title = getMemeTitle();
  const author = getAuthorInfo();
  const subreddit = getSubreddit();

  return (
    <>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 px-4 py-3">
          <div className="max-w-500 mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => history.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-lg truncate">{title}</h1>
                <p className="text-xs text-zinc-500">by {author.name}</p>
              </div>
            </div>
            
            {isCreator() && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:text-zinc-50 hover:bg-zinc-800/80"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="border-red-700/50 bg-red-900/20 text-red-400 hover:text-red-300 hover:bg-red-900/40"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-500 mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-5 space-y-6">
              {/* IMAGE */}
              <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        console.error('Image failed to load:', imageUrl);
                      }}
                    />
                    {/* Fullscreen Button Overlay */}
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="absolute top-4 right-4 p-2 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-sm border border-zinc-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="w-5 h-5 text-zinc-100" />
                    </button>
                  </>
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center text-zinc-500">
                    <p>Image not available</p>
                  </div>
                )}
              </div>

              {/* AUTHOR + ACTIONS */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-center justify-start gap-x-2 mb-4">
                  <div
                    onClick={handleProfileClick}
                    className="flex cursor-pointer items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="h-10 w-10 ">
                      <AvatarImage src={author.pic} />
                      <AvatarFallback>
                        {author.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    </div>
                    <div className="text-left" onClick={handleProfileClick}>
                      <p className="font-semibold cursor-pointer text-sm hover:underline">{author.name}</p>
                      {subreddit && (
                        <p className="text-xs text-purple-400">
                          r/{subreddit}
                        </p>
                      )}
                    </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className='flex flex-row gap-2 items-center'>
                      <button onClick={handleLike}>
                        <Heart
                          className={`h-7 w-7 ${
                            isLiked ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </button>
                      {likeCount > 0 && (
                        <p className="font-semibold text-md mt-1">
                          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                        </p>
                      )}
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                      <button onClick={() => {
                        if(!requireAuth()) return;
                        commentsRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }}>
                        <MessageCircle className="h-7 w-7" />
                      </button>
                      {commentCount > 0 && (
                        <p className="font-semibold text-md mt-1">
                          {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                        </p>
                      )}
                    </div>
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
                  <MemeCard key={m._id} meme={m} contentType='MemeFeedPost' />
                ))}
              </Masonry>
            </div>
          </div>
        </main>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-100 bg-black flex flex-col"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Top Bar with Title and Controls */}
          <div className="absolute top-0 left-0 right-0 bg-linear-to-b from-black/80 to-transparent p-6 z-10">
            <div className="flex items-start justify-between gap-4">
              {/* Title and Author - Top Left */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white mb-1 line-clamp-2">{title}</h2>
                <p className="text-sm text-zinc-300">by {author.name}</p>
              </div>

              {/* Controls - Top Right */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(e);
                  }}
                  disabled={isDownloading}
                  className="p-3 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-sm border border-zinc-700 rounded-full transition-colors disabled:opacity-50"
                >
                  <Download className="w-5 h-5 text-zinc-100" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullscreen(false);
                  }}
                  className="p-3 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-sm border border-zinc-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-100" />
                </button>
              </div>
            </div>
          </div>

          {/* Fullscreen Image - Covers entire viewport */}
          <div className="flex-1 flex items-center justify-center w-full h-full">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-contain"
              onClick={() => setIsFullscreen(false)}
            />
          </div>
        </div>
      )}

      <EditMemeDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        memeId={memeId}
        initialTitle={title}
        initialTags={meme?.tags || []}
        onSuccess={() => {
          // Reload data
          loadData();
        }}
      />

      <DeleteMemeDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        memeId={memeId}
        onSuccess={() => {
          // Will redirect automatically
        }}
        redirectAfterDelete={true}
      />
    </>
  );
}