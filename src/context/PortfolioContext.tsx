import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  PortfolioData,
  PhotoItem,
  VideoProject,
  SectionVisibility,
  CatalogNode,
  TrashItem,
  BackupItem,
  YouTubeSong,
  SpotifySong,
  AudioTrack,
  SongItem,
  ShootService,
  DirectionProject,
  ExperienceItem,
} from '../types';
import {
  initialPortfolioData,
  defaultVideoCatalogTree,
  defaultPhotoCatalogTree,
  defaultSongCatalogTree,
} from '../data/initialData';
import {
  addCatalogNodeToTree,
  updateCatalogNodeInTree,
  deleteCatalogNodeFromTree,
  moveCatalogNodeInTree,
  changeCatalogParentInTree,
  findCatalogNode,
  getCatalogPath,
  getAllGlobalCatalogs,
  getAllGlobalCatalogNames,
  GlobalCatalogEntry,
  renameCatalogNodeInTree,
  deleteCatalogFromTreeNode,
  getAllDescendantNames,
} from '../utils/catalogUtils';

const defaultSectionVisibility: SectionVisibility = {
  hero: true,
  about: true,
  videoEditing: true,
  weddingFilms: true,
  cinematic: true,
  trailers: true,
  teasers: true,
  reels: true,
  photography: true,
  shootServices: true,
  videoDirection: true,
  mySongs: true,
  experience: true,
  skills: true,
  contact: true,
};

export interface ServerBackupInfo {
  filename: string;
  timestamp: string;
  label: string;
  sizeBytes: number;
  videoProjectsCount: number;
  photosCount: number;
}

interface PortfolioContextType {
  data: PortfolioData; // Saved live data rendered on public website
  draftData: PortfolioData; // Working draft state in CMS
  hasUnsavedChanges: boolean;
  saveChanges: () => Promise<boolean>;
  saveChangesWithDetails: () => Promise<{ success: boolean; message?: string }>;
  discardChanges: () => void;
  resetSectionToDefault: (sectionKey: string) => void;
  resetAllToDefaults: () => void;
  requestExitCMS: () => void;
  forceExitCMS: () => void;
  isUnsavedPromptOpen: boolean;
  setIsUnsavedPromptOpen: (val: boolean) => void;
  handleSaveAndLeave: () => Promise<void>;
  handleDiscardAndLeave: () => void;

  isLoading: boolean;
  isAuthenticated: boolean;
  isAdminView: boolean;
  setIsAdminView: (val: boolean) => void;
  openCustomize: () => void;
  login: (username: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateData: (updater: (prev: PortfolioData) => PortfolioData) => void;
  setDataDirectly: (newData: PortfolioData) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => Promise<boolean>;

  // Undo & Redo System
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  undoCount: number;
  redoCount: number;

  // Section toggle helper
  toggleSectionVisibility: (sectionKey: keyof SectionVisibility) => void;

  // Global Catalog System
  allGlobalCatalogs: GlobalCatalogEntry[];
  allGlobalCatalogNames: string[];
  addGlobalCatalog: (name: string, type?: 'video' | 'photo' | 'song' | 'shoot' | 'direction' | 'general') => void;
  removeGlobalCatalog: (name: string) => void;
  renameCatalogEverywhere: (oldName: string, newName: string, type?: 'video' | 'photo' | 'song' | 'shoot' | 'direction' | 'all') => void;
  deleteCatalogEverywhere: (targetName: string, type?: 'video' | 'photo' | 'song' | 'shoot' | 'direction' | 'all') => void;

  // Video Catalog Tree Handlers
  addVideoCatalogNode: (parentId: string | null, name: string, description?: string) => void;
  updateVideoCatalogNode: (id: string, updates: Partial<CatalogNode>) => void;
  deleteVideoCatalogNode: (id: string) => void;
  moveVideoCatalogNode: (id: string, direction: 'up' | 'down') => void;
  changeVideoCatalogParent: (nodeId: string, newParentId: string | null) => void;

  // Photo Catalog Tree Handlers
  addPhotoCatalogNode: (parentId: string | null, name: string, description?: string) => void;
  updatePhotoCatalogNode: (id: string, updates: Partial<CatalogNode>) => void;
  deletePhotoCatalogNode: (id: string) => void;
  movePhotoCatalogNode: (id: string, direction: 'up' | 'down') => void;
  changePhotoCatalogParent: (nodeId: string, newParentId: string | null) => void;

  // Song Catalog Tree Handlers
  addSongCatalogNode: (parentId: string | null, name: string, description?: string) => void;
  updateSongCatalogNode: (id: string, updates: Partial<CatalogNode>) => void;
  deleteSongCatalogNode: (id: string) => void;
  moveSongCatalogNode: (id: string, direction: 'up' | 'down') => void;
  changeSongCatalogParent: (nodeId: string, newParentId: string | null) => void;

  // Item Relocation & Multi-Catalog Operations
  moveVideoProjectToCatalog: (projectId: string, catalogId: string) => void;
  copyVideoProjectToCatalog: (projectId: string, catalogId: string, duplicateAsNew?: boolean) => void;
  addVideoProjectToCatalog: (projectId: string, catalogId: string) => void;
  removeVideoProjectFromCatalog: (projectId: string, catalogId: string) => void;
  batchMoveVideoProjects: (projectIds: string[], catalogId: string) => void;
  batchCopyVideoProjects: (projectIds: string[], catalogId: string, duplicateAsNew?: boolean) => void;

  movePhotoToCatalog: (photoId: string, catalogId: string) => void;
  copyPhotoToCatalog: (photoId: string, catalogId: string, duplicateAsNew?: boolean) => void;
  addPhotoToCatalog: (photoId: string, catalogId: string) => void;
  removePhotoFromCatalog: (photoId: string, catalogId: string) => void;
  batchMovePhotos: (photoIds: string[], catalogId: string) => void;
  batchCopyPhotos: (photoIds: string[], catalogId: string, duplicateAsNew?: boolean) => void;

  // Shoot Services Catalog Operations
  moveShootToCatalog: (shootId: string, catalogId: string) => void;
  copyShootToCatalog: (shootId: string, catalogId: string, duplicateAsNew?: boolean) => void;
  addShootToCatalog: (shootId: string, catalogId: string) => void;
  removeShootFromCatalog: (shootId: string, catalogId: string) => void;

  // Direction Projects Catalog Operations
  moveDirectionToCatalog: (directionId: string, catalogId: string) => void;
  copyDirectionToCatalog: (directionId: string, catalogId: string, duplicateAsNew?: boolean) => void;
  addDirectionToCatalog: (directionId: string, catalogId: string) => void;
  removeDirectionFromCatalog: (directionId: string, catalogId: string) => void;

  // Universal Cross-Section Item Relocation
  moveItemToCatalog: (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song',
    itemId: string,
    targetCatalogIdOrName: string,
    sourceCatalogIdOrName?: string
  ) => void;
  copyItemToCatalog: (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song',
    itemId: string,
    targetCatalogIdOrName: string,
    duplicateAsNew?: boolean
  ) => void;
  addItemToCatalog: (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song',
    itemId: string,
    catalogIdOrName: string
  ) => void;
  removeItemFromCatalog: (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song',
    itemId: string,
    catalogIdOrName: string
  ) => void;
  permanentlyDeleteItem: (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song' | 'experience' | 'catalog' | 'general',
    itemId: string | string[]
  ) => Promise<boolean>;

  // Songs Operations
  moveSongToCatalog: (songId: string, catalogId: string) => void;
  copySongToCatalog: (songId: string, catalogId: string, duplicateAsNew?: boolean) => void;
  addSongToCatalog: (songId: string, catalogId: string) => void;
  removeSongFromCatalog: (songId: string, catalogId: string) => void;
  batchMoveSongs: (songIds: string[], catalogId: string) => void;
  batchCopySongs: (songIds: string[], catalogId: string, duplicateAsNew?: boolean) => void;

  // Trash & Safe Delete System
  deleteItemToTrash: (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song' | 'experience' | 'catalog',
    itemData: any,
    sourceCatalogId?: string,
    sourceCategory?: string
  ) => void;
  restoreFromTrash: (trashId: string) => void;
  permanentlyDeleteTrashItem: (trashId: string) => void;
  emptyTrash: () => void;

  // Version Snapshots & Backups
  serverBackups: ServerBackupInfo[];
  fetchServerBackups: () => Promise<void>;
  restoreServerBackup: (filename: string) => Promise<boolean>;
  createServerSnapshot: (label?: string) => Promise<boolean>;
  createLocalSnapshot: (label?: string) => void;
  restoreLocalSnapshot: (backupId: string) => void;
  deleteLocalSnapshot: (backupId: string) => void;

  // Video Modal State
  activeVideo: { url: string; title: string; category?: string } | null;
  openVideoModal: (url: string, title: string, category?: string) => void;
  closeVideoModal: () => void;

  // Photo Lightbox State
  activePhotoIndex: number | null;
  activePhotoList: PhotoItem[];
  openPhotoLightbox: (photos: PhotoItem[], index: number) => void;
  closePhotoLightbox: () => void;
  nextPhoto: () => void;
  prevPhoto: () => void;

  // Login modal trigger
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (val: boolean) => void;
}

const LOCAL_STORAGE_KEY = 'shahid_portfolio_data_v2';
const AUTH_TOKEN_KEY = 'shahid_portfolio_auth_token';
const MAX_HISTORY = 40;

/**
 * Absolute Data Preservation Helper:
 * Preserves every existing user key, array, and relationship.
 * Guarantees VERTICAL COMMERCIAL catalog & Urban Company experience exist without overriding custom user data.
 */
// Helper to recursively strip any "Uncategorized" nodes from catalog trees
const cleanCatalogTreeNodes = (nodes: CatalogNode[] = []): CatalogNode[] => {
  return nodes
    .filter((n) => n && n.name && n.name.trim().toLowerCase() !== 'uncategorized')
    .map((n) => ({
      ...n,
      children: n.children ? cleanCatalogTreeNodes(n.children) : [],
    }));
};

const cleanCatalogList = (list: string[] = []): string[] => {
  return list.filter((c) => c && typeof c === 'string' && c.trim().toLowerCase() !== 'uncategorized');
};

const cleanItemCategory = <T extends { category?: string; catalogId?: string; catalogIds?: string[]; categories?: string[] }>(item: T): T => {
  const isUncat = (item.category || '').trim().toLowerCase() === 'uncategorized';
  const newCat = isUncat ? '' : (item.category || '');
  const newCatalogIds = (item.catalogIds || []).filter((id) => id && id.toLowerCase() !== 'uncategorized');
  const newCategories = (item.categories || []).filter((c) => c && c.toLowerCase() !== 'uncategorized');
  return {
    ...item,
    category: newCat,
    catalogId: isUncat ? undefined : item.catalogId,
    catalogIds: newCatalogIds,
    categories: newCategories,
  };
};

export const ensureDataIntegrity = (raw: any): PortfolioData => {
  if (!raw || typeof raw !== 'object') return initialPortfolioData;

  // 1. Video Catalog Tree
  const videoTree: CatalogNode[] = cleanCatalogTreeNodes(
    Array.isArray(raw.videoCatalogTree) ? [...raw.videoCatalogTree] : [...defaultVideoCatalogTree]
  );

  // 2. Photo Catalog Tree
  const photoTree: CatalogNode[] = cleanCatalogTreeNodes(
    Array.isArray(raw.photoCatalogTree) ? [...raw.photoCatalogTree] : [...defaultPhotoCatalogTree]
  );

  // 3. Song Catalog Tree
  const songTree: CatalogNode[] = cleanCatalogTreeNodes(
    Array.isArray(raw.songCatalogTree) ? [...raw.songCatalogTree] : [...defaultSongCatalogTree]
  );

  // 4. Catalogues
  const videoCatalogues: string[] = cleanCatalogList(
    Array.isArray(raw.videoCatalogues) ? [...raw.videoCatalogues] : [...(initialPortfolioData.videoCatalogues || [])]
  );
  const photoCatalogues: string[] = cleanCatalogList(
    Array.isArray(raw.photoCatalogues) ? [...raw.photoCatalogues] : [...(initialPortfolioData.photoCatalogues || [])]
  );
  const songCatalogues: string[] = cleanCatalogList(
    Array.isArray(raw.songCatalogues) ? [...raw.songCatalogues] : [...(initialPortfolioData.songCatalogues || [])]
  );
  const globalCatalogues: string[] = cleanCatalogList(
    Array.isArray(raw.globalCatalogues) ? [...raw.globalCatalogues] : []
  );

  // 5. Experiences
  const experiences: ExperienceItem[] = Array.isArray(raw.experiences)
    ? [...raw.experiences]
    : [...initialPortfolioData.experiences];

  // 6. Video Projects
  const videoProjects: VideoProject[] = (
    Array.isArray(raw.videoProjects) ? [...raw.videoProjects] : [...initialPortfolioData.videoProjects]
  ).map(cleanItemCategory);

  // 7. Photography
  const photography: PhotoItem[] = (
    Array.isArray(raw.photography) ? [...raw.photography] : [...initialPortfolioData.photography]
  ).map(cleanItemCategory);

  // 8. Shoots and Direction
  const shootServices: ShootService[] = (
    Array.isArray(raw.shootServices) ? [...raw.shootServices] : [...(initialPortfolioData.shootServices || [])]
  ).map(cleanItemCategory);

  const directionProjects: DirectionProject[] = (
    Array.isArray(raw.directionProjects) ? [...raw.directionProjects] : [...(initialPortfolioData.directionProjects || [])]
  ).map(cleanItemCategory);

  // 9. Songs
  const songs = raw.songs && typeof raw.songs === 'object'
    ? {
        youtubeSongs: (Array.isArray(raw.songs.youtubeSongs) ? raw.songs.youtubeSongs : (initialPortfolioData.songs.youtubeSongs || [])).map(cleanItemCategory),
        spotifySongs: (Array.isArray(raw.songs.spotifySongs) ? raw.songs.spotifySongs : (initialPortfolioData.songs.spotifySongs || [])).map(cleanItemCategory),
        audioTracks: (Array.isArray(raw.songs.audioTracks) ? raw.songs.audioTracks : (initialPortfolioData.songs.audioTracks || [])).map(cleanItemCategory),
        allSongs: (Array.isArray(raw.songs.allSongs) ? raw.songs.allSongs : []).map(cleanItemCategory),
      }
    : initialPortfolioData.songs;

  // 10. Trash and Backups
  const trash: TrashItem[] = Array.isArray(raw.trash) ? raw.trash : [];
  const backups: BackupItem[] = Array.isArray(raw.backups) ? raw.backups : [];

  return {
    ...initialPortfolioData,
    ...raw,
    sections: {
      ...defaultSectionVisibility,
      ...(raw.sections || {}),
    },
    videoCatalogTree: videoTree,
    photoCatalogTree: photoTree,
    songCatalogTree: songTree,
    videoCatalogues,
    photoCatalogues,
    songCatalogues,
    globalCatalogues,
    videoProjects,
    photography,
    shootServices,
    directionProjects,
    songs,
    experiences,
    skills: Array.isArray(raw.skills) ? raw.skills : (initialPortfolioData.skills || []),
    general: { ...initialPortfolioData.general, ...(raw.general || {}) },
    hero: { ...initialPortfolioData.hero, ...(raw.hero || {}) },
    about: { ...initialPortfolioData.about, ...(raw.about || {}) },
    contact: { ...initialPortfolioData.contact, ...(raw.contact || {}) },
    trash,
    backups,
  };
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Live / Saved portfolio data (visible on public site)
  const [data, setData] = useState<PortfolioData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('shahid_portfolio_data_v1');
      if (saved) {
        return ensureDataIntegrity(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse local storage data:', e);
    }
    return initialPortfolioData;
  });

