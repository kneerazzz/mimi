"use client";
import { useState } from 'react';
import Container from '../ui/container';
import { 
  User, 
  LogOut, 
  ChevronDown,
  LayoutTemplate,
  Sparkles,
  Hammer,
  Menu,
  X,
  LogIn,
  UserPlus,
  Lock, // Added Lock icon
  Star  // Icon for Features
} from 'lucide-react';
import Logo from '../ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Separator } from '../ui/separator';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, showLoginModal, setShowLoginModal } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Handler for locked items
  const handleLockedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLoginModal(true);
  };

  return (
    <header className="w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b sticky top-0 z-50">
        <Container className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* LEFT: Logo */}
          <div className="flex items-center">
              <Logo />
          </div>

          {/* CENTER: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {user?.is_registered ? (
              // --- LOGGED IN NAV ---
              <>
                <Button asChild variant={isActive('/create/ai') ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Link href="/create/ai">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    AI Mimi
                  </Link>
                </Button>
                <Button asChild variant={isActive('/create/editor') ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Link href="/create/editor">
                    <Hammer className="h-4 w-4" />
                    Create Mimi
                  </Link>
                </Button>
                <Button asChild variant={isActive('/templates') ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Link href="/templates">
                    <LayoutTemplate className="h-4 w-4" />
                    Templates
                  </Link>
                </Button>
                {/* Explore/Features REMOVED for logged in users as requested */}
              </>
            ) : (
              // --- GUEST NAV (LOCKED MODE) ---
              <>
                {/* Locked AI Mimi */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-zinc-500 hover:text-zinc-400"
                  onClick={handleLockedClick}
                >
                  <Lock className="h-3 w-3" />
                  AI Mimi
                </Button>

                <Button asChild variant={isActive('/create/editor') ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Link href="/create/editor">
                    <Hammer className="h-4 w-4" />
                    Create Mimi
                  </Link>
                </Button>

                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href="/templates">
                    <LayoutTemplate className="h-4 w-4" />
                    Templates
                  </Link>
                </Button>

                {/* Features (Replaces Explore) */}
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href="/features">
                    <Star className="h-4 w-4" />
                    Features
                  </Link>
                </Button>
              </>
            )}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2">
            {!user?.is_registered ? (
              // --- GUEST ACTIONS ---
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowLoginModal(true)}
                >
                  <LogIn className="h-4 w-4" />
                  Log in
                </Button>
                <Button asChild size="sm" className="gap-2">
                  <Link href="/register">
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Link>
                </Button>
              </>
            ) : (
              // --- LOGGED IN ACTIONS ---
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 pl-0 pr-2">
                      <Avatar className="h-8 w-8 border border-zinc-800">
                        <AvatarImage src={user?.profilePic} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline font-medium text-sm">{user?.name}</span>
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-500 focus:text-red-500 hover:bg-red-950/20 focus:bg-red-950/20"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-75 sm:w-100 bg-zinc-950 border-zinc-800 text-zinc-100">
                <SheetHeader>
                  <SheetTitle className="text-zinc-100">Menu</SheetTitle>
                  <SheetDescription className="text-zinc-400">
                    {user?.is_registered ? 'Create and share memes.' : 'Join to unlock all features.'}
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  {user?.is_registered ? (
                    <>
                      <Button asChild variant="ghost" className="justify-start gap-3">
                        <Link href="/create/ai" onClick={() => setMobileMenuOpen(false)}>
                          <Sparkles className="h-5 w-5 text-violet-500" />
                          AI Mimi
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="justify-start gap-3">
                        <Link href="/create/editor" onClick={() => setMobileMenuOpen(false)}>
                          <Hammer className="h-5 w-5" />
                          Create Mimi
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="justify-start gap-3">
                        <Link href="/templates" onClick={() => setMobileMenuOpen(false)}>
                          <LayoutTemplate className="h-5 w-5" />
                          Templates
                        </Link>
                      </Button>
                      <Separator className="bg-zinc-800" />
                      <Button asChild variant="ghost" className="justify-start gap-3">
                        <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <User className="h-5 w-5" />
                          Profile
                        </Link>
                      </Button>
                      <Button 
                         variant="ghost" 
                         className="justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-950/20"
                         onClick={() => {
                           logout();
                           setMobileMenuOpen(false);
                         }}
                      >
                          <LogOut className="h-5 w-5" />
                          Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Locked Mobile Items */}
                      <Button 
                        variant="ghost" 
                        className="justify-start gap-3 text-zinc-500"
                        onClick={(e) => {
                           handleLockedClick(e);
                           setMobileMenuOpen(false);
                        }}
                      >
                        <Lock className="h-4 w-4" />
                        AI Mimi
                      </Button>
                      <Button asChild variant="ghost" className="justify-start gap-3">
                        <Link href="/create/editor" onClick={() => setMobileMenuOpen(false)}>
                          <Hammer className="h-5 w-5" />
                          Create Mimi
                        </Link>
                      </Button>
                      
                      <Button asChild variant="ghost" className="justify-start gap-3">
                        <Link href="/templates" onClick={() => setMobileMenuOpen(false)}>
                          <LayoutTemplate className="h-5 w-5" />
                          Templates
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="justify-start gap-3">
                        <Link href="/features" onClick={() => setMobileMenuOpen(false)}>
                          <Star className="h-5 w-5" />
                          Features
                        </Link>
                      </Button>
                      <Separator className="bg-zinc-800 my-2" />
                      <Button 
                        variant="ghost" 
                        className="justify-start gap-3"
                        onClick={() => {
                            router.push('/login')
                          setShowLoginModal(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogIn className="h-5 w-5" />
                        Log in
                      </Button>
                      <Button asChild className="justify-start gap-3 bg-zinc-100 text-zinc-900">
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                          <UserPlus className="h-5 w-5" />
                          Sign up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </Container>
    </header>
  );
}