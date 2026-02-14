'use client';

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-pink-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-5xl w-full space-y-8 sm:space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter bg-linear-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                How do you want to cook?
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-2">
                Choose your weapon. Generate with AI, start from scratch, or browse the archives.
            </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            <Link href="/upcoming" className="group relative">
                <div className="absolute inset-0 bg-linear-to-br from-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative h-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:border-purple-500/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all group-hover:-translate-y-1 group-hover:shadow-2xl">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Bot className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                AI Magic
                            </h3>
                            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                                Describe a scenario and let our AI generate a meme for you instantly. Pure brainrot automation.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 sm:mt-8 flex items-center text-purple-400 font-semibold group-hover:gap-2 transition-all">
                        <span className="text-sm sm:text-base">Generate Now</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>
            </Link>

            {/* OPTION 2: UPLOAD / EDITOR */}
            <Link href="/create/editor" className="group">
                <div className="h-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:border-zinc-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all group-hover:-translate-y-1 group-hover:shadow-xl hover:bg-zinc-900">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                            <ImagePlus className="w-6 sm:w-7 h-6 sm:h-7 text-zinc-300" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-white">
                                Start from Scratch
                            </h3>
                            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                                Upload your own image or raw template. The classic editor experience for the pros.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 sm:mt-8 flex items-center text-zinc-300 font-semibold group-hover:gap-2 transition-all">
                        <span className="text-sm sm:text-base">Open Editor</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>
            </Link>

            {/* OPTION 3: BROWSE TEMPLATES */}
            <Link href="/templates" className="group">
                <div className="h-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:border-pink-500/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all group-hover:-translate-y-1 group-hover:shadow-xl hover:bg-zinc-900">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                            <LayoutGrid className="w-6 sm:w-7 h-6 sm:h-7 text-zinc-300 group-hover:text-pink-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-pink-300 transition-colors">
                                Browse Templates
                            </h3>
                            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                                Search through thousands of templates. From classic formats to the latest trends.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 sm:mt-8 flex items-center text-pink-400 font-semibold group-hover:gap-2 transition-all">
                        <span className="text-sm sm:text-base">Go to Library</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>
            </Link>

        </div>

        {/* Footer Link */}
        <div className="text-center">
            <Link href="/feed" className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                Not feeling creative? <span className="underline decoration-zinc-700 underline-offset-4">Return to Feed</span>
            </Link>
        </div>

      </div>
    </div>
  );
}