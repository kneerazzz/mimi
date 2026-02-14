'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      router.push(`/feed/search/memes?q=${encodedQuery}`);
      setSearchQuery('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Search Memes</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Find memes in our collection
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search memes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-purple-500"
              autoFocus
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!searchQuery.trim()}
            className="w-full"
          >
            <Search className="h-4 w-4 mr-2" />
            Search Memes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
