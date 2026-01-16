'use client';

import Link from "next/link";
import { Search, TrendingUp, Zap, Skull, Smile, Frown, HelpCircle, Angry, Sparkles, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";

const MOODS = [
  { 
    id: 'Happy', 
    label: 'Happy', 
    icon: Smile, 
    color: 'text-green-400', 
    // Example: A collage of smiling dogs, happy people, etc.
    image: '/assets/moods/happy_cover.jpg', 
    border: 'hover:border-green-500/50',
  },
  { 
    id: 'Sad', 
    label: 'Sad', 
    icon: Frown, 
    color: 'text-blue-400', 
    image: '/assets/moods/sad_cover.jpg', 
    border: 'hover:border-blue-500/50',
  },
  { 
    id: 'Confused', 
    label: 'Confused', 
    icon: HelpCircle, 
    color: 'text-orange-400', 
    image: '/assets/moods/confused_cover.jpg', 
    border: 'hover:border-orange-500/50',
  },
  { 
    id: 'Angry', 
    label: 'Angry', 
    icon: Angry, 
    color: 'text-red-400', 
    image: '/assets/moods/angry_cover.jpg', 
    border: 'hover:border-red-500/50',
  },
  { 
    id: 'Dumb', 
    label: 'Dumb', 
    icon: Zap, 
    color: 'text-yellow-400', 
    image: '/assets/moods/dumb_cover.jpg', 
    border: 'hover:border-yellow-500/50',
  },
  { 
    id: 'Dark', 
    label: 'Dark', 
    icon: Skull, 
    color: 'text-zinc-400', 
    image: '/assets/moods/dark_cover.jpg', 
    border: 'hover:border-zinc-500/50',
  },
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 py-4 px-6">
        <div className="max-w-5xl mx-auto flex gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <Input 
                    placeholder="Search for vibes, reactions, or templates..." 
                    className="pl-10 h-12 bg-zinc-900/50 border-zinc-800 focus:border-purple-500 rounded-full text-base transition-all focus:bg-zinc-900"
                />
            </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 mt-8">
        
        {/* Vibe Check (Pinterest Boxes) */}
        <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
                    Vibe Check
                </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {MOODS.map((mood) => (
                    <Link href={`/templates/c/${mood.id}`} key={mood.id}>
                        <div className={`
                            relative h-48 rounded-3xl border border-zinc-800 bg-zinc-900
                            flex flex-col items-center justify-center gap-3 transition-all duration-300
                            hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 cursor-pointer ${mood.border} group overflow-hidden
                        `}>
                            
                            {/* 2. Background Image (The Collage) */}
                            {/* We use 'group-hover:scale-110' for a nice zoom effect on hover */}
                            <div 
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                                style={{ backgroundImage: `url(${mood.image})` }}
                            />

                            {/* 3. Gradient Overlay (To make text readable) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                            
                            {/* Icon & Label */}
                            <div className="relative z-10 flex flex-col items-center">
                                <mood.icon 
                                    strokeWidth={2}
                                    className={`w-10 h-10 ${mood.color} drop-shadow-lg mb-2`} 
                                />
                                <span className="font-bold text-lg text-white tracking-wide drop-shadow-md">
                                    {mood.label}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>

        {/* Explore Deeper */}
        <div className="mb-12">
             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                Explore Deeper
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/templates" className="group">
                    <div className="h-64 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden transition-all hover:border-purple-500/50">
                        {/* Abstract background for Void card */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-900/0 to-transparent opacity-50" />
                        
                        <div className="absolute inset-0 flex flex-col justify-end p-8">
                            <TrendingUp className="w-12 h-12 text-zinc-700 group-hover:text-purple-500 mb-4 transition-colors" />
                            <h3 className="text-3xl font-bold text-zinc-100 group-hover:text-purple-400 transition-colors">
                                Enter The Void
                            </h3>
                            <p className="text-zinc-400 mt-2 text-lg font-medium">
                                Infinite scroll of random templates. Pure chaos.
                            </p>
                        </div>
                    </div>
                </Link>
                
                 <div className="h-64 rounded-3xl bg-zinc-900/30 border border-zinc-800 border-dashed flex flex-col items-center justify-center text-zinc-600 relative overflow-hidden group">
                    <span className="relative z-10 font-bold text-xl group-hover:text-zinc-500 transition-colors">
                        Trending Templates Coming Soon...
                    </span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}