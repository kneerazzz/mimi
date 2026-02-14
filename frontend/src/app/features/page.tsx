'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Bookmark,
  MessageCircle,
  Upload,
  TrendingUp,
  Sparkles,
  Palette,
  Search,
  User,
  Eye,
  Layers,
  Shield,
  Layout,
  MousePointer2,
  Image as ImageIcon,
  Rocket,
  Zap,
  Gift,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- FEATURE LISTS ---

const freeFeatures = [
  { icon: Eye, title: 'Browse Feed', desc: 'Endless scroll of community memes and trending content' },
  { icon: Search, title: 'Smart Search', desc: 'Find memes by tags, categories, and keywords' },
  { icon: TrendingUp, title: 'Trending Memes', desc: 'Discover what\'s viral right now in the community' },
  { icon: Palette, title: 'Meme Editor', desc: 'Access the powerful HTML5 canvas editor' },
];

const memberFeatures = [
  { icon: Upload, title: 'Upload Templates', desc: 'Contribute your own custom templates to the library for others to use' },
  { icon: Heart, title: 'Like & React', desc: 'Support creators by liking their memes and showing appreciation' },
  { icon: MessageCircle, title: 'Comments', desc: 'Engage with the community through thoughtful comments' },
  { icon: Bookmark, title: 'Save Collection', desc: 'Build and manage your personal collection of favorite memes' },
  { icon: User, title: 'Full Profile', desc: 'Complete creator profile showcasing your uploads and history' },
  { icon: Shield, title: 'Account Security', desc: 'Advanced security with OTP and session management' },
];

