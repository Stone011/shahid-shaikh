import { CatalogNode, VideoProject, PhotoItem } from '../types';

/**
 * Recursively find a catalog node by ID in the tree
 */
export function findCatalogNode(nodes: CatalogNode[] = [], id: string): CatalogNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findCatalogNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get the breadcrumb path from root to the target catalog node
 */
export function getCatalogPath(nodes: CatalogNode[] = [], targetId: string, currentPath: CatalogNode[] = []): CatalogNode[] {
  for (const node of nodes) {
    const nextPath = [...currentPath, node];
    if (node.id === targetId) return nextPath;
    if (node.children && node.children.length > 0) {
      const foundPath = getCatalogPath(node.children, targetId, nextPath);
      if (foundPath.length > 0) return foundPath;
    }
  }
  return [];
}

/**
 * Get all descendant IDs of a catalog node (including itself)
 */
export function getAllDescendantIds(node: CatalogNode): string[] {
  const ids: string[] = [node.id];
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      ids.push(...getAllDescendantIds(child));
    }
  }
  return ids;
}

/**
 * Flatten tree for easy select dropdown rendering with visual depth indentation
 */
export interface FlatCatalogItem {
  id: string;
  name: string;
  depth: number;
  pathString: string;
  parentId: string | null;
  node: CatalogNode;
  fullPathNames: string[];
}

export function flattenCatalogTree(
  nodes: CatalogNode[] = [],
  depth = 0,
  parentNames: string[] = [],
  parentId: string | null = null
): FlatCatalogItem[] {
  const flat: FlatCatalogItem[] = [];

  for (const node of nodes) {
    const fullPathNames = [...parentNames, node.name];
    const pathString = fullPathNames.join(' / ');

    flat.push({
      id: node.id,
      name: node.name,
      depth,
      pathString,
      parentId,
      node,
      fullPathNames,
    });

    if (node.children && node.children.length > 0) {
      flat.push(...flattenCatalogTree(node.children, depth + 1, fullPathNames, node.id));
    }
  }

  return flat;
}

/**
 * Add a new catalog node to the tree under parentId (or at root if parentId is null)
 */
export function addCatalogNodeToTree(
  tree: CatalogNode[] = [],
  parentId: string | null,
  newNode: CatalogNode
): CatalogNode[] {
  if (!parentId) {
    return [...tree, newNode];
  }

  return tree.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), { ...newNode, parentId }],
      };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: addCatalogNodeToTree(node.children, parentId, newNode),
      };
    }
    return node;
  });
}

/**
 * Update an existing catalog node
 */
export function updateCatalogNodeInTree(
  tree: CatalogNode[] = [],
  id: string,
  updates: Partial<CatalogNode>
): CatalogNode[] {
  return tree.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateCatalogNodeInTree(node.children, id, updates),
      };
    }
    return node;
  });
}

/**
 * Remove a catalog node from the tree
 */
export function deleteCatalogNodeFromTree(tree: CatalogNode[] = [], id: string): CatalogNode[] {
  return tree
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: deleteCatalogNodeFromTree(node.children, id),
        };
      }
      return node;
    });
}

/**
 * Reorder siblings inside tree
 */
export function moveCatalogNodeInTree(
  tree: CatalogNode[] = [],
  id: string,
  direction: 'up' | 'down'
): CatalogNode[] {
  const index = tree.findIndex((n) => n.id === id);
  if (index !== -1) {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= tree.length) return tree;
    const newTree = [...tree];
    const [moved] = newTree.splice(index, 1);
    newTree.splice(targetIdx, 0, moved);
    return newTree;
  }

  return tree.map((node) => {
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: moveCatalogNodeInTree(node.children, id, direction),
      };
    }
    return node;
  });
}

/**
 * Change the parent of a catalog node (move to another parent or promote to root)
 */
