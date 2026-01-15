"use client";

import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogContentBlurry, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LoginForm from "@/components/forms/LoginForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal } = useAuth();

  return (
    <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
      <DialogContentBlurry className="p-o border-none bg-transparent shadow-none">
        <DialogContent className="sm:max-w-106.25 bg-zinc-950 border-zinc-800 text-zinc-100">
            <DialogHeader>
            <DialogTitle>Join the Cult 🌟</DialogTitle>
            <DialogDescription className="text-zinc-400">
                Login to like, save, comment, and create AI mimis.
            </DialogDescription>
            </DialogHeader>
            
            {/* Render your existing Login Form here */}
            <div className="py-4">
            {/* You might need to adjust LoginForm to accept an 'onSuccess' prop to close modal */}
            <LoginForm onSuccess={() => setShowLoginModal(false)} />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                <span>New here?</span>
                <Link 
                    href="/register" 
                    className="text-violet-400 hover:underline"
                    onClick={() => setShowLoginModal(false)} // Close modal if they go to register page
                >
                    Create an account
                </Link>
            </div>
        </DialogContent>
      </DialogContentBlurry>
    </Dialog>
  );
}