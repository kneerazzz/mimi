'use client';

import React, { useState } from 'react';
import { sendPasswordChangeEmail, resetPassword } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function PasswordSettingsPage() {
  const { user } = useAuth();

  // Removed 'email' state since we strictly use user.email now
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [sendingEmail, setSendingEmail] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email) {
      toast.error('User email not found. Please try reloading.');
      return;
    }

    try {
      setSendingEmail(true);
      await sendPasswordChangeEmail(user.email);
      toast.success(`Verification email sent to ${user.email}`);
    } catch (error) {
      toast.error('Failed to send email');
      console.error(error);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email || !otp || !newPassword) {
      toast.error('OTP and new password are required');
      return;
    }

    try {
      setResetting(true);
      await resetPassword({ email: user.email, otp, newPassword });
      toast.success('Password reset successfully');
      setOtp('');
      setNewPassword('');
      // Optional: Redirect or just let them stay since they are already logged in
      // router.push('/login'); 
    } catch (error) {
      toast.error('Failed to reset password');
      console.error(error);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Password & security</h1>
      <p className="text-xs sm:text-sm text-zinc-500">
        Use email verification and a one-time code to reset your password.
      </p>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <form onSubmit={handleSendEmail} className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-400" />
              <h2 className="text-xs sm:text-sm font-semibold text-zinc-100">
                1. Send verification email
              </h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled // Locked field
                readOnly // Ensure non-editable
                className="bg-zinc-900/50 border-zinc-800 text-sm text-zinc-400 cursor-not-allowed opacity-75"
              />
              <p className="text-[10px] text-zinc-600">
                For security, password resets are sent to your registered email address.
              </p>
            </div>
            <Button
              type="submit"
              disabled={sendingEmail || !user?.email}
              className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-10 sm:h-11 text-sm sm:text-base"
            >
              {sendingEmail && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Send OTP email
            </Button>
          </form>

          <Separator className="bg-zinc-800" />

          <form onSubmit={handleResetPassword} className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-zinc-400" />
              <h2 className="text-xs sm:text-sm font-semibold text-zinc-100">
                2. Reset password with OTP
              </h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-xs sm:text-sm">OTP from email</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the 6-digit code"
                className="bg-zinc-900 border-zinc-800 text-sm placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPw" className="text-xs sm:text-sm">New password</Label>
              <Input
                id="newPw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-zinc-900 border-zinc-800 text-sm placeholder:text-zinc-600"
              />
            </div>
            <Button
              type="submit"
              disabled={resetting}
              className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-10 sm:h-11 text-sm sm:text-base"
            >
              {resetting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}