export function changeCatalogParentInTree(
  tree: CatalogNode[] = [],
  nodeId: string,
  newParentId: string | null
): CatalogNode[] {
  const targetNode = findCatalogNode(tree, nodeId);
  if (!targetNode) return tree;
  if (nodeId === newParentId) return tree;

  // Prevent parenting to own descendant
  const descendantIds = getAllDescendantIds(targetNode);
  if (newParentId && descendantIds.includes(newParentId)) return tree;

  // 1. Remove node from old location
  const treeWithoutNode = deleteCatalogNodeFromTree(tree, nodeId);

  // 2. Insert into new location
  const updatedNode = { ...targetNode, parentId: newParentId };
  return addCatalogNodeToTree(treeWithoutNode, newParentId, updatedNode);
}

/**
 * Count projects belonging to a catalog node or any of its descendants
 */
export function countProjectsInCatalogBranch(
  node: CatalogNode,
  projects: (VideoProject | PhotoItem | any)[]
): number {
  const allIds = getAllDescendantIds(node);
  const allNames = getAllDescendantNames(node);

  return projects.filter((p) => {
    if (p.catalogIds && Array.isArray(p.catalogIds) && p.catalogIds.some((cid: string) => allIds.includes(cid))) return true;
    if (p.catalogId && allIds.includes(p.catalogId)) return true;
    if (p.category && allNames.some((n) => n.toLowerCase() === p.category.toLowerCase())) return true;
    return false;
  }).length;
}

export function getAllDescendantNames(node: CatalogNode): string[] {
  const names: string[] = [node.name];
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      names.push(...getAllDescendantNames(child));
    }
  }
  return names;
}

export interface GlobalCatalogEntry {
  id: string;
  name: string;
  type: 'video' | 'photo' | 'song' | 'shoot' | 'direction' | 'general';
  pathString: string;
  description?: string;
  nodeId?: string;
}

/**
 * Standard baseline catalog names to guarantee all requested core catalogs exist
 */
export const CORE_CATALOG_NAMES = [
  'Commercial Work',
  'Brand Vertical',
  'Vertical Commercial',
  'Social Media',
  'Wedding Films',
  'Cinematic',
  'Trailers',
  'Teasers',
  'Reels',
  'Podcasts',
  'Music Videos',
  'Short Films & Stories',
  'Documentary & Concept',
  'Pre-Wedding',
  'Wedding Day',
  'Original Tracks',
  'Film Scores & Sound Design',
  'Spotify & Streaming Releases',
  'Shoot Services',
  'Video Direction',
  'Weddings',
  'Portraits',
  'Events',
  'Lifestyle',
  'Street',
  'Creative',
];

/**
 * Extract EVERY catalog across the entire CMS into a unified, deduplicated list.
 * Live and reactive: newly created catalogs immediately appear everywhere!
 * Guaranteed unique IDs across all entries.
 */
