import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { CheckCircle2, Award, Clapperboard, Sparkles, Film, Disc } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { data } = usePortfolio();
  const { about } = data;

  return (
    <section id="about" className="relative py-24 sm:py-32 bg-[#09090b] text-white border-t border-white/[0.05]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-zinc-700/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs tracking-[0.25em] font-semibold uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE STORYTELLER</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">
              {about.title || 'ABOUT ME'}
            </h2>
          </div>
          <div className="mt-4 md:mt-0 text-zinc-400 text-xs tracking-[0.2em] uppercase font-mono">
            {about.headline || 'Creative Video Professional & Visual Storyteller'}
          </div>
        </div>

        {/* Main Grid: Editorial Layout inspired by Reference 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Portrait & Film Still Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Portrait Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 aspect-[4/5] group">
                <img
                  src={about.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop'}
                  alt="Shahid Shaikh - Video Editor & Director"
                  className="w-full h-full object-cover object-center filter grayscale contrast-[1.1] hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs font-mono tracking-widest text-amber-400 uppercase">Director • Editor • Storyteller</div>
                  <div className="font-brand-cinematic text-xl font-bold text-white uppercase mt-0.5 tracking-wider">Shahid Shaikh</div>
                  <div className="text-xs text-zinc-400">Based in Mumbai, India</div>
                </div>
              </div>

              {/* Floating Experience Badge */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-zinc-950/95 border border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-2xl backdrop-blur-xl max-w-[210px]">
                <div className="font-display text-3xl font-extrabold text-amber-400">5+</div>
                <div className="text-xs font-semibold text-white uppercase tracking-wider mt-0.5">
                  Years Experience
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">Video Editing &amp; Storytelling</div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Stats */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            {/* Paragraphs */}
            <div className="space-y-5 text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
              {about.paragraphs && about.paragraphs.length > 0 ? (
                about.paragraphs.map((p, idx) => (
                  <p key={idx} className={idx === 0 ? 'text-lg sm:text-xl font-normal text-white' : ''}>
                    {p}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-lg sm:text-xl font-normal text-white">
                    I’m Shahid Shaikh — a multidisciplinary creative professional, video editor, video director, story writer, songwriter, and cinematic filmmaker with over 5 years of hands-on industry experience.
                  </p>
                  <p>
                    My creative work spans commercial video editing, social media content, high-retention reels, podcasts, short-form videos, cinematic visual projects, storytelling, video direction, photography, and wedding films.
                  </p>
                  <p>
                    Whether sculpting the pacing and rhythm of a narrative cut, writing a story script, penning song lyrics, directing visual concepts on set, or delivering engaging short-form edits, I focus on creating work that captivates, connects, and resonates with audiences.
                  </p>
                </>
              )}
            </div>

            {/* Philosophy quote */}
            {about.philosophyQuote && (
              <div className="p-4 sm:p-5 rounded-xl bg-white/[0.03] border-l-2 border-amber-500 border-y border-r border-white/5 text-sm sm:text-base italic text-zinc-300">
                "{about.philosophyQuote}"
              </div>
            )}

            {/* Creative Statistics Grid */}
            <div className="pt-6 border-t border-white/[0.08]">
              <div className="text-xs tracking-[0.2em] font-mono text-zinc-400 uppercase mb-4">
                EXPERIENCE &amp; PRODUCTION METRICS
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {about.stats && about.stats.length > 0 ? (
                  about.stats.map((stat) => (
                    <div
                      key={stat.id}
                      className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.06] hover:border-amber-500/30 transition-colors group"
                    >
                      <div className="font-display text-2xl sm:text-3xl font-extrabold text-white group-hover:text-amber-400 transition-colors">
                        {stat.number}
                      </div>
                      <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mt-1">
                        {stat.label}
                      </div>
                      {stat.subtext && (
                        <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{stat.subtext}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.06]">
                      <div className="font-display text-2xl font-bold text-amber-400">5+</div>
                      <div className="text-xs text-zinc-300 mt-1 uppercase">Years Experience</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.06]">
                      <div className="font-display text-2xl font-bold text-white">1K+</div>
                      <div className="text-xs text-zinc-300 mt-1 uppercase">Video Editing</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.06]">
                      <div className="font-display text-2xl font-bold text-white">5000+</div>
                      <div className="text-xs text-zinc-300 mt-1 uppercase">Social Media &amp; Reels</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
