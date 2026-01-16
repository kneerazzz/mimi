'use client';

import { useState } from 'react';
import { Heart, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toggleLike, addComment, deleteComment, updateComment } from '@/services/memeService';
import { renderContentWithMentions } from '../../utils/textUtils';

export interface CommentType {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
    profilePic?: string;
  };
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
}

interface Props {
  reply: CommentType;
  rootCommentId: string; // 👇 The ID of the top-level parent
  user: any;
  memeId: string;
  contentType: string;
  onReplySuccess: () => void;
  onDelete: (id: string) => void;
}

export default function ReplyItem({
  reply,
  rootCommentId,
  user,
  memeId,
  contentType,
  onReplySuccess,
  onDelete,
}: Props) {
  const [isLiked, setIsLiked] = useState(reply.isLiked || false);
  const [likesCount, setLikesCount] = useState(reply.likesCount || 0);
  
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content);
  const [displayContent, setDisplayContent] = useState(reply.content);

  const isOwner = user?._id === reply.user._id;

  // --- Handlers ---

  const handleReplyClick = () => {
    // 1. Open Input
    setIsReplying(p => !p);
    // 2. Auto-fill the @username if opening
    if (!isReplying) {
      setReplyText(`@${reply.user.username} `);
    }
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    try {
      // 3. FLATTENING LOGIC:
      // We send 'rootCommentId' as the parent, NOT 'reply._id'
      // This ensures all replies stay on Level 1 (visible in the main thread)
      await addComment(
        { content: replyText, parentCommentId: rootCommentId },
        memeId,
        contentType as any
      );
      setReplyText('');
      setIsReplying(false);
      onReplySuccess(); 
      toast.success("Reply sent");
    } catch {
      toast.error('Reply failed');
    }
  };

  const handleLike = async () => {
    if (!user?.is_registered) return toast.error('Login required');
    setIsLiked(!isLiked);
    setLikesCount(p => (isLiked ? p - 1 : p + 1));
    try {
      await toggleLike(reply._id, 'Comment');
    } catch {
      setIsLiked(!isLiked);
      setLikesCount(p => (isLiked ? p + 1 : p - 1));
      toast.error('Like failed');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(reply._id);
      onDelete(reply._id);
      toast.success("Reply deleted");
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
      await updateComment({ content: editText }, reply._id);
      setDisplayContent(editText);
      setIsEditing(false);
      toast.success("Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="flex gap-3 group">
      <Avatar className="h-6 w-6 mt-1 cursor-pointer">
        <AvatarImage src={reply.user.profilePic} />
        <AvatarFallback className="text-[10px] bg-zinc-800">
          {reply.user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="text-sm leading-snug">
          <span className="font-semibold text-zinc-300 mr-2 cursor-pointer hover:underline">
            {reply.user.username}
          </span>
          
          {isEditing ? (
             <div className="mt-1 flex gap-2 mb-2">
                <Input 
                  value={editText} 
                  onChange={e => setEditText(e.target.value)} 
                  className="h-7 text-xs bg-zinc-900"
                  autoFocus
                />
                <Button size="sm" onClick={handleEdit} className="h-7 px-2 text-xs">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-7 px-2 text-xs">Cancel</Button>
             </div>
          ) : (
             // Highlight @mentions in blue/purple
             <span className="text-zinc-400 wrap-break-words">
                {renderContentWithMentions(displayContent)}
             </span>
          )}
        </div>

        <div className="flex items-center gap-4 mt-1 text-[11px] text-zinc-500 font-medium">
          <span>{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
          
          {likesCount > 0 && (
            <span>{likesCount} like{likesCount !== 1 ? 's' : ''}</span>
          )}

          <button 
            onClick={handleReplyClick}
            className="hover:text-zinc-300 transition-colors"
          >
            Reply
          </button>

           {isOwner && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity outline-none">
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
          <div className="mt-2 flex gap-2">
            <Input 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                // placeholder={`Reply to ${reply.user.username}...`}
                className="h-7 text-xs bg-zinc-900/50 border-zinc-800"
                autoFocus
            />
            <Button size="sm" onClick={submitReply} className="h-7 pt-1 text-xs">Post</Button>
          </div>
        )}
      </div>

      <button onClick={handleLike} className="self-start mt-1">
        <Heart className={`h-3 w-3 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-zinc-700 hover:text-zinc-500'}`} />
      </button>
    </div>
  );
}