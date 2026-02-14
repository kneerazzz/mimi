'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Rocket,
  Wand2,
  Zap,
  Brain,
  Share2,
  Filter,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Users,
  UserCheck,
  Lightbulb,
  Cpu,
  Target,
  Gift
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- UPCOMING FEATURES ---
const upcomingFeatures = [
  {
    icon: Brain,
    title: 'AI Meme Generator',
    desc: 'Describe your meme idea and let AI handle the rest. Get smart captions, auto-matched templates, and instant creation.',
    status: 'In Development',
    timeline: 'Q1 2026',
    badge: 'ai'
  },
  {
    icon: Wand2,
    title: 'Smart Template Assistant',
    desc: 'Get AI-powered suggestions for layouts, text placement, and styling based on your meme idea.',
    status: 'Planning',
    timeline: 'Q2 2026',
    badge: 'ai'
  },
  {
    icon: Filter,
    title: 'Advanced Filters & Effects',
    desc: 'Professional-grade filters, blur, shadows, and custom effects right in the editor.',
    status: 'In Development',
    timeline: 'Q1 2026',
    badge: 'premium'
  },
  {
    icon: Share2,
    title: 'Social Auto-Share',
    desc: 'Post your memes directly to Twitter, Reddit, TikTok, and more in one click.',
    status: 'Planning',
    timeline: 'Q2 2026',
    badge: 'social'
  },
  {
    icon: Users,
    title: 'Follow & Followers',
    desc: 'Follow your favorite creators and grow your own fanbase. Build meaningful connections in the community.',
    status: 'In Development',
    timeline: 'Q1 2026',
    badge: 'social'
  },
  {
    icon: MessageSquare,
    title: 'Community Challenges',
    desc: 'Participate in themed meme creation challenges and compete for recognition and rewards.',
    status: 'Planning',
    timeline: 'Q3 2026',
    badge: 'community'
  },
  {
    icon: TrendingUp,
    title: 'Creator Analytics',
    desc: 'Track views, engagement, and trending insights for your memes and templates.',
    status: 'Planning',
    timeline: 'Q2 2026',
    badge: 'analytics'
  },
  {
    icon: UserCheck,
    title: 'Creator Collections',
    desc: 'Organize your created memes into themed collections and share curated sets with the community.',
    status: 'Planning',
    timeline: 'Q2 2026',
    badge: 'profile'
  }
];

const getStatusColor = (status: string) => {
  switch(status) {
    case 'In Development':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'Planning':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    default:
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  }
};

const getTimelineColor = (timeline: string) => {
  if (timeline.includes('Q1')) return 'text-emerald-400';
  if (timeline.includes('Q2')) return 'text-blue-400';
  return 'text-purple-400';
};

