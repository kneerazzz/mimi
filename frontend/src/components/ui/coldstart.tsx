'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const BOOT_LINES = [
  { delay: 0,    text: 'Booting free-tier instance...'        },
  { delay: 700,  text: 'Connecting to database...'            },
  { delay: 1400, text: 'Waking up server hamsters 🐹'         },
  { delay: 2200, text: 'Injecting caffeine into database ☕'  },
  { delay: 3100, text: 'Convincing free tier to cooperate 💸' },
  { delay: 4000, text: 'Polishing pixels ✨'                  },
  { delay: 4800, text: 'Almost there — pinky promise 🥺'      },
];

export const ColdStartLoader = () => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress]         = useState(0);
  const [cursor, setCursor]             = useState(true);

  useEffect(() => {
    const timers = BOOT_LINES.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), BOOT_LINES[i].delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress(p => p >= 90 ? p : Math.min(p + Math.random() * 8, 90));
    }, 700);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(id);
  }, []);

  const pct    = Math.round(progress);
  const filled = Math.round(progress / 5);

  return (
    <div className="flex items-center justify-center w-full py-16 px-4">
      <div className="w-full max-w-md">

        {/* Terminal window */}
        <div className="rounded-lg overflow-hidden border border-zinc-800">

          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="ml-3 text-[11px] text-zinc-600 font-mono tracking-widest select-none">
              mimi — server boot
            </span>
            <span className="ml-auto text-[10px] text-zinc-600 font-mono">
              free tier
            </span>
          </div>

          {/* Body */}
          <div className="bg-zinc-950 px-5 py-4 font-mono text-[12px] sm:text-[13px] leading-relaxed min-h-60">

            <p className="text-zinc-700 mb-4 text-[11px]">
              Last login: {new Date().toDateString()}
            </p>

            {/* Boot lines */}
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} className="flex items-start gap-3 mb-1.5">
                <span className="text-zinc-600 shrink-0">›</span>
                <span className="text-zinc-400">{line.text}</span>
              </div>
            ))}

            {/* Blinking cursor */}
            {visibleLines < BOOT_LINES.length && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-zinc-600">›</span>
                <span
                  className="inline-block w-1.75 h-3,25 bg-zinc-500 transition-opacity duration-75"
                  style={{ opacity: cursor ? 1 : 0 }}
                />
              </div>
            )}

            {/* Progress bar */}
            <div className="mt-6 border-t border-zinc-800 pt-4">
              <div className="flex items-center gap-3">
                <span className="text-zinc-600 text-[11px] shrink-0">boot</span>
                <div className="flex-1 bg-zinc-800 rounded-full h-0.75 overflow-hidden">
                  <div
                    className="h-full bg-zinc-400 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-zinc-500 text-[11px] w-8 text-right">{pct}%</span>
              </div>
            </div>

            {/* Note */}
            <p className="text-zinc-700 text-[11px] mt-4">
              # render free tier spins down after inactivity. first load ~30–50s
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <Link href="/features" className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-900 hover:text-zinc-200 hover:border-zinc-700"
            >
              Read features while waiting
            </Button>
          </Link>
          <Button
            disabled
            size="sm"
            className="flex-1 text-xs bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
          >
            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
            Server booting...
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ColdStartLoader;