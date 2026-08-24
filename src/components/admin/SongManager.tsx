import React, { useState, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SongItem, YouTubeSong, SpotifySong, AudioTrack, CatalogNode } from '../../types';
import { flattenCatalogTree } from '../../utils/catalogUtils';
import { UniversalCatalogPicker } from './UniversalCatalogComponents';
import {
  Music,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  Copy,
  ExternalLink,
  Search,
  FolderTree,
  Sliders,
  Check,
  X,
  Volume2,
  Tag,
  Clock,
  Sparkles,
  Layers,
  FileAudio,
} from 'lucide-react';

export const SongManager: React.FC = () => {
  const {
    draftData,
    data,
    updateData,
    allGlobalCatalogs,
    moveSongToCatalog,
    copySongToCatalog,
    addSongToCatalog,
    removeSongFromCatalog,
    deleteItemToTrash,
    permanentlyDeleteItem,
  } = usePortfolio();

  const activeData = draftData || data;
  const songTree = activeData.songCatalogTree || [];
  const flatSongCatalogs = flattenCatalogTree(songTree);

  // Tabs for song categories
  const [songTab, setSongTab] = useState<'all' | 'youtube' | 'spotify' | 'audio'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatalogFilter, setSelectedCatalogFilter] = useState<string>('all');

  // Currently playing audio in admin preview
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Add / Edit Song Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<any | null>(null);
  const [songTypeToCreate, setSongTypeToCreate] = useState<'all' | 'youtube' | 'spotify' | 'audio'>('all');

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    artist: 'Shahid Shaikh — Stone GD',
    coverImage: '',
    audioUrl: '',
    videoUrl: '',
    spotifyUrl: '',
    description: '',
    year: '2024',
    duration: '3:20',
    genre: 'Hip Hop / Trap',
    bpm: '140 BPM',
    catalogId: '',
    catalogIds: [] as string[],
    releaseDate: '2024',
    plays: '120K+',
  });

  const togglePlayAudio = (url: string) => {
    if (playingAudioUrl === url) {
      audioRef.current?.pause();
      setPlayingAudioUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch((e) => console.warn('Audio play error:', e));
      setPlayingAudioUrl(url);
      audio.onended = () => setPlayingAudioUrl(null);
    }
  };

  const openAddModal = (type: 'all' | 'youtube' | 'spotify' | 'audio' = 'all') => {
    setEditingSong(null);
    setSongTypeToCreate(type);
    setFormData({
      title: '',
      artist: 'Shahid Shaikh — Stone GD',
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
      audioUrl: '',
      videoUrl: '',
      spotifyUrl: '',
      description: '',
      year: new Date().getFullYear().toString(),
      duration: '3:00',
      genre: 'Soundtrack / Score',
      bpm: '128 BPM',
      catalogId: flatSongCatalogs[0]?.id || '',
      catalogIds: flatSongCatalogs[0]?.id ? [flatSongCatalogs[0].id] : [],
      releaseDate: new Date().getFullYear().toString(),
      plays: '50K+',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (song: any, type: 'all' | 'youtube' | 'spotify' | 'audio') => {
    setEditingSong(song);
    setSongTypeToCreate(type);
    setFormData({
      title: song.title || '',
      artist: song.artist || 'Shahid Shaikh — Stone GD',
      coverImage: song.coverImage || song.cover || song.thumbnail || '',
      audioUrl: song.audioUrl || '',
      videoUrl: song.videoUrl || '',
      spotifyUrl: song.spotifyUrl || '',
      description: song.description || '',
      year: song.year || '2024',
      duration: song.duration || '3:00',
      genre: song.genre || 'Soundtrack',
      bpm: song.bpm || '128 BPM',
      catalogId: song.catalogId || '',
      catalogIds: song.catalogIds || (song.catalogId ? [song.catalogId] : []),
      releaseDate: song.releaseDate || '2024',
      plays: song.plays || '50K+',
    });
    setIsModalOpen(true);
  };

  const handleSaveSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    updateData((prev) => {
      const currentSongs = prev.songs || {
        youtubeSongs: [],
        spotifySongs: [],
        audioTracks: [],
        allSongs: [],
      };

      if (editingSong) {
        // Updating existing song
        const updatedItem = {
          ...editingSong,
          title: formData.title.trim(),
          artist: formData.artist.trim(),
          coverImage: formData.coverImage.trim() || undefined,
          cover: formData.coverImage.trim() || undefined,
          thumbnail: formData.coverImage.trim() || undefined,
          audioUrl: formData.audioUrl.trim() || undefined,
          videoUrl: formData.videoUrl.trim() || undefined,
          spotifyUrl: formData.spotifyUrl.trim() || undefined,
          description: formData.description.trim() || undefined,
          year: formData.year.trim() || undefined,
          duration: formData.duration.trim() || undefined,
          genre: formData.genre.trim() || undefined,
          bpm: formData.bpm.trim() || undefined,
          catalogId: formData.catalogId || undefined,
          catalogIds: formData.catalogIds,
          releaseDate: formData.releaseDate.trim() || undefined,
          plays: formData.plays.trim() || undefined,
        };

        return {
          ...prev,
          songs: {
            ...currentSongs,
            youtubeSongs: (currentSongs.youtubeSongs || []).map((s) => (s.id === editingSong.id ? updatedItem : s)),
            spotifySongs: (currentSongs.spotifySongs || []).map((s) => (s.id === editingSong.id ? updatedItem : s)),
            audioTracks: (currentSongs.audioTracks || []).map((s) => (s.id === editingSong.id ? updatedItem : s)),
            allSongs: (currentSongs.allSongs || []).map((s) => (s.id === editingSong.id ? updatedItem : s)),
          },
        };
      }

      // Adding new song
      const newId = `song-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newItem: any = {
        id: newId,
        title: formData.title.trim(),
        artist: formData.artist.trim(),
        coverImage: formData.coverImage.trim() || undefined,
        cover: formData.coverImage.trim() || undefined,
        thumbnail: formData.coverImage.trim() || undefined,
        audioUrl: formData.audioUrl.trim() || undefined,
        videoUrl: formData.videoUrl.trim() || undefined,
        spotifyUrl: formData.spotifyUrl.trim() || undefined,
        description: formData.description.trim() || undefined,
        year: formData.year.trim() || '2024',
        duration: formData.duration.trim() || '3:00',
        genre: formData.genre.trim() || 'Soundtrack',
        bpm: formData.bpm.trim() || '128 BPM',
        catalogId: formData.catalogId || undefined,
        catalogIds: formData.catalogIds,
        releaseDate: formData.releaseDate.trim() || '2024',
        plays: formData.plays.trim() || '50K+',
      };

      if (songTypeToCreate === 'youtube') {
        return {
          ...prev,
          songs: {
            ...currentSongs,
            youtubeSongs: [newItem, ...(currentSongs.youtubeSongs || [])],
          },
        };
      }
      if (songTypeToCreate === 'spotify') {
        return {
          ...prev,
          songs: {
            ...currentSongs,
            spotifySongs: [newItem, ...(currentSongs.spotifySongs || [])],
          },
        };
      }
      if (songTypeToCreate === 'audio') {
        return {
          ...prev,
          songs: {
            ...currentSongs,
            audioTracks: [newItem, ...(currentSongs.audioTracks || [])],
          },
        };
      }

      return {
        ...prev,
        songs: {
          ...currentSongs,
          allSongs: [newItem, ...(currentSongs.allSongs || [])],
        },
      };
    });

    setIsModalOpen(false);
  };

  // Selected songs for multi-select / batch delete
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [deleteTargetSong, setDeleteTargetSong] = useState<{ item: any; type: string } | null>(null);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleSelectSong = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedSongIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = (allIds: string[]) => {
    if (selectedSongIds.length === allIds.length) {
      setSelectedSongIds([]);
    } else {
      setSelectedSongIds([...allIds]);
    }
  };

  const handleDeselectAll = () => {
    setSelectedSongIds([]);
  };

  const executeDeleteSong = async (songId: string) => {
    setIsDeleting(true);
    try {
      await permanentlyDeleteItem('song', songId);
      setSelectedSongIds((prev) => prev.filter((id) => id !== songId));
      setDeleteTargetSong(null);
      showNotification('Song deleted successfully');
    } catch (err) {
      console.error('Error deleting song:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const executeBatchDelete = async () => {
    if (selectedSongIds.length === 0) return;
    setIsDeleting(true);
    try {
      await permanentlyDeleteItem('song', selectedSongIds);
      const count = selectedSongIds.length;
      setSelectedSongIds([]);
      setIsBatchDeleteModalOpen(false);
      showNotification(count === 1 ? 'Song deleted successfully' : `${count} songs deleted successfully`);
    } catch (err) {
      console.error('Error batch deleting songs:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get active list based on tab
  const getFilteredSongs = () => {
    const rawAll = activeData.songs?.allSongs || [];
    const rawYt = activeData.songs?.youtubeSongs || [];
    const rawSp = activeData.songs?.spotifySongs || [];
    const rawAud = activeData.songs?.audioTracks || [];

    let list: { item: any; type: 'all' | 'youtube' | 'spotify' | 'audio' }[] = [];

    if (songTab === 'all') {
      list = [
        ...rawAll.map((s) => ({ item: s, type: 'all' as const })),
        ...rawYt.map((s) => ({ item: s, type: 'youtube' as const })),
        ...rawSp.map((s) => ({ item: s, type: 'spotify' as const })),
        ...rawAud.map((s) => ({ item: s, type: 'audio' as const })),
      ];
    } else if (songTab === 'youtube') {
      list = rawYt.map((s) => ({ item: s, type: 'youtube' as const }));
    } else if (songTab === 'spotify') {
      list = rawSp.map((s) => ({ item: s, type: 'spotify' as const }));
    } else if (songTab === 'audio') {
      list = rawAud.map((s) => ({ item: s, type: 'audio' as const }));
    }

    return list.filter(({ item }) => {
      const matchesSearch =
        !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genre?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCatalog =
        selectedCatalogFilter === 'all' ||
        item.catalogId === selectedCatalogFilter ||
        (item.catalogIds && item.catalogIds.includes(selectedCatalogFilter));

      return matchesSearch && matchesCatalog;
    });
  };

  const filteredSongs = getFilteredSongs();
  const visibleSongIds = filteredSongs.map((f) => f.item.id);
  const isAllVisibleSelected = visibleSongIds.length > 0 && visibleSongIds.every((id) => selectedSongIds.includes(id));

  return (
    <div className="space-y-6 relative" id="song-manager-container">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-2 text-emerald-400/60 hover:text-emerald-300 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2.5">
            <Music className="w-5 h-5 text-amber-500" />
            My Songs & Music Catalog
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your original music tracks, YouTube music videos, Spotify releases, and score library with multi-catalog support.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedSongIds.length > 0 && (
            <button
              type="button"
              onClick={() => setIsBatchDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-500/20 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedSongIds.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => openAddModal('all')}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Song
          </button>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          {[
            { key: 'all', label: 'All Songs', count: (activeData.songs?.allSongs?.length || 0) + (activeData.songs?.youtubeSongs?.length || 0) + (activeData.songs?.spotifySongs?.length || 0) + (activeData.songs?.audioTracks?.length || 0) },
            { key: 'youtube', label: 'YouTube Videos', count: activeData.songs?.youtubeSongs?.length || 0 },
            { key: 'spotify', label: 'Spotify Releases', count: activeData.songs?.spotifySongs?.length || 0 },
            { key: 'audio', label: 'Audio Tracks', count: activeData.songs?.audioTracks?.length || 0 },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSongTab(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                songTab === tab.key
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {tab.label} <span className="opacity-70 text-[10px] ml-1">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search, Catalog filter & Select All controls */}
        <div className="flex flex-wrap items-center gap-3">
          {visibleSongIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(visibleSongIds)}
                className="px-3 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    isAllVisibleSelected
                      ? 'bg-amber-500 border-amber-500 text-zinc-950'
                      : selectedSongIds.length > 0
                      ? 'bg-amber-500/30 border-amber-500 text-amber-300'
                      : 'border-zinc-600 bg-zinc-800'
                  }`}
                >
                  {isAllVisibleSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                {isAllVisibleSelected ? 'Deselect All' : 'Select All'}
              </button>

              {selectedSongIds.length > 0 && !isAllVisibleSelected && (
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                >
                  Deselect All
                </button>
              )}
            </div>
          )}

          {flatSongCatalogs.length > 0 && (
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-zinc-400" />
              <select
                value={selectedCatalogFilter}
                onChange={(e) => setSelectedCatalogFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Catalogs</option>
                {flatSongCatalogs.map((cat, idx) => (
                  <option key={`${cat.id}-${idx}`} value={cat.id}>
                    {cat.pathString}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search songs, artist, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 w-52 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Songs Cards Grid */}
      {filteredSongs.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <Music className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-300">No songs found in this category</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'Try adjusting your search query or catalog filter.' : 'Click "Add New Song" above to add your first track.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map(({ item, type }) => {
            const isPlaying = playingAudioUrl === (item.audioUrl || item.audioTrack);
            const cover = item.coverImage || item.cover || item.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop';
            const audioSrc = item.audioUrl || item.audioTrack;
            const isSelected = selectedSongIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-zinc-900/90 border p-4 rounded-2xl flex flex-col justify-between transition-all group shadow-md relative ${
                  isSelected ? 'border-amber-500 ring-1 ring-amber-500/50 bg-amber-500/5' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-950 mb-3 group/cover">
                    <img
                      src={cover}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500"
                    />

                    {/* Selection Checkbox on Card */}
                    <button
                      type="button"
                      onClick={(e) => handleSelectSong(item.id, e)}
                      className="absolute top-2 right-2 z-10 w-6 h-6 rounded-lg bg-zinc-950/80 border border-zinc-600 hover:border-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-md"
                      title={isSelected ? 'Deselect song' : 'Select song'}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center ${
                          isSelected ? 'bg-amber-500 text-zinc-950 font-bold' : ''
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>

                    {/* Audio Play Overlay if audio url exists */}
                    {audioSrc && (
                      <button
                        type="button"
                        onClick={() => togglePlayAudio(audioSrc)}
                        className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all cursor-pointer"
                        title={isPlaying ? 'Pause preview' : 'Play audio preview'}
                      >
                        <div className="w-12 h-12 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg transform group-hover/cover:scale-110 transition-transform">
                          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                        </div>
                      </button>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-amber-500/20">
                      {type}
                    </div>

                    {item.duration && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] text-zinc-300 font-mono">
                        {item.duration}
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-zinc-100 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-amber-400/90 font-medium line-clamp-1 mt-0.5">{item.artist || 'Shahid Shaikh'}</p>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {item.genre && (
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] rounded-md border border-zinc-700">
                        {item.genre}
                      </span>
                    )}
                    {item.bpm && (
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] rounded-md border border-zinc-700">
                        {item.bpm}
                      </span>
                    )}
                    {item.year && (
                      <span className="px-2 py-0.5 bg-zinc-800/60 text-zinc-400 text-[10px] rounded-md">
                        {item.year}
                      </span>
                    )}
                  </div>

                  {/* Assigned Catalogs list */}
                  {item.catalogIds && item.catalogIds.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1">
                      <Tag className="w-3 h-3 text-zinc-500" />
                      {item.catalogIds.map((cid: string) => {
                        const catNode = flatSongCatalogs.find((c) => c.id === cid);
                        return (
                          <span
                            key={cid}
                            className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] rounded border border-amber-500/20"
                          >
                            {catNode?.name || cid}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">{item.description}</p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.videoUrl && (
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-amber-400 text-xs flex items-center gap-1"
                        title="Open Video URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {item.spotifyUrl && (
                      <a
                        href={item.spotifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-green-400 text-xs flex items-center gap-1"
                        title="Open Spotify URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(item, type)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Song"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetSong({ item, type })}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Song Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Single Song Deletion */}
      {deleteTargetSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-950 border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-100">Delete Song</h3>
                <p className="text-xs text-zinc-400">This action will permanently delete this song.</p>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl">
              <p className="text-xs font-semibold text-zinc-200 line-clamp-1">{deleteTargetSong.item.title}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{deleteTargetSong.item.artist || 'Shahid Shaikh'}</p>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete this song from the database? It will be completely removed from storage and all catalog relationships.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTargetSong(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => executeDeleteSong(deleteTargetSong.item.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Deleting...' : 'Delete Song'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Batch Deletion */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-950 border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-100">Delete Selected Songs</h3>
                <p className="text-xs text-zinc-400">Permanently delete {selectedSongIds.length} selected song(s).</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete the <strong className="text-zinc-200">{selectedSongIds.length}</strong> selected song(s) from the database? Unselected songs will remain untouched.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeBatchDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Deleting...' : `Delete ${selectedSongIds.length} Songs`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Song Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-500" />
                {editingSong ? 'Edit Song Details' : 'Add New Song to Portfolio'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSong} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Song Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    placeholder="Track Title"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Artist / Composer</label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    placeholder="Shahid Shaikh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Cover Artwork URL</label>
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Audio Stream / MP3 URL</label>
                  <input
                    type="text"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    placeholder="https://...mp3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">YouTube Video Link</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Spotify Track Link</label>
                  <input
                    type="text"
                    value={formData.spotifyUrl}
                    onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    placeholder="https://open.spotify.com/track/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Genre</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    placeholder="Trap / Hip Hop"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">BPM</label>
                  <input
                    type="text"
                    value={formData.bpm}
                    onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    placeholder="140 BPM"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    placeholder="3:15"
                  />
                </div>
              </div>

              {/* Universal Global Catalog Assignment */}
              <UniversalCatalogPicker
                label="Assign to Music / Global Catalogs (Multi-Catalog Selection)"
                selectedCategory={
                  flatSongCatalogs.find((c) => c.id === formData.catalogId)?.name ||
                  allGlobalCatalogs.find((c) => c.id === formData.catalogId)?.name ||
                  formData.catalogId
                }
                selectedCatalogId={formData.catalogId}
                selectedCatalogIds={formData.catalogIds}
                onSelectCategory={(catName, catId) => {
                  setFormData({
                    ...formData,
                    catalogId: catId || catName,
                    catalogIds: catId ? (formData.catalogIds.includes(catId) ? formData.catalogIds : [...formData.catalogIds, catId]) : formData.catalogIds,
                  });
                }}
                onToggleAdditionalCatalog={(cid) => {
                  const current = formData.catalogIds;
                  const updated = current.includes(cid) ? current.filter((id) => id !== cid) : [...current, cid];
                  setFormData({
                    ...formData,
                    catalogIds: updated,
                    catalogId: formData.catalogId === cid ? updated[0] || '' : (formData.catalogId || updated[0] || ''),
                  });
                }}
              />

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Description / Liner Notes</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  placeholder="Song concept, instrumentation, and credits..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  {editingSong ? 'Update Song' : 'Save Song'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
