'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAccount } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Trash2, AlertTriangle, Lock, User2 } from 'lucide-react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth(); // Assuming you have a logout function to clear state

  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Fallback if username isn't loaded yet, though auth context should handle this
  const requiredText = user?.username || '';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.username) {
      toast.error("User information missing. Please reload.");
      return;
    }

    if (confirmText.trim() !== requiredText) {
      toast.error(`Please type "${requiredText}" correctly to confirm.`);
      return;
    }

    if (!password) {
      toast.error("Please enter your password to confirm deletion.");
      return;
    }

    try {
      setLoading(true);
      
      // Send object with username and password as required by backend
      await deleteAccount({ 
        username: user.username, 
        password: password 
      });

      toast.success('Account deleted successfully');
      
      // Clear local auth state if needed
      if (logout) logout();
      
      router.push('/');
      // Optional: Force reload to clear any lingering in-memory state
      window.location.href = '/'; 
      
    } catch (error: any) {
      // Handle specific backend errors (like wrong password)
      const msg = error?.response?.data?.message || 'Failed to delete account. Check your password.';
      toast.error(msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-red-500 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Delete Account
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Deleting your account is permanent. All your created memes, saved templates, 
          and profile data will be wiped immediately. This action cannot be undone.
        </p>
        <p className="text-md text-zinc-400 mt-1 font-bold">Tusi ja rhe ho, tusi na jao</p>
      </div>

      <Card className="bg-red-950/10 border border-red-900/50">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-red-400">
            Confirm Account Deletion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleDelete} className="space-y-4">
            
            {/* 1. Confirm Username */}
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm text-zinc-300">
                Enter your username to confirm
              </Label>
              <div className='relative'>
                <User2 className='absolute left-3 top-2.5 w-4 h-4 text-zinc-500' />
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Your Username"
                  className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-red-500/50 text-sm placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* 2. Confirm Password (Required by Backend) */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-zinc-300">
                Enter your password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="bg-zinc-900 border-zinc-800 pl-9 focus-visible:ring-red-500/50 text-sm placeholder:text-zinc-600"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || confirmText !== requiredText || !password}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-11 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Permanently Delete Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}