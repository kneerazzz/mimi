'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Upload, 
  LayoutGrid, 
  ArrowRight, 
  Bot, 
  ImagePlus, 
  Library 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateLandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-5xl w-full space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                How do you want to cook?
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
                Choose your weapon. Generate with AI, start from scratch, or browse the archives.
            </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* OPTION 1: AI GENERATION */}
            <Link href="/create/ai" className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative h-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:border-purple-500/50 rounded-3xl p-8 flex flex-col justify-between transition-all group-hover:-translate-y-1 group-hover:shadow-2xl">
                    <div className="space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                AI Magic
                            </h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Describe a scenario and let our AI generate a meme for you instantly. Pure brainrot automation.
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center text-purple-400 font-semibold group-hover:gap-2 transition-all">
                        <span>Generate Now</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>
            </Link>

            {/* OPTION 2: UPLOAD / EDITOR */}
            <Link href="/create/editor" className="group">
                <div className="h-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:border-zinc-600 rounded-3xl p-8 flex flex-col justify-between transition-all group-hover:-translate-y-1 group-hover:shadow-xl hover:bg-zinc-900">
                    <div className="space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                            <ImagePlus className="w-7 h-7 text-zinc-300" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">
                                Start from Scratch
                            </h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Upload your own image or raw template. The classic editor experience for the pros.
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center text-zinc-300 font-semibold group-hover:gap-2 transition-all">
                        <span>Open Editor</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>
            </Link>

            {/* OPTION 3: BROWSE TEMPLATES */}
            <Link href="/templates" className="group">
                <div className="h-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:border-pink-500/50 rounded-3xl p-8 flex flex-col justify-between transition-all group-hover:-translate-y-1 group-hover:shadow-xl hover:bg-zinc-900">
                    <div className="space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                            <LayoutGrid className="w-7 h-7 text-zinc-300 group-hover:text-pink-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white group-hover:text-pink-300 transition-colors">
                                Browse Templates
                            </h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Search through thousands of templates. From classic formats to the latest trends.
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center text-pink-400 font-semibold group-hover:gap-2 transition-all">
                        <span>Go to Library</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>
            </Link>

        </div>

        {/* Footer Link */}
        <div className="text-center">
            <Link href="/feed" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                Not feeling creative? <span className="underline decoration-zinc-700 underline-offset-4">Return to Feed</span>
            </Link>
        </div>

      </div>
    </div>
  );
}