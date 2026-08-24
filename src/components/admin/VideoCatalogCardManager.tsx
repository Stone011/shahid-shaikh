import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { VideoProject } from '../../types';
import {
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
  MoveRight,
  Copy,
  Check,
  X,
  Sparkles,
  Film,
  Layers,
  CheckSquare,
  Square,
  ExternalLink,
  Sliders,
  AlertTriangle,
  Image as ImageIcon,
  Eye,
  Filter,
  Search,
} from 'lucide-react';

interface VideoCatalogCardManagerProps {
  catalogues: string[];
  projects: VideoProject[];
  activeFilter: string;
  onSelectFilter: (cat: string) => void;
  onUpdateCatalogues: (newCats: string[]) => void;
  onUpdateProjects: (updater: (prev: VideoProject[]) => VideoProject[]) => void;
  onAddNewProject: (category: string) => void;
  onEditProject: (id: string) => void;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => void;
}

export const VideoCatalogCardManager: React.FC<VideoCatalogCardManagerProps> = ({
  catalogues,
  projects,
  activeFilter,
  onSelectFilter,
  onUpdateCatalogues,
  onUpdateProjects,
  onAddNewProject,
  onEditProject,
}) => {
  const { renameCatalogEverywhere, deleteCatalogEverywhere } = usePortfolio();

  // Search query for filtering cards & items
  const [catalogSearch, setCatalogSearch] = useState('');

  // Expansion state for each catalog
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // Modals & Forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatAspect, setNewCatAspect] = useState<'16:9' | '9:16'>('16:9');

  // Rename state
  const [renamingCat, setRenamingCat] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  // Safe Delete Modal
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  // Move / Copy Modal
  const [moveCopyModal, setMoveCopyModal] = useState<{
    isOpen: boolean;
    mode: 'move' | 'copy';
    sourceCat: string;
    itemIds: string[];
    targetCat: string;
  }>({
    isOpen: false,
    mode: 'move',
    sourceCat: '',
    itemIds: [],
    targetCat: '',
  });

  // Selected items inside expanded catalog for bulk actions
  const [selectedItemsByCat, setSelectedItemsByCat] = useState<Record<string, string[]>>({});

  // Drag-and-drop state for catalogs
  const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null);
  const [dragOverCatIndex, setDragOverCatIndex] = useState<number | null>(null);

  // Toggle expand
  const toggleExpand = (cat: string) => {
    setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Reordering
  const handleMoveCatalog = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= catalogues.length) return;
    const updated = [...catalogues];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onUpdateCatalogues(updated);
  };

  // Add Catalog
  const handleCreateCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    if (!catalogues.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      onUpdateCatalogues([...catalogues, trimmed]);
    }
    setNewCatName('');
    setNewCatDesc('');
    setIsAddModalOpen(false);
  };

  // Rename Catalog
  const handleSaveRename = () => {
    if (!renamingCat) return;
    const trimmed = renameText.trim();
    if (!trimmed || trimmed.toLowerCase() === renamingCat.toLowerCase()) {
      setRenamingCat(null);
      return;
    }

    renameCatalogEverywhere(renamingCat, trimmed, 'video');

    if (activeFilter.toLowerCase() === renamingCat.toLowerCase()) {
      onSelectFilter(trimmed);
    }
    setRenamingCat(null);
    setRenameText('');
  };

  // Safe Delete (removes category without deleting underlying projects)
  const handleConfirmDeleteCatalog = () => {
    if (!catToDelete) return;
    deleteCatalogEverywhere(catToDelete, 'video');

    if (activeFilter.toLowerCase() === catToDelete.toLowerCase()) {
      onSelectFilter('ALL');
    }
    setCatToDelete(null);
  };

  // Bulk Selection Handlers
  const handleToggleSelectItem = (cat: string, itemId: string) => {
    const current = selectedItemsByCat[cat] || [];
    const updated = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId];
    setSelectedItemsByCat((prev) => ({ ...prev, [cat]: updated }));
  };

  const handleSelectAllInCat = (cat: string, catProjectIds: string[]) => {
    const current = selectedItemsByCat[cat] || [];
    if (current.length === catProjectIds.length) {
      // Deselect all
      setSelectedItemsByCat((prev) => ({ ...prev, [cat]: [] }));
    } else {
      // Select all
      setSelectedItemsByCat((prev) => ({ ...prev, [cat]: [...catProjectIds] }));
    }
  };

  // Open Move / Copy Modal
  const handleOpenMoveCopy = (
    mode: 'move' | 'copy',
    sourceCat: string,
    itemIds: string[]
  ) => {
    const otherCats = catalogues.filter((c) => c !== sourceCat);
    setMoveCopyModal({
      isOpen: true,
      mode,
      sourceCat,
      itemIds,
      targetCat: otherCats[0] || sourceCat,
    });
  };

  // Execute Move / Copy
  const handleExecuteMoveCopy = () => {
    const { mode, sourceCat, itemIds, targetCat } = moveCopyModal;
    if (!targetCat || itemIds.length === 0) return;

    if (mode === 'move') {
      // Move projects to target category
      onUpdateProjects((prev) =>
        prev.map((p) => (itemIds.includes(p.id) ? { ...p, category: targetCat } : p))
      );
    } else {
      // Copy / Duplicate projects to target category
      onUpdateProjects((prev) => {
        const itemsToCopy = prev.filter((p) => itemIds.includes(p.id));
        const newCopies: VideoProject[] = itemsToCopy.map((p) => ({
          ...p,
          id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: `${p.title} (Copy)`,
          category: targetCat,
        }));
        return [...newCopies, ...prev];
      });
    }

    // Clear selection
    setSelectedItemsByCat((prev) => ({ ...prev, [sourceCat]: [] }));
    setMoveCopyModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Remove single project from category
  const handleRemoveProjectFromCat = (projectId: string, cat: string) => {
    const otherCats = catalogues.filter((c) => c !== cat);
    const fallbackCat = otherCats[0] || '';
    onUpdateProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, category: fallbackCat, catalogId: fallbackCat ? p.catalogId : undefined } : p))
    );
  };

  // Drag handlers for catalog cards and items
  const [isItemDraggingOver, setIsItemDraggingOver] = useState<string | null>(null);

  const handleDragStart = (idx: number) => {
    setDraggedCatIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number, catName: string) => {
    e.preventDefault();
    if (dragOverCatIndex !== idx) {
      setDragOverCatIndex(idx);
    }
    setIsItemDraggingOver(catName);
  };

  const handleDrop = (e: React.DragEvent, idx: number, targetCat: string) => {
    e.preventDefault();
    // Check if an individual item was dropped
    const rawData = e.dataTransfer.getData('application/json');
    if (rawData) {
      try {
        const payload = JSON.parse(rawData);
        if (payload.type === 'project' && payload.id) {
          onUpdateProjects((prev) =>
            prev.map((p) => (p.id === payload.id ? { ...p, category: targetCat } : p))
          );
          setDraggedCatIndex(null);
          setDragOverCatIndex(null);
          setIsItemDraggingOver(null);
          return;
        }
      } catch (err) {
        // Fall back to catalog reorder
      }
    }

    // Catalog card reorder drop
    if (draggedCatIndex !== null && draggedCatIndex !== idx) {
      handleMoveCatalog(draggedCatIndex, idx);
    }
    setDraggedCatIndex(null);
    setDragOverCatIndex(null);
    setIsItemDraggingOver(null);
  };

  // Filtered catalogues based on search query
  const filteredCatalogues = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return catalogues;
    return catalogues.filter((cat) => {
      if (cat.toLowerCase().includes(q)) return true;
      const catProjects = projects.filter((p) => p.category.toLowerCase() === cat.toLowerCase());
      return catProjects.some(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.client && p.client.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    });
  }, [catalogues, projects, catalogSearch]);

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-amber-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                ACTIVE VIDEO CATALOGUES / CATEGORIES
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-400">
                {catalogues.length} Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Drag cards or use buttons to reorder, add new items, move or copy between catalogues, and expand contents.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Search catalogs..."
              className="w-full pl-8 pr-7 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            {catalogSearch && (
              <button
                type="button"
                onClick={() => setCatalogSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-amber-500 text-zinc-950 border-amber-500'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/10'
            }`}
          >
            Show All ({projects.length})
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD CATALOG</span>
          </button>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCatalogues.map((cat, idx) => {
          const isExpanded = !!expandedCats[cat];
          const isFiltered = activeFilter.toLowerCase() === cat.toLowerCase();
          const catProjects = projects.filter(
            (p) => p.category.toLowerCase() === cat.toLowerCase()
          );
          const selectedInCat = selectedItemsByCat[cat] || [];
          const isDragging = draggedCatIndex === idx;
          const isDragOver = dragOverCatIndex === idx;

          return (
            <div
              key={cat + idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx, cat)}
              onDrop={(e) => handleDrop(e, idx, cat)}
              onDragEnd={() => {
                setDraggedCatIndex(null);
                setDragOverCatIndex(null);
                setIsItemDraggingOver(null);
              }}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                isFiltered
                  ? 'bg-zinc-950 border-amber-500 ring-2 ring-amber-500/20 shadow-xl shadow-amber-500/10'
                  : 'bg-zinc-950/90 border-white/10 hover:border-amber-500/40 shadow-lg'
              } ${isDragging ? 'opacity-40 scale-98' : ''} ${
                isDragOver ? 'border-amber-400 ring-2 ring-amber-400/40' : ''
              } ${isItemDraggingOver === cat ? 'ring-2 ring-teal-400 border-teal-400' : ''}`}
            >
              {/* Card Header Top */}
              <div className="p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-white/[0.06]">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Drag Handle */}
                  <div
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-amber-400 cursor-grab active:cursor-grabbing shrink-0 mt-0.5"
                    title="Drag to reorder catalog card"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Folder Icon */}
                  <div
                    onClick={() => toggleExpand(cat)}
                    className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 cursor-pointer hover:bg-amber-500/20 transition-colors"
                  >
                    {isExpanded ? (
                      <FolderOpen className="w-5 h-5" />
                    ) : (
                      <Folder className="w-5 h-5" />
                    )}
                  </div>

                  {/* Title & Badge */}
                  <div className="min-w-0 flex-1">
                    {renamingCat === cat ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          autoFocus
                          value={renameText}
                          onChange={(e) => setRenameText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename();
                            if (e.key === 'Escape') setRenamingCat(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-amber-500 text-white text-xs font-mono font-bold w-full"
                        />
                        <button
                          type="button"
                          onClick={handleSaveRename}
                          className="p-1.5 rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 cursor-pointer"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingCat(null)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => toggleExpand(cat)}
                          className="text-sm font-bold text-white uppercase tracking-wider truncate font-display cursor-pointer hover:text-amber-300 transition-colors"
                        >
                          {cat}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300 shrink-0">
                          {catProjects.length} items
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => onSelectFilter(cat)}
                        className={`text-[11px] font-mono transition-colors cursor-pointer ${
                          isFiltered
                            ? 'text-amber-400 font-bold'
                            : 'text-zinc-400 hover:text-amber-300'
                        }`}
                      >
                        {isFiltered ? '● Viewing in Gallery' : 'Filter Gallery to this'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expand Toggle Chevron */}
                <button
                  type="button"
                  onClick={() => toggleExpand(cat)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={isExpanded ? 'Collapse Catalogue' : 'Expand Catalogue Items'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Card Controls Bar */}
              <div className="p-3 bg-zinc-900/60 border-b border-white/[0.04] flex flex-wrap items-center justify-between gap-1.5 text-xs font-mono">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveCatalog(idx, idx - 1)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                    title="Move Catalogue Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === catalogues.length - 1}
                    onClick={() => handleMoveCatalog(idx, idx + 1)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                    title="Move Catalogue Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAddNewProject(cat)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold hover:text-amber-200 transition-colors cursor-pointer"
                    title="Add new video project directly into this catalogue"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Item</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenMoveCopy(
                        'move',
                        cat,
                        catProjects.map((p) => p.id)
                      )
                    }
                    disabled={catProjects.length === 0}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-amber-300 disabled:opacity-40 cursor-pointer transition-colors"
                    title="Move or Copy all items from this catalogue"
                  >
                    <MoveRight className="w-3.5 h-3.5" />
                    <span>Move / Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRenamingCat(cat);
                      setRenameText(cat);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title="Rename Catalogue"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCatToDelete(cat)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/40 border border-white/10 hover:border-red-500/40 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete Catalogue (Safe Delete)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expandable Items Drawer */}
              {isExpanded && (
                <div className="p-4 bg-zinc-950/95 space-y-3 animate-in fade-in duration-200">
                  {/* Bulk Select Header */}
                  {catProjects.length > 0 && (
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs font-mono">
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectAllInCat(
                            cat,
                            catProjects.map((p) => p.id)
                          )
                        }
                        className="flex items-center gap-1.5 text-zinc-400 hover:text-white cursor-pointer"
                      >
                        {selectedInCat.length === catProjects.length ? (
                          <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                        <span>
                          {selectedInCat.length === catProjects.length
                            ? 'Deselect All'
                            : 'Select All'}
                        </span>
                      </button>

                      {selectedInCat.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-amber-400 font-bold">
                            {selectedInCat.length} Selected
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenMoveCopy('move', cat, selectedInCat)
                            }
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold cursor-pointer"
                          >
                            MOVE
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenMoveCopy('copy', cat, selectedInCat)
                            }
                            className="px-2 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[10px] font-bold cursor-pointer"
                          >
                            COPY
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items List */}
                  {catProjects.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-zinc-900/40 border border-dashed border-white/10 space-y-2">
                      <Film className="w-6 h-6 text-zinc-600 mx-auto" />
                      <p className="text-xs text-zinc-400">
                        No videos currently assigned to this catalogue.
                      </p>
                      <button
                        type="button"
                        onClick={() => onAddNewProject(cat)}
                        className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add first video</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {catProjects.map((p) => {
                        const isSelected = selectedInCat.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              e.dataTransfer.setData('application/json', JSON.stringify({ type: 'project', id: p.id, fromCat: cat }));
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-grab active:cursor-grabbing ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500/40'
                                : 'bg-zinc-900/70 border-white/[0.06] hover:border-white/20'
                            }`}
                          >
                            {/* Checkbox & Thumbnail */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => handleToggleSelectItem(cat, p.id)}
                                className="text-zinc-400 hover:text-amber-400 cursor-pointer shrink-0"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-amber-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-zinc-600" />
                                )}
                              </button>

                              <img
                                src={p.thumbnail}
                                alt={p.title}
                                className="w-12 h-8 rounded-lg object-cover bg-zinc-800 shrink-0 border border-white/10"
                                referrerPolicy="no-referrer"
                              />

                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-bold text-white truncate">
                                  {p.title}
                                </h5>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                                  <span>{p.aspectRatio || '16:9'}</span>
                                  <span>•</span>
                                  <span>{p.year || '2026'}</span>
                                  {p.client && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">{p.client}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Item Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => onEditProject(p.id)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title="Edit Project Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenMoveCopy('move', cat, [p.id])
                                }
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                                title="Move to another catalogue"
                              >
                                <MoveRight className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenMoveCopy('copy', cat, [p.id])
                                }
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-teal-300 transition-colors cursor-pointer"
                                title="Copy / Duplicate to another catalogue"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveProjectFromCat(p.id, cat)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                                title="Remove from this catalogue"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          MODAL: ADD NEW CATALOG
         ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Folder className="w-5 h-5" />
                <h3 className="text-base font-bold text-white uppercase font-display">
                  CREATE NEW VIDEO CATALOGUE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCatalog} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Catalogue Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Commercial &amp; Brand Ads, Documentaries"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of this video category..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Default Aspect Ratio Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCatAspect('16:9')}
                    className={`py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all ${
                      newCatAspect === '16:9'
                        ? 'bg-amber-500 text-zinc-950 border-amber-500'
                        : 'bg-zinc-900 text-zinc-300 border-white/10'
                    }`}
                  >
                    16:9 Landscape Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatAspect('9:16')}
                    className={`py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all ${
                      newCatAspect === '9:16'
                        ? 'bg-amber-500 text-zinc-950 border-amber-500'
                        : 'bg-zinc-900 text-zinc-300 border-white/10'
                    }`}
                  >
                    9:16 Vertical Reel
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Create Catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: MOVE / COPY ITEMS
         ========================================================================= */}
      {moveCopyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <MoveRight className="w-5 h-5" />
                <h3 className="text-base font-bold text-white uppercase font-display">
                  {moveCopyModal.mode === 'move' ? 'MOVE VIDEOS' : 'COPY VIDEOS'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMoveCopyModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Action Mode Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMoveCopyModal((prev) => ({ ...prev, mode: 'move' }))}
                  className={`py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    moveCopyModal.mode === 'move'
                      ? 'bg-amber-500 text-zinc-950 border-amber-500'
                      : 'bg-zinc-900 text-zinc-300 border-white/10'
                  }`}
                >
                  → MOVE (Transfer)
                </button>
                <button
                  type="button"
                  onClick={() => setMoveCopyModal((prev) => ({ ...prev, mode: 'copy' }))}
                  className={`py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    moveCopyModal.mode === 'copy'
                      ? 'bg-teal-500 text-zinc-950 border-teal-500'
                      : 'bg-zinc-900 text-zinc-300 border-white/10'
                  }`}
                >
                  ⎘ COPY (Duplicate)
                </button>
              </div>

              <p className="text-zinc-400">
                {moveCopyModal.mode === 'move'
                  ? `Transfer ${moveCopyModal.itemIds.length} item(s) from "${moveCopyModal.sourceCat}" to:`
                  : `Duplicate ${moveCopyModal.itemIds.length} item(s) into destination catalogue:`}
              </p>

              {/* Destination Dropdown */}
              <div>
                <label className="block text-[11px] text-zinc-400 uppercase mb-1">
                  Destination Catalogue:
                </label>
                <select
                  value={moveCopyModal.targetCat}
                  onChange={(e) =>
                    setMoveCopyModal((prev) => ({ ...prev, targetCat: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs"
                >
                  {catalogues
                    .filter((c) => c !== moveCopyModal.sourceCat)
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setMoveCopyModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMoveCopy}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Confirm {moveCopyModal.mode.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SAFE DELETE CONFIRMATION
         ========================================================================= */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white uppercase font-display">
                Delete Catalogue "{catToDelete}"?
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Deleting this catalogue will remove the category reference. All videos inside this catalogue will be safely preserved and moved to your other catalogues. No video projects will be lost.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCatalog}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Delete Catalogue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