export default function UpcomingPage() {
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
          <div className="flex gap-2 sm:gap-4 items-center flex-wrap justify-end">
            <Link 
              href="/features"
              className="text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Current Features
            </Link>
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
      <section className="relative pt-12 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 sm:w-300 h-75 sm:h-150 bg-purple-600/30 rounded-full blur-[80px] sm:blur-[150px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-100 sm:w-200 h-100 sm:h-150 bg-pink-600/20 rounded-full blur-[80px] sm:blur-[120px] -z-10" />
        <div className="absolute top-1/2 left-0 w-100 sm:w-150 h-100 sm:h-150 bg-blue-600/15 rounded-full blur-[80px] sm:blur-[100px] -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-xs sm:text-sm text-purple-300 mb-6 sm:mb-8">
            <span className="flex h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse"></span>
            Future Features Roadmap
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 sm:mb-8 leading-tight">
            The Future of <br />
            <span className="bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Meme Creation
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
            We're constantly innovating. Here's what we're building to make MIMI the ultimate meme creation platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button 
                size="lg" 
                onClick={() => router.push('/features')}
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-lg rounded-full bg-white text-black hover:bg-zinc-200 w-full sm:w-auto"
            >
              <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              Current Features
            </Button>
            <Button 
                size="lg" 
                variant="outline"
                onClick={() => handleAction('/create')}
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-lg rounded-full border-zinc-800 hover:bg-zinc-900 w-full sm:w-auto"
            >
              <Rocket className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              Start Creating Now
            </Button>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-linear-to-b from-zinc-950 via-zinc-900/30 to-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-4 sm:mb-6">What We're Building</h2>
            <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto">
              AI-powered creation tools, social features, creator profiles, and more. These features are in active development and will launch soon.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {upcomingFeatures.map((feature, idx) => (
              <div 
                key={idx}
                className="group relative p-4 sm:p-6 rounded-2xl bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-xl hover:shadow-purple-500/10"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  {/* Header with icon and status */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-xl group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                      <feature.icon className="w-5 sm:w-6 h-5 sm:h-6 text-purple-400" />
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(feature.status)}`}>
                      {feature.status}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mb-4 sm:mb-6 leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* Timeline */}
                  <div className="pt-3 sm:pt-4 border-t border-zinc-800/50">
                    <p className={`text-xs sm:text-sm font-semibold ${getTimelineColor(feature.timeline)}`}>
                      🗓️ {feature.timeline}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- AI CREATION EXPLAINED --- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-xs sm:text-sm text-purple-300 mb-4 sm:mb-6">
              <Lightbulb className="w-3 sm:w-4 h-3 sm:h-4" />
              How AI Meme Creation Works
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">The Smart Meme Engine</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
            {[
              {
                num: '1',
                title: 'Your Idea',
                desc: 'Describe the meme you want to create in your own words',
                Icon: Lightbulb
              },
              {
                num: '2',
                title: 'Gemini AI Analysis',
                desc: 'Our AI understands your context and generates perfect captions & tags',
                Icon: Cpu
              },
              {
                num: '3',
                title: 'Smart Matching',
                desc: 'System filters templates using generated tags for the best fit',
                Icon: Target
              },
              {
                num: '4',
                title: 'Auto-Layout',
                desc: 'AI applies captions to templates with optimal positioning',
                Icon: Wand2
              },
              {
                num: '5',
                title: 'Your Meme',
                desc: 'Get a ready-to-share meme or edit further in the studio',
                Icon: Gift
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
                  <div className="text-4xl sm:text-5xl text-purple-400"><item.Icon className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 mx-auto" /></div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-400">{item.num}</div>
                  <h3 className="font-bold text-sm md:text-base">{item.title}</h3>
                  <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
                {idx < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-linear-to-r from-purple-500 to-transparent transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 sm:mt-16 p-4 sm:p-6 md:p-8 rounded-2xl bg-linear-to-br from-purple-950/40 to-zinc-950 border border-purple-500/30">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Brain className="w-5 sm:w-6 h-5 sm:h-6 text-purple-400" />
              Behind the Scenes
            </h3>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div>
                <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-purple-300">Context-Aware Processing</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  You describe your meme idea with context. Maybe it's funny, satirical, nostalgic, or trending. The AI understands the nuance and generates appropriate captions that match the vibe.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-purple-300">Intelligent Template Matching</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  The AI generates relevant tags and searches our database for the perfect templates. No more scrolling through hundreds - the system finds what matches your idea instantly.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-purple-300">Gemini API Powered</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  We use Google's Gemini API to understand natural language, generate captions, extract keywords, and make smart suggestions about layout and styling.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-purple-300">Still Your Creative Control</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  The AI creates a draft, but you always have full control. Edit the caption, switch templates, adjust colors - or just download and share instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- EARLY ACCESS --- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-linear-to-b from-zinc-950 to-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-pink-900/30 border border-pink-500/30 text-xs sm:text-sm text-pink-300 mb-6 sm:mb-8">
            <Zap className="w-3 sm:w-4 h-3 sm:h-4" />
            Be Part of the Future
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Want Early Access?
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-6 sm:mb-8">
            Sign up as a member and you might get early access to beta features. Be among the first to test and provide feedback on new tools.
          </p>
          {!user?.is_registered ? (
            <Button 
              size="lg"
              onClick={() => setShowLoginModal(true)}
              className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-lg rounded-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg w-full sm:w-auto inline-flex gap-2"
            >
              Join the Community
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </Button>
          ) : (
            <Button 
              size="lg"
              onClick={() => router.push('/create')}
              className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-lg rounded-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg w-full sm:w-auto inline-flex gap-2"
            >
              Start Creating
              <Rocket className="w-4 sm:w-5 h-4 sm:h-5" />
            </Button>
          )}
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-12 sm:mb-16 text-center">Frequently Asked Questions</h2>

          <div className="space-y-4 sm:space-y-6">
            {[
              {
                q: 'When will these features be available?',
                a: 'Most features are planned for Q1-Q3 2026. We update the timeline as we make progress. Follow us for announcements!'
              },
              {
                q: 'Will these features be free?',
                a: 'Most features will be available to all members. Some advanced features might have additional tiers, but we\'ll keep the core free.'
              },
              {
                q: 'Can I request a feature?',
                a: 'Absolutely! Join our community and suggest features. The more votes a feature gets, the higher priority we give it.'
              },
              {
                q: 'How can I stay updated?',
                a: 'Create an account to get notifications about new feature launches. You can also follow us on social media for announcements.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all">
                <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-white">{item.q}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 text-center bg-linear-to-b from-zinc-950 via-purple-950/20 to-zinc-900">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            The Future Starts Today
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-zinc-400">
            While you wait for new features, start creating amazing memes with our current tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => handleAction('/create')}
              className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-lg rounded-full bg-white text-black hover:bg-zinc-200 font-semibold w-full sm:w-auto"
            >
              Open Studio
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/features')}
              className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-lg rounded-full border-zinc-800 hover:bg-zinc-900 w-full sm:w-auto"
            >
              Explore All Features
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">No credit card required. Start creating for free today.</p>
        </div>
      </section>

    </div>
  );
}
