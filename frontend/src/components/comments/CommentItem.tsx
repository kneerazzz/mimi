'use client';

import { useState } from 'react';
import { Heart, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  toggleLike,
  addComment,
  getCommentReplies,
  deleteComment,
  updateComment,
} from '@/services/memeService';
import ReplyItem, { CommentType } from './ReplyItem';
import { renderContentWithMentions } from '@/utils/textUtils';

interface Props {
  comment: CommentType & { repliesCount?: number };
  user: any;
  memeId: string;
  contentType: string;
  onDelete: (id: string) => void;
}

export default function CommentItem({
  comment,
  user,
  memeId,
  contentType,
  onDelete,
}: Props) {
  const { setShowLoginModal, user: authUser } = useAuth();
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [replyCount, setReplyCount] = useState(comment.repliesCount || 0);
  
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likesCount || 0);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [displayContent, setDisplayContent] = useState(comment.content);

  const isOwner = user?._id === comment.user._id;

  // --- 1. SEPARATE FETCH LOGIC ---
  const fetchReplies = async () => {
    try {
      const res = await getCommentReplies(comment._id);
      setReplies(res.data.replies || []);
      setRepliesLoaded(true);
    } catch (err) {
      toast.error("Failed to load replies");
    }
  };

  // --- 2. TOGGLE LOGIC (For the button) ---
  const toggleReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
    } else {
      setShowReplies(true);
      if (!repliesLoaded) {
        await fetchReplies();
      }
    }
  };

  // --- 3. REFRESH LOGIC (For successful actions) ---
  const handleNestedReplySuccess = async () => {
    // Increment count immediately for UI responsiveness
    setReplyCount((prev) => prev + 1);
    
    // Ensure the list is open
    setShowReplies(true);
    
    // Re-fetch to get the new reply data (with ID, user info, etc.)
    await fetchReplies();
  };

  const submitReply = async () => {
    if(!authUser?.is_registered){
        setShowLoginModal(true);
        return;
    }
    if (!replyText.trim()) return;
    try {
      const res = await addComment(
        { content: replyText, parentCommentId: comment._id },
        memeId,
        contentType as any
      );
      // Append new reply manually to avoid needing a full re-fetch immediately
      setReplies(p => [...p, res.data]);
      setReplyCount(p => p + 1);
      setReplyText('');
      setIsReplying(false);
      setShowReplies(true); 
    } catch {
      toast.error('Reply failed');
    }
  };

  // ... (handleLike, handleDelete, handleEdit remain the same) ...
  const handleLike = async () => {
    if (!authUser?.is_registered) {
        setShowLoginModal(true);
        return;
    };
    setIsLiked(!isLiked);
    setLikeCount(p => isLiked ? p - 1 : p + 1);
    try {
      await toggleLike(comment._id, 'Comment');
    } catch {
      setIsLiked(!isLiked); 
      setLikeCount(p => isLiked ? p + 1 : p - 1);
      toast.error('Like failed');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment._id);
      onDelete(comment._id);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = async () => {
    if (!editText.trim() || editText === displayContent) {
      setIsEditing(false);
      return;
    }
    try {
      await updateComment({ content: editText }, comment._id);
      setDisplayContent(editText);
      setIsEditing(false);
      toast.success("Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="group py-3 animate-in fade-in">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-transparent hover:ring-zinc-700 transition-all">
          <AvatarImage src={comment.user.profilePic} />
          <AvatarFallback className="text-xs bg-zinc-800">
            {comment.user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="text-sm leading-relaxed">
            <span className="font-semibold text-zinc-200 mr-2 cursor-pointer hover:underline">
              {comment.user.username}
            </span>
            {isEditing ? (
              <div className="mt-1 flex gap-2">
                <Input 
                  value={editText} 
                  onChange={e => setEditText(e.target.value)} 
                  className="h-8 text-xs bg-zinc-900"
                  autoFocus
                />
                <Button size="sm" onClick={handleEdit} className="h-8 px-3">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 px-3">Cancel</Button>
              </div>
            ) : (
              <span className="text-zinc-300 wrap-break-words">
                {renderContentWithMentions(displayContent)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500 font-medium">
            <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
            {likeCount > 0 && <span>{likeCount} like{likeCount !== 1 ? 's' : ''}</span>}
            <button onClick={() => setIsReplying(!isReplying)} className="hover:text-zinc-300 transition-colors">Reply</button>
            
            {isOwner && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 outline-none">
                  <MoreHorizontal className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem onClick={() => setIsEditing(true)} className="text-xs cursor-pointer"><Pencil className="h-3 w-3 mr-2" /> Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-xs text-red-400 cursor-pointer"><Trash2 className="h-3 w-3 mr-2" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isReplying && (
            <div className="mt-3 flex gap-2 animate-in slide-in-from-top-1">
              <Input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.user.username}...`}
                className="h-8 text-xs bg-zinc-900/50 border-zinc-800"
                autoFocus
              />
              <Button size="sm" onClick={submitReply} disabled={!replyText.trim()} className="h-8">Post</Button>
            </div>
          )}

          {/* Logic for View Replies Button */}
          {(replyCount > 0 || replies.length > 0) && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="w-6 border-t border-zinc-800"></div>
                <button 
                  onClick={toggleReplies} 
                  className="text-xs text-zinc-500 font-semibold hover:text-zinc-300 transition-colors"
                >
                  {showReplies ? 'Hide replies' : `View all ${replyCount} replies`}
                </button>
              </div>

              {showReplies && (
                <div className="mt-2 space-y-3">
                  {replies.map(r => (
                    <ReplyItem
                      key={r._id}
                      reply={r}
                      rootCommentId={comment._id}
                      user={user}
                      memeId={memeId}
                      contentType={contentType}
                      // 👇 UPDATED: Use the new handler that doesn't toggle closed
                      onReplySuccess={handleNestedReplySuccess}
                      onDelete={(replyId) => {
                         setReplies(prev => prev.filter(rep => rep._id !== replyId));
                         setReplyCount(p => p - 1);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={handleLike} className="self-start pt-1">
          <Heart className={`h-3 w-3 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-zinc-600 hover:text-zinc-400'}`} />
        </button>
      </div>
    </div>
  );
}