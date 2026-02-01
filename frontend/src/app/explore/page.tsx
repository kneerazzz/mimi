'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Search, TrendingUp, Zap, Skull, Smile, Frown, HelpCircle, Angry, Sparkles, Flame, Award, Heart, ThumbsDown, Hand, Eye, Siren } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from '@/hooks/useDebounce';
import { searchTemplates } from '@/services/templateService';
import TemplateSearchResults from './TemplateSearchResults';
import { Template } from '@/components/templates/templateCard';

const REACTION_CATEGORIES = [
  { 
    id: 'yes_win_love', 
    label: 'Yes / Win / Love', 
    icon: Heart, 
    color: 'text-green-400', 
    border: 'hover:border-green-500/50',
  },
  { 
    id: 'sad_oof_lose', 
    label: 'Sad / Oof / Lose', 
    icon: Frown, 
    color: 'text-blue-400', 
    border: 'hover:border-blue-500/50',
  },
  {
    id: 'angry',
    label: 'Angry',
    icon: Angry,
    color: 'text-red-400',
    border: 'hover:border-red-500/50',
  },
  {
    id: 'wtf',
    label: 'WTF',
    icon: HelpCircle,
    color: 'text-orange-400',
    border: 'hover:border-orange-500/50',
  },
  {
    id: 'dumb',
    label: 'Dumb / Smart',
    icon: Zap,
    color: 'text-yellow-400',
    border: 'hover:border-yellow-500/50',
  },
  {
    id: 'cursed',
    label: 'Cursed',
    icon: Skull,
    color: 'text-zinc-400',
    border: 'hover:border-zinc-500/50',
  },
  {
    id: 'funny_notfunny',
    label: 'Funny / Not Funny',
    icon: Smile,
    color: 'text-pink-400',
    border: 'hover:border-pink-500/50',
  },
  {
    id: 'horny',
    label: 'Horny',
    icon: Flame,
    color: 'text-rose-400',
    border: 'hover:border-rose-500/50',
  },
  {
    id: 'humm_not_interesting',
    label: 'Not Interesting',
    icon: ThumbsDown,
    color: 'text-gray-400',
    border: 'hover:border-gray-500/50',
  },
  {
    id: 'liar_sauce',
    label: 'Liar / Sauce?',
    icon: Eye,
    color: 'text-indigo-400',
    border: 'hover:border-indigo-500/50',
  },
  {
    id: 'no_stop_police',
    label: 'No / Stop / Police',
    icon: Siren,
    color: 'text-blue-500',
    border: 'hover:border-blue-600/50',
  },
  {
    id: 'offend',
    label: 'Offended',
    icon: Hand,
    color: 'text-purple-400',
    border: 'hover:border-purple-500/50',
  }
];

const FEATURED_CATEGORIES = [
    {
        id: 'Classic',
        label: 'Classic Memes',
        description: 'The OG memes that started it all.',
        icon: Award,
        color: 'text-amber-400',
        href: '/templates/c/Classic'
    },
    {
        id: 'New Formats',
        label: 'New Formats',
        description: 'Fresh templates, hot off the press.',
        icon: TrendingUp,
        color: 'text-teal-400',
        href: '/templates/c/New'
    }
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Template[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery) {
      setIsSearching(true);
      searchTemplates(debouncedSearchQuery)
        .then(response => {
          if (response.success) {
            setSearchResults(response.data.templates);
          } else {
            setSearchResults([]);
          }
        })
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      
      <div className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 py-4 px-6">
        <div className="max-w-5xl mx-auto flex gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <Input 
                    placeholder="Search for vibes, reactions, or templates..." 
                    className="pl-12 h-12 bg-zinc-900 border-zinc-800 focus:border-purple-500 rounded-full text-base transition-all focus:bg-zinc-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {searchQuery ? (
          <TemplateSearchResults templates={searchResults} isLoading={isSearching} query={debouncedSearchQuery} />
        ) : (
          <>
            <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-7 h-7 text-purple-400" />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                        Reactions
                    </h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                    {REACTION_CATEGORIES.map((mood) => (
                        <Link href={`/templates/c/${mood.id}`} key={mood.id}>
                            <div className={`
                                relative h-32 rounded-2xl border border-zinc-800 bg-zinc-900
                                flex flex-col items-center justify-center gap-2 p-4 transition-all duration-300
                                hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 cursor-pointer ${mood.border} group overflow-hidden
                            `}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    <mood.icon 
                                        strokeWidth={2}
                                        className={`w-8 h-8 ${mood.color} drop-shadow-lg mb-2`} 
                                    />
                                    <span className="font-bold text-base text-white text-center tracking-wide drop-shadow-md">
                                        {mood.label}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="mb-16">
                 <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Flame className="w-7 h-7 text-orange-500" />
                    <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">Explore More</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/templates/c/General" className="group lg:col-span-2">
                        <div className="h-64 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden transition-all hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/20">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/30 via-zinc-900/0 to-transparent opacity-50" />
                            
                            <div className="absolute inset-0 flex flex-col justify-end p-8">
                                <h3 className="text-4xl font-bold text-zinc-100">
                                    General Templates
                                </h3>
                                <p className="text-zinc-400 mt-2 text-lg max-w-md">
                                    Browse all templates for general use.
                                </p>
                            </div>
                        </div>
                    </Link>
                    
                     <div className="h-64 rounded-2xl bg-zinc-900/50 border border-zinc-800 border-dashed flex flex-col items-center justify-center text-zinc-600 relative overflow-hidden group">
                        <TrendingUp className="w-12 h-12 text-zinc-700 group-hover:text-zinc-600 transition-colors" />
                        <span className="relative z-10 font-bold text-xl mt-4 group-hover:text-zinc-500 transition-colors">
                            Trending Templates
                        </span>
                         <span className="text-sm text-zinc-700">Coming Soon</span>
                    </div>
                </div>
            </div>

            <div className="mb-12">
                 <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Award className="w-7 h-7 text-amber-500" />
                    <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">Featured</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FEATURED_CATEGORIES.map(cat => (
                        <Link href={cat.href} key={cat.id} className="group">
                            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden transition-all hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-900/20">
                                <div className="flex items-start gap-4">
                                    <cat.icon className={`w-8 h-8 ${cat.color} mt-1`} />
                                    <div>
                                        <h3 className="text-2xl font-bold text-zinc-100">{cat.label}</h3>
                                        <p className="text-zinc-400 mt-1">{cat.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}