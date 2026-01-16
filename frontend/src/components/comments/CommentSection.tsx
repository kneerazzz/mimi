'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addComment } from '@/services/memeService';
import CommentItem from './CommentItem';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function CommentsSection({
  comments: initialComments = [],
  memeId,
  contentType,
  user,
}: any) {
  const {setShowLoginModal, user: authUser} = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (!authUser?.is_registered){
        setShowLoginModal(true);
        return;
    }

    setIsSubmitting(true);
    try {
      const res = await addComment({ content: text }, memeId, contentType);
      // Add new comment to top of list
      setComments((prev: any) => [res.data, ...prev]);
      setText('');
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFromList = (commentId: string) => {
    setComments((prev: any[]) => prev.filter(c => c._id !== commentId));
  };

  return (
    <div className="flex flex-col h-full">
    <div className="pt-6 mt-2 pb-6 border-t border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky bottom-0">
        <div className="flex gap-2">
          <Input 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Add a comment..."
            className="bg-zinc-900 border-zinc-800"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !text.trim()}
            size="icon"
            className="bg-zinc-200 hover:bg-zinc-400 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Scrollable List Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0">
        {comments.length === 0 ? (
          <div className="text-center text-zinc-500 py-10">
            No comments yet. Be the first!
          </div>
        ) : (
          comments.map((c: any) => (
            <CommentItem
              key={c._id}
              comment={c}
              user={user}
              memeId={memeId}
              contentType={contentType}
              onDelete={handleDeleteFromList}
            />
          ))
        )}
      </div>
    </div>
  );
}