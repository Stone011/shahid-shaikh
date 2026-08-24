import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { CatalogNode, VideoProject, PhotoItem, SongItem } from '../../types';
import {
  findCatalogNode,
  getCatalogPath,
  getAllDescendantIds,
  getAllDescendantNames,
  countProjectsInCatalogBranch,
  flattenCatalogTree,
} from '../../utils/catalogUtils';
import {
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Film,
  Camera,
  Music,
  Check,
  X,
  Layers,
  Sparkles,
  MoveRight,
  AlertTriangle,
  Copy,
  Search,
  Move,
  ExternalLink,
  Tag,
  CheckSquare,
  Square,
  CornerDownRight,
} from 'lucide-react';

interface CatalogTreeManagerProps {
  type: 'video' | 'photo' | 'song';
}

interface ClipboardItem {
  id: string;
  type: 'video' | 'photo' | 'song';
  title: string;
  sourceCatalogId?: string;
  isCut?: boolean;
}

export const CatalogTreeManager: React.FC<CatalogTreeManagerProps> = ({ type }) => {
  const {
    draftData,
    data,
    updateData,

    // Video
    addVideoCatalogNode,
    updateVideoCatalogNode,
    deleteVideoCatalogNode,
    moveVideoCatalogNode,
    changeVideoCatalogParent,
    moveVideoProjectToCatalog,
    copyVideoProjectToCatalog,
    addVideoProjectToCatalog,
    removeVideoProjectFromCatalog,
    batchMoveVideoProjects,
    batchCopyVideoProjects,

    // Photo
    addPhotoCatalogNode,
    updatePhotoCatalogNode,
    deletePhotoCatalogNode,
    movePhotoCatalogNode,
    changePhotoCatalogParent,
    movePhotoToCatalog,
    copyPhotoToCatalog,
    addPhotoToCatalog,
    removePhotoFromCatalog,
    batchMovePhotos,
    batchCopyPhotos,

    // Song
    addSongCatalogNode,
    updateSongCatalogNode,
    deleteSongCatalogNode,
    moveSongCatalogNode,
    changeSongCatalogParent,
    moveSongToCatalog,
    copySongToCatalog,
    addSongToCatalog,
    removeSongFromCatalog,
    batchMoveSongs,
    batchCopySongs,
  } = usePortfolio();

  const activeData = draftData || data;
  const isVideo = type === 'video';
  const isPhoto = type === 'photo';
  const isSong = type === 'song';

  const tree: CatalogNode[] = isVideo
    ? activeData.videoCatalogTree || []
    : isPhoto
    ? activeData.photoCatalogTree || []
    : activeData.songCatalogTree || [];

  const allProjects: any[] = isVideo
    ? activeData.videoProjects || []
    : isPhoto
    ? activeData.photography || []
    : [
        ...(activeData.songs?.allSongs || []),
        ...(activeData.songs?.youtubeSongs || []),
        ...(activeData.songs?.spotifySongs || []),
        ...(activeData.songs?.audioTracks || []),
      ];

  // Local state
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Add Catalog Modal
  const [isAddCatalogModalOpen, setIsAddCatalogModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatCover, setNewCatCover] = useState('');
  const [newCatParentId, setNewCatParentId] = useState<string>('root');

  // Inline edit state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCover, setEditCover] = useState('');

  // Parent relocation modal/dropdown
  const [movingNodeId, setMovingNodeId] = useState<string | null>(null);
  const [targetParentId, setTargetParentId] = useState<string>('root');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Multi-Selection State for Batch Operations
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [batchMoveTargetCatalogId, setBatchMoveTargetCatalogId] = useState<string>('');
  const [isBatchMoveModalOpen, setIsBatchMoveModalOpen] = useState(false);
  const [batchActionType, setBatchActionType] = useState<'move' | 'copy' | 'reference'>('reference');

  const [notification, setNotification] = useState<string | null>(null);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  const flatList = flattenCatalogTree(tree);

  // Filtered flat list of catalogs when searching in tree view
  const matchingCatalogs = useMemo(() => {
    const q = catalogSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return flatList.filter((node) => node.name.toLowerCase().includes(q));
  }, [flatList, catalogSearchQuery]);

  const showBanner = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddCatalog = (parentId?: string) => {
    setNewCatName('');
    setNewCatDesc('');
    setNewCatCover('');
    setNewCatParentId(parentId || 'root');
    setIsAddCatalogModalOpen(true);
  };

  const handleSaveNewCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const parentId = newCatParentId === 'root' ? null : newCatParentId;

    if (isVideo) {
      addVideoCatalogNode(parentId, newCatName.trim(), newCatDesc.trim());
    } else if (isPhoto) {
      addPhotoCatalogNode(parentId, newCatName.trim(), newCatDesc.trim());
    } else {
      addSongCatalogNode(parentId, newCatName.trim(), newCatDesc.trim());
    }

    if (parentId) {
      setCollapsedNodes((prev) => ({ ...prev, [parentId]: false }));
    }

    setIsAddCatalogModalOpen(false);
    showBanner(`✓ Catalog "${newCatName.trim()}" created successfully`);
  };

  const handleStartEdit = (node: CatalogNode) => {
    setEditingNodeId(node.id);
    setEditName(node.name);
    setEditDesc(node.description || '');
    setEditCover(node.coverImage || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    const updates: Partial<CatalogNode> = {
      name: editName.trim(),
      description: editDesc.trim() || undefined,
      coverImage: editCover.trim() || undefined,
    };
    if (isVideo) {
      updateVideoCatalogNode(id, updates);
    } else if (isPhoto) {
      updatePhotoCatalogNode(id, updates);
    } else {
      updateSongCatalogNode(id, updates);
    }
    setEditingNodeId(null);
    showBanner(`✓ Catalog updated`);
  };

  const handleDeleteCatalog = (id: string) => {
    if (isVideo) {
      deleteVideoCatalogNode(id);
    } else if (isPhoto) {
      deletePhotoCatalogNode(id);
    } else {
      deleteSongCatalogNode(id);
    }
    setDeleteConfirmId(null);
    if (selectedNodeId === id) setSelectedNodeId(null);
    showBanner(`✓ Catalog deleted (moved to Trash)`);
  };

  const handleMoveOrder = (id: string, direction: 'up' | 'down') => {
    if (isVideo) {
      moveVideoCatalogNode(id, direction);
    } else if (isPhoto) {
      movePhotoCatalogNode(id, direction);
    } else {
      moveSongCatalogNode(id, direction);
    }
  };

  const handleSaveParentChange = (nodeId: string) => {
    const parent = targetParentId === 'root' ? null : targetParentId;
    if (isVideo) {
      changeVideoCatalogParent(nodeId, parent);
    } else if (isPhoto) {
      changePhotoCatalogParent(nodeId, parent);
    } else {
      changeSongCatalogParent(nodeId, parent);
    }
    setMovingNodeId(null);
    showBanner(`✓ Catalog hierarchy relocated`);
  };

  // Get items assigned to the currently selected catalog
  const getItemsForSelectedCatalog = () => {
    if (!selectedNodeId) return [];
    const selectedNode = findCatalogNode(tree, selectedNodeId);
    if (!selectedNode) return [];

    const branchIds = getAllDescendantIds(selectedNode);
    const branchNames = getAllDescendantNames(selectedNode).map((n) => n.toLowerCase());

    return allProjects.filter((p) => {
      // 1. Direct Multi-Catalog match
      if (p.catalogIds && Array.isArray(p.catalogIds) && p.catalogIds.some((cid: string) => branchIds.includes(cid))) {
        return true;
      }
      // 2. Primary catalogId match
      if (p.catalogId && branchIds.includes(p.catalogId)) {
        return true;
      }
      // 3. Category name match
      if (p.category && branchNames.includes(p.category.toLowerCase())) {
        return true;
      }
      return false;
    });
  };

  const currentAssignedItems = getItemsForSelectedCatalog().filter((item) => {
    if (!itemSearchQuery) return true;
    return (
      item.title?.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.client?.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.artist?.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(itemSearchQuery.toLowerCase())
    );
  });

  const selectedNode = selectedNodeId ? findCatalogNode(tree, selectedNodeId) : null;
  const selectedNodeBreadcrumb = selectedNodeId ? getCatalogPath(tree, selectedNodeId) : [];

  // Batch execute
  const handleExecuteBatchAction = () => {
    if (!batchMoveTargetCatalogId || selectedItemIds.length === 0) return;
    const targetNode = findCatalogNode(tree, batchMoveTargetCatalogId);
    if (!targetNode) return;

    if (batchActionType === 'move') {
      if (isVideo) batchMoveVideoProjects(selectedItemIds, batchMoveTargetCatalogId);
      else if (isPhoto) batchMovePhotos(selectedItemIds, batchMoveTargetCatalogId);
      else batchMoveSongs(selectedItemIds, batchMoveTargetCatalogId);
      showBanner(`✓ Moved ${selectedItemIds.length} item(s) to "${targetNode.name}"`);
    } else if (batchActionType === 'reference') {
      // Multi-catalog reference (item is now in both catalogs)
      selectedItemIds.forEach((id) => {
        if (isVideo) addVideoProjectToCatalog(id, batchMoveTargetCatalogId);
        else if (isPhoto) addPhotoToCatalog(id, batchMoveTargetCatalogId);
        else addSongToCatalog(id, batchMoveTargetCatalogId);
      });
      showBanner(`✓ Added multi-catalog reference for ${selectedItemIds.length} item(s) in "${targetNode.name}"`);
    } else {
      // True clone
      if (isVideo) batchCopyVideoProjects(selectedItemIds, batchMoveTargetCatalogId, true);
      else if (isPhoto) batchCopyPhotos(selectedItemIds, batchMoveTargetCatalogId, true);
      else batchCopySongs(selectedItemIds, batchMoveTargetCatalogId, true);
      showBanner(`✓ Duplicated ${selectedItemIds.length} item(s) into "${targetNode.name}"`);
    }

    setSelectedItemIds([]);
    setIsBatchMoveModalOpen(false);
  };

  // Render recursive catalog branch node
  const renderTreeNode = (node: CatalogNode, depth = 0) => {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isCollapsed = collapsedNodes[node.id] ?? false;
    const isSelected = selectedNodeId === node.id;
    const itemCount = countProjectsInCatalogBranch(node, allProjects);
    const isEditing = editingNodeId === node.id;

    // Check if this is VERTICAL COMMERCIAL
    const isVerticalCommercial = node.name.toUpperCase().includes('VERTICAL COMMERCIAL');

    return (
      <div key={node.id} className="select-none" style={{ marginLeft: depth > 0 ? `${depth * 18}px` : '0px' }}>
        <div
          onClick={() => setSelectedNodeId(node.id)}
          className={`flex items-center justify-between gap-2 p-2.5 my-1 rounded-xl transition-all border cursor-pointer ${
            isSelected
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-md'
              : 'bg-zinc-900/70 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse(node.id);
                }}
                className="p-1 hover:text-white text-zinc-400 rounded cursor-pointer"
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-5" />
            )}

            {isSelected ? (
              <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-zinc-400 shrink-0" />
            )}

            {isEditing ? (
              <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-zinc-950 border border-amber-500 rounded px-2 py-1 text-xs text-zinc-100 flex-1"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(node.id)}
                  className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingNodeId(null)}
                  className="p-1 text-zinc-400 hover:bg-zinc-800 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-xs truncate">{node.name}</span>
                {isVerticalCommercial && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                    9:16 REELS & ADS
                  </span>
                )}
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {itemCount}
                </span>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1 opacity-80 hover:opacity-100" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => handleOpenAddCatalog(node.id)}
                className="p-1 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded"
                title="Add Sub-Catalog inside this folder"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleStartEdit(node)}
                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded"
                title="Rename Catalog"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveOrder(node.id, 'up')}
                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveOrder(node.id, 'down')}
                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCatalog(node.id)}
                className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                title="Delete Catalog"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && !isCollapsed && (
          <div className="border-l border-zinc-800/80 ml-3 pl-1">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" id={`catalog-tree-manager-${type}`}>
      {notification && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2.5">
            {isVideo ? (
              <Film className="w-5 h-5 text-amber-500" />
            ) : isPhoto ? (
              <Camera className="w-5 h-5 text-sky-400" />
            ) : (
              <Music className="w-5 h-5 text-emerald-400" />
            )}
            {isVideo ? 'Video Catalog Tree' : isPhoto ? 'Photography Catalog Tree' : 'Song & Music Catalog Tree'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Create multi-tier folders, sub-catalogs, and multi-catalog item assignments with instant drag and relocation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenAddCatalog('root')}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Root Catalog
          </button>
        </div>
      </div>

      {/* 2-Column Layout: Tree on Left, Assigned Items on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tree Navigation (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Catalog Hierarchy ({flatList.length} Folders)
            </span>
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                selectedNodeId === null ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Show All Items
            </button>
          </div>

          {/* Search Folder Hierarchy */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={catalogSearchQuery}
              onChange={(e) => setCatalogSearchQuery(e.target.value)}
              placeholder="Search folders in hierarchy..."
              className="w-full pl-8 pr-7 py-1.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            {catalogSearchQuery && (
              <button
                type="button"
                onClick={() => setCatalogSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-1 space-y-1">
            {catalogSearchQuery.trim() ? (
              matchingCatalogs.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs">
                  No folders match "{catalogSearchQuery}".
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider px-1 mb-1">
                    Matching Catalogs ({matchingCatalogs.length})
                  </div>
                  {matchingCatalogs.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const path = getCatalogPath(tree, node.id);
                    const catalogNode = findCatalogNode(tree, node.id);
                    const count = catalogNode ? countProjectsInCatalogBranch(catalogNode, allProjects) : 0;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                            : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold truncate">{node.name}</div>
                            {path.length > 1 && (
                              <div className="text-[10px] text-zinc-500 truncate">
                                {path.map((p) => p.name).join(' / ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )
            ) : tree.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No catalogs defined yet. Click "Create Root Catalog" above.
              </div>
            ) : (
              tree.map((node) => renderTreeNode(node, 0))
            )}
          </div>
        </div>

        {/* Right Column: Assigned Items in Selected Catalog (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800 p-4 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span>Catalog:</span>
                {selectedNodeBreadcrumb.length > 0 ? (
                  selectedNodeBreadcrumb.map((b, idx) => (
                    <span key={b.id} className="flex items-center gap-1 text-zinc-200 font-semibold">
                      {idx > 0 && <span className="text-zinc-600">/</span>}
                      {b.name}
                    </span>
                  ))
                ) : (
                  <span className="text-amber-400 font-semibold">All Items</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {currentAssignedItems.length} items assigned to this catalog branch
              </p>
            </div>

            {/* Batch Controls */}
            {selectedItemIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-semibold">
                  {selectedItemIds.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => setIsBatchMoveModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-all"
                >
                  Relocate / Tag Multi-Catalog
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItemIds([])}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Search within catalog */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search items in this catalog..."
              value={itemSearchQuery}
              onChange={(e) => setItemSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Items List */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {currentAssignedItems.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No items found in this catalog view.
              </div>
            ) : (
              currentAssignedItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const thumb = item.thumbnail || item.imageUrl || item.coverImage || item.cover;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-zinc-100'
                        : 'bg-zinc-950/80 hover:bg-zinc-900 border-zinc-800/80 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItemIds((prev) =>
                            prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                          );
                        }}
                        className="p-1 text-zinc-400 hover:text-amber-400"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </button>

                      {thumb && (
                        <img
                          src={thumb}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-8 rounded object-cover bg-zinc-900 shrink-0"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-zinc-100 truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-amber-400/90 font-medium">
                            {item.category || item.client || item.artist}
                          </span>
                          {item.catalogIds && item.catalogIds.length > 1 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                              In {item.catalogIds.length} Catalogs
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick multi-catalog tags */}
                    <div className="flex items-center gap-1">
                      {item.videoUrl && (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-zinc-400 hover:text-amber-400"
                          title="Open URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Catalog Modal */}
      {isAddCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-500" />
                Create New Catalog
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCatalogModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCatalog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Catalog Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  placeholder="e.g. VERTICAL COMMERCIAL, Luxury Weddings, Traps"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Parent Folder</label>
                <select
                  value={newCatParentId}
                  onChange={(e) => setNewCatParentId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                >
                  <option value="root">Root Level (Top Parent)</option>
                  {flatList.map((cat, idx) => (
                    <option key={`${cat.id}-${idx}`} value={cat.id}>
                      {cat.pathString}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  placeholder="Brief summary of this catalog collection..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddCatalogModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl"
                >
                  Create Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Relocation / Multi-Catalog Modal */}
      {isBatchMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                Batch Catalog Action ({selectedItemIds.length} Items)
              </h3>
              <button
                type="button"
                onClick={() => setIsBatchMoveModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Target Catalog Folder</label>
                <select
                  value={batchMoveTargetCatalogId}
                  onChange={(e) => setBatchMoveTargetCatalogId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                >
                  <option value="">Select a catalog...</option>
                  {flatList.map((cat, idx) => (
                    <option key={`${cat.id}-${idx}`} value={cat.id}>
                      {cat.pathString}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Action Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchActionType('reference')}
                    className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      batchActionType === 'reference'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    Add Multi-Catalog Reference
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchActionType('move')}
                    className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      batchActionType === 'move'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    Relocate / Move
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchActionType('copy')}
                    className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      batchActionType === 'copy'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    Clone as Copy
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBatchMoveModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!batchMoveTargetCatalogId}
                  onClick={handleExecuteBatchAction}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-xs font-bold rounded-xl"
                >
                  Apply Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
