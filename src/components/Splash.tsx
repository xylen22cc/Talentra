import { useEffect, useRef } from 'react';
import { Briefcase, ShieldCheck, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useLanguage } from '../LanguageContext';

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    // 2.2 seconds timer for exit completed state
    const timer = setTimeout(onComplete, 2250);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // Holographic splash intro staggering
      tl.fromTo('.gsap-splash-bg', 
        { scale: 0.7, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 1.5, ease: 'back.out(1.2)' }
      )
      .fromTo('.gsap-splash-logo', 
        { scale: 0.1, opacity: 0, rotate: -180 }, 
        { scale: 1, opacity: 1, rotate: 0, duration: 1.2, ease: 'elastic.out(1, 0.7)' },
        '-=1.2'
      )
      .fromTo('.gsap-splash-title', 
        { y: 24, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8 }, 
        '-=0.8'
      )
      .fromTo('.gsap-splash-desc', 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.7 }, 
        '-=0.65'
      )
      .fromTo('.gsap-splash-line', 
        { scaleX: 0, opacity: 0 }, 
        { scaleX: 1, opacity: 1, duration: 0.8, transformOrigin: 'left center' }, 
        '-=0.5'
      )
      .fromTo('.gsap-splash-feature', 
        { y: 12, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 }, 
        '-=0.4'
      );

      // Exit fade and fly-up animation just before complete trigger
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.45,
        delay: 1.85,
        ease: 'power3.in',
      });
    }, containerRef);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      id="splash-screen" 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden"
    >
      {/* Background ambient pulse */}
      <div className="gsap-splash-bg absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
      
      <div className="relative flex flex-col items-center">
        {/* Animated logo badge container */}
        <div
          className="gsap-splash-logo relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.3)]"
        >
          <Briefcase className="w-12 h-12 text-white" />
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
          </div>
        </div>

        {/* Text transition */}
        <h1
          className="gsap-splash-title mt-6 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400"
        >
          TALENTRA
        </h1>

        <p
          className="gsap-splash-desc mt-2 text-xs font-mono tracking-widest text-indigo-400 uppercase"
        >
          AI-POWERED RECRUITMENT SAAS
        </p>

        {/* Dynamic loader line */}
        <div className="gsap-splash-line mt-8 w-48 h-1 bg-slate-800 rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-505 to-cyan-404 animation-scan h-full rounded-full" style={{ width: '100%' }}>
            <div className="w-full h-full bg-indigo-550 animate-pulse" />
          </div>
        </div>

        {/* Feature quick lists */}
        <div
          className="mt-12 flex items-center gap-6 text-xs text-slate-500"
        >
          <span className="gsap-splash-feature flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" /> {lang === 'id' ? 'Sistem Deteksi Loker Palsu' : 'Fake Job Guard'}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
          <span className="gsap-splash-feature flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-500/80" /> {lang === 'id' ? 'Evaluasi Resume AI' : 'Resume Evaluator'}
          </span>
        </div>
      </div>
    </div>
  );
}
