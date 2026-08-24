import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  Search,
  X,
  Film,
  Camera,
  Music,
  Folder,
  Briefcase,
  Wrench,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Tag,
  Clock,
  Compass,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type SearchResultType = 'video' | 'photo' | 'song' | 'catalog' | 'service' | 'direction' | 'experience' | 'skill';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  targetAnchor?: string;
  payload?: any;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const {
    data,
    draftData,
    isAdminView,
    openVideoModal,
    openLightbox,
  } = usePortfolio();

  const activeData = draftData || data;
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | SearchResultType>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K and Escape listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute search index across all content
  const allIndexedItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // 1. Video Projects
    if (Array.isArray(activeData.videoProjects)) {
      activeData.videoProjects.forEach((p) => {
        items.push({
          id: `video-${p.id}`,
          type: 'video',
          title: p.title,
          subtitle: p.client ? `Client: ${p.client} • ${p.category}` : p.category,
          description: p.description,
          category: p.category,
          imageUrl: p.thumbnail,
          targetAnchor: '#video-editing',
          payload: p,
        });
      });
    }

    // 2. Photography Items
    if (Array.isArray(activeData.photography)) {
      activeData.photography.forEach((p) => {
        items.push({
          id: `photo-${p.id}`,
          type: 'photo',
          title: p.title,
          subtitle: p.location ? `${p.location} • ${p.category}` : p.category,
          description: p.description,
          category: p.category,
          imageUrl: p.imageUrl,
          targetAnchor: '#photography',
          payload: p,
        });
      });
    }

    // 3. Songs (YouTube, Spotify, Audio Tracks, All Songs)
    if (activeData.songs) {
      const songPool = [
        ...(activeData.songs.youtubeSongs || []),
        ...(activeData.songs.spotifySongs || []),
        ...(activeData.songs.audioTracks || []),
        ...(activeData.songs.allSongs || []),
      ];
      const seenSongIds = new Set<string>();
      songPool.forEach((s) => {
        if (!seenSongIds.has(s.id)) {
          seenSongIds.add(s.id);
          items.push({
            id: `song-${s.id}`,
            type: 'song',
            title: s.title,
            subtitle: s.artist ? `Artist: ${s.artist} • ${s.category || s.genre || 'Song'}` : s.genre || 'Music',
            description: s.description,
            category: s.category || s.genre,
            imageUrl: s.thumbnailUrl,
            targetAnchor: '#my-songs',
            payload: s,
          });
        }
      });
    }

    // 4. Catalogs & Categories
    const catalogEntries = new Set<string>();
    const registerCat = (name: string, typeDesc: string, targetAnchor: string) => {
      if (!name || name.trim().toLowerCase() === 'uncategorized') return;
      const key = `${name.toLowerCase()}--${typeDesc}`;
      if (!catalogEntries.has(key)) {
        catalogEntries.add(key);
        items.push({
          id: `cat-${key}`,
          type: 'catalog',
          title: name.trim(),
          subtitle: `${typeDesc} Folder / Category`,
          targetAnchor,
          category: name.trim(),
        });
      }
    };

    if (Array.isArray(activeData.videoCatalogues)) {
      activeData.videoCatalogues.forEach((c) => registerCat(c, 'Video Catalog', '#video-editing'));
    }
    if (Array.isArray(activeData.photoCatalogues)) {
      activeData.photoCatalogues.forEach((c) => registerCat(c, 'Photography Catalog', '#photography'));
    }
    if (Array.isArray(activeData.songCatalogues)) {
      activeData.songCatalogues.forEach((c) => registerCat(c, 'Song Catalog', '#my-songs'));
    }
    if (Array.isArray(activeData.globalCatalogues)) {
      activeData.globalCatalogues.forEach((c) => registerCat(c, 'Global Catalog', '#video-editing'));
    }

    // 5. Shoot Services
    if (Array.isArray(activeData.shootServices)) {
      activeData.shootServices.forEach((s) => {
        items.push({
          id: `shoot-${s.id}`,
          type: 'service',
          title: s.title,
          subtitle: s.category || 'Production & Shoot Service',
          description: s.description,
          imageUrl: s.imageUrl,
          targetAnchor: '#shoots',
          payload: s,
        });
      });
    }

    // 6. Video Direction Projects
    if (Array.isArray(activeData.directionProjects)) {
      activeData.directionProjects.forEach((d) => {
        items.push({
          id: `direction-${d.id}`,
          type: 'direction',
          title: d.title,
          subtitle: d.role ? `Role: ${d.role} • ${d.category || 'Direction'}` : d.category || 'Direction',
          description: d.description,
          imageUrl: d.thumbnail,
          targetAnchor: '#video-direction',
          payload: d,
        });
      });
    }

    // 7. Experience / Timeline
    if (Array.isArray(activeData.timeline)) {
      activeData.timeline.forEach((t) => {
        items.push({
          id: `exp-${t.id}`,
          type: 'experience',
          title: `${t.role} at ${t.company}`,
          subtitle: `${t.period} • ${t.category || 'Career Experience'}`,
          description: t.description,
          targetAnchor: '#experience',
          payload: t,
        });
      });
    }

    // 8. Skills & Tools
    if (Array.isArray(activeData.skills)) {
      activeData.skills.forEach((sk) => {
        items.push({
          id: `skill-${sk.id}`,
          type: 'skill',
          title: sk.name,
          subtitle: `${sk.category} • Proficiency: ${sk.level}%`,
          targetAnchor: '#skills',
          payload: sk,
        });
      });
    }

    return items;
  }, [activeData]);

  // Filter items based on query and activeFilter
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allIndexedItems.filter((item) => {
      if (activeFilter !== 'all' && item.type !== activeFilter) {
        return false;
      }
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const subMatch = item.subtitle ? item.subtitle.toLowerCase().includes(q) : false;
      const descMatch = item.description ? item.description.toLowerCase().includes(q) : false;
      const catMatch = item.category ? item.category.toLowerCase().includes(q) : false;

      return titleMatch || subMatch || descMatch || catMatch;
    });
  }, [allIndexedItems, query, activeFilter]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  // Handle Item Click / Action
  const handleSelectResult = (item: SearchResultItem) => {
    onClose();

    if (item.type === 'video' && item.payload?.videoUrl) {
      if (openVideoModal) {
        openVideoModal(item.payload.videoUrl, item.payload.title, item.payload.category);
      }
    } else if (item.type === 'photo' && item.payload?.imageUrl) {
      if (openLightbox) {
        openLightbox(item.payload.imageUrl, item.payload.title, item.payload.category);
      }
    }

    if (item.targetAnchor) {
      setTimeout(() => {
        const el = document.querySelector(item.targetAnchor!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Keyboard navigation within list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectResult(filteredResults[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: SearchResultType) => {
    switch (type) {
      case 'video':
        return <Film className="w-4 h-4 text-amber-400" />;
      case 'photo':
        return <Camera className="w-4 h-4 text-sky-400" />;
      case 'song':
        return <Music className="w-4 h-4 text-emerald-400" />;
      case 'catalog':
        return <Folder className="w-4 h-4 text-amber-500" />;
      case 'service':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'direction':
        return <Compass className="w-4 h-4 text-rose-400" />;
      case 'experience':
        return <Briefcase className="w-4 h-4 text-indigo-400" />;
      case 'skill':
        return <Wrench className="w-4 h-4 text-teal-400" />;
      default:
        return <Search className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getTypeBadge = (type: SearchResultType) => {
    switch (type) {
      case 'video':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'photo':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'song':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'catalog':
        return 'bg-amber-600/20 text-amber-200 border-amber-600/30';
      case 'service':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'direction':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'experience':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'skill':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const filterTabs: { id: 'all' | SearchResultType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: allIndexedItems.length },
    { id: 'video', label: 'Videos', count: allIndexedItems.filter((i) => i.type === 'video').length },
    { id: 'photo', label: 'Photos', count: allIndexedItems.filter((i) => i.type === 'photo').length },
    { id: 'song', label: 'Songs', count: allIndexedItems.filter((i) => i.type === 'song').length },
    { id: 'catalog', label: 'Catalogs', count: allIndexedItems.filter((i) => i.type === 'catalog').length },
    { id: 'service', label: 'Services', count: allIndexedItems.filter((i) => i.type === 'service').length },
    { id: 'direction', label: 'Direction', count: allIndexedItems.filter((i) => i.type === 'direction').length },
    { id: 'experience', label: 'Career', count: allIndexedItems.filter((i) => i.type === 'experience').length },
    { id: 'skill', label: 'Skills', count: allIndexedItems.filter((i) => i.type === 'skill').length },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-12 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      id="global-search-overlay"
    >
      <div
        className="relative w-full max-w-3xl bg-zinc-950/95 border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col my-auto max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        id="global-search-modal"
      >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center gap-3 bg-zinc-900/50">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos, photos, songs, catalogs, services, skills..."
            className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none"
            id="global-search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs rounded-lg transition-colors border border-zinc-700/50"
            title="Close (Esc)"
          >
            ESC
          </button>
        </div>

        {/* Filter Categories Chips */}
        <div className="px-4 sm:px-5 py-2.5 bg-zinc-900/30 border-b border-zinc-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900/80 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 max-h-[55vh] min-h-[220px]"
          id="global-search-results"
        >
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-60" />
              <p className="text-sm font-semibold text-zinc-400">No matching items found</p>
              <p className="text-xs text-zinc-600 mt-1">Try typing a different title, artist, client, or catalog name.</p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 sm:gap-4 p-3 rounded-2xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-zinc-100 shadow-md'
                      : 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800/60 text-zinc-300'
                  }`}
                  id={`search-result-item-${idx}`}
                >
                  {/* Thumbnail / Icon */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center border border-zinc-700/50">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      getTypeIcon(item.type)
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs sm:text-sm text-zinc-100 truncate">{item.title}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border shrink-0 ${getTypeBadge(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-zinc-400 truncate">{item.subtitle}</p>
                    )}
                    {item.description && (
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{item.description}</p>
                    )}
                  </div>

                  {/* Action Arrow */}
                  <div className="shrink-0 flex items-center text-zinc-500">
                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-amber-400' : ''}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Key Hints */}
        <div className="px-4 py-3 bg-zinc-900/60 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400 font-mono text-[10px]">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400 font-mono text-[10px]">ENTER</kbd>
              <span>Open</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400 font-mono text-[10px]">ESC</kbd>
              <span>Close</span>
            </span>
          </div>
          <div>
            <span>{filteredResults.length} matches found</span>
          </div>
        </div>
      </div>
    </div>
  );
};
