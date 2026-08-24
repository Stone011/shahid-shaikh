import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Clapperboard, Play, Film, Sparkles, User, ExternalLink, Calendar, Compass } from 'lucide-react';
import { DirectionProject } from '../types';

export const VideoDirectionSection: React.FC = () => {
  const { data, openVideoModal } = usePortfolio();
  const { directionProjects } = data;

  const handleWatchClick = (project: DirectionProject, e: React.MouseEvent) => {
    e.preventDefault();
    if (project.videoUrl) {
      openVideoModal(project.videoUrl, project.title, `Direction • ${project.category}`);
    }
  };

  return (
    <section id="video-direction" className="relative py-24 sm:py-32 bg-[#09090b] text-white border-t border-white/[0.05]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-10 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs tracking-[0.25em] font-semibold uppercase mb-2">
              <Clapperboard className="w-3.5 h-3.5" />
              <span>DIRECTORIAL VISION &amp; NARRATIVE</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">
              VIDEO DIRECTION
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-zinc-400 text-xs tracking-[0.18em] uppercase max-w-md md:text-right font-mono">
            Directing Emotional Beats • Camera Staging • Visual Metaphors
          </p>
        </div>

        {/* Narrative Banner: Directorial Philosophy */}
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/30 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
            <Clapperboard className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>DIRECTOR'S STATEMENT</span>
            </div>
            <h3 className="font-serif-luxury text-xl sm:text-2xl text-white font-medium mb-3">
              "Direction is the art of giving emotional shape to time."
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
              Beyond editing in post-production, I direct short films, music videos, and commercial concepts from initial script treatment to on-set blocking, lighting mood, and actor pacing — ensuring the thematic core is carried from script to final color grade.
            </p>
          </div>
        </div>

        {/* Directorial Projects Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {directionProjects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-950/90 border border-white/[0.08] hover:border-amber-500/40 transition-all duration-500 shadow-2xl hover:shadow-amber-500/10"
            >
              {/* Cinematic Thumbnail with Play Action */}
              <div
                className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900 cursor-pointer"
                onClick={(e) => handleWatchClick(project, e)}
              >
                <img
                  src={project.thumbnail || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop'}
                  alt={project.title}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-108 filter brightness-[0.85] group-hover:brightness-75"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                {/* Top Category Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono font-medium text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                    {project.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10">
                    {project.year || '2025'}
                  </span>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-110 group-hover:bg-amber-400 transition-all duration-300">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>

                {/* Project Title overlay at bottom of thumbnail */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white group-hover:text-amber-300 transition-colors uppercase">
                    {project.title}
                  </h3>
                </div>
              </div>

              {/* Body & Credits Area */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                    {project.description}
                  </p>

                  {/* Directorial Concept Statement */}
                  {project.concept && (
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300 font-light italic">
                      <span className="font-semibold text-amber-400 not-italic uppercase font-mono mr-1">Concept:</span>
                      "{project.concept}"
                    </div>
                  )}

                  {/* Production Credits Breakdown */}
                  {project.credits && (
                    <div className="pt-3 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      {project.credits.director && (
                        <div>
                          <div className="text-[10px] font-mono text-zinc-400 uppercase">Director</div>
                          <div className="text-zinc-200 font-medium">{project.credits.director}</div>
                        </div>
                      )}
                      {project.credits.dop && (
                        <div>
                          <div className="text-[10px] font-mono text-zinc-400 uppercase">Cinematography</div>
                          <div className="text-zinc-200 font-medium">{project.credits.dop}</div>
                        </div>
                      )}
                      {project.credits.editor && (
                        <div>
                          <div className="text-[10px] font-mono text-zinc-400 uppercase">Editing / Grade</div>
                          <div className="text-zinc-200 font-medium">{project.credits.editor}</div>
                        </div>
                      )}
                      {project.credits.client && (
                        <div>
                          <div className="text-[10px] font-mono text-zinc-400 uppercase">Client / Prod</div>
                          <div className="text-zinc-200 font-medium">{project.credits.client}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom CTA Action Button */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={(e) => handleWatchClick(project, e)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 text-xs font-bold tracking-wider uppercase transition-all duration-300 border border-amber-500/30 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>VIEW PROJECT</span>
                  </button>

                  {project.videoUrl && (
                    <a
                      href={project.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                    >
                      <span>External Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
