'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  toggleLike,
  addComment,
  getCommentReplies,
} from '@/services/memeService';
import ReplyItem, { CommentType } from './ReplyItem';

interface Props {
  comment: CommentType & { repliesCount?: number };
  user: any;
  memeId: string;
  contentType: string;
}

export default function CommentItem({
  comment,
  user,
  memeId,
  contentType,
}: Props) {
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [show, setShow] = useState(false);
  const [text, setText] = useState('');

  const loadReplies = async () => {
    if (show) return setShow(false);
    const res = await getCommentReplies(comment._id);
    setReplies(res.data.replies || []);
    setShow(true);
  };

  const submitReply = async () => {
    if (!text.trim()) return;
    const res = await addComment(
      { content: text, parentCommentId: comment._id },
      memeId,
      contentType as any
    );
    setReplies(p => [...p, res.data]);
    setText('');
    setShow(true);
  };

  return (
    <div className="border-b border-zinc-800 py-4">
      <div className="flex gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={comment.user.profilePic} />
          <AvatarFallback>
            {comment.user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p>
            <b>{comment.user.username}</b> {comment.content}
          </p>

          <div className="flex gap-4 text-xs text-zinc-500 mt-1">
            <span>
              {formatDistanceToNow(new Date(comment.createdAt))} ago
            </span>
            <button onClick={loadReplies}>
              View replies ({comment.repliesCount || 0})
            </button>
          </div>

          <div className="mt-2 flex gap-2">
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Reply..."
            />
            <Button onClick={submitReply}>Post</Button>
          </div>

          {show && (
            <div className="pl-4 mt-3 border-l border-zinc-800">
              {replies.map(r => (
                <ReplyItem
                  key={r._id}
                  reply={r}
                  parentUsername={comment.user.username}
                  user={user}
                  memeId={memeId}
                  contentType={contentType}
                  onReplySuccess={loadReplies}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
