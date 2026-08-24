import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Play, ArrowDown, Sparkles, Film, Camera, Clapperboard, ChevronRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const { data } = usePortfolio();
  const { hero } = data;

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#09090b] pt-20"
    >
      {/* Background Cinematic Image with slow zoom animation & dark gradient overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={hero.backgroundImage || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=2000&auto=format&fit=crop'}
          alt="Cinematic Background"
          className="w-full h-full object-cover object-center animate-slow-zoom scale-105 filter brightness-[0.42] contrast-[1.12]"
        />
        {/* Multi-layered cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/50 to-[#09090b]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/90 via-transparent to-[#09090b]/90" />
        <div className="absolute inset-0 film-grain opacity-40 pointer-events-none" />

        {/* Ambient subtle warm amber spotlight behind text */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center flex flex-col items-center justify-center">
        {/* Top subtle badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-amber-500/30 backdrop-blur-md mb-8 sm:mb-10 text-amber-300 text-xs tracking-[0.2em] font-medium animate-in fade-in slide-in-from-bottom-2 duration-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span className="uppercase">{hero.statusBadge || 'Available for Directorial Commissions & Editing'}</span>
        </div>

        {/* Main Name Heading with Editorial Display Typography */}
        <div className="relative mb-4 sm:mb-6">
          <h1 className="font-brand-cinematic text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[0.16em] sm:tracking-[0.18em] text-white uppercase drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] selection:bg-amber-500/40">
            {hero.name || 'SHAHID SHAIKH'}
          </h1>
          {/* Subtle Anamorphic horizontal lens flare underline */}
          <div className="w-48 sm:w-80 h-[1.5px] mx-auto mt-4 lens-flare-line opacity-75" />
        </div>

        {/* Primary Subtitle & Roles */}
        <div className="space-y-3 mb-6 sm:mb-8 max-w-3xl">
          <h2 className="font-serif-luxury text-xl sm:text-2xl md:text-3xl text-amber-200/90 font-medium tracking-[0.15em] uppercase">
            {hero.tagline || 'Professional Video Editor'}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-zinc-400 tracking-[0.3em] uppercase font-light flex items-center justify-center flex-wrap gap-x-3 gap-y-1">
            {hero.subRoles && hero.subRoles.length > 0 ? (
              hero.subRoles.map((role, idx) => (
                <React.Fragment key={idx}>
                  <span className="hover:text-zinc-200 transition-colors">{role}</span>
                  {idx < hero.subRoles.length - 1 && (
                    <span className="text-amber-500/60 font-bold">•</span>
                  )}
                </React.Fragment>
              ))
            ) : (
              <>
                <span>Videographer</span>
                <span className="text-amber-500/60 font-bold">•</span>
                <span>Photographer</span>
                <span className="text-amber-500/60 font-bold">•</span>
                <span>Video Director</span>
              </>
            )}
          </p>
        </div>

        {/* Short Premium Introduction Quote */}
        <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-12 italic">
          "{hero.bioQuote || 'Crafting cinematic stories through editing, visuals, sound and direction.'}"
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto">
          <a
            href={hero.ctaPrimaryLink || '#video-editing'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs sm:text-sm tracking-[0.15em] uppercase transition-all duration-300 shadow-xl shadow-amber-500/20 hover:scale-[1.03] cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{hero.ctaPrimaryText || 'VIEW MY WORK'}</span>
          </a>

          <a
            href={hero.ctaSecondaryLink || '#contact'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/15 hover:border-white/30 text-white font-medium text-xs sm:text-sm tracking-[0.15em] uppercase transition-all duration-300 backdrop-blur-sm cursor-pointer"
          >
            <span>{hero.ctaSecondaryText || 'CONTACT ME'}</span>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </a>
        </div>

        {/* Highlights Bar underneath buttons */}
        <div className="mt-14 sm:mt-16 pt-8 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 w-full max-w-3xl text-center">
          <div>
            <div className="text-xl sm:text-2xl font-bold font-display text-white">5+</div>
            <div className="text-[11px] tracking-widest text-zinc-400 uppercase mt-0.5">Years Exp.</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-display text-amber-400">1K+</div>
            <div className="text-[11px] tracking-widest text-zinc-400 uppercase mt-0.5">Video Editing</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-display text-white">5000+</div>
            <div className="text-[11px] tracking-widest text-zinc-400 uppercase mt-0.5">Social &amp; Reels</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-display text-amber-400">80+</div>
            <div className="text-[11px] tracking-widest text-zinc-400 uppercase mt-0.5">Story Writing</div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <a
        href="#about"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer group"
        aria-label="Scroll to About section"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase font-medium group-hover:tracking-[0.3em] transition-all">
          SCROLL
        </span>
        <ArrowDown className="w-4 h-4 animate-bounce text-amber-400/80" />
      </a>
    </section>
  );
};
