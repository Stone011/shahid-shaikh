import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Menu, X, Sliders, LogOut, RotateCcw, RotateCw, Eye, ShieldCheck, Search } from 'lucide-react';
import { GlobalSearchModal } from './common/GlobalSearchModal';

interface NavbarProps {
  onOpenCustomize?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCustomize }) => {
  const {
    data,
    isAuthenticated,
    isAdminView,
    setIsAdminView,
    requestExitCMS,
    openCustomize,
    logout,
    canUndo,
    canRedo,
    undo,
    redo,
    undoCount,
    redoCount,
    hasUnsavedChanges,
  } = usePortfolio();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleCustomizeClick = () => {
    if (onOpenCustomize) {
      onOpenCustomize();
    } else {
      openCustomize();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Track active section for nav highlight
      const sections = ['home', 'about', 'video-editing', 'photography', 'shoots', 'video-direction', 'my-songs', 'experience', 'skills', 'contact'];
      const current = sections.find((sec) => {
        const el = document.getElementById(sec);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 200 && rect.bottom >= 200;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { label: 'HOME', href: '#home', id: 'home', visible: s.hero !== false },
    { label: 'ABOUT', href: '#about', id: 'about', visible: s.about !== false },
    { label: 'VIDEO', href: '#video-editing', id: 'video-editing', visible: s.videoEditing !== false },
    { label: 'PHOTO', href: '#photography', id: 'photography', visible: s.photography !== false },
    { label: 'SHOOT', href: '#shoots', id: 'shoots', visible: s.shootServices !== false },
    { label: 'DIRECTION', href: '#video-direction', id: 'video-direction', visible: s.videoDirection !== false },
    { label: 'MY SONGS', href: '#my-songs', id: 'my-songs', visible: s.mySongs !== false },
    { label: 'EXPERIENCE', href: '#experience', id: 'experience', visible: s.experience !== false },
    { label: 'CONTACT', href: '#contact', id: 'contact', visible: s.contact !== false },
  ];

  const navLinks = allNavLinks.filter((l) => l.visible);

  return (
    <>
      {/* Top Admin Status Bar if logged in */}
      {isAuthenticated && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 border-b border-amber-500/30 backdrop-blur-xl py-1.5 px-4 text-xs flex items-center justify-between text-amber-300 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold tracking-wider text-[11px] sm:text-xs">ADMIN MODE</span>
            <span className="text-zinc-400 hidden md:inline text-[11px]">— Instant Live Edit Active</span>

            {/* Quick Undo / Redo buttons right in top bar */}
            <div className="flex items-center gap-1 ml-1 sm:ml-3 pl-2 border-l border-white/10">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-300 text-[11px] font-mono transition-colors cursor-pointer disabled:cursor-not-allowed"
                title={`Undo (Ctrl+Z) - ${undoCount} steps`}
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Undo</span>
                {undoCount > 0 && <span className="text-[10px] text-amber-400">({undoCount})</span>}
              </button>

              <button
                onClick={redo}
                disabled={!canRedo}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-300 text-[11px] font-mono transition-colors cursor-pointer disabled:cursor-not-allowed"
                title={`Redo (Ctrl+Y) - ${redoCount} steps`}
              >
                <RotateCw className="w-3 h-3" />
                <span className="hidden sm:inline">Redo</span>
                {redoCount > 0 && <span className="text-[10px] text-amber-400">({redoCount})</span>}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {hasUnsavedChanges && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved edits
              </span>
            )}
            <button
              onClick={() => {
                if (isAdminView) {
                  requestExitCMS();
                } else {
                  setIsAdminView(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              {isAdminView ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Website</span>
                </>
              ) : (
                <>
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Open CMS Dashboard</span>
                </>
              )}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1 px-2 py-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      )}

      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          isAuthenticated ? 'top-9' : 'top-0'
        } ${
          scrolled
            ? 'bg-[#09090b]/85 backdrop-blur-xl border-b border-white/[0.06] py-3.5 shadow-2xl shadow-black/50'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo / Brand Name */}
          <a
            href="#home"
            className="group flex flex-col items-start focus:outline-none"
            aria-label="Shahid Shaikh Home"
          >
            <div className="flex items-center gap-2">
              <span className="font-brand-cinematic tracking-[0.16em] text-lg sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors duration-300">
                {data.general?.brandName || 'SHAHID SHAIKH'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-150 transition-transform duration-300" />
            </div>
            <span className="text-[10px] tracking-[0.24em] text-zinc-400 uppercase font-medium">
              Video Editor • Director • Storyteller
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`text-xs tracking-[0.18em] font-medium transition-all duration-200 relative py-1 ${
                    isActive
                      ? 'text-amber-400 font-semibold'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Icons & Subtle Customize Trigger */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Global Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="group flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-amber-500/40 text-zinc-300 hover:text-white text-[11px] sm:text-xs transition-all duration-300 cursor-pointer"
              title="Search portfolio (Ctrl+K / Cmd+K)"
              aria-label="Search portfolio"
              id="navbar-global-search-btn"
            >
              <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.2 bg-zinc-800 text-[9px] font-mono text-zinc-400 rounded border border-zinc-700">⌘K</kbd>
            </button>

            {/* Direct 100% Working Customize Button */}
            <button
              onClick={handleCustomizeClick}
              className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-200 hover:text-amber-300 text-[11px] tracking-wider font-semibold transition-all duration-300 cursor-pointer shadow-sm shadow-amber-500/5 hover:shadow-amber-500/20"
              title="Customize Portfolio (Admin Mode)"
              aria-label="Customize Portfolio"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              <span>CUSTOMIZE</span>
            </button>

            {/* Direct Contact Button */}
            {s.contact !== false && (
              <a
                href="#contact"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-bold tracking-wider transition-all duration-300 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25"
              >
                HIRE ME
              </a>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-300 hover:text-white focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#09090b]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Search Portfolio</span>
                </span>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 text-[10px] text-zinc-400 rounded">⌘K</kbd>
              </button>

              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm tracking-[0.2em] font-medium py-1 transition-colors ${
                    activeSection === link.id ? 'text-amber-400 font-bold' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                {s.contact !== false && (
                  <a
                    href="#contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wider transition-colors"
                  >
                    LET'S CONNECT
                  </a>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleCustomizeClick();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs tracking-wider text-amber-200 hover:text-white font-bold"
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                  CUSTOMIZE PORTFOLIO (CMS)
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
};
