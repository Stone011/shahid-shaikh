import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { TrashItem } from '../../types';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Film,
  Camera,
  Music,
  Briefcase,
  Layers,
  FolderTree,
  Search,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';

export const TrashManager: React.FC = () => {
  const { draftData, data, restoreFromTrash, permanentlyDeleteTrashItem, emptyTrash } = usePortfolio();

  const activeData = draftData || data;
  const trashItems: TrashItem[] = activeData.trash || [];

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTrashIds, setSelectedTrashIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRestore = (id: string, title: string) => {
    restoreFromTrash(id);
    showBanner(`✓ Restored "${title}" to its original section`);
  };

  const handlePermanentDelete = (id: string, title: string) => {
    if (window.confirm(`Permanently destroy "${title}"? This cannot be undone.`)) {
      permanentlyDeleteTrashItem(id);
      showBanner(`Item permanently removed from trash`);
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm('Are you sure you want to permanently delete ALL items in the trash? This cannot be undone.')) {
      emptyTrash();
      showBanner('Trash bin completely emptied');
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Film className="w-4 h-4 text-amber-400" />;
      case 'photo':
        return <Camera className="w-4 h-4 text-sky-400" />;
      case 'song':
        return <Music className="w-4 h-4 text-emerald-400" />;
      case 'shoot':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'direction':
        return <Briefcase className="w-4 h-4 text-pink-400" />;
      case 'experience':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'catalog':
        return <FolderTree className="w-4 h-4 text-yellow-400" />;
      default:
        return <Trash2 className="w-4 h-4 text-zinc-400" />;
    }
  };

  const filteredTrash = trashItems.filter((item) => {
    const matchesType = filterType === 'all' || item.itemType === filterType;
    const matchesSearch =
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceCategory?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6" id="trash-manager-container">
      {notification && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2.5">
            <Trash2 className="w-5 h-5 text-amber-500" />
            Safe Delete & Trash Bin ({trashItems.length} items)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Items deleted in the CMS are placed here safely. You can review and restore any item back to its original location anytime before publishing.
          </p>
        </div>

        {trashItems.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleEmptyTrash}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold text-xs rounded-xl border border-red-500/30 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Empty All Trash
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          {[
            { key: 'all', label: 'All Deleted' },
            { key: 'video', label: 'Videos' },
            { key: 'photo', label: 'Photos' },
            { key: 'song', label: 'Songs' },
            { key: 'shoot', label: 'Shoots' },
            { key: 'direction', label: 'Direction' },
            { key: 'experience', label: 'Career' },
            { key: 'catalog', label: 'Catalogs' },
          ].map((tab) => {
            const count = tab.key === 'all' ? trashItems.length : trashItems.filter((t) => t.itemType === tab.key).length;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterType(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === tab.key
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {tab.label} <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search deleted items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 w-64"
          />
        </div>
      </div>

      {/* Trash Item List */}
      {filteredTrash.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-300">Trash bin is clean</h3>
          <p className="text-xs text-zinc-500 mt-1">No items match your current filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrash.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                  {getItemIcon(item.itemType)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] uppercase font-bold text-zinc-300 tracking-wider">
                      {item.itemType}
                    </span>
                    {item.sourceCategory && (
                      <span className="text-[10px] text-amber-400 font-medium">
                        From: {item.sourceCategory}
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-500">
                      Deleted: {new Date(item.deletedAt).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-zinc-100 truncate mt-1">{item.title}</h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRestore(item.id, item.title)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
                  title="Restore this item"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
                <button
                  type="button"
                  onClick={() => handlePermanentDelete(item.id, item.title)}
                  className="flex items-center gap-1 px-3 py-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 text-xs rounded-xl transition-all cursor-pointer"
                  title="Delete permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
