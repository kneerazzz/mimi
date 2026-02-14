'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { 
  Search, 
  Sparkles, 
  Award, 
  Flame,
  PartyPopper,
  HeartCrack,
  Angry,
  CircleHelp,
  Lightbulb,
  Ghost,
  Laugh,
  ThumbsDown,
  ShieldAlert,
  HandMetal,
  Ban,
  Shuffle,
  Star,
  Swords,
  Droplets,
  Grid3x3,
  Upload
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchTemplates } from '@/services/templateService';
import TemplateSearchResults from './TemplateSearchResults';
import { Template } from '@/components/templates/templateCard';

const REACTION_CATEGORIES = [
  { 
    id: 'yes-win-love', 
    label: 'Yes / Win / Love', 
    icon: PartyPopper, 
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 to-emerald-900/5',
    border: 'hover:border-emerald-500/60',
  },
  { 
    id: 'Sad', 
    label: 'Sad / Oof / Lose', 
    icon: HeartCrack, 
    color: 'text-sky-400',
    bgGradient: 'from-sky-500/20 to-sky-900/5',
    border: 'hover:border-sky-500/60',
  },
  {
    id: 'Angry',
    label: 'Angry',
    icon: Angry,
    color: 'text-red-400',
    bgGradient: 'from-red-500/20 to-red-900/5',
    border: 'hover:border-red-500/60',
  },
  {
    id: 'WTF',
    label: 'WTF',
    icon: CircleHelp,
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/20 to-amber-900/5',
    border: 'hover:border-amber-500/60',
  },
  {
    id: 'Dumb',
    label: 'Dumb / Smart',
    icon: Lightbulb,
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-500/20 to-yellow-900/5',
    border: 'hover:border-yellow-500/60',
  },
  {
    id: 'Cursed',
    label: 'Cursed',
    icon: Ghost,
    color: 'text-violet-400',
    bgGradient: 'from-violet-500/20 to-violet-900/5',
    border: 'hover:border-violet-500/60',
  },
  {
    id: 'Funny Not-Funny',
    label: 'Funny / Not Funny',
    icon: Laugh,
    color: 'text-pink-400',
    bgGradient: 'from-pink-500/20 to-pink-900/5',
    border: 'hover:border-pink-500/60',
  },
  {
    id: 'Horny',
    label: 'Horny',
    icon: Flame,
    color: 'text-rose-400',
    bgGradient: 'from-rose-500/20 to-rose-900/5',
    border: 'hover:border-rose-500/60',
  },
  {
    id: 'Boring',
    label: 'Not Interesting',
    icon: ThumbsDown,
    color: 'text-zinc-400',
    bgGradient: 'from-zinc-500/20 to-zinc-900/5',
    border: 'hover:border-zinc-500/60',
  },
  {
    id: 'Liar',
    label: 'Liar / Sauce?',
    icon: ShieldAlert,
    color: 'text-indigo-400',
    bgGradient: 'from-indigo-500/20 to-indigo-900/5',
    border: 'hover:border-indigo-500/60',
  },
  {
    id: 'Police',
    label: 'No / Stop / Police',
    icon: Ban,
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 to-blue-900/5',
    border: 'hover:border-blue-500/60',
  },
  {
    id: 'Offend',
    label: 'Offended',
    icon: HandMetal,
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 to-purple-900/5',
    border: 'hover:border-purple-500/60',
  },
  {
    id: 'Attack',
    label: 'Attack',
    icon: Swords,
    color: 'text-orange-400',
    bgGradient: 'from-orange-500/20 to-orange-900/5',
    border: 'hover:border-orange-500/60',
  },
  {
    id: 'Run-away',
    label: 'Sweat / Run Away',
    icon: Droplets,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-500/20 to-cyan-900/5',
    border: 'hover:border-cyan-500/60',
  }
];

