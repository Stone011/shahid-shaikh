import React, { useState } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { VideoEditingSection } from './components/VideoEditingSection';
import { PhotographySection } from './components/PhotographySection';
import { ShootServicesSection } from './components/ShootServicesSection';
import { VideoDirectionSection } from './components/VideoDirectionSection';
import { MySongsSection } from './components/MySongsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { SkillsSection } from './components/SkillsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { VideoModal } from './components/VideoModal';
import { PhotoLightbox } from './components/PhotoLightbox';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Sliders, RotateCcw, RotateCw, Eye, Sparkles, Layers, Shield } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    data,
    isAdminView,
    setIsAdminView,
    openCustomize,
    isAuthenticated,
    canUndo,
    canRedo,
    undo,
    redo,
    undoCount,
    redoCount,
  } = usePortfolio();

  if (isAdminView) {
    return <AdminDashboard />;
  }

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

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 selection:bg-amber-500 selection:text-zinc-950 relative">
      {/* Navigation */}
      <Navbar />

      {/* Main Sections with Visibility Controls */}
      <main>
        {/* 1. Hero & Reels Spotlight */}
        {s.hero !== false && <Hero />}

        {/* 2. About Me & Editorial Profile */}
        {s.about !== false && <AboutSection />}

        {/* 3. Video Showcase: Wedding Films, Cinematic, Trailers, Teasers, 9:16 Reels */}
        {s.videoEditing !== false && <VideoEditingSection />}

        {/* 4. Photography Masonry Gallery */}
        {s.photography !== false && <PhotographySection />}

        {/* 5. On-Location Shoot Services */}
        {s.shootServices !== false && <ShootServicesSection />}

        {/* 6. Video Direction & Concept Films */}
        {s.videoDirection !== false && <VideoDirectionSection />}

        {/* 7. My Songs & Music Discography */}
        {s.mySongs !== false && <MySongsSection />}

        {/* 8. Career Experience Timeline */}
        {s.experience !== false && <ExperienceSection />}

        {/* 9. Creative Skills & Software Suite */}
        {s.skills !== false && <SkillsSection />}

        {/* 10. Contact & Project Inquiries */}
        {s.contact !== false && <ContactSection />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Persistent Floating Quick Customize & Undo/Redo Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-zinc-950/90 border border-amber-500/30 backdrop-blur-xl p-1.5 rounded-full shadow-2xl shadow-black/80 hover:border-amber-500/60 transition-all duration-300">
        {/* Undo Button */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-300 hover:text-white disabled:hover:text-zinc-300 text-xs font-mono transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
          title={`Undo (Ctrl+Z) — ${undoCount} actions recorded`}
          aria-label="Undo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {undoCount > 0 && <span className="text-[10px] text-amber-400 font-bold hidden sm:inline">{undoCount}</span>}
        </button>

        {/* Redo Button */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-300 hover:text-white disabled:hover:text-zinc-300 text-xs font-mono transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
          title={`Redo (Ctrl+Y / Ctrl+Shift+Z) — ${redoCount} actions available`}
          aria-label="Redo"
        >
          <RotateCw className="w-3.5 h-3.5" />
          {redoCount > 0 && <span className="text-[10px] text-amber-400 font-bold hidden sm:inline">{redoCount}</span>}
        </button>

        {/* Main Customize Button */}
        <button
          onClick={openCustomize}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-lg shadow-amber-500/20 cursor-pointer"
          title="Open Customization Dashboard (CMS)"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>CUSTOMIZE</span>
        </button>
      </div>

      {/* Global Interactive Modals */}
      <VideoModal />
      <PhotoLightbox />
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <MainContent />
    </PortfolioProvider>
  );
}