  // Working draft data inside the CMS
  const [draftData, setDraftData] = useState<PortfolioData>(data);

  // History Stacks for Undo / Redo within CMS
  const [pastStack, setPastStack] = useState<PortfolioData[]>([]);
  const [futureStack, setFutureStack] = useState<PortfolioData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  });
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isUnsavedPromptOpen, setIsUnsavedPromptOpen] = useState<boolean>(false);

  // Server backups state
  const [serverBackups, setServerBackups] = useState<ServerBackupInfo[]>([]);

  // Modal states
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string; category?: string } | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [activePhotoList, setActivePhotoList] = useState<PhotoItem[]>([]);

  // Calculate if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    try {
      return JSON.stringify(draftData) !== JSON.stringify(data);
    } catch {
      return false;
    }
  }, [draftData, data]);

  // Sync draftData with live data when live data is initialized or loaded
  useEffect(() => {
    if (!isAdminView && !hasUnsavedChanges) {
      setDraftData(data);
    }
  }, [data, isAdminView, hasUnsavedChanges]);

  // Load from backend API on initial startup if available
  useEffect(() => {
    const fetchRemoteData = async () => {
      try {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            const merged = ensureDataIntegrity(result.data);
            setData(merged);
            setDraftData(merged);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          }
        }
      } catch (err) {
        console.log('Using local client data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRemoteData();
  }, []);

  // Fetch server backups list
  const fetchServerBackups = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio/backups');
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.backups)) {
          setServerBackups(result.backups);
        }
      }
    } catch (err) {
      console.warn('Could not fetch server backups:', err);
    }
  }, []);

  useEffect(() => {
    if (isAdminView) {
      fetchServerBackups();
    }
  }, [isAdminView, fetchServerBackups]);

  // Protect against accidental tab closure when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Verify auth token with backend if present
  useEffect(() => {
    const verifyAuth = async () => {
      if (!authToken) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const json = await res.json();
          setIsAuthenticated(json.authenticated);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setAuthToken(null);
        }
      } catch {
        if (authToken) {
          setIsAuthenticated(true);
        }
      }
    };

    verifyAuth();
  }, [authToken]);

  const openCustomize = useCallback(() => {
    if (isAuthenticated) {
      setDraftData(data);
      setIsAdminView(true);
    } else {
      setIsLoginModalOpen(true);
    }
  }, [isAuthenticated, data]);

  const login = async (username: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });

      const result = await res.json();
      if (result.success && result.token) {
        setAuthToken(result.token);
        localStorage.setItem(AUTH_TOKEN_KEY, result.token);
        setIsAuthenticated(true);
        setDraftData(data);
        setIsAdminView(true);
        setIsLoginModalOpen(false);
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Invalid credentials' };
      }
    } catch (err) {
      const u = username.trim().toLowerCase();
      if ((u === 'shahid' || u === 'shahid shaikh' || u === 'stonegangdestroy8766@gmail.com') && pass.trim() === 'Zainab8766') {
        const localToken = btoa(`${username}:${Date.now()}:shahid-portfolio-session-key-2026`);
        setAuthToken(localToken);
        localStorage.setItem(AUTH_TOKEN_KEY, localToken);
        setIsAuthenticated(true);
        setDraftData(data);
        setIsAdminView(true);
        setIsLoginModalOpen(false);
        return { success: true };
      }
      return { success: false, message: 'Authentication failed. Please check credentials.' };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setIsAdminView(false);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  // In-flight save lock and queue
  const isSavingRef = useRef<boolean>(false);

  const syncToServer = useCallback(
    async (newData: PortfolioData): Promise<PortfolioData> => {
      if (!authToken) {
        throw new Error('Not authenticated. Please login to save changes to the live portfolio.');
      }

      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ data: newData }),
      });

      if (!res.ok) {
        let errMessage = `Server responded with HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson.message) errMessage = errJson.message;
        } catch {}
        throw new Error(errMessage);
      }

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Server rejected portfolio update');
      }

      fetchServerBackups();
      return result.data ? ensureDataIntegrity(result.data) : newData;
    },
    [authToken, fetchServerBackups]
  );

  // Update Data in Draft with History Tracking
  const updateData = useCallback(
    (updater: (prev: PortfolioData) => PortfolioData) => {
      setDraftData((prev) => {
        setPastStack((past) => [...past, prev].slice(-MAX_HISTORY));
        setFutureStack([]);
        return ensureDataIntegrity(updater(prev));
      });
    },
    []
  );

  // Undo / Redo Actions in CMS Draft
  const undo = useCallback(() => {
    if (pastStack.length === 0) return;
    const previous = pastStack[pastStack.length - 1];
    const newPast = pastStack.slice(0, pastStack.length - 1);

    setFutureStack((prev) => [draftData, ...prev].slice(0, MAX_HISTORY));
    setPastStack(newPast);
    setDraftData(previous);
  }, [pastStack, draftData]);

  const redo = useCallback(() => {
    if (futureStack.length === 0) return;
    const next = futureStack[0];
    const newFuture = futureStack.slice(1);

    setPastStack((prev) => [...prev, draftData].slice(-MAX_HISTORY));
    setFutureStack(newFuture);
    setDraftData(next);
  }, [futureStack, draftData]);

  // Unified Global Catalogs across entire CMS
  const allGlobalCatalogs = useMemo(() => {
    return getAllGlobalCatalogs(draftData || data);
  }, [draftData, data]);

  const allGlobalCatalogNames = useMemo(() => {
    return getAllGlobalCatalogNames(draftData || data);
  }, [draftData, data]);

  const addGlobalCatalog = useCallback((name: string, type: 'video' | 'photo' | 'song' | 'shoot' | 'direction' | 'general' = 'general') => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.toLowerCase() === 'uncategorized') return;
    updateData((prev) => {
      const existingGlobal = prev.globalCatalogues || [];
      const isDuplicate = existingGlobal.some((c) => c.toLowerCase() === trimmed.toLowerCase());
      const nextGlobal = isDuplicate ? existingGlobal : [...existingGlobal, trimmed];

      let nextVideoCats = prev.videoCatalogues || [];
      let nextPhotoCats = prev.photoCatalogues || [];
      let nextSongCats = prev.songCatalogues || [];

      if (type === 'video' && !nextVideoCats.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        nextVideoCats = [...nextVideoCats, trimmed];
      } else if (type === 'photo' && !nextPhotoCats.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        nextPhotoCats = [...nextPhotoCats, trimmed];
      } else if (type === 'song' && !nextSongCats.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        nextSongCats = [...nextSongCats, trimmed];
      }

      return {
        ...prev,
        globalCatalogues: nextGlobal,
        videoCatalogues: nextVideoCats,
        photoCatalogues: nextPhotoCats,
        songCatalogues: nextSongCats,
      };
    });
  }, [updateData]);

  const renameCatalogEverywhere = useCallback((oldName: string, newName: string, type: 'video' | 'photo' | 'song' | 'shoot' | 'direction' | 'all' = 'all') => {
    const oldTrimmed = oldName.trim();
    const newTrimmed = newName.trim();
    if (!oldTrimmed || !newTrimmed || oldTrimmed.toLowerCase() === newTrimmed.toLowerCase()) return;
    const oldLower = oldTrimmed.toLowerCase();

    updateData((prev) => {
      // 1. Trees
      const videoCatalogTree = renameCatalogNodeInTree(prev.videoCatalogTree || defaultVideoCatalogTree, oldTrimmed, newTrimmed);
      const photoCatalogTree = renameCatalogNodeInTree(prev.photoCatalogTree || defaultPhotoCatalogTree, oldTrimmed, newTrimmed);
      const songCatalogTree = renameCatalogNodeInTree(prev.songCatalogTree || defaultSongCatalogTree, oldTrimmed, newTrimmed);

      // 2. Arrays (in-place index replacement)
      const replaceInList = (list: string[] = []) =>
        list.map((c) => (c.trim().toLowerCase() === oldLower ? newTrimmed : c));

      const videoCatalogues = replaceInList(prev.videoCatalogues);
      const photoCatalogues = replaceInList(prev.photoCatalogues);
      const songCatalogues = replaceInList(prev.songCatalogues);
      const globalCatalogues = replaceInList(prev.globalCatalogues);

      // 3. Projects
      const videoProjects = (prev.videoProjects || []).map((p) => {
        let updated = { ...p };
        if (p.category && p.category.trim().toLowerCase() === oldLower) {
          updated.category = newTrimmed;
        }
        if (Array.isArray(p.categories)) {
          updated.categories = p.categories.map((c) => (c.trim().toLowerCase() === oldLower ? newTrimmed : c));
        }
        return updated;
      });

      const photography = (prev.photography || []).map((p) => {
        let updated = { ...p };
        if (p.category && p.category.trim().toLowerCase() === oldLower) {
          updated.category = newTrimmed;
        }
        if (Array.isArray(p.categories)) {
          updated.categories = p.categories.map((c) => (c.trim().toLowerCase() === oldLower ? newTrimmed : c));
        }
        return updated;
      });

      const shootServices = (prev.shootServices || []).map((s) => {
        let updated = { ...s };
        if (s.category && s.category.trim().toLowerCase() === oldLower) {
          updated.category = newTrimmed;
        }
        if (Array.isArray(s.categories)) {
          updated.categories = s.categories.map((c) => (c.trim().toLowerCase() === oldLower ? newTrimmed : c));
        }
        return updated;
      });

      const directionProjects = (prev.directionProjects || []).map((d) => {
        let updated = { ...d };
        if (d.category && d.category.trim().toLowerCase() === oldLower) {
          updated.category = newTrimmed;
        }
        if (Array.isArray(d.categories)) {
          updated.categories = d.categories.map((c) => (c.trim().toLowerCase() === oldLower ? newTrimmed : c));
        }
        return updated;
      });

      const updateSongList = (list: any[] = []) =>
        list.map((s) => {
          let updated = { ...s };
          if (s.category && s.category.trim().toLowerCase() === oldLower) {
            updated.category = newTrimmed;
          }
          if (Array.isArray(s.categories)) {
            updated.categories = s.categories.map((c) => (c.trim().toLowerCase() === oldLower ? newTrimmed : c));
          }
          return updated;
        });

      const songs = prev.songs
        ? {
            youtubeSongs: updateSongList(prev.songs.youtubeSongs),
            spotifySongs: updateSongList(prev.songs.spotifySongs),
            audioTracks: updateSongList(prev.songs.audioTracks),
            allSongs: updateSongList(prev.songs.allSongs),
          }
        : prev.songs;

      return {
        ...prev,
        videoCatalogTree,
        photoCatalogTree,
        songCatalogTree,
        videoCatalogues,
        photoCatalogues,
        songCatalogues,
        globalCatalogues,
        videoProjects,
        photography,
        shootServices,
        directionProjects,
        songs,
      };
    });
  }, [updateData]);

  const deleteCatalogEverywhere = useCallback((targetName: string, type: 'video' | 'photo' | 'song' | 'shoot' | 'direction' | 'all' = 'all') => {
    const targetTrimmed = targetName.trim();
    if (!targetTrimmed) return;
    const targetLower = targetTrimmed.toLowerCase();

    updateData((prev) => {
      // 1. Trees
      const videoCatalogTree = deleteCatalogFromTreeNode(prev.videoCatalogTree || defaultVideoCatalogTree, targetTrimmed);
      const photoCatalogTree = deleteCatalogFromTreeNode(prev.photoCatalogTree || defaultPhotoCatalogTree, targetTrimmed);
      const songCatalogTree = deleteCatalogFromTreeNode(prev.songCatalogTree || defaultSongCatalogTree, targetTrimmed);

      // 2. Arrays
      const filterList = (list: string[] = []) =>
        list.filter((c) => c.trim().toLowerCase() !== targetLower);

      const videoCatalogues = filterList(prev.videoCatalogues);
      const photoCatalogues = filterList(prev.photoCatalogues);
      const songCatalogues = filterList(prev.songCatalogues);
      const globalCatalogues = filterList(prev.globalCatalogues);

      // 3. Trash record
      const newTrash: TrashItem[] = [
        ...(prev.trash || []),
        {
          id: `trash-cat-${Date.now()}`,
          originalId: targetTrimmed,
          itemType: 'catalog',
          title: `Catalog: ${targetTrimmed}`,
          deletedAt: new Date().toISOString(),
          data: { name: targetTrimmed, type: type || 'general' },
        },
      ];

      return {
        ...prev,
        videoCatalogTree,
        photoCatalogTree,
        songCatalogTree,
        videoCatalogues,
        photoCatalogues,
        songCatalogues,
        globalCatalogues,
        trash: newTrash,
      };
    });
  }, [updateData]);

  const removeGlobalCatalog = useCallback((name: string) => {
    deleteCatalogEverywhere(name, 'all');
  }, [deleteCatalogEverywhere]);

  // Save changes explicitly to live state and persistence
  const saveChangesWithDetails = async (): Promise<{ success: boolean; message?: string }> => {
    if (isSavingRef.current) {
      return { success: false, message: 'A save operation is currently in progress. Please wait a moment.' };
    }

    isSavingRef.current = true;
    try {
      const sanitized = ensureDataIntegrity(draftData);

      // Persist to server disk first
      const verifiedData = await syncToServer(sanitized);

      // Upon confirmed server persistence, synchronize application state & cache
      setData(verifiedData);
      setDraftData(verifiedData);
      setPastStack([]);
      setFutureStack([]);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(verifiedData));
      } catch (storageErr) {
        console.warn('LocalStorage cache update warning:', storageErr);
      }

      return { success: true, message: 'All changes saved and published successfully' };
    } catch (e: any) {
      console.error('Failed to save changes to server:', e);
      // Preserve draftData so user never loses their changes
      return {
        success: false,
        message: e?.message || 'Failed to persist changes to server. Please check your connection and try again.',
      };
    } finally {
      isSavingRef.current = false;
    }
  };

  const saveChanges = async (): Promise<boolean> => {
    const res = await saveChangesWithDetails();
    return res.success;
  };

  // Discard all unsaved changes and revert draft to saved state
  const discardChanges = () => {
    setDraftData(data);
    setPastStack([]);
    setFutureStack([]);
  };

  // Reset a specific section in draft state to default
  const resetSectionToDefault = (sectionKey: string) => {
    const key = sectionKey as keyof PortfolioData;
    if (key in initialPortfolioData) {
      setDraftData((prev) => {
        setPastStack((past) => [...past, prev].slice(-MAX_HISTORY));
        setFutureStack([]);
        return {
          ...prev,
          [key]: JSON.parse(JSON.stringify(initialPortfolioData[key])),
        };
      });
    }
  };

  // Reset entire portfolio draft to default
  const resetAllToDefaults = () => {
    setDraftData((prev) => {
      setPastStack((past) => [...past, prev].slice(-MAX_HISTORY));
      setFutureStack([]);
      return JSON.parse(JSON.stringify(initialPortfolioData));
    });
  };

  const resetToDefaults = async (): Promise<boolean> => {
    resetAllToDefaults();
    return true;
  };

  // Safe Exit CMS Handlers
  const requestExitCMS = () => {
    if (hasUnsavedChanges) {
      setIsUnsavedPromptOpen(true);
    } else {
      setIsAdminView(false);
    }
  };

  const forceExitCMS = () => {
    setIsUnsavedPromptOpen(false);
    setIsAdminView(false);
  };

  const handleSaveAndLeave = async () => {
    await saveChanges();
    setIsUnsavedPromptOpen(false);
    setIsAdminView(false);
  };

  const handleDiscardAndLeave = () => {
    discardChanges();
    setIsUnsavedPromptOpen(false);
    setIsAdminView(false);
  };

  const setDataDirectly = async (newData: PortfolioData): Promise<boolean> => {
    try {
      const sanitized = ensureDataIntegrity(newData);
      setDraftData(sanitized);
      setData(sanitized);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
      await syncToServer(sanitized);
      return true;
    } catch {
      return false;
    }
  };

  const toggleSectionVisibility = (sectionKey: keyof SectionVisibility) => {
    updateData((prev) => ({
      ...prev,
      sections: {
        ...defaultSectionVisibility,
        ...(prev.sections || {}),
        [sectionKey]: !(prev.sections?.[sectionKey] ?? true),
      },
    }));
  };

  const exportDataJSON = () => {
    const dataToExport = draftData || data;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `shahid_portfolio_complete_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJSON = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && (parsed.hero || parsed.videoProjects || parsed.photography)) {
        const sanitized = ensureDataIntegrity(parsed);
        setDraftData(sanitized);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import parse error:', e);
      return false;
    }
  };

  // Video Catalog Tree Handlers
  const addVideoCatalogNode = (parentId: string | null, name: string, description?: string) => {
    const newNode: CatalogNode = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      description: description?.trim(),
      parentId,
      children: [],
    };
    updateData((prev) => ({
      ...prev,
      videoCatalogTree: addCatalogNodeToTree(prev.videoCatalogTree || defaultVideoCatalogTree, parentId, newNode),
    }));
  };

  const updateVideoCatalogNode = (id: string, updates: Partial<CatalogNode>) => {
    updateData((prev) => {
      const oldNode = findCatalogNode(prev.videoCatalogTree || defaultVideoCatalogTree, id);
      const updatedTree = updateCatalogNodeInTree(prev.videoCatalogTree || defaultVideoCatalogTree, id, updates);

      let videoProjects = prev.videoProjects || [];
      let videoCatalogues = prev.videoCatalogues || [];
      let globalCatalogues = prev.globalCatalogues || [];

      if (updates.name && oldNode && oldNode.name.trim().toLowerCase() !== updates.name.trim().toLowerCase()) {
        const oldLower = oldNode.name.trim().toLowerCase();
        const newName = updates.name.trim();

        videoProjects = videoProjects.map((p) => {
          let updated = { ...p };
          if (p.catalogId === id || (p.category && p.category.trim().toLowerCase() === oldLower)) {
            updated.category = newName;
          }
          if (Array.isArray(p.categories)) {
            updated.categories = p.categories.map((c) => (c.trim().toLowerCase() === oldLower ? newName : c));
          }
          return updated;
        });

        videoCatalogues = videoCatalogues.map((c) => (c.trim().toLowerCase() === oldLower ? newName : c));
        globalCatalogues = globalCatalogues.map((c) => (c.trim().toLowerCase() === oldLower ? newName : c));
      }

      return {
        ...prev,
        videoCatalogTree: updatedTree,
        videoProjects,
        videoCatalogues,
        globalCatalogues,
      };
    });
  };

  const deleteVideoCatalogNode = (id: string) => {
    updateData((prev) => {
      const deletedNode = findCatalogNode(prev.videoCatalogTree || defaultVideoCatalogTree, id);
      const descendantNames = deletedNode
        ? [deletedNode.name.toLowerCase(), ...getAllDescendantNames(deletedNode).map((n) => n.toLowerCase())]
        : [];

      const newTrash: TrashItem[] = deletedNode
        ? [
            ...(prev.trash || []),
            {
              id: `trash-cat-${Date.now()}`,
              originalId: id,
              itemType: 'catalog',
              title: `Video Catalog: ${deletedNode.name}`,
              deletedAt: new Date().toISOString(),
              data: { catalog: deletedNode, type: 'video' },
            },
          ]
        : prev.trash || [];

      const videoCatalogues = (prev.videoCatalogues || []).filter(
        (c) => !descendantNames.includes(c.trim().toLowerCase())
      );
      const globalCatalogues = (prev.globalCatalogues || []).filter(
        (c) => !descendantNames.includes(c.trim().toLowerCase())
      );

      return {
        ...prev,
        videoCatalogTree: deleteCatalogNodeFromTree(prev.videoCatalogTree || defaultVideoCatalogTree, id),
        videoCatalogues,
        globalCatalogues,
        trash: newTrash,
      };
    });
  };

  const moveVideoCatalogNode = (id: string, direction: 'up' | 'down') => {
    updateData((prev) => ({
      ...prev,
      videoCatalogTree: moveCatalogNodeInTree(prev.videoCatalogTree || defaultVideoCatalogTree, id, direction),
    }));
  };

  const changeVideoCatalogParent = (nodeId: string, newParentId: string | null) => {
    updateData((prev) => ({
      ...prev,
      videoCatalogTree: changeCatalogParentInTree(prev.videoCatalogTree || defaultVideoCatalogTree, nodeId, newParentId),
    }));
  };

  // Photo Catalog Tree Handlers
  const addPhotoCatalogNode = (parentId: string | null, name: string, description?: string) => {
    const newNode: CatalogNode = {
      id: `photo-cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      description: description?.trim(),
      parentId,
      children: [],
    };
    updateData((prev) => ({
      ...prev,
      photoCatalogTree: addCatalogNodeToTree(prev.photoCatalogTree || defaultPhotoCatalogTree, parentId, newNode),
    }));
  };

  const updatePhotoCatalogNode = (id: string, updates: Partial<CatalogNode>) => {
    updateData((prev) => {
      const oldNode = findCatalogNode(prev.photoCatalogTree || defaultPhotoCatalogTree, id);
      const updatedTree = updateCatalogNodeInTree(prev.photoCatalogTree || defaultPhotoCatalogTree, id, updates);

      let photography = prev.photography || [];
      let photoCatalogues = prev.photoCatalogues || [];
      let globalCatalogues = prev.globalCatalogues || [];

      if (updates.name && oldNode && oldNode.name.trim().toLowerCase() !== updates.name.trim().toLowerCase()) {
        const oldLower = oldNode.name.trim().toLowerCase();
        const newName = updates.name.trim();

        photography = photography.map((p) => {
          let updated = { ...p };
          if (p.catalogId === id || (p.category && p.category.trim().toLowerCase() === oldLower)) {
            updated.category = newName;
          }
          if (Array.isArray(p.categories)) {
            updated.categories = p.categories.map((c) => (c.trim().toLowerCase() === oldLower ? newName : c));
          }
          return updated;
        });

        photoCatalogues = photoCatalogues.map((c) => (c.trim().toLowerCase() === oldLower ? newName : c));
        globalCatalogues = globalCatalogues.map((c) => (c.trim().toLowerCase() === oldLower ? newName : c));
      }

      return {
        ...prev,
        photoCatalogTree: updatedTree,
        photography,
        photoCatalogues,
        globalCatalogues,
      };
    });
  };

  const deletePhotoCatalogNode = (id: string) => {
    updateData((prev) => {
      const deletedNode = findCatalogNode(prev.photoCatalogTree || defaultPhotoCatalogTree, id);
      const descendantNames = deletedNode
        ? [deletedNode.name.toLowerCase(), ...getAllDescendantNames(deletedNode).map((n) => n.toLowerCase())]
        : [];

      const newTrash: TrashItem[] = deletedNode
        ? [
            ...(prev.trash || []),
            {
              id: `trash-photo-cat-${Date.now()}`,
              originalId: id,
              itemType: 'catalog',
              title: `Photo Catalog: ${deletedNode.name}`,
              deletedAt: new Date().toISOString(),
              data: { catalog: deletedNode, type: 'photo' },
            },
          ]
        : prev.trash || [];

      const photoCatalogues = (prev.photoCatalogues || []).filter(
        (c) => !descendantNames.includes(c.trim().toLowerCase())
      );
      const globalCatalogues = (prev.globalCatalogues || []).filter(
        (c) => !descendantNames.includes(c.trim().toLowerCase())
      );

      return {
        ...prev,
        photoCatalogTree: deleteCatalogNodeFromTree(prev.photoCatalogTree || defaultPhotoCatalogTree, id),
        photoCatalogues,
        globalCatalogues,
        trash: newTrash,
      };
    });
  };

  const movePhotoCatalogNode = (id: string, direction: 'up' | 'down') => {
    updateData((prev) => ({
      ...prev,
      photoCatalogTree: moveCatalogNodeInTree(prev.photoCatalogTree || defaultPhotoCatalogTree, id, direction),
    }));
  };

  const changePhotoCatalogParent = (nodeId: string, newParentId: string | null) => {
    updateData((prev) => ({
      ...prev,
      photoCatalogTree: changeCatalogParentInTree(prev.photoCatalogTree || defaultPhotoCatalogTree, nodeId, newParentId),
    }));
  };

  // Song Catalog Tree Handlers
  const addSongCatalogNode = (parentId: string | null, name: string, description?: string) => {
    const newNode: CatalogNode = {
      id: `song-cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      description: description?.trim(),
      parentId,
      children: [],
    };
    updateData((prev) => ({
      ...prev,
      songCatalogTree: addCatalogNodeToTree(prev.songCatalogTree || defaultSongCatalogTree, parentId, newNode),
    }));
  };

  const updateSongCatalogNode = (id: string, updates: Partial<CatalogNode>) => {
    updateData((prev) => {
      const oldNode = findCatalogNode(prev.songCatalogTree || defaultSongCatalogTree, id);
      const updatedTree = updateCatalogNodeInTree(prev.songCatalogTree || defaultSongCatalogTree, id, updates);

      let songCatalogues = prev.songCatalogues || [];
      let globalCatalogues = prev.globalCatalogues || [];
      let songs = prev.songs;

      if (updates.name && oldNode && oldNode.name.trim().toLowerCase() !== updates.name.trim().toLowerCase()) {
        const oldLower = oldNode.name.trim().toLowerCase();
        const newName = updates.name.trim();

        const updateSongList = (list: any[] = []) =>
          list.map((s) => {
            let updated = { ...s };
            if (s.catalogId === id || (s.category && s.category.trim().toLowerCase() === oldLower)) {
              updated.category = newName;
            }
            if (Array.isArray(s.categories)) {
              updated.categories = s.categories.map((c) => (c.trim().toLowerCase() === oldLower ? newName : c));
            }
            return updated;
          });

        if (songs) {
          songs = {
            youtubeSongs: updateSongList(songs.youtubeSongs),
            spotifySongs: updateSongList(songs.spotifySongs),
            audioTracks: updateSongList(songs.audioTracks),
            allSongs: updateSongList(songs.allSongs),
          };
        }

        songCatalogues = songCatalogues.map((c) => (c.trim().toLowerCase() === oldLower ? newName : c));
        globalCatalogues = globalCatalogues.map((c) => (c.trim().toLowerCase() === oldLower ? newName : c));
      }

      return {
        ...prev,
        songCatalogTree: updatedTree,
        songCatalogues,
        globalCatalogues,
        songs,
      };
    });
  };

  const deleteSongCatalogNode = (id: string) => {
    updateData((prev) => {
      const deletedNode = findCatalogNode(prev.songCatalogTree || defaultSongCatalogTree, id);
      const descendantNames = deletedNode
        ? [deletedNode.name.toLowerCase(), ...getAllDescendantNames(deletedNode).map((n) => n.toLowerCase())]
        : [];

      const newTrash: TrashItem[] = deletedNode
        ? [
            ...(prev.trash || []),
            {
              id: `trash-song-cat-${Date.now()}`,
              originalId: id,
              itemType: 'catalog',
              title: `Song Catalog: ${deletedNode.name}`,
              deletedAt: new Date().toISOString(),
              data: { catalog: deletedNode, type: 'song' },
            },
          ]
        : prev.trash || [];

      const songCatalogues = (prev.songCatalogues || []).filter(
        (c) => !descendantNames.includes(c.trim().toLowerCase())
      );
      const globalCatalogues = (prev.globalCatalogues || []).filter(
        (c) => !descendantNames.includes(c.trim().toLowerCase())
      );

      return {
        ...prev,
        songCatalogTree: deleteCatalogNodeFromTree(prev.songCatalogTree || defaultSongCatalogTree, id),
        songCatalogues,
        globalCatalogues,
        trash: newTrash,
      };
    });
  };

  const moveSongCatalogNode = (id: string, direction: 'up' | 'down') => {
    updateData((prev) => ({
      ...prev,
      songCatalogTree: moveCatalogNodeInTree(prev.songCatalogTree || defaultSongCatalogTree, id, direction),
    }));
  };

  const changeSongCatalogParent = (nodeId: string, newParentId: string | null) => {
    updateData((prev) => ({
      ...prev,
      songCatalogTree: changeCatalogParentInTree(prev.songCatalogTree || defaultSongCatalogTree, nodeId, newParentId),
    }));
  };

  // Video Project Catalog Actions (Move / Copy / Multi-Catalog Reference)
  const moveVideoProjectToCatalog = (projectId: string, catalogId: string) => {
    updateData((prev) => {
      const tree = prev.videoCatalogTree || defaultVideoCatalogTree;
      const targetNode = findCatalogNode(tree, catalogId);
      const pathNodes = getCatalogPath(tree, catalogId);
      const categoryPath = pathNodes.map((n) => n.name);

      return {
        ...prev,
        videoProjects: prev.videoProjects.map((p) => {
          if (p.id === projectId) {
            const currentCatIds = (p.catalogIds || []).filter((cid) => cid !== p.catalogId);
            if (!currentCatIds.includes(catalogId)) {
              currentCatIds.push(catalogId);
            }
            return {
              ...p,
              catalogId,
              catalogIds: currentCatIds,
              category: targetNode ? targetNode.name : p.category,
              categoryPath,
            };
          }
          return p;
        }),
      };
    });
  };

  const copyVideoProjectToCatalog = (projectId: string, catalogId: string, duplicateAsNew = false) => {
    updateData((prev) => {
      const tree = prev.videoCatalogTree || defaultVideoCatalogTree;
      const targetNode = findCatalogNode(tree, catalogId);
      const pathNodes = getCatalogPath(tree, catalogId);
      const categoryPath = pathNodes.map((n) => n.name);
      const original = prev.videoProjects.find((p) => p.id === projectId);
      if (!original) return prev;

      if (!duplicateAsNew) {
        // Multi-catalog reference: add catalogId to catalogIds array
        return {
          ...prev,
          videoProjects: prev.videoProjects.map((p) => {
            if (p.id === projectId) {
              const currentCatIds = Array.from(new Set([...(p.catalogIds || []), p.catalogId, catalogId].filter(Boolean) as string[]));
              return { ...p, catalogIds: currentCatIds };
            }
            return p;
          }),
        };
      }

      // True duplicate item creation
      const clonedProject: VideoProject = {
        ...original,
        id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `${original.title} (Copy)`,
        catalogId,
        catalogIds: [catalogId],
        category: targetNode ? targetNode.name : original.category,
        categoryPath,
      };

      return {
        ...prev,
        videoProjects: [...prev.videoProjects, clonedProject],
      };
    });
  };

  const addVideoProjectToCatalog = (projectId: string, catalogId: string) => {
    copyVideoProjectToCatalog(projectId, catalogId, false);
  };

  const removeVideoProjectFromCatalog = (projectId: string, catalogId: string) => {
    updateData((prev) => ({
      ...prev,
      videoProjects: prev.videoProjects.map((p) => {
        if (p.id === projectId) {
          const updatedIds = (p.catalogIds || []).filter((cid) => cid !== catalogId);
          const newPrimary = p.catalogId === catalogId ? (updatedIds[0] || undefined) : p.catalogId;
          return {
            ...p,
            catalogId: newPrimary,
            catalogIds: updatedIds,
          };
        }
        return p;
      }),
    }));
  };

  const batchMoveVideoProjects = (projectIds: string[], catalogId: string) => {
    updateData((prev) => {
      const tree = prev.videoCatalogTree || defaultVideoCatalogTree;
      const targetNode = findCatalogNode(tree, catalogId);
      const pathNodes = getCatalogPath(tree, catalogId);
      const categoryPath = pathNodes.map((n) => n.name);

      return {
        ...prev,
        videoProjects: prev.videoProjects.map((p) => {
          if (projectIds.includes(p.id)) {
            const currentCatIds = (p.catalogIds || []).filter((cid) => cid !== p.catalogId);
            if (!currentCatIds.includes(catalogId)) currentCatIds.push(catalogId);
            return {
              ...p,
              catalogId,
              catalogIds: currentCatIds,
              category: targetNode ? targetNode.name : p.category,
              categoryPath,
            };
          }
          return p;
        }),
      };
    });
  };

  const batchCopyVideoProjects = (projectIds: string[], catalogId: string, duplicateAsNew = false) => {
    updateData((prev) => {
      const tree = prev.videoCatalogTree || defaultVideoCatalogTree;
      const targetNode = findCatalogNode(tree, catalogId);
      const pathNodes = getCatalogPath(tree, catalogId);
      const categoryPath = pathNodes.map((n) => n.name);

      if (!duplicateAsNew) {
        return {
          ...prev,
          videoProjects: prev.videoProjects.map((p) => {
            if (projectIds.includes(p.id)) {
              const currentCatIds = Array.from(new Set([...(p.catalogIds || []), p.catalogId, catalogId].filter(Boolean) as string[]));
              return { ...p, catalogIds: currentCatIds };
            }
            return p;
          }),
        };
      }

      const originals = prev.videoProjects.filter((p) => projectIds.includes(p.id));
      const clonedList: VideoProject[] = originals.map((orig, idx) => ({
        ...orig,
        id: `vid-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        title: `${orig.title} (Copy)`,
        catalogId,
        catalogIds: [catalogId],
        category: targetNode ? targetNode.name : orig.category,
        categoryPath,
      }));

      return {
        ...prev,
        videoProjects: [...prev.videoProjects, ...clonedList],
      };
    });
  };

  // Photo Catalog Actions
  const movePhotoToCatalog = (photoId: string, catalogId: string) => {
    updateData((prev) => {
      const tree = prev.photoCatalogTree || defaultPhotoCatalogTree;
      const targetNode = findCatalogNode(tree, catalogId);
      const pathNodes = getCatalogPath(tree, catalogId);
      const categoryPath = pathNodes.map((n) => n.name);

      return {
        ...prev,
        photography: prev.photography.map((p) => {
          if (p.id === photoId) {
            const currentCatIds = (p.catalogIds || []).filter((cid) => cid !== p.catalogId);
            if (!currentCatIds.includes(catalogId)) currentCatIds.push(catalogId);
            return {
              ...p,
              catalogId,
              catalogIds: currentCatIds,
              category: targetNode ? targetNode.name : p.category,
              categoryPath,
            };
          }
          return p;
        }),
      };
    });
  };

  const copyPhotoToCatalog = (photoId: string, catalogId: string, duplicateAsNew = false) => {
    updateData((prev) => {
      const tree = prev.photoCatalogTree || defaultPhotoCatalogTree;
      const targetNode = findCatalogNode(tree, catalogId);
      const pathNodes = getCatalogPath(tree, catalogId);
      const categoryPath = pathNodes.map((n) => n.name);
      const original = prev.photography.find((p) => p.id === photoId);
      if (!original) return prev;

      if (!duplicateAsNew) {
        return {
          ...prev,
          photography: prev.photography.map((p) => {
            if (p.id === photoId) {
              const currentCatIds = Array.from(new Set([...(p.catalogIds || []), p.catalogId, catalogId].filter(Boolean) as string[]));
              return { ...p, catalogIds: currentCatIds };
            }
            return p;
          }),
        };
      }

      const clonedPhoto: PhotoItem = {
        ...original,
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `${original.title} (Copy)`,
        catalogId,
        catalogIds: [catalogId],
        category: targetNode ? targetNode.name : original.category,
        categoryPath,
      };

      return {
        ...prev,
        photography: [...prev.photography, clonedPhoto],
      };
    });
  };

  const addPhotoToCatalog = (photoId: string, catalogId: string) => {
    copyPhotoToCatalog(photoId, catalogId, false);
  };

  const removePhotoFromCatalog = (photoId: string, catalogId: string) => {
    updateData((prev) => ({
      ...prev,
      photography: prev.photography.map((p) => {
        if (p.id === photoId) {
          const updatedIds = (p.catalogIds || []).filter((cid) => cid !== catalogId);
          return {
            ...p,
            catalogId: p.catalogId === catalogId ? updatedIds[0] || undefined : p.catalogId,
            catalogIds: updatedIds,
          };
        }
        return p;
      }),
    }));
  };

  const batchMovePhotos = (photoIds: string[], catalogId: string) => {
    updateData((prev) => {
      const tree = prev.photoCatalogTree || defaultPhotoCatalogTree;
      const targetNode = findCatalogNode(tree, catalogId);
      const pathNodes = getCatalogPath(tree, catalogId);
      const categoryPath = pathNodes.map((n) => n.name);

      return {
        ...prev,
        photography: prev.photography.map((p) => {
          if (photoIds.includes(p.id)) {
            const currentCatIds = (p.catalogIds || []).filter((cid) => cid !== p.catalogId);
            if (!currentCatIds.includes(catalogId)) currentCatIds.push(catalogId);
            return {
              ...p,
              catalogId,
              catalogIds: currentCatIds,
              category: targetNode ? targetNode.name : p.category,
              categoryPath,
            };
          }
          return p;
        }),
      };
    });
  };

  const batchCopyPhotos = (photoIds: string[], catalogId: string, duplicateAsNew = false) => {
    updateData((prev) => {
      const tree = prev.photoCatalogTree || defaultPhotoCatalogTree;
      const targetNode = findCatalogNode(tree, catalogId);
      const pathNodes = getCatalogPath(tree, catalogId);
      const categoryPath = pathNodes.map((n) => n.name);

      if (!duplicateAsNew) {
        return {
          ...prev,
          photography: prev.photography.map((p) => {
            if (photoIds.includes(p.id)) {
              const currentCatIds = Array.from(new Set([...(p.catalogIds || []), p.catalogId, catalogId].filter(Boolean) as string[]));
              return { ...p, catalogIds: currentCatIds };
            }
            return p;
          }),
        };
      }

      const originals = prev.photography.filter((p) => photoIds.includes(p.id));
      const clonedList: PhotoItem[] = originals.map((orig, idx) => ({
        ...orig,
        id: `photo-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        title: `${orig.title} (Copy)`,
        catalogId,
        catalogIds: [catalogId],
        category: targetNode ? targetNode.name : orig.category,
        categoryPath,
      }));

      return {
        ...prev,
        photography: [...prev.photography, ...clonedList],
      };
    });
  };

  // Song Catalog Actions
  const moveSongToCatalog = (songId: string, catalogId: string) => {
    updateData((prev) => {
      const updateSongList = (list: any[]) =>
        list.map((item) => {
          if (item.id === songId) {
            const currentCatIds = (item.catalogIds || []).filter((cid: string) => cid !== item.catalogId);
            if (!currentCatIds.includes(catalogId)) currentCatIds.push(catalogId);
            return { ...item, catalogId, catalogIds: currentCatIds };
          }
          return item;
        });

      return {
        ...prev,
        songs: {
          ...prev.songs,
          youtubeSongs: updateSongList(prev.songs.youtubeSongs || []),
          spotifySongs: updateSongList(prev.songs.spotifySongs || []),
          audioTracks: updateSongList(prev.songs.audioTracks || []),
          allSongs: updateSongList(prev.songs.allSongs || []),
        },
      };
    });
  };

  const copySongToCatalog = (songId: string, catalogId: string, duplicateAsNew = false) => {
    updateData((prev) => {
      const updateSongList = (list: any[]) =>
        list.map((item) => {
          if (item.id === songId) {
            const currentCatIds = Array.from(new Set([...(item.catalogIds || []), item.catalogId, catalogId].filter(Boolean) as string[]));
            return { ...item, catalogIds: currentCatIds };
          }
          return item;
        });

      if (!duplicateAsNew) {
        return {
          ...prev,
          songs: {
            ...prev.songs,
            youtubeSongs: updateSongList(prev.songs.youtubeSongs || []),
            spotifySongs: updateSongList(prev.songs.spotifySongs || []),
            audioTracks: updateSongList(prev.songs.audioTracks || []),
            allSongs: updateSongList(prev.songs.allSongs || []),
          },
        };
      }

      // Duplicate in allSongs
      const foundInAll = (prev.songs.allSongs || []).find((s) => s.id === songId);
      const foundInYt = (prev.songs.youtubeSongs || []).find((s) => s.id === songId);
      const foundInSp = (prev.songs.spotifySongs || []).find((s) => s.id === songId);
      const foundInAud = (prev.songs.audioTracks || []).find((s) => s.id === songId);

      const base = foundInAll || foundInYt || foundInSp || foundInAud;
      if (!base) return prev;

      const clonedSong: SongItem = {
        ...base,
        id: `song-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `${base.title} (Copy)`,
        catalogId,
        catalogIds: [catalogId],
      };

      return {
        ...prev,
        songs: {
          ...prev.songs,
          allSongs: [...(prev.songs.allSongs || []), clonedSong],
        },
      };
    });
  };

  const addSongToCatalog = (songId: string, catalogId: string) => {
    copySongToCatalog(songId, catalogId, false);
  };

  const removeSongFromCatalog = (songId: string, catalogId: string) => {
    updateData((prev) => {
      const filterCatalog = (list: any[]) =>
        list.map((item) => {
          if (item.id === songId) {
            const updatedIds = (item.catalogIds || []).filter((cid: string) => cid !== catalogId);
            return {
              ...item,
              catalogId: item.catalogId === catalogId ? updatedIds[0] || undefined : item.catalogId,
              catalogIds: updatedIds,
            };
          }
          return item;
        });

      return {
        ...prev,
        songs: {
          ...prev.songs,
          youtubeSongs: filterCatalog(prev.songs.youtubeSongs || []),
          spotifySongs: filterCatalog(prev.songs.spotifySongs || []),
          audioTracks: filterCatalog(prev.songs.audioTracks || []),
          allSongs: filterCatalog(prev.songs.allSongs || []),
        },
      };
    });
  };

  const batchMoveSongs = (songIds: string[], catalogId: string) => {
    songIds.forEach((id) => moveSongToCatalog(id, catalogId));
  };

  const batchCopySongs = (songIds: string[], catalogId: string, duplicateAsNew = false) => {
    songIds.forEach((id) => copySongToCatalog(id, catalogId, duplicateAsNew));
  };

  // Shoot Services Catalog Actions
  const moveShootToCatalog = (shootId: string, catalogId: string) => {
    updateData((prev) => ({
      ...prev,
      shootServices: (prev.shootServices || []).map((s) => {
        if (s.id === shootId) {
          const currentCatIds = (s.catalogIds || []).filter((cid: string) => cid !== s.catalogId);
          if (!currentCatIds.includes(catalogId)) currentCatIds.push(catalogId);
          return {
            ...s,
            catalogId,
            catalogIds: currentCatIds,
            category: catalogId,
          };
        }
        return s;
      }),
    }));
  };

  const copyShootToCatalog = (shootId: string, catalogId: string, duplicateAsNew = false) => {
    updateData((prev) => {
      if (!duplicateAsNew) {
        return {
          ...prev,
          shootServices: (prev.shootServices || []).map((s) => {
            if (s.id === shootId) {
              const currentCatIds = Array.from(new Set([...(s.catalogIds || []), s.catalogId, catalogId].filter(Boolean) as string[]));
              return { ...s, catalogIds: currentCatIds };
            }
            return s;
          }),
        };
      }
      const original = (prev.shootServices || []).find((s) => s.id === shootId);
      if (!original) return prev;
      const clone: ShootService = {
        ...original,
        id: `shoot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `${original.title} (Copy)`,
        catalogId,
        catalogIds: [catalogId],
        category: catalogId,
      };
      return {
        ...prev,
        shootServices: [...(prev.shootServices || []), clone],
      };
    });
  };

  const addShootToCatalog = (shootId: string, catalogId: string) => {
    copyShootToCatalog(shootId, catalogId, false);
  };

  const removeShootFromCatalog = (shootId: string, catalogId: string) => {
    updateData((prev) => ({
      ...prev,
      shootServices: (prev.shootServices || []).map((s) => {
        if (s.id === shootId) {
          const updatedIds = (s.catalogIds || []).filter((cid) => cid !== catalogId);
          return {
            ...s,
            catalogId: s.catalogId === catalogId ? updatedIds[0] || undefined : s.catalogId,
            catalogIds: updatedIds,
          };
        }
        return s;
      }),
    }));
  };

  // Direction Projects Catalog Actions
  const moveDirectionToCatalog = (directionId: string, catalogId: string) => {
    updateData((prev) => ({
      ...prev,
      directionProjects: (prev.directionProjects || []).map((d) => {
        if (d.id === directionId) {
          const currentCatIds = (d.catalogIds || []).filter((cid: string) => cid !== d.catalogId);
          if (!currentCatIds.includes(catalogId)) currentCatIds.push(catalogId);
          return {
            ...d,
            catalogId,
            catalogIds: currentCatIds,
            category: catalogId,
          };
        }
        return d;
      }),
    }));
  };

  const copyDirectionToCatalog = (directionId: string, catalogId: string, duplicateAsNew = false) => {
    updateData((prev) => {
      if (!duplicateAsNew) {
        return {
          ...prev,
          directionProjects: (prev.directionProjects || []).map((d) => {
            if (d.id === directionId) {
              const currentCatIds = Array.from(new Set([...(d.catalogIds || []), d.catalogId, catalogId].filter(Boolean) as string[]));
              return { ...d, catalogIds: currentCatIds };
            }
            return d;
          }),
        };
      }
      const original = (prev.directionProjects || []).find((d) => d.id === directionId);
      if (!original) return prev;
      const clone: DirectionProject = {
        ...original,
        id: `dir-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `${original.title} (Copy)`,
        catalogId,
        catalogIds: [catalogId],
        category: catalogId,
      };
      return {
        ...prev,
        directionProjects: [...(prev.directionProjects || []), clone],
      };
    });
  };

  const addDirectionToCatalog = (directionId: string, catalogId: string) => {
    copyDirectionToCatalog(directionId, catalogId, false);
  };

  const removeDirectionFromCatalog = (directionId: string, catalogId: string) => {
    updateData((prev) => ({
      ...prev,
      directionProjects: (prev.directionProjects || []).map((d) => {
        if (d.id === directionId) {
          const updatedIds = (d.catalogIds || []).filter((cid) => cid !== catalogId);
          return {
            ...d,
            catalogId: d.catalogId === catalogId ? updatedIds[0] || undefined : d.catalogId,
            catalogIds: updatedIds,
          };
        }
        return d;
      }),
    }));
  };

  // Universal Cross-Section Item Operations
  const moveItemToCatalog = (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song',
    itemId: string,
    targetCatalogIdOrName: string,
    _sourceCatalogIdOrName?: string
  ) => {
    if (itemType === 'video') moveVideoProjectToCatalog(itemId, targetCatalogIdOrName);
    else if (itemType === 'photo') movePhotoToCatalog(itemId, targetCatalogIdOrName);
    else if (itemType === 'shoot') moveShootToCatalog(itemId, targetCatalogIdOrName);
    else if (itemType === 'direction') moveDirectionToCatalog(itemId, targetCatalogIdOrName);
    else if (itemType === 'song') moveSongToCatalog(itemId, targetCatalogIdOrName);
  };

  const copyItemToCatalog = (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song',
    itemId: string,
    targetCatalogIdOrName: string,
    duplicateAsNew = false
  ) => {
    if (itemType === 'video') copyVideoProjectToCatalog(itemId, targetCatalogIdOrName, duplicateAsNew);
    else if (itemType === 'photo') copyPhotoToCatalog(itemId, targetCatalogIdOrName, duplicateAsNew);
    else if (itemType === 'shoot') copyShootToCatalog(itemId, targetCatalogIdOrName, duplicateAsNew);
    else if (itemType === 'direction') copyDirectionToCatalog(itemId, targetCatalogIdOrName, duplicateAsNew);
    else if (itemType === 'song') copySongToCatalog(itemId, targetCatalogIdOrName, duplicateAsNew);
  };

  const addItemToCatalog = (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song',
    itemId: string,
    catalogIdOrName: string
  ) => {
    copyItemToCatalog(itemType, itemId, catalogIdOrName, false);
  };

  const removeItemFromCatalog = (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song',
    itemId: string,
    catalogIdOrName: string
  ) => {
    if (itemType === 'video') removeVideoProjectFromCatalog(itemId, catalogIdOrName);
    else if (itemType === 'photo') removePhotoFromCatalog(itemId, catalogIdOrName);
    else if (itemType === 'shoot') removeShootFromCatalog(itemId, catalogIdOrName);
    else if (itemType === 'direction') removeDirectionFromCatalog(itemId, catalogIdOrName);
    else if (itemType === 'song') removeSongFromCatalog(itemId, catalogIdOrName);
  };

  const permanentlyDeleteItem = async (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song' | 'experience' | 'catalog' | 'general',
    itemId: string | string[]
  ): Promise<boolean> => {
    const itemIds = Array.isArray(itemId) ? itemId : [itemId];
    const idSet = new Set(itemIds);

    // 1. Strip the item from state cleanly
    const stripItemFromData = (prev: PortfolioData): PortfolioData => {
      let videoTree = prev.videoCatalogTree || [];
      let photoTree = prev.photoCatalogTree || [];
      let songTree = prev.songCatalogTree || [];
      let videoCatalogues = prev.videoCatalogues || [];
      let photoCatalogues = prev.photoCatalogues || [];
      let songCatalogues = prev.songCatalogues || [];
      let globalCatalogues = prev.globalCatalogues || [];

      if (itemType === 'catalog') {
        itemIds.forEach((id) => {
          videoTree = deleteCatalogNodeFromTree(videoTree, id);
          photoTree = deleteCatalogNodeFromTree(photoTree, id);
          songTree = deleteCatalogNodeFromTree(songTree, id);
          videoCatalogues = videoCatalogues.filter((c) => c !== id && c.toLowerCase() !== id.toLowerCase());
          photoCatalogues = photoCatalogues.filter((c) => c !== id && c.toLowerCase() !== id.toLowerCase());
          songCatalogues = songCatalogues.filter((c) => c !== id && c.toLowerCase() !== id.toLowerCase());
          globalCatalogues = globalCatalogues.filter((c) => c !== id && c.toLowerCase() !== id.toLowerCase());
        });
      }

      return {
        ...prev,
        videoProjects: (prev.videoProjects || []).filter((p) => !idSet.has(p.id)),
        photography: (prev.photography || []).filter((p) => !idSet.has(p.id)),
        shootServices: (prev.shootServices || []).filter((s) => !idSet.has(s.id)),
        directionProjects: (prev.directionProjects || []).filter((d) => !idSet.has(d.id)),
        experiences: (prev.experiences || []).filter((e) => !idSet.has(e.id)),
        songs: {
          ...prev.songs,
          youtubeSongs: (prev.songs?.youtubeSongs || []).filter((s) => !idSet.has(s.id)),
          spotifySongs: (prev.songs?.spotifySongs || []).filter((s) => !idSet.has(s.id)),
          audioTracks: (prev.songs?.audioTracks || []).filter((s) => !idSet.has(s.id)),
          allSongs: (prev.songs?.allSongs || []).filter((s) => !idSet.has(s.id)),
        },
        about: {
          ...prev.about,
          stats: (prev.about?.stats || []).filter((st) => !idSet.has(st.id)),
        },
        videoCatalogTree: videoTree,
        photoCatalogTree: photoTree,
        songCatalogTree: songTree,
        videoCatalogues,
        photoCatalogues,
        songCatalogues,
        globalCatalogues,
        trash: (prev.trash || []).filter((t) => !idSet.has(t.id) && !idSet.has(t.originalId)),
      };
    };

    const currentActive = draftData || data;
    const stripped = stripItemFromData(currentActive);

    // Immediately reflect in UI and localStorage
    setData(stripped);
    setDraftData(stripped);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stripped));
    } catch {}

    // 2. Persist directly to server backend database
    try {
      if (authToken) {
        const delRes = await fetch('/api/portfolio/delete-item', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            itemId: Array.isArray(itemId) ? itemId[0] : itemId,
            itemIds,
            itemType,
          }),
        });

        if (delRes.ok) {
          const resJson = await delRes.json();
          if (resJson.data) {
            const clean = ensureDataIntegrity(resJson.data);
            setData(clean);
            setDraftData(clean);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
          }
        } else {
          // Fallback to sync full payload
          await syncToServer(stripped);
        }
      } else {
        await syncToServer(stripped);
      }
    } catch (err) {
      console.warn('Failed to delete on server, fallback to local sync:', err);
      await syncToServer(stripped);
    }

    // 3. Re-fetch from server to ensure complete consistency
    try {
      const fetchRes = await fetch('/api/portfolio');
      if (fetchRes.ok) {
        const fetchJson = await fetchRes.json();
        if (fetchJson.success && fetchJson.data) {
          const verified = ensureDataIntegrity(fetchJson.data);
          setData(verified);
          setDraftData(verified);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(verified));
        }
      }
    } catch {}

    return true;
  };

  // Safe Delete (Trash System)
  const deleteItemToTrash = (
    itemType: 'video' | 'photo' | 'shoot' | 'direction' | 'song' | 'experience' | 'catalog',
    itemData: any,
    sourceCatalogId?: string,
    sourceCategory?: string
  ) => {
    updateData((prev) => {
      const trashItem: TrashItem = {
        id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        originalId: itemData.id || 'unknown',
        itemType,
        title: itemData.title || itemData.name || itemData.company || 'Untitled Item',
        deletedAt: new Date().toISOString(),
        data: itemData,
        sourceCatalogId: sourceCatalogId || itemData.catalogId,
        sourceCategory: sourceCategory || itemData.category,
      };

      let newVideoProjects = prev.videoProjects;
      let newPhotography = prev.photography;
      let newShootServices = prev.shootServices;
      let newDirectionProjects = prev.directionProjects;
      let newExperiences = prev.experiences;
      let newSongs = prev.songs;

      if (itemType === 'video') {
        newVideoProjects = prev.videoProjects.filter((p) => p.id !== itemData.id);
      } else if (itemType === 'photo') {
        newPhotography = prev.photography.filter((p) => p.id !== itemData.id);
      } else if (itemType === 'shoot') {
        newShootServices = prev.shootServices.filter((s) => s.id !== itemData.id);
      } else if (itemType === 'direction') {
        newDirectionProjects = prev.directionProjects.filter((d) => d.id !== itemData.id);
      } else if (itemType === 'experience') {
        newExperiences = prev.experiences.filter((e) => e.id !== itemData.id);
      } else if (itemType === 'song') {
        newSongs = {
          ...prev.songs,
          youtubeSongs: (prev.songs.youtubeSongs || []).filter((s) => s.id !== itemData.id),
          spotifySongs: (prev.songs.spotifySongs || []).filter((s) => s.id !== itemData.id),
          audioTracks: (prev.songs.audioTracks || []).filter((s) => s.id !== itemData.id),
          allSongs: (prev.songs.allSongs || []).filter((s) => s.id !== itemData.id),
        };
      }

      return {
        ...prev,
        videoProjects: newVideoProjects,
        photography: newPhotography,
        shootServices: newShootServices,
        directionProjects: newDirectionProjects,
        experiences: newExperiences,
        songs: newSongs,
        trash: [trashItem, ...(prev.trash || [])],
      };
    });
  };

  const restoreFromTrash = (trashId: string) => {
    updateData((prev) => {
      const itemToRestore = (prev.trash || []).find((t) => t.id === trashId);
      if (!itemToRestore) return prev;

      const remainingTrash = (prev.trash || []).filter((t) => t.id !== trashId);
      const data = itemToRestore.data;

      if (itemToRestore.itemType === 'video') {
        return {
          ...prev,
          videoProjects: [...prev.videoProjects, data],
          trash: remainingTrash,
        };
      }
      if (itemToRestore.itemType === 'photo') {
        return {
          ...prev,
          photography: [...prev.photography, data],
          trash: remainingTrash,
        };
      }
      if (itemToRestore.itemType === 'shoot') {
        return {
          ...prev,
          shootServices: [...prev.shootServices, data],
          trash: remainingTrash,
        };
      }
      if (itemToRestore.itemType === 'direction') {
        return {
          ...prev,
          directionProjects: [...prev.directionProjects, data],
          trash: remainingTrash,
        };
      }
      if (itemToRestore.itemType === 'experience') {
        return {
          ...prev,
          experiences: [...prev.experiences, data],
          trash: remainingTrash,
        };
      }
      if (itemToRestore.itemType === 'song') {
        return {
          ...prev,
          songs: {
            ...prev.songs,
            allSongs: [...(prev.songs.allSongs || []), data],
          },
          trash: remainingTrash,
        };
      }
      if (itemToRestore.itemType === 'catalog') {
        if (data.type === 'photo') {
          return {
            ...prev,
            photoCatalogTree: addCatalogNodeToTree(prev.photoCatalogTree || defaultPhotoCatalogTree, data.catalog.parentId || null, data.catalog),
            trash: remainingTrash,
          };
        }
        return {
          ...prev,
          videoCatalogTree: addCatalogNodeToTree(prev.videoCatalogTree || defaultVideoCatalogTree, data.catalog.parentId || null, data.catalog),
          trash: remainingTrash,
        };
      }

      return {
        ...prev,
        trash: remainingTrash,
      };
    });
  };

  const permanentlyDeleteTrashItem = (trashId: string) => {
    updateData((prev) => ({
      ...prev,
      trash: (prev.trash || []).filter((t) => t.id !== trashId),
    }));
  };

  const emptyTrash = () => {
    updateData((prev) => ({
      ...prev,
      trash: [],
    }));
  };

  // Local Snapshots & Server Backups
  const createLocalSnapshot = (label = 'Manual Snapshot') => {
    const current = draftData || data;
    const backupItem: BackupItem = {
      id: `backup-${Date.now()}`,
      timestamp: new Date().toISOString(),
      label: label.trim() || 'Manual Snapshot',
      itemCount: (current.videoProjects?.length || 0) + (current.photography?.length || 0),
      dataSnapshot: JSON.parse(JSON.stringify(current)),
    };
    updateData((prev) => ({
      ...prev,
      backups: [backupItem, ...(prev.backups || [])].slice(0, 30),
    }));
  };

  const restoreLocalSnapshot = (backupId: string) => {
    const active = draftData || data;
    const target = (active.backups || []).find((b) => b.id === backupId);
    if (target && target.dataSnapshot) {
      updateData(() => ensureDataIntegrity(target.dataSnapshot));
    }
  };

  const deleteLocalSnapshot = (backupId: string) => {
    updateData((prev) => ({
      ...prev,
      backups: (prev.backups || []).filter((b) => b.id !== backupId),
    }));
  };

  const createServerSnapshot = async (label = 'Manual Cloud Snapshot'): Promise<boolean> => {
    if (!authToken) return false;
    try {
      const res = await fetch('/api/portfolio/create-snapshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ label }),
      });
      if (res.ok) {
        await fetchServerBackups();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const restoreServerBackup = async (filename: string): Promise<boolean> => {
    if (!authToken) return false;
    try {
      const res = await fetch('/api/portfolio/restore-backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ filename }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const sanitized = ensureDataIntegrity(result.data);
          setData(sanitized);
          setDraftData(sanitized);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
          await fetchServerBackups();
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Global Keyboard Shortcuts for Undo (Ctrl+Z / Cmd+Z) and Redo (Ctrl+Y / Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAdminView) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, isAdminView]);

  // Video modal helpers
  const openVideoModal = (url: string, title: string, category?: string) => {
    setActiveVideo({ url, title, category });
  };
  const closeVideoModal = () => {
    setActiveVideo(null);
  };

  // Lightbox helpers
  const openPhotoLightbox = (photos: PhotoItem[], index: number) => {
    setActivePhotoList(photos);
    setActivePhotoIndex(index);
  };
  const closePhotoLightbox = () => {
    setActivePhotoIndex(null);
    setActivePhotoList([]);
  };
  const nextPhoto = () => {
    if (activePhotoIndex !== null && activePhotoList.length > 0) {
      setActivePhotoIndex((prev) => ((prev ?? 0) + 1) % activePhotoList.length);
    }
  };
  const prevPhoto = () => {
    if (activePhotoIndex !== null && activePhotoList.length > 0) {
      setActivePhotoIndex((prev) => ((prev ?? 0) - 1 + activePhotoList.length) % activePhotoList.length);
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        data,
        draftData,
        hasUnsavedChanges,
        saveChanges,
        saveChangesWithDetails,
        discardChanges,
        resetSectionToDefault,
        resetAllToDefaults,
        requestExitCMS,
        forceExitCMS,
        isUnsavedPromptOpen,
        setIsUnsavedPromptOpen,
        handleSaveAndLeave,
        handleDiscardAndLeave,

        isLoading,
        isAuthenticated,
        isAdminView,
        setIsAdminView,
        openCustomize,
        login,
        logout,
        updateData,
        setDataDirectly,
        resetToDefaults,
        exportDataJSON,
        importDataJSON,

        canUndo: pastStack.length > 0,
        canRedo: futureStack.length > 0,
        undo,
        redo,
        undoCount: pastStack.length,
        redoCount: futureStack.length,

        toggleSectionVisibility,

        // Global Catalog System
        allGlobalCatalogs,
        allGlobalCatalogNames,
        addGlobalCatalog,
        removeGlobalCatalog,
        renameCatalogEverywhere,
        deleteCatalogEverywhere,

        // Video Catalog Handlers
        addVideoCatalogNode,
        updateVideoCatalogNode,
        deleteVideoCatalogNode,
        moveVideoCatalogNode,
        changeVideoCatalogParent,

        // Photo Catalog Handlers
        addPhotoCatalogNode,
        updatePhotoCatalogNode,
        deletePhotoCatalogNode,
        movePhotoCatalogNode,
        changePhotoCatalogParent,

        // Song Catalog Handlers
        addSongCatalogNode,
        updateSongCatalogNode,
        deleteSongCatalogNode,
        moveSongCatalogNode,
        changeSongCatalogParent,

        // Video Project Relocation & Multi-Catalog
        moveVideoProjectToCatalog,
        copyVideoProjectToCatalog,
        addVideoProjectToCatalog,
        removeVideoProjectFromCatalog,
        batchMoveVideoProjects,
        batchCopyVideoProjects,

        // Photo Relocation & Multi-Catalog
        movePhotoToCatalog,
        copyPhotoToCatalog,
        addPhotoToCatalog,
        removePhotoFromCatalog,
        batchMovePhotos,
        batchCopyPhotos,

        // Shoot Services Relocation & Multi-Catalog
        moveShootToCatalog,
        copyShootToCatalog,
        addShootToCatalog,
        removeShootFromCatalog,

        // Direction Projects Relocation & Multi-Catalog
        moveDirectionToCatalog,
        copyDirectionToCatalog,
        addDirectionToCatalog,
        removeDirectionFromCatalog,

        // Universal Cross-Section Operations
        moveItemToCatalog,
        copyItemToCatalog,
        addItemToCatalog,
        removeItemFromCatalog,
        permanentlyDeleteItem,

        // Song Relocation & Multi-Catalog
        moveSongToCatalog,
        copySongToCatalog,
        addSongToCatalog,
        removeSongFromCatalog,
        batchMoveSongs,
        batchCopySongs,

        // Trash & Safe Delete
        deleteItemToTrash,
        restoreFromTrash,
        permanentlyDeleteTrashItem,
        emptyTrash,

        // Snapshots & Server Backups
        serverBackups,
        fetchServerBackups,
        restoreServerBackup,
        createServerSnapshot,
        createLocalSnapshot,
        restoreLocalSnapshot,
        deleteLocalSnapshot,

        activeVideo,
        openVideoModal,
        closeVideoModal,
        activePhotoIndex,
        activePhotoList,
        openPhotoLightbox,
        closePhotoLightbox,
        nextPhoto,
        prevPhoto,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