const FEATURED_CATEGORIES = [
    {
        id: 'Classic',
        label: 'Classic Memes',
        description: 'The OG memes that started it all.',
        icon: Award,
        color: 'text-amber-400',
        bgGradient: 'from-amber-500/10 via-transparent to-transparent',
        href: '/feed'
    }
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Template[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await searchTemplates(searchQuery);
      if (response.success) {
        setSearchResults(response.data.templates || []);
      } else if (response.data?.templates) {
        setSearchResults(response.data.templates);
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      // Handle 404 as "no results found" instead of error
      if (err.response?.status === 404) {
        setSearchResults([]);
      } else {
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 py-4 px-6">
        <div className="max-w-460 mx-auto flex gap-4">
            <div className="relative flex-1 group flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input 
                      placeholder="Search for templates..." 
                      className="pl-12 h-12 bg-zinc-900/80 border-zinc-800 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 rounded-xl text-base transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-6 h-12 rounded-xl"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
                {hasSearched && (
                  <Button 
                    onClick={handleClearSearch}
                    variant="ghost"
                    className="px-4 h-12 text-zinc-400 hover:text-zinc-200"
                  >
                    Clear
                  </Button>
                )}
            </div>
        </div>
      </div>

      <div className="max-w-480 mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {hasSearched ? (
          <TemplateSearchResults templates={searchResults} isLoading={isSearching} query={searchQuery} />
        ) : (
          <>
            {/* Reactions Section */}
            <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-7 h-7 text-purple-400" />
                    <h2 className="text-3xl font-bold bg-linear-to-r from-zinc-50 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                        Reactions
                    </h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {REACTION_CATEGORIES.map((mood) => (
                        <Link href={`/templates/c/${mood.id}`} key={mood.id}>
                            <div className={`
                                relative h-32 rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm
                                flex flex-col items-center justify-center gap-2.5 p-4 transition-all duration-300
                                hover:scale-[1.05] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 cursor-pointer ${mood.border} group overflow-hidden
                            `}>
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-linear-to-br ${mood.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                
                                {/* Dark Overlay */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    <mood.icon 
                                        strokeWidth={2}
                                        className={`w-9 h-9 ${mood.color} drop-shadow-lg mb-2 group-hover:scale-110 transition-transform duration-300`} 
                                    />
                                    <span className="font-semibold text-sm text-zinc-100 text-center tracking-wide drop-shadow-md">
                                        {mood.label}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Explore More Section */}
            <div className="mb-16">
                 <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Star className="w-7 h-7 text-amber-400" />
                    <span className="bg-linear-to-r from-zinc-50 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">Explore More</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* The Void - Random Templates */}
                    <Link href="/templates" className="group">
                        <div className="h-64 rounded-2xl bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800/60 relative overflow-hidden transition-all hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/30">
                            {/* Animated gradient overlay */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-purple-600/20 via-fuchsia-600/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Noise texture */}
                            <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
                            
                            <div className="absolute inset-0 flex flex-col justify-end p-8">
                                <div className="flex items-center gap-3 mb-3">
                                    <Shuffle className="w-10 h-10 text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
                                </div>
                                <h3 className="text-4xl font-bold text-zinc-100 mb-2">
                                    The Void
                                </h3>
                                <p className="text-zinc-300 text-lg max-w-md">
                                    Discover unexpected gems. New surprises every time.
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Template Matrix - All Templates */}
                    <Link href="/templates/c/General" className="group">
                        <div className="h-64 rounded-2xl bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800/60 relative overflow-hidden transition-all hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-900/30">
                            {/* Animated gradient overlay */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-cyan-600/20 via-blue-600/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Grid pattern overlay */}
                            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size-40px_40px]" />
                            
                            <div className="absolute inset-0 flex flex-col justify-end p-8">
                                <div className="flex items-center gap-3 mb-3">
                                    <Grid3x3 className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <h3 className="text-4xl font-bold text-zinc-100 mb-2">
                                    Template Matrix
                                </h3>
                                <p className="text-zinc-300 text-lg max-w-md">
                                    Browse the complete collection. All templates, all vibes.
                                </p>
                            </div>
                        </div>
                    </Link>
                    
                    {/* Upload Your Template */}
                    <Link href="/create/template" className="group">
                        <div className="h-64 rounded-2xl bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800/60 relative overflow-hidden transition-all hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/30">
                            {/* Animated gradient overlay */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-emerald-600/20 via-teal-600/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Sparkle pattern overlay */}
                            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-[size-50px_50px]" />
                            
                            <div className="absolute inset-0 flex flex-col justify-end p-8">
                                <div className="flex items-center gap-3 mb-3">
                                    <Upload className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <h3 className="text-4xl font-bold text-zinc-100 mb-2">
                                    Create Template
                                </h3>
                                <p className="text-zinc-300 text-lg max-w-md">
                                    Upload your own templates. Private and personal.
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Featured Section */}
            <div className="mb-12">
                 <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Award className="w-7 h-7 text-amber-400" />
                    <span className="bg-linear-to-r from-zinc-50 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">Featured</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FEATURED_CATEGORIES.map(cat => (
                        <Link href={cat.href} key={cat.id} className="group">
                            <div className="p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 relative overflow-hidden transition-all hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-900/20 hover:bg-zinc-900/80">
                                {/* Gradient overlay */}
                                <div className={`absolute inset-0 bg-linear-to-br ${cat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                
                                <div className="flex items-start gap-4 relative z-10">
                                    <cat.icon className={`w-8 h-8 ${cat.color} mt-1 group-hover:scale-110 transition-transform`} />
                                    <div>
                                        <h3 className="text-2xl font-bold text-zinc-100 mb-1">{cat.label}</h3>
                                        <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors">{cat.description}</p>
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