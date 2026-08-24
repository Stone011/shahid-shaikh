import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Video, Camera, ArrowRight, CheckCircle2, Clock, Sparkles, PhoneCall } from 'lucide-react';
import { ShootService } from '../types';

export const ShootServicesSection: React.FC = () => {
  const { data } = usePortfolio();
  const { shootServices } = data;

  return (
    <section id="shoots" className="relative py-24 sm:py-32 bg-[#09090b] text-white border-t border-white/[0.05]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs tracking-[0.25em] font-semibold uppercase mb-2">
              <Video className="w-3.5 h-3.5" />
              <span>ON-LOCATION &amp; STUDIO PRODUCTION</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">
              VIDEO &amp; PHOTO SHOOT
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-zinc-400 text-xs tracking-[0.18em] uppercase max-w-md md:text-right font-mono">
            Full-Spectrum Visual Production &amp; Cinematography Services
          </p>
        </div>

        {/* Shoot Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shootServices.map((shoot, index) => (
            <div
              key={shoot.id}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-zinc-950/80 border border-white/[0.08] hover:border-amber-500/40 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10"
            >
              {/* Image banner */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
                <img
                  src={shoot.imageUrl || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1000&auto=format&fit=crop'}
                  alt={shoot.title}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-108 filter brightness-[0.85] group-hover:brightness-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Category Pill */}
                {shoot.category && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                      {shoot.category}
                    </span>
                  </div>
                )}

                {/* Service Title on image bottom */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-amber-300 transition-colors uppercase">
                    {shoot.title}
                  </h3>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                  {shoot.description}
                </p>

                {/* Deliverables checklist */}
                {shoot.deliverables && shoot.deliverables.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                      Key Deliverables:
                    </div>
                    {shoot.deliverables.map((item, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Turnaround / Booking CTA */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  {shoot.turnaround ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{shoot.turnaround}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-amber-400">Custom Production</span>
                  )}

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1 text-xs font-bold tracking-wider text-amber-400 group-hover:text-amber-300 uppercase transition-colors"
                  >
                    <span>BOOK SHOOT</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
