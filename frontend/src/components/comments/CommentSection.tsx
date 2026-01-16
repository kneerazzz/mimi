'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addComment } from '@/services/memeService';
import CommentItem from './CommentItem';

export default function CommentsSection({
  comments: initial,
  memeId,
  contentType,
  user,
}: any) {
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState('');

  const submit = async () => {
    if (!text.trim()) return;
    const res = await addComment({ content: text }, memeId, contentType);
    setComments((p: any) => [res.data, ...p]);
    setText('');
  };

  return (
    <>
      <div className="flex gap-2 mb-6">
        <Input value={text} onChange={e => setText(e.target.value)} />
        <Button onClick={submit}>Post</Button>
      </div>

      {comments.map((c: any) => (
        <CommentItem
          key={c._id}
          comment={c}
          user={user}
          memeId={memeId}
          contentType={contentType}
        />
      ))}
    </>
  );
}
