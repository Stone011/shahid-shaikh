import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Play,
  Film,
  Sparkles,
  Clock,
  Heart,
  Video,
  Flame,
  Smartphone,
  Eye,
  Volume2,
  Plus,
  ArrowRight,
  Layers,
  ChevronRight,
  Search,
  Folder,
  FolderOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { VideoProject, CatalogNode } from '../types';
import { defaultVideoCatalogTree } from '../data/initialData';
import {
  findCatalogNode,
  getCatalogPath,
  getAllDescendantIds,
  getAllDescendantNames,
  countProjectsInCatalogBranch,
} from '../utils/catalogUtils';
import { HorizontalCategoryScroller } from './common/HorizontalCategoryScroller';

export const VideoEditingSection: React.FC = () => {
  const { data, openVideoModal, isAuthenticated, setIsAdminView } = usePortfolio();
  const { videoProjects } = data;

  const catalogTree = useMemo(() => {
    return (data.videoCatalogTree && data.videoCatalogTree.length > 0)
      ? data.videoCatalogTree
      : defaultVideoCatalogTree;
  }, [data.videoCatalogTree]);

  // Active navigation in the catalog hierarchy
  // 'ALL' or a specific catalog node id
  const [activeCatalogId, setActiveCatalogId] = useState<string>('ALL');
  const [aspectFilter, setAspectFilter] = useState<'ALL' | '16:9' | '9:16'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Find currently active node (if not 'ALL')
  const activeNode = useMemo(() => {
    if (activeCatalogId === 'ALL') return null;
    return findCatalogNode(catalogTree, activeCatalogId);
  }, [catalogTree, activeCatalogId]);

  // Breadcrumb path for the active node
  const breadcrumbPath = useMemo(() => {
    if (!activeNode) return [];
    return getCatalogPath(catalogTree, activeNode.id);
  }, [catalogTree, activeNode]);

  // Sub-catalogs available under current active node (or root nodes if ALL)
  const currentSubCatalogs = useMemo(() => {
    if (activeNode) {
      return activeNode.children || [];
    }
    return [];
  }, [activeNode]);

  // Filter projects based on active catalog branch and search/aspect ratio
  const filteredProjects = useMemo(() => {
    let list = videoProjects;

    // Filter by catalog branch
    if (activeNode) {
      const descendantIds = getAllDescendantIds(activeNode);
      const descendantNames = getAllDescendantNames(activeNode).map((n) => n.toLowerCase());

      list = list.filter((p) => {
        if (p.catalogId && descendantIds.includes(p.catalogId)) return true;
        if (p.category && descendantNames.includes(p.category.toLowerCase())) return true;
        if (p.categoryPath && p.categoryPath.some((cp) => descendantNames.includes(cp.toLowerCase()))) return true;
        return false;
      });
    }

    // Filter by Aspect Ratio
    if (aspectFilter !== 'ALL') {
      if (aspectFilter === '9:16') {
        list = list.filter((p) => p.aspectRatio === '9:16' || p.category.toLowerCase().includes('reel'));
      } else {
        list = list.filter((p) => p.aspectRatio !== '9:16' && !p.category.toLowerCase().includes('reel'));
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.client && p.client.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [videoProjects, activeNode, aspectFilter, searchQuery]);

  const handleWatchClick = (project: VideoProject, e: React.MouseEvent) => {
    e.preventDefault();
    if (project.videoUrl) {
      openVideoModal(project.videoUrl, project.title, project.category);
    }
  };

  const renderStandardCard = (project: VideoProject) => (
    <div
      key={project.id}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-zinc-950/80 border border-white/[0.08] hover:border-amber-500/40 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10"
    >
      {/* 16:9 Thumbnail Container */}
      <div
        className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900 cursor-pointer"
        onClick={(e) => handleWatchClick(project, e)}
      >
        <img
          src={project.thumbnail || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200&auto=format&fit=crop'}
          alt={project.title}
          className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-110 filter brightness-[0.85] group-hover:brightness-[0.7]"
          loading="lazy"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-mono font-medium text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            {project.category}
          </span>
          {project.duration && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-zinc-300">
              <Clock className="w-3 h-3 text-amber-400" />
              {project.duration}
            </span>
          )}
        </div>

        {/* Center Glowing Play Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center shadow-xl transform scale-90 opacity-85 group-hover:scale-110 group-hover:opacity-100 group-hover:bg-amber-400 transition-all duration-300">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>{project.year || '2025'}</span>
            {project.client && <span className="text-zinc-400">{project.client}</span>}
          </div>

          <h3
            onClick={(e) => handleWatchClick(project, e)}
            className="font-display text-lg font-bold text-white group-hover:text-amber-300 transition-colors duration-200 cursor-pointer line-clamp-1"
          >
            {project.title}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] font-mono text-zinc-400 border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Watch Button */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
          <button
            onClick={(e) => handleWatchClick(project, e)}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors cursor-pointer"
          >
            <span>{project.buttonText || 'WATCH FILM'}</span>
            <Play className="w-3 h-3 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderReelCard = (project: VideoProject) => (
    <div
      key={project.id}
      className="group relative flex flex-col rounded-3xl overflow-hidden bg-zinc-950 border border-white/[0.1] hover:border-amber-500/50 transition-all duration-500 shadow-2xl hover:shadow-amber-500/15"
    >
      {/* 9:16 Vertical Smartphone Aspect Ratio */}
      <div
        className="relative aspect-[9/16] w-full overflow-hidden bg-zinc-900 cursor-pointer"
        onClick={(e) => handleWatchClick(project, e)}
      >
        <img
          src={project.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop'}
          alt={project.title}
          className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-[0.9] group-hover:brightness-[0.75]"
          loading="lazy"
        />

        {/* Gradient overlays for smartphone reel realism */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/60 pointer-events-none" />

        {/* Top Header: Reel Badge & Views */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-500/30">
            <Smartphone className="w-3 h-3" />
            <span>9:16 REEL</span>
          </span>

          {project.viewsCount && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-zinc-200">
              <Eye className="w-3 h-3 text-amber-400" />
              <span>{project.viewsCount}</span>
            </span>
          )}
        </div>

        {/* Audio Track Badge */}
        {project.audioTrack && (
          <div className="absolute top-12 left-3 right-3 pointer-events-none z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[9px] font-mono text-zinc-300 max-w-full truncate">
              <Volume2 className="w-2.5 h-2.5 text-amber-400 animate-pulse shrink-0" />
              <span className="truncate">{project.audioTrack}</span>
            </div>
          </div>
        )}

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center shadow-2xl transform scale-90 opacity-85 group-hover:scale-110 group-hover:opacity-100 group-hover:bg-amber-400 transition-all duration-300">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom Details inside the 9:16 frame */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10 space-y-2 pointer-events-none">
          <h3 className="font-display text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
            {project.title}
          </h3>

          <p className="text-[11px] text-zinc-300 line-clamp-2 font-light">
            {project.description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono text-amber-300">
            <span>{project.duration || '0:30'}</span>
            <span className="flex items-center gap-1 text-white font-bold pointer-events-auto">
              TAP TO PLAY <ArrowRight className="w-3 h-3 text-amber-400" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="video-editing" className="relative py-24 sm:py-32 bg-[#09090b] text-white border-t border-white/[0.05]">
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs tracking-[0.25em] font-semibold uppercase mb-2">
              <Film className="w-3.5 h-3.5" />
              <span>DYNAMIC CATALOG SHOWCASE</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">
              VIDEO PORTFOLIO
            </h2>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900/80 border border-white/10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 w-40 sm:w-48 transition-all"
              />
            </div>

            {/* Aspect Ratio Filters */}
            <div className="flex items-center p-1 rounded-lg bg-zinc-900 border border-white/10 text-xs">
              <button
                onClick={() => setAspectFilter('ALL')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                  aspectFilter === 'ALL' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setAspectFilter('16:9')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                  aspectFilter === '16:9' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                16:9
              </button>
              <button
                onClick={() => setAspectFilter('9:16')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                  aspectFilter === '9:16' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                9:16 REELS
              </button>
            </div>

            {isAuthenticated && (
              <button
                onClick={() => setIsAdminView(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold tracking-wider cursor-pointer"
                title="Manage Catalogs in CMS"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Catalogs</span>
              </button>
            )}
          </div>
        </div>

        {/* Level 1: Root Catalog Tabs with Left/Right Navigation Scroller */}
        <div className="mb-6">
          <HorizontalCategoryScroller>
            <button
              onClick={() => setActiveCatalogId('ALL')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold tracking-wider whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeCatalogId === 'ALL'
                  ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25 scale-[1.03]'
                  : 'bg-zinc-900/85 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08]'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeCatalogId === 'ALL' ? 'text-zinc-950' : 'text-amber-400'}`} />
              <span>ALL WORK</span>
              <span className="ml-1 text-xs opacity-75 font-mono">({videoProjects.length})</span>
            </button>

            {catalogTree.map((node) => {
              const isSelected = breadcrumbPath.some((b) => b.id === node.id);
              const count = countProjectsInCatalogBranch(node, videoProjects);

              return (
                <button
                  key={node.id}
                  onClick={() => setActiveCatalogId(node.id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold tracking-wider whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25 scale-[1.03]'
                      : 'bg-zinc-900/85 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08]'
                  }`}
                >
                  <Folder className={`w-4 h-4 ${isSelected ? 'text-zinc-950' : 'text-amber-400'}`} />
                  <span>{node.name.toUpperCase()}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${isSelected ? 'bg-black/20 text-zinc-950 font-bold' : 'bg-white/10 text-zinc-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </HorizontalCategoryScroller>
        </div>

        {/* Interactive Breadcrumbs & Sub-Catalog Drilldown Container */}
        {activeNode && (
          <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-white/[0.1] backdrop-blur-md space-y-4 shadow-xl">
            {/* Breadcrumb Trail */}
            <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm font-mono text-zinc-400">
              <button
                onClick={() => setActiveCatalogId('ALL')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>ALL</span>
              </button>

              {breadcrumbPath.map((bNode, idx) => {
                const isLast = idx === breadcrumbPath.length - 1;
                return (
                  <React.Fragment key={bNode.id}>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                    <button
                      onClick={() => setActiveCatalogId(bNode.id)}
                      className={`cursor-pointer transition-colors flex items-center gap-1 text-xs sm:text-sm ${
                        isLast ? 'text-amber-300 font-bold' : 'hover:text-amber-400 text-zinc-300'
                      }`}
                    >
                      <span>{bNode.name}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Description of current catalog */}
            {activeNode.description && (
              <p className="text-sm text-zinc-300 font-light leading-relaxed">
                {activeNode.description}
              </p>
            )}

            {/* Child Sub-Catalogs Pills (with increased readable text size) */}
            {currentSubCatalogs.length > 0 && (
              <div className="pt-4 border-t border-white/[0.08]">
                <div className="text-xs sm:text-sm font-mono text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2 font-semibold">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>Sub-Categories in {activeNode.name}:</span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {currentSubCatalogs.map((sub) => {
                    const subCount = countProjectsInCatalogBranch(sub, videoProjects);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveCatalogId(sub.id)}
                        className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-amber-500/20 border border-white/15 hover:border-amber-500/50 text-xs sm:text-sm font-medium text-zinc-200 hover:text-amber-300 transition-all cursor-pointer group shadow-sm"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                        <span>{sub.name}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 group-hover:bg-amber-400/25 group-hover:text-amber-300">
                          {subCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Project Grid Display */}
        {filteredProjects.length > 0 ? (
          <div className={`grid gap-8 ${
            aspectFilter === '9:16'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredProjects.map((project) =>
              project.aspectRatio === '9:16' ? renderReelCard(project) : renderStandardCard(project)
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5">
            <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">
              {searchQuery
                ? `No projects found matching "${searchQuery}"`
                : 'No projects currently assigned to this catalog category.'}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setIsAdminView(true)}
                className="mt-4 px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold cursor-pointer hover:bg-amber-400 transition-colors"
              >
                + Add / Move Video to this Catalog
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
