import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  Folder,
  FolderPlus,
  Plus,
  Trash2,
  MoveRight,
  Copy,
  Check,
  X,
  Search,
  AlertTriangle,
  Layers,
  Sparkles,
  Film,
  Camera,
  Music,
  Briefcase,
  Clapperboard,
  Tag,
  ChevronRight,
  Info,
} from 'lucide-react';
import { GlobalCatalogEntry } from '../../utils/catalogUtils';

// =========================================================================
// 1. UNIVERSAL CATALOG PICKER (Used in Add / Edit forms across all CMS)
// =========================================================================

interface UniversalCatalogPickerProps {
  label?: string;
  selectedCategory: string;
  selectedCatalogId?: string;
  selectedCatalogIds?: string[];
  onSelectCategory: (categoryName: string, catalogId?: string) => void;
  onToggleAdditionalCatalog?: (catalogIdOrName: string) => void;
  allowMulti?: boolean;
  required?: boolean;
}

export const UniversalCatalogPicker: React.FC<UniversalCatalogPickerProps> = ({
  label = 'Catalog Assignment',
  selectedCategory,
  selectedCatalogId,
  selectedCatalogIds = [],
  onSelectCategory,
  onToggleAdditionalCatalog,
  allowMulti = true,
  required = true,
}) => {
  const { allGlobalCatalogs, addGlobalCatalog } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Filtered catalogs
  const filteredCatalogs = useMemo(() => {
    return allGlobalCatalogs.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.pathString.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterType === 'all') return true;
      return c.type === filterType;
    });
  }, [allGlobalCatalogs, searchQuery, filterType]);

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    addGlobalCatalog(trimmed);
    onSelectCategory(trimmed);
    setNewCatName('');
    setIsCreatingNew(false);
  };

  const isSelectedAsPrimary = (cat: GlobalCatalogEntry) => {
    if (selectedCatalogId && cat.id === selectedCatalogId) return true;
    if (selectedCategory && cat.name.toLowerCase() === selectedCategory.toLowerCase()) return true;
    return false;
  };

  const isSelectedAsAdditional = (cat: GlobalCatalogEntry) => {
    if (selectedCatalogIds.includes(cat.id)) return true;
    if (selectedCatalogIds.some((id) => id.toLowerCase() === cat.name.toLowerCase())) return true;
    return false;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Film className="w-3.5 h-3.5 text-amber-400" />;
      case 'photo':
        return <Camera className="w-3.5 h-3.5 text-cyan-400" />;
      case 'song':
        return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      case 'shoot':
        return <Briefcase className="w-3.5 h-3.5 text-indigo-400" />;
      case 'direction':
        return <Clapperboard className="w-3.5 h-3.5 text-fuchsia-400" />;
      default:
        return <Folder className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          {label} {required && <span className="text-amber-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setIsCreatingNew((prev) => !prev)}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer"
        >
          {isCreatingNew ? <X className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5" />}
          <span>{isCreatingNew ? 'Cancel' : '+ New Catalog'}</span>
        </button>
      </div>

      {/* Selected Primary Catalog Pill */}
      {selectedCategory && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-mono font-bold">Primary:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-black font-semibold text-xs rounded-lg shadow-sm">
            <Check className="w-3.5 h-3.5" />
            {selectedCategory}
          </span>
          {allowMulti && selectedCatalogIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 ml-2 border-l border-amber-500/30 pl-2">
              <span className="text-[10px] text-zinc-400 uppercase">Also in:</span>
              {selectedCatalogIds.map((cid) => {
                const match = allGlobalCatalogs.find((c) => c.id === cid || c.name.toLowerCase() === cid.toLowerCase());
                const name = match ? match.name : cid;
                if (name.toLowerCase() === selectedCategory.toLowerCase()) return null;
                return (
                  <span
                    key={cid}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-md"
                  >
                    <Tag className="w-3 h-3 text-zinc-400" />
                    {name}
                    {onToggleAdditionalCatalog && (
                      <button
                        type="button"
                        onClick={() => onToggleAdditionalCatalog(cid)}
                        className="hover:text-red-400 ml-1 text-zinc-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Inline Create New Catalog Form */}
      {isCreatingNew && (
        <form onSubmit={handleCreateNew} className="p-3 bg-black/40 border border-amber-500/40 rounded-xl space-y-2 animate-in fade-in">
          <label className="block text-[11px] font-mono uppercase text-zinc-400">Create & Assign New Global Catalog</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Brand Vertical, Commercial Ads..."
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Add Catalog
            </button>
          </div>
        </form>
      )}

      {/* Search & Type Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all global catalogs..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
            {['all', 'video', 'photo', 'song'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded capitalize transition-colors cursor-pointer ${
                  filterType === t ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid Selector */}
        <div className="max-h-48 overflow-y-auto p-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5 rounded-xl bg-zinc-950/70 border border-zinc-800/60 custom-scrollbar">
          {filteredCatalogs.map((cat, idx) => {
            const isPrimary = isSelectedAsPrimary(cat);
            const isAdditional = isSelectedAsAdditional(cat);

            return (
              <div
                key={`${cat.id}-${idx}`}
                className={`group flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none text-xs ${
                  isPrimary
                    ? 'bg-amber-500/20 border-amber-500/60 text-white font-semibold shadow-sm'
                    : isAdditional
                    ? 'bg-zinc-800/90 border-zinc-600 text-zinc-200'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
                onClick={() => onSelectCategory(cat.name, cat.id)}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  {getTypeIcon(cat.type)}
                  <span className="truncate">{cat.name}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isPrimary ? (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500 text-black font-bold rounded">
                      PRIMARY
                    </span>
                  ) : allowMulti && onToggleAdditionalCatalog ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleAdditionalCatalog(cat.id || cat.name);
                      }}
                      className={`p-1 rounded text-[10px] uppercase font-mono transition-colors cursor-pointer ${
                        isAdditional
                          ? 'bg-zinc-700 text-amber-300 hover:bg-zinc-600'
                          : 'opacity-0 group-hover:opacity-100 bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title={isAdditional ? 'Remove additional link' : 'Add as additional catalog'}
                    >
                      {isAdditional ? 'Linked' : '+ Link'}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}

          {filteredCatalogs.length === 0 && (
            <div className="col-span-full py-4 text-center text-xs text-zinc-500">
              No catalogs found matching "{searchQuery}". Click "+ New Catalog" to create it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. UNIVERSAL MOVE / COPY MODAL (Works on ANY content type in the CMS)
// =========================================================================

interface UniversalMoveCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song';
  itemId: string;
  itemTitle: string;
  currentCatalogName?: string;
  currentCatalogId?: string;
  initialMode?: 'move' | 'copy';
}

export const UniversalMoveCopyModal: React.FC<UniversalMoveCopyModalProps> = ({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemTitle,
  currentCatalogName,
  currentCatalogId,
  initialMode = 'move',
}) => {
  const { allGlobalCatalogs, moveItemToCatalog, copyItemToCatalog, addGlobalCatalog } = usePortfolio();

  const [mode, setMode] = useState<'move' | 'copy'>(initialMode);
  const [copyAsDuplicate, setCopyAsDuplicate] = useState(false);
  const [selectedTargetCat, setSelectedTargetCat] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  if (!isOpen) return null;

  const filteredCatalogs = allGlobalCatalogs.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExecute = () => {
    if (!selectedTargetCat) return;

    if (mode === 'move') {
      moveItemToCatalog(itemType, itemId, selectedTargetCat, currentCatalogId || currentCatalogName);
    } else {
      copyItemToCatalog(itemType, itemId, selectedTargetCat, copyAsDuplicate);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  const handleCreateAndSelect = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    addGlobalCatalog(trimmed);
    setSelectedTargetCat(trimmed);
    setNewCatName('');
    setIsCreatingNew(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              {mode === 'move' ? <MoveRight className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                {mode === 'move' ? 'Move Item to Catalog' : 'Copy Item to Catalog'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                Item: <span className="text-amber-400 font-semibold">{itemTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('move')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'move'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MoveRight className="w-4 h-4" />
            <span>Move to Catalog</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('copy')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'copy'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Copy / Multi-Link</span>
          </button>
        </div>

        {/* Mode Explanation Notice */}
        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 mb-4 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            {mode === 'move' ? (
              <span>
                <strong>Move Mode:</strong> Changes the item's catalog from{' '}
                <span className="text-zinc-100 font-mono underline">{currentCatalogName || 'current'}</span> to the selected destination.
              </span>
            ) : (
              <span>
                <strong>Copy Mode:</strong> Keeps the item in its current catalog and makes it also visible in the destination catalog.
              </span>
            )}
          </div>
        </div>

        {mode === 'copy' && (
          <div className="mb-4 px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-zinc-300">Duplicate as independent clone?</span>
            <button
              type="button"
              onClick={() => setCopyAsDuplicate((prev) => !prev)}
              className={`px-3 py-1 rounded-md font-mono text-[11px] transition-colors cursor-pointer ${
                copyAsDuplicate
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {copyAsDuplicate ? 'Yes (Clone Item)' : 'No (Shared Link)'}
            </button>
          </div>
        )}

        {/* Search & Catalog List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono uppercase text-zinc-400">
              Select Destination Catalog (Showing all {allGlobalCatalogs.length} catalogs):
            </label>
            <button
              type="button"
              onClick={() => setIsCreatingNew((prev) => !prev)}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              {isCreatingNew ? 'Cancel' : '+ New Catalog'}
            </button>
          </div>

          {isCreatingNew && (
            <form onSubmit={handleCreateAndSelect} className="flex gap-2 p-2 bg-zinc-900 border border-amber-500/40 rounded-xl">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New Catalog Name..."
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white"
                autoFocus
              />
              <button
                type="submit"
                disabled={!newCatName.trim()}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg cursor-pointer"
              >
                Create
              </button>
            </form>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination catalog..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1 p-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl custom-scrollbar">
            {filteredCatalogs.map((cat, idx) => {
              const isSelected =
                selectedTargetCat === cat.id ||
                selectedTargetCat.toLowerCase() === cat.name.toLowerCase();
              const isCurrent =
                currentCatalogName &&
                cat.name.toLowerCase() === currentCatalogName.toLowerCase();

              return (
                <div
                  key={`${cat.id}-${idx}`}
                  onClick={() => setSelectedTargetCat(cat.name)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-md'
                      : isCurrent
                      ? 'bg-zinc-900/90 border-zinc-700 text-zinc-400'
                      : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-black' : 'text-amber-400'}`} />
                    <span className="truncate">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isCurrent && !isSelected && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                        Current
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-black" />}
                  </div>
                </div>
              );
            })}

            {filteredCatalogs.length === 0 && (
              <div className="py-6 text-center text-xs text-zinc-500">
                No catalogs match "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={!selectedTargetCat || isSuccess}
            className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                {mode === 'move' ? <MoveRight className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>Confirm {mode === 'move' ? 'Move' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. UNIVERSAL DELETE CONFIRM MODAL (Distinguishes Remove from Catalog vs Permanent Delete)
// =========================================================================

interface UniversalDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType?: 'video' | 'photo' | 'shoot' | 'direction' | 'song' | 'experience' | 'catalog';
  itemId?: string;
  itemTitle: string;
  catalogName?: string;
  currentCatalogName?: string;
  catalogId?: string;
  onConfirmRemoveFromCatalog?: () => void;
  onRemoveFromCatalog?: () => void;
  onConfirmPermanentDelete?: () => void;
  onDeletePermanently?: () => void;
}

export const UniversalDeleteConfirmModal: React.FC<UniversalDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  itemType = 'video',
  itemId,
  itemTitle,
  catalogName,
  currentCatalogName,
  catalogId,
  onConfirmRemoveFromCatalog,
  onRemoveFromCatalog,
  onConfirmPermanentDelete,
  onDeletePermanently,
}) => {
  const { removeItemFromCatalog, permanentlyDeleteItem } = usePortfolio();
  const effectiveCatalogName = catalogName || currentCatalogName;
  const [actionType, setActionType] = useState<'remove_from_catalog' | 'permanent_delete'>(
    effectiveCatalogName ? 'remove_from_catalog' : 'permanent_delete'
  );
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleExecute = async () => {
    setIsDeleting(true);
    try {
      if (actionType === 'remove_from_catalog') {
        if (onConfirmRemoveFromCatalog) {
          onConfirmRemoveFromCatalog();
        } else if (onRemoveFromCatalog) {
          onRemoveFromCatalog();
        } else if (itemId && (catalogId || effectiveCatalogName)) {
          removeItemFromCatalog(itemType as any, itemId, (catalogId || effectiveCatalogName)!);
        }
      } else {
        if (onConfirmPermanentDelete) {
          onConfirmPermanentDelete();
        }
        if (onDeletePermanently) {
          onDeletePermanently();
        }
        if (itemId) {
          await permanentlyDeleteItem(itemType, itemId);
        }
      }
    } catch (err) {
      console.error('Error during deletion:', err);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-zinc-950 border border-red-500/40 rounded-3xl p-6 shadow-2xl text-white animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">
              {actionType === 'remove_from_catalog' ? 'Remove from Catalog' : 'Permanent Delete'}
            </h3>
            <p className="text-xs text-zinc-400 line-clamp-1">
              Target: <span className="text-zinc-200 font-semibold">{itemTitle}</span>
            </p>
          </div>
        </div>

        {/* Option Selection */}
        {catalogName && (
          <div className="space-y-2 mb-5">
            <label className="text-[11px] font-mono uppercase text-zinc-400 block">
              Choose Deletion Scope:
            </label>

            <div
              onClick={() => setActionType('remove_from_catalog')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                actionType === 'remove_from_catalog'
                  ? 'bg-amber-500/15 border-amber-500/50 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-amber-400">1. Remove from this Catalog only</span>
                {actionType === 'remove_from_catalog' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-[11px] text-zinc-400">
                Removes the link from <span className="text-white font-mono">{catalogName}</span>. Content remains safe in your database and other catalogs.
              </p>
            </div>

            <div
              onClick={() => setActionType('permanent_delete')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                actionType === 'permanent_delete'
                  ? 'bg-red-500/15 border-red-500/50 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-red-400">2. Delete Content Permanently</span>
                {actionType === 'permanent_delete' && <Check className="w-4 h-4 text-red-400" />}
              </div>
              <p className="text-[11px] text-zinc-400">
                Moves the item to Trash and completely removes it from all catalog views.
              </p>
            </div>
          </div>
        )}

        {!catalogName && (
          <p className="text-xs text-zinc-300 mb-6 bg-red-950/30 border border-red-500/30 p-3 rounded-xl">
            Are you sure you want to permanently delete <strong className="text-white font-semibold">"{itemTitle}"</strong>?
            This will remove it from the live portfolio.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecute}
            className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
              actionType === 'remove_from_catalog'
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {actionType === 'remove_from_catalog' ? 'Remove from Catalog' : 'Confirm Permanent Delete'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
