import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Sparkles, Sliders, Check, Film, Layers, Palette, Volume2, Video, Camera, Clapperboard, Award } from 'lucide-react';

export const SkillsSection: React.FC = () => {
  const { data } = usePortfolio();
  const { skills } = data;

  const getSkillIcon = (skill: string) => {
    const s = skill.toLowerCase();
    if (s.includes('color') || s.includes('grading')) return <Palette className="w-4 h-4 text-amber-400" />;
    if (s.includes('sound') || s.includes('audio')) return <Volume2 className="w-4 h-4 text-amber-400" />;
    if (s.includes('direction')) return <Clapperboard className="w-4 h-4 text-amber-400" />;
    if (s.includes('photo')) return <Camera className="w-4 h-4 text-amber-400" />;
    if (s.includes('video') || s.includes('premiere')) return <Film className="w-4 h-4 text-amber-400" />;
    return <Layers className="w-4 h-4 text-amber-400" />;
  };

  return (
    <section id="skills" className="relative py-24 sm:py-32 bg-[#09090b] text-white border-t border-white/[0.05]">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs tracking-[0.25em] font-semibold uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CORE TOOLKIT &amp; PROFICIENCIES</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">
              CREATIVE SKILLS
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-zinc-400 text-xs tracking-[0.18em] uppercase max-w-md md:text-right font-mono">
            Crafting Rhythm, Tone &amp; Cinematic Nuance
          </p>
        </div>

        {/* Typographic Visual Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="group p-5 sm:p-6 rounded-2xl bg-zinc-950/70 border border-white/[0.07] hover:border-amber-500/50 hover:bg-zinc-900/90 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-xl hover:shadow-amber-500/10 cursor-default"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] group-hover:bg-amber-500/20 border border-white/[0.08] group-hover:border-amber-500/40 flex items-center justify-center transition-colors">
                  {getSkillIcon(skill)}
                </div>
                <span className="text-[10px] font-mono text-zinc-400 group-hover:text-amber-300 uppercase">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              </div>

              <div>
                <h3 className="font-display text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                  {skill}
                </h3>
                <div className="w-6 h-[1.5px] bg-white/20 group-hover:w-12 group-hover:bg-amber-400 transition-all duration-300 mt-2" />
              </div>
            </div>
          ))}
        </div>

        {/* Software Suite Badges */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-zinc-950/80 border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-1">
              PRIMARY SUITE &amp; POST PIPELINE
            </div>
            <h4 className="font-display text-lg font-bold text-white uppercase">
              Adobe Premiere Pro • DaVinci Resolve Studio • After Effects
            </h4>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-300">
              ProRes 4444 / RAW
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-300">
              Dolby 5.1 Mix Ready
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