export function getAllGlobalCatalogs(data?: any): GlobalCatalogEntry[] {
  if (!data) {
    const list: GlobalCatalogEntry[] = [];
    const seenIds = new Set<string>();
    for (const name of CORE_CATALOG_NAMES) {
      const id = `cat-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        list.push({
          id,
          name,
          type: 'general',
          pathString: name,
        });
      }
    }
    return list;
  }

  const entriesById = new Map<string, GlobalCatalogEntry>();
  const nameToIdMap = new Map<string, string>();

  const register = (
    name: string,
    id?: string,
    type: 'video' | 'photo' | 'song' | 'shoot' | 'direction' | 'general' = 'general',
    pathString?: string,
    description?: string,
    nodeId?: string
  ) => {
    const trimmed = (name || '').trim();
    if (!trimmed || trimmed.toLowerCase() === 'uncategorized') return;
    const nameKey = trimmed.toLowerCase();

    // Generate base ID if not provided
    const baseId = (id || `cat-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`).trim();

    // Check if we already registered an entry with this name
    if (nameToIdMap.has(nameKey)) {
      const existingId = nameToIdMap.get(nameKey)!;
      const existing = entriesById.get(existingId);
      if (existing) {
        if (pathString && (!existing.pathString || existing.pathString === existing.name)) {
          existing.pathString = pathString;
        }
        if (description && !existing.description) {
          existing.description = description;
        }
        if (nodeId && !existing.nodeId) {
          existing.nodeId = nodeId;
        }
        if (type !== 'general' && existing.type === 'general') {
          existing.type = type;
        }
      }
      return;
    }

    // Check if this ID is already used by an existing entry
    let finalId = baseId;
    if (entriesById.has(finalId)) {
      const existing = entriesById.get(finalId)!;
      // If it's an alias or related name for the same ID (e.g. Podcasts vs Podcasts & Interviews)
      if (
        existing.name.toLowerCase() === nameKey ||
        existing.name.toLowerCase().includes(nameKey) ||
        nameKey.includes(existing.name.toLowerCase())
      ) {
        nameToIdMap.set(nameKey, finalId);
        return;
      }
      // Otherwise, disambiguate with unique suffix
      let counter = 2;
      while (entriesById.has(`${baseId}-${counter}`)) {
        counter++;
      }
      finalId = `${baseId}-${counter}`;
    }

    const entry: GlobalCatalogEntry = {
      id: finalId,
      name: trimmed,
      type,
      pathString: pathString || trimmed,
      description,
      nodeId: nodeId || (id ? id : finalId),
    };

    entriesById.set(finalId, entry);
    nameToIdMap.set(nameKey, finalId);
  };

  // 1. Process Video Catalog Tree
  if (Array.isArray(data.videoCatalogTree)) {
    const flat = flattenCatalogTree(data.videoCatalogTree);
    flat.forEach((item) => {
      register(item.name, item.id, 'video', item.pathString, item.node.description, item.id);
    });
  }

  // 2. Process Photo Catalog Tree
  if (Array.isArray(data.photoCatalogTree)) {
    const flat = flattenCatalogTree(data.photoCatalogTree);
    flat.forEach((item) => {
      register(item.name, item.id, 'photo', item.pathString, item.node.description, item.id);
    });
  }

  // 3. Process Song Catalog Tree
  if (Array.isArray(data.songCatalogTree)) {
    const flat = flattenCatalogTree(data.songCatalogTree);
    flat.forEach((item) => {
      register(item.name, item.id, 'song', item.pathString, item.node.description, item.id);
    });
  }

  // 4. Process flat catalog arrays
  if (Array.isArray(data.globalCatalogues)) {
    data.globalCatalogues.forEach((cat: string) => register(cat, undefined, 'general'));
  }
  if (Array.isArray(data.videoCatalogues)) {
    data.videoCatalogues.forEach((cat: string) => register(cat, undefined, 'video'));
  }
  if (Array.isArray(data.photoCatalogues)) {
    data.photoCatalogues.forEach((cat: string) => register(cat, undefined, 'photo'));
  }
  if (Array.isArray(data.songCatalogues)) {
    data.songCatalogues.forEach((cat: string) => register(cat, undefined, 'song'));
  }

  // 5. Process categories from live projects
  if (Array.isArray(data.videoProjects)) {
    data.videoProjects.forEach((p: any) => {
      if (p.category) register(p.category, p.catalogId, 'video');
      if (Array.isArray(p.categories)) p.categories.forEach((c: string) => register(c, undefined, 'video'));
    });
  }
  if (Array.isArray(data.photography)) {
    data.photography.forEach((p: any) => {
      if (p.category) register(p.category, p.catalogId, 'photo');
      if (Array.isArray(p.categories)) p.categories.forEach((c: string) => register(c, undefined, 'photo'));
    });
  }
  if (Array.isArray(data.shootServices)) {
    data.shootServices.forEach((s: any) => {
      if (s.category) register(s.category, s.catalogId, 'shoot');
      if (Array.isArray(s.categories)) s.categories.forEach((c: string) => register(c, undefined, 'shoot'));
    });
  }
  if (Array.isArray(data.directionProjects)) {
    data.directionProjects.forEach((d: any) => {
      if (d.category) register(d.category, d.catalogId, 'direction');
      if (Array.isArray(d.categories)) d.categories.forEach((c: string) => register(c, undefined, 'direction'));
    });
  }
  if (data.songs) {
    const allSongItems = [
      ...(Array.isArray(data.songs.youtubeSongs) ? data.songs.youtubeSongs : []),
      ...(Array.isArray(data.songs.spotifySongs) ? data.songs.spotifySongs : []),
      ...(Array.isArray(data.songs.audioTracks) ? data.songs.audioTracks : []),
      ...(Array.isArray(data.songs.allSongs) ? data.songs.allSongs : []),
    ];
    allSongItems.forEach((s: any) => {
      if (s.category) register(s.category, s.catalogId, 'song');
      if (Array.isArray(s.categories)) s.categories.forEach((c: string) => register(c, undefined, 'song'));
    });
  }

  // If no catalogs found at all in data, provide fallback baseline
  if (entriesById.size === 0) {
    CORE_CATALOG_NAMES.forEach((name) => register(name, undefined, 'general'));
  }

  return Array.from(entriesById.values()).filter(
    (c) => c.name && c.name.trim().toLowerCase() !== 'uncategorized'
  );
}

/**
 * Returns a sorted unique list of all catalog names across the whole CMS
 */
export function getAllGlobalCatalogNames(data?: any): string[] {
  const catalogs = getAllGlobalCatalogs(data);
  return catalogs
    .map((c) => c.name)
    .filter((name) => name && name.trim().toLowerCase() !== 'uncategorized');
}

/**
 * Helper to recursively update catalog node names in a tree by ID or old name
 */
export function renameCatalogNodeInTree(
  tree: CatalogNode[] = [],
  targetIdOrOldName: string,
  newName: string,
  extraUpdates?: Partial<CatalogNode>
): CatalogNode[] {
  const targetLower = targetIdOrOldName.trim().toLowerCase();
  return tree.map((node) => {
    const isMatch = node.id.toLowerCase() === targetLower || node.name.trim().toLowerCase() === targetLower;
    let updatedNode = { ...node };
    if (isMatch) {
      updatedNode = {
        ...updatedNode,
        ...extraUpdates,
        name: newName.trim(),
      };
    }
    if (node.children && node.children.length > 0) {
      updatedNode.children = renameCatalogNodeInTree(node.children, targetIdOrOldName, newName, extraUpdates);
    }
    return updatedNode;
  });
}

/**
 * Helper to recursively delete catalog node from a tree by ID or name
 */
export function deleteCatalogFromTreeNode(
  tree: CatalogNode[] = [],
  targetIdOrName: string
): CatalogNode[] {
  const targetLower = targetIdOrName.trim().toLowerCase();
  return tree
    .filter((node) => node.id.toLowerCase() !== targetLower && node.name.trim().toLowerCase() !== targetLower)
    .map((node) => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: deleteCatalogFromTreeNode(node.children, targetIdOrName),
        };
      }
      return node;
    });
}

/**
 * Checks whether an item belongs to a specific catalog (by ID or name)
 */
export function isItemInCatalog(
  item: any,
  catalogTarget: string,
  catalogTree?: CatalogNode[]
): boolean {
  if (!item || !catalogTarget) return false;
  const targetLower = catalogTarget.trim().toLowerCase();

  // Direct catalogId match
  if (item.catalogId && item.catalogId.toLowerCase() === targetLower) return true;

  // Direct catalogIds array match
  if (Array.isArray(item.catalogIds) && item.catalogIds.some((id: string) => id.toLowerCase() === targetLower)) {
    return true;
  }

  // Direct category string match
  if (item.category && item.category.trim().toLowerCase() === targetLower) return true;

  // Direct categories array match
  if (Array.isArray(item.categories) && item.categories.some((c: string) => c.trim().toLowerCase() === targetLower)) {
    return true;
  }

  // Tree descendant matching if tree is provided
  if (catalogTree && catalogTree.length > 0) {
    const node = findCatalogNode(catalogTree, catalogTarget);
    if (node) {
      const allIds = getAllDescendantIds(node).map((i) => i.toLowerCase());
      const allNames = getAllDescendantNames(node).map((n) => n.toLowerCase());

      if (item.catalogId && allIds.includes(item.catalogId.toLowerCase())) return true;
      if (Array.isArray(item.catalogIds) && item.catalogIds.some((id: string) => allIds.includes(id.toLowerCase()))) {
        return true;
      }
      if (item.category && allNames.includes(item.category.trim().toLowerCase())) return true;
      if (Array.isArray(item.categories) && item.categories.some((c: string) => allNames.includes(c.trim().toLowerCase()))) {
        return true;
      }
    }
  }

  return false;
}

