import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Briefcase, Calendar, Building2, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import { ExperienceItem } from '../types';

export const ExperienceSection: React.FC = () => {
  const { data } = usePortfolio();
  const { experiences } = data;

  return (
    <section id="experience" className="relative py-24 sm:py-32 bg-[#09090b] text-white border-t border-white/[0.05]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs tracking-[0.25em] font-semibold uppercase mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>CAREER JOURNEY &amp; STUDIOS</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">
              EXPERIENCE
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-zinc-400 text-xs tracking-[0.18em] uppercase max-w-md md:text-right font-mono">
            Commercial Production Houses &amp; Wedding Studios
          </p>
        </div>

        {/* Timeline Component */}
        <div className="relative">
          {/* Vertical Glowing Line */}
          <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-amber-400 via-amber-500/40 to-transparent" />

          <div className="space-y-12 sm:space-y-16">
            {experiences.map((exp, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={exp.id}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Center Node */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-950 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 z-10">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping opacity-75" />
                    <span className="absolute w-2 h-2 rounded-full bg-amber-300" />
                  </div>

                  {/* Content Box */}
                  <div className="ml-12 sm:ml-0 sm:w-1/2 sm:px-8 w-full">
                    <div className="p-6 sm:p-7 rounded-2xl bg-zinc-950/80 border border-white/[0.08] hover:border-amber-500/40 transition-all duration-300 shadow-xl group">
                      {/* Year Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{exp.year}</span>
                      </div>

                      {/* Company Name & Position */}
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-white group-hover:text-amber-300 transition-colors uppercase">
                        {exp.company}
                      </h3>

                      <div className="text-xs sm:text-sm font-semibold text-zinc-300 uppercase tracking-wide mt-1 mb-4 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{exp.position}</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed mb-4">
                        {exp.description}
                      </p>

                      {/* Highlights */}
                      {exp.highlights && exp.highlights.length > 0 && (
                        <div className="pt-3 border-t border-white/[0.06] space-y-1.5">
                          {exp.highlights.map((hl, hIdx) => (
                            <div key={hIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                              <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
