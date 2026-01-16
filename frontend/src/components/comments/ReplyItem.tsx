'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toggleLike, addComment } from '@/services/memeService';

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
  parentUsername: string;
  user: any;
  memeId: string;
  contentType: string;
  onReplySuccess: () => void;
}

export default function ReplyItem({
  reply,
  parentUsername,
  user,
  memeId,
  contentType,
  onReplySuccess,
}: Props) {
  const [isLiked, setIsLiked] = useState(reply.isLiked || false);
  const [likesCount, setLikesCount] = useState(reply.likesCount || 0);
  const [isReplying, setIsReplying] = useState(false);
  const [text, setText] = useState('');

  const handleLike = async () => {
    if (!user?.is_registered) return toast.error('Login required');
    setIsLiked(p => !p);
    setLikesCount(p => (isLiked ? p - 1 : p + 1));
    try {
      await toggleLike(reply._id, 'Comment');
    } catch {
      toast.error('Like failed');
    }
  };

  const submitReply = async () => {
    if (!text.trim()) return;
    try {
      await addComment(
        { content: text, parentCommentId: reply._id },
        memeId,
        contentType as any
      );
      setText('');
      setIsReplying(false);
      onReplySuccess();
    } catch {
      toast.error('Reply failed');
    }
  };

  return (
    <div className="flex gap-3 py-2">
      <Avatar className="h-7 w-7">
        <AvatarImage src={reply.user.profilePic} />
        <AvatarFallback>
          {reply.user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <p className="text-sm">
          <b>{reply.user.username}</b>{' '}
          <span className="text-purple-400">@{parentUsername}</span>{' '}
          {reply.content}
        </p>

        <div className="flex gap-3 text-xs text-zinc-500 mt-1">
          <span>
            {formatDistanceToNow(new Date(reply.createdAt))} ago
          </span>
          <button onClick={() => setIsReplying(p => !p)}>Reply</button>
        </div>

        {isReplying && (
          <div className="mt-2 flex gap-2">
            <Input value={text} onChange={e => setText(e.target.value)} />
            <Button onClick={submitReply}>Post</Button>
          </div>
        )}
      </div>

      <button onClick={handleLike}>
        <Heart
          className={`h-4 w-4 ${
            isLiked ? 'fill-red-500 text-red-500' : ''
          }`}
        />
      </button>
    </div>
  );
}
