import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Camera,
  Maximize2,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Folder,
  FolderOpen,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { PhotoItem, CatalogNode } from '../types';
import { defaultPhotoCatalogTree } from '../data/initialData';
import {
  findCatalogNode,
  getCatalogPath,
  getAllDescendantIds,
  getAllDescendantNames,
  countProjectsInCatalogBranch,
} from '../utils/catalogUtils';
import { HorizontalCategoryScroller } from './common/HorizontalCategoryScroller';

export const PhotographySection: React.FC = () => {
  const { data, openPhotoLightbox, isAuthenticated, setIsAdminView } = usePortfolio();
  const { photography } = data;

  const catalogTree = useMemo(() => {
    return (data.photoCatalogTree && data.photoCatalogTree.length > 0)
      ? data.photoCatalogTree
      : defaultPhotoCatalogTree;
  }, [data.photoCatalogTree]);

  const [activeCatalogId, setActiveCatalogId] = useState<string>('ALL');

  const activeNode = useMemo(() => {
    if (activeCatalogId === 'ALL') return null;
    return findCatalogNode(catalogTree, activeCatalogId);
  }, [catalogTree, activeCatalogId]);

  const breadcrumbPath = useMemo(() => {
    if (!activeNode) return [];
    return getCatalogPath(catalogTree, activeNode.id);
  }, [catalogTree, activeNode]);

  const currentSubCatalogs = useMemo(() => {
    if (activeNode) {
      return activeNode.children || [];
    }
    return [];
  }, [activeNode]);

  const filteredPhotos = useMemo(() => {
    if (!activeNode) return photography;

    const descendantIds = getAllDescendantIds(activeNode);
    const descendantNames = getAllDescendantNames(activeNode).map((n) => n.toLowerCase());

    return photography.filter((p) => {
      if (p.catalogId && descendantIds.includes(p.catalogId)) return true;
      if (p.category && descendantNames.includes(p.category.toLowerCase())) return true;
      if (p.categoryPath && p.categoryPath.some((cp) => descendantNames.includes(cp.toLowerCase()))) return true;
      return false;
    });
  }, [photography, activeNode]);

  return (
    <section id="photography" className="relative py-24 sm:py-32 bg-[#09090b] text-white border-t border-white/[0.05]">
      {/* Ambient background styling */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs tracking-[0.25em] font-semibold uppercase mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>STILL FRAMES &amp; OPTICS</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">
              PHOTOGRAPHY PORTFOLIO
            </h2>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <p className="text-zinc-400 text-xs tracking-[0.18em] uppercase max-w-md md:text-right font-mono hidden sm:block">
              Framing Light • Emotional Moments • Editorial Nuance
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setIsAdminView(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold tracking-wider cursor-pointer"
                title="Manage Photos & Catalogues in CMS"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Photos</span>
              </button>
            )}
          </div>
        </div>

        {/* Level 1: Root Photo Catalog Tabs with Left/Right Navigation Scroller */}
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
              <span>ALL PHOTOS</span>
              <span className="ml-1 text-xs opacity-75 font-mono">({photography.length})</span>
            </button>

            {catalogTree.map((node) => {
              const isSelected = breadcrumbPath.some((b) => b.id === node.id);
              const count = countProjectsInCatalogBranch(node, photography);

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

        {/* Sub-Catalog Drilldown Container */}
        {activeNode && (
          <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-white/[0.1] backdrop-blur-md space-y-4 shadow-xl">
            {/* Breadcrumbs */}
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

            {activeNode.description && (
              <p className="text-sm text-zinc-300 font-light leading-relaxed">
                {activeNode.description}
              </p>
            )}

            {/* Child Sub-Catalogs */}
            {currentSubCatalogs.length > 0 && (
              <div className="pt-4 border-t border-white/[0.08]">
                <div className="text-xs sm:text-sm font-mono text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2 font-semibold">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>Sub-Categories in {activeNode.name}:</span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {currentSubCatalogs.map((sub) => {
                    const subCount = countProjectsInCatalogBranch(sub, photography);
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

        {/* Masonry-Style Responsive Photo Gallery */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5">
            <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No photographs found in this category.</p>
            {isAuthenticated && (
              <button
                onClick={() => setIsAdminView(true)}
                className="mt-4 px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold cursor-pointer hover:bg-amber-400 transition-colors"
              >
                + Add Photos to this Catalog
              </button>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => openPhotoLightbox(filteredPhotos, index)}
                className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.08] hover:border-amber-500/50 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-amber-500/10"
              >
                <img
                  src={photo.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop'}
                  alt={photo.title}
                  className="w-full h-auto object-cover transform transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-[0.9] group-hover:brightness-100"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                      {photo.category}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20">
                      <Maximize2 className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>

                  {/* Bottom Text */}
                  <div className="space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-display text-base sm:text-lg font-bold text-white uppercase tracking-wide">
                      {photo.title}
                    </h3>
                    {photo.description && (
                      <p className="text-xs text-zinc-300 font-light line-clamp-2">{photo.description}</p>
                    )}
                    {photo.location && (
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono pt-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{photo.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