export default function FeaturesPage() {
  const router = useRouter();
  const { user, setShowLoginModal } = useAuth();

  const handleAction = (path: string) => {
    if (!user?.is_registered) {
      setShowLoginModal(true);
    } else {
      router.push(path);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-500/30">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div></div>
          <div className="flex gap-2 sm:gap-4 items-center">
            {!user?.is_registered && (
              <Button variant="ghost" onClick={() => setShowLoginModal(true)} className="text-xs sm:text-sm">
                Log in
              </Button>
            )}
            <Button 
                onClick={() => handleAction('/create')}
                className="bg-white text-black hover:bg-zinc-200 font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2"
            >
              Start Creating
            </Button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 sm:w-250 h-75 sm:h-125 bg-purple-600/20 rounded-full blur-[80px] sm:blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-125 sm:w-200 h-100 sm:h-125 bg-blue-600/10 rounded-full blur-[80px] sm:blur-[100px] -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-zinc-400 mb-6 sm:mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            v1.0 Live & Ready
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 sm:mb-8">
            The professional grade <br />
            <span className="bg-linear-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              meme studio.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
            Mimi is a complete ecosystem for meme creators. Upload custom templates, 
            edit with advanced layer controls, and share directly to a global community.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button 
                size="lg" 
                onClick={() => handleAction('/create')}
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-lg rounded-full bg-white text-black hover:bg-zinc-200 w-full sm:w-auto"
            >
              <Palette className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              Open Studio
            </Button>
            <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/feed')}
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-lg rounded-full border-zinc-800 hover:bg-zinc-900 w-full sm:w-auto"
            >
              Explore Feed
            </Button>
          </div>
        </div>
      </section>

      {/* --- FEATURE COMPARISON GRID --- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-linear-to-b from-zinc-900/50 to-zinc-950 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-20">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-linear-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  Unlock the Full Creator Experience
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto">
                  Join the community to unlock exclusive features for creating, curating, and sharing your best work.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                {/* Free Tier */}
                <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Eye className="w-32 sm:w-40 h-32 sm:h-40" />
                    </div>
                    <div className="relative">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
                          <Gift className="w-5 sm:w-6 h-5 sm:h-6 text-zinc-400" />
                          <span>Visitor Access</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-500 mb-6 sm:mb-8">Perfect for exploring and experimenting</p>
                      <div className="space-y-3 sm:space-y-4">
                          {freeFeatures.map((f, i) => (
                              <div key={i} className="flex gap-3 sm:gap-4 items-start group">
                                  <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200 transition-all shrink-0">
                                      <f.icon className="w-4 sm:w-5 h-4 sm:h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-xs sm:text-sm md:text-base text-zinc-100">{f.title}</div>
                                      <div className="text-xs text-zinc-500 mt-1">{f.desc}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                    </div>
                </div>

                {/* Member Tier */}
                <div className="p-6 sm:p-8 rounded-2xl bg-linear-to-br from-purple-950/40 via-zinc-900 to-zinc-950 border border-purple-500/50 hover:border-purple-400/70 transition-all shadow-lg shadow-purple-500/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-purple-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Sparkles className="w-32 sm:w-40 h-32 sm:h-40 text-purple-500" />
                    </div>
                    <div className="relative">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
                          <Zap className="w-5 sm:w-6 h-5 sm:h-6 text-purple-400" />
                          <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Full Member Access</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-purple-200/70 mb-6 sm:mb-8">Everything you need to create & share</p>
                      <div className="space-y-3 sm:space-y-4">
                          {memberFeatures.map((f, i) => (
                              <div key={i} className="flex gap-3 sm:gap-4 items-start group">
                                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:bg-purple-500/30 group-hover:text-purple-300 transition-all shrink-0">
                                      <f.icon className="w-4 sm:w-5 h-4 sm:h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-xs sm:text-sm md:text-base text-white">{f.title}</div>
                                      <div className="text-xs text-purple-200/60 mt-1">{f.desc}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                      
                      {!user?.is_registered && (
                          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-purple-500/20">
                              <Button 
                                  onClick={() => setShowLoginModal(true)}
                                  className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg text-sm sm:text-base"
                              >
                                  Create Free Account
                              </Button>
                          </div>
                      )}
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- DEEP DIVE: THE STUDIO --- */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 blur-[60px] sm:blur-[80px] opacity-20" />
                <div className="relative bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
                    {/* Visual representation of editor */}
                    <div className="border-b border-zinc-800 bg-zinc-950 p-2 sm:p-3 flex gap-2">
                        <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-red-500/20" />
                        <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-green-500/20" />
                    </div>
                    <div className="p-4 sm:p-6 md:p-8 aspect-video flex items-center justify-center bg-zinc-950/50">
                        <div className="text-center space-y-2 sm:space-y-4">
                            <Layers className="w-12 sm:w-16 h-12 sm:h-16 text-zinc-700 mx-auto" />
                            <p className="text-zinc-500 font-mono text-xs sm:text-sm">
                                4 Text Layers • Custom Font • Locked Background
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-6 sm:space-y-8">
                <div className="inline-flex items-center gap-2 text-purple-400 font-medium text-sm sm:text-base">
                    <Palette className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span>The Creator Studio</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                    Total control over <br />
                    <span className="text-zinc-400">every pixel.</span>
                </h2>
                <p className="text-base sm:text-lg text-zinc-400">
                    Mimi provides a powerful HTML5 canvas editor that gives you the freedom of a desktop design tool right in your browser.
                </p>
                
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex gap-3 sm:gap-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 shrink-0">
                            <MousePointer2 className="w-5 sm:w-6 h-5 sm:h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-1">Drag & Drop Layers</h3>
                            <p className="text-zinc-400 text-xs sm:text-sm">
                                Position text exactly where you want it. Resize, rotate, and stack layers to create complex composites.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 sm:gap-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 shrink-0">
                            <ImageIcon className="w-5 sm:w-6 h-5 sm:h-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-1">Custom Uploads</h3>
                            <p className="text-zinc-400 text-xs sm:text-sm">
                                Not seeing the template you need? Upload your own images directly from your device and start editing instantly.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 shrink-0">
                            <Palette className="w-5 sm:w-6 h-5 sm:h-6 text-pink-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-1">Advanced Styling</h3>
                            <p className="text-zinc-400 text-xs sm:text-sm">
                                Use any hex color code, add strokes, change fonts, and toggle bold/italics for maximum impact.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- DEEP DIVE: THE PROFILE & TEMPLATES --- */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8">
                <div className="inline-flex items-center gap-2 text-green-400 font-medium text-sm sm:text-base">
                    <User className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span>Your Digital Identity</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    Build your legacy.
                </h2>
                <p className="text-base sm:text-lg text-zinc-400">
                    Your profile is your home base. Track your contributions, manage your security, and curate your personal collection.
                </p>

                <div className="grid gap-3 sm:gap-4">
                    {[
                        { l: "Created Memes", d: "A portfolio of everything you've published." },
                        { l: "Template Library", d: "Templates you've uploaded for the community to use." },
                        { l: "Saved Collection", d: "Bookmarks for memes you want to see later." },
                        { l: "Liked History", d: "Quickly find that one meme you laughed at yesterday." },
                        { l: "Account Security", d: "Manage your password and active sessions securely." },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            <div className="min-w-0">
                                <div className="font-bold text-xs sm:text-sm">{item.l}</div>
                                <div className="text-xs text-zinc-500">{item.d}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-linear-to-l from-green-500/20 to-transparent blur-[60px] sm:blur-[80px]" />
                {/* Mockup of Profile Dashboard */}
                <div className="bg-black rounded-xl border border-zinc-800 p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 shrink-0" />
                        <div className="space-y-2 flex-1 min-w-0">
                            <div className="h-4 sm:h-6 w-24 sm:w-32 bg-zinc-800 rounded animate-pulse" />
                            <div className="h-3 sm:h-4 w-32 sm:w-48 bg-zinc-900 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="flex gap-2 border-b border-zinc-800 pb-3 sm:pb-4 overflow-x-auto">
                        {["Created", "Saved", "Templates", "Liked", "Security"].map((t, i) => (
                            <div key={i} className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${i === 2 ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                                {t}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="aspect-square bg-zinc-900 rounded-lg border border-zinc-800 flex flex-col items-center justify-center p-2 sm:p-4 text-center">
                            <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-zinc-700 mb-1 sm:mb-2" />
                            <span className="text-xs text-zinc-500">Your Uploaded Template</span>
                        </div>
                         {[1,2,3].map(i => (
                            <div key={i} className="aspect-square bg-zinc-900 rounded-lg border border-zinc-800/50" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- DEEP DIVE: THE FEED --- */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
             <div className="order-2 lg:order-1 relative">
                {/* Community Grid Visualization */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 opacity-50">
                     {[...Array(9)].map((_, i) => (
                         <div key={i} className={`rounded-xl bg-zinc-800 border border-zinc-700 aspect-3/4 ${i % 2 === 0 ? 'translate-y-2 sm:translate-y-4' : ''}`} />
                     ))}
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                <div className="absolute bottom-4 sm:bottom-10 left-4 sm:left-10 right-4 sm:right-10 p-4 sm:p-6 bg-zinc-900/90 backdrop-blur border border-zinc-700 rounded-2xl">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-orange-500 shrink-0" />
                        <div className="font-bold text-sm sm:text-base">Trending Now</div>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400">
                        "The community is loving this format! Use it to create your own."
                    </p>
                </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-6 sm:space-y-8">
                <div className="inline-flex items-center gap-2 text-orange-400 font-medium text-sm sm:text-base">
                    <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span>The Feed</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    Never run out of inspiration.
                </h2>
                <p className="text-base sm:text-lg text-zinc-400">
                    The MIMI feed is a curated stream of what's funny, trending, and remixable right now.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                        <Layout className="w-6 sm:w-8 h-6 sm:h-8 text-orange-500 mb-2 sm:mb-3" />
                        <h4 className="font-bold text-sm sm:text-base mb-1">Instant Remixing</h4>
                        <p className="text-xs sm:text-sm text-zinc-500">See a meme you like? One click opens that exact template in the editor so you can make your own version.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                        <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-blue-500 mb-2 sm:mb-3" />
                        <h4 className="font-bold text-sm sm:text-base mb-1">Community Templates</h4>
                        <p className="text-xs sm:text-sm text-zinc-500">Access thousands of templates uploaded by other users, or upload your own to start a trend.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- UPCOMING FEATURES SECTION --- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-linear-to-b from-zinc-950 via-zinc-900/50 to-zinc-950 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 -right-1/3 w-100 sm:w-150 h-100 sm:h-150 bg-linear-to-l from-indigo-600/20 to-transparent rounded-full blur-[80px] sm:blur-[120px] -z-10" />
        <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-indigo-900/30 border border-indigo-500/30 mb-6 sm:mb-8">
              <span className="flex h-2 w-2 rounded-full bg-zinc-600 animate-pulse"></span>
              <span className="text-xs sm:text-sm font-medium text-indigo-300">Coming Soon</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-linear-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Ooh, you've found our future features!
            </h2>
            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto mb-3 sm:mb-4 leading-relaxed">
              We're working on next-generation tools that will revolutionize meme creation. Check out what's coming to MIMI in the near future.
            </p>
            <p className="text-xs sm:text-sm text-zinc-500 mb-6 sm:mb-8">AI-powered meme generation, video editing, smart templates, and much more...</p>
            <Link 
                href="/upcoming" 
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-zinc-600 hover:bg-zinc-700 text-white font-semibold rounded-full transition-all hover:shadow-lg hover:shadow-zinc-600/30 text-sm sm:text-base"
            >
              <Rocket className="w-4 sm:w-5 h-4 sm:h-5" />
              View Roadmap & Upcoming Features
            </Link>
        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 text-center bg-linear-to-b from-zinc-950 to-zinc-900">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold">Ready to break the internet?</h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400">
                Join thousands of creators making the next viral hit on MIMI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {!user?.is_registered ? (
                    <Button 
                        size="lg" 
                        onClick={() => setShowLoginModal(true)}
                        className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-lg rounded-full bg-white text-black hover:bg-zinc-200 w-full sm:w-auto"
                    >
                        Create Free Account
                    </Button>
                ) : (
                    <Button 
                        size="lg" 
                        onClick={() => router.push('/create')}
                        className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-lg rounded-full bg-zinc-600 text-white hover:bg-zinc-700 w-full sm:w-auto"
                    >
                        Go to Editor
                    </Button>
                )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-500">No credit card required. Free forever.</p>
        </div>
      </section>

    </div>
  );
}