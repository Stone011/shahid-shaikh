import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Film,
  Instagram,
  Mail,
  Phone,
  ArrowUp,
  Sliders,
  ShieldCheck,
  Heart,
  Sparkles,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { data, isAuthenticated, openCustomize } = usePortfolio();
  const { general, contact } = data;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const s = data.sections || {
    hero: true,
    about: true,
    videoEditing: true,
    photography: true,
    shootServices: true,
    videoDirection: true,
    mySongs: true,
    experience: true,
    skills: true,
    contact: true,
  };

  const allNavLinks = [
    { label: 'HOME', href: '#home', visible: s.hero !== false },
    { label: 'ABOUT', href: '#about', visible: s.about !== false },
    { label: 'VIDEO SHOWCASE', href: '#video-editing', visible: s.videoEditing !== false },
    { label: 'PHOTOGRAPHY', href: '#photography', visible: s.photography !== false },
    { label: 'SHOOT SERVICES', href: '#shoots', visible: s.shootServices !== false },
    { label: 'VIDEO DIRECTION', href: '#video-direction', visible: s.videoDirection !== false },
    { label: 'MY SONGS', href: '#my-songs', visible: s.mySongs !== false },
    { label: 'EXPERIENCE', href: '#experience', visible: s.experience !== false },
    { label: 'SKILLS', href: '#skills', visible: s.skills !== false },
    { label: 'CONTACT', href: '#contact', visible: s.contact !== false },
  ];

  const navLinks = allNavLinks.filter((l) => l.visible);

  return (
    <footer className="relative bg-[#040406] text-white border-t border-white/[0.08] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        {/* Top Tier: Big Brand Signature & Back to Top */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/[0.08]">
          <div>
            <a href="#home" className="inline-block group">
              <span className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors uppercase">
                {general?.brandName || 'SHAHID SHAIKH'}
              </span>
            </a>
            <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase mt-2">
              Video Editor • Videographer • Photographer • Video Director
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={openCustomize}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-mono text-amber-300 hover:text-amber-200 transition-all cursor-pointer shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAuthenticated ? 'OPEN CMS DASHBOARD' : 'CUSTOMIZE PORTFOLIO'}</span>
            </button>

            <button
              onClick={scrollToTop}
              className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer group"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Middle Tier: Quick Navigation & Direct Links */}
        <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-white/[0.08]">
          <div className="md:col-span-8">
            <div className="text-[11px] font-mono text-amber-400 uppercase tracking-widest mb-4">
              PORTFOLIO CHAPTERS
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="text-xs text-zinc-400 hover:text-amber-300 font-mono transition-colors tracking-wider"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-[11px] font-mono text-amber-400 uppercase tracking-widest mb-2">
                DIRECT INQUIRY
              </div>
              <p className="text-xs text-zinc-300">
                {contact?.email || 'stonegangdestroy8766@gmail.com'}
              </p>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                {contact?.phoneDisplay || '+91 9167567162'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={contact?.instagramUrl || 'https://instagram.com/stone_gang_destroy'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 border border-white/5 transition-all text-xs flex items-center gap-1.5 font-mono"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@{contact?.instagramName || 'stone_gang_destroy'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Credits & CMS Access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 font-mono gap-4">
          <p>© {new Date().getFullYear()} Shahid Shaikh (Stone GD). All rights reserved.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={openCustomize}
              className="text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin CMS</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
