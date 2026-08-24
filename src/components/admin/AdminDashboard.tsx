import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { CatalogTreeManager } from './CatalogTreeManager';
import { SongManager } from './SongManager';
import { TrashManager } from './TrashManager';
import { BackupManager as CloudBackupManager } from './BackupManager';
import { VideoCatalogCardManager } from './VideoCatalogCardManager';
import {
  UniversalCatalogPicker,
  UniversalMoveCopyModal,
  UniversalDeleteConfirmModal,
} from './UniversalCatalogComponents';
import {
  Sliders,
  LogOut,
  Eye,
  Save,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ArrowUp,
  ArrowDown,
  Upload,
  RefreshCw,
  Download,
  FileCode,
  Check,
  AlertTriangle,
  Film,
  Camera,
  Music,
  Briefcase,
  Layers,
  Phone,
  Layout,
  User,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  RotateCcw,
  RotateCw,
  ToggleLeft,
  ToggleRight,
  EyeOff,
  Heart,
  Smartphone,
  Video,
  Folder,
  FolderTree,
  ShieldCheck,
} from 'lucide-react';
import {
  VideoProject,
  PhotoItem,
  ShootService,
  DirectionProject,
  YouTubeSong,
  SpotifySong,
  AudioTrack,
  ExperienceItem,
  StatItem,
  SectionVisibility,
} from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    data,
    draftData,
    hasUnsavedChanges,
    saveChanges,
    saveChangesWithDetails,
    discardChanges,
    resetSectionToDefault,
    resetAllToDefaults,
    requestExitCMS,
    isUnsavedPromptOpen,
    setIsUnsavedPromptOpen,
    handleSaveAndLeave,
    handleDiscardAndLeave,
    updateData,
    resetToDefaults,
    exportDataJSON,
    importDataJSON,
    setIsAdminView,
    logout,
    canUndo,
    canRedo,
    undo,
    redo,
    undoCount,
    redoCount,
    toggleSectionVisibility,
  } = usePortfolio();

  // Use draftData for editing controls
  const activeData = draftData || data;

  const [activeTab, setActiveTab] = useState<
    | 'sections'
    | 'catalogs'
    | 'videos'
    | 'photos'
    | 'shoots'
    | 'direction'
    | 'songs'
    | 'experience'
    | 'skills'
    | 'hero'
    | 'about'
    | 'contact'
    | 'general'
    | 'trash'
    | 'backup'
  >('videos');

  const [catalogSubTab, setCatalogSubTab] = useState<'video' | 'photo' | 'song'>('video');
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const showNotification = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(null), 4000);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    const res = await saveChangesWithDetails();
    setIsSaving(false);
    if (res.success) {
      showNotification('✓ All changes published and saved successfully to server!');
    } else {
      showNotification(`⚠️ Save failed: ${res.message || 'Please try again'}`);
    }
  };

  const handleDiscardClick = () => {
    if (window.confirm('Discard all unsaved changes and revert to the last saved version?')) {
      discardChanges();
      showNotification('Draft reverted to last saved state.');
    }
  };

  const getCurrentSectionKey = () => {
    switch (activeTab) {
      case 'sections':
        return 'sections';
      case 'catalogs':
        return catalogSubTab === 'video' ? 'videoCatalogTree' : 'photoCatalogTree';
      case 'videos':
        return 'videoProjects';
      case 'photos':
        return 'photography';
      case 'shoots':
        return 'shootServices';
      case 'direction':
        return 'directionProjects';
      case 'songs':
        return 'songs';
      case 'experience':
        return 'experiences';
      case 'skills':
        return 'skills';
      case 'hero':
        return 'hero';
      case 'about':
        return 'about';
      case 'contact':
        return 'contact';
      case 'general':
        return 'general';
      default:
        return null;
    }
  };

  const handleResetCurrentSection = () => {
    const secKey = getCurrentSectionKey();
    if (secKey) {
      resetSectionToDefault(secKey);
      setIsResetModalOpen(false);
      showNotification(`Reset ${activeTab.toUpperCase()} to defaults (unsaved draft). Click SAVE to publish.`);
    }
  };

  const handleResetEntireSite = () => {
    resetAllToDefaults();
    setIsResetModalOpen(false);
    showNotification('Reset entire portfolio to default baseline (unsaved draft). Click SAVE to publish.');
  };

  // Helper for image upload to base64
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
          showNotification('Image uploaded successfully');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans pb-24">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 border-b border-amber-500/30 backdrop-blur-xl px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-wider uppercase text-white font-display">
                CMS CONTROL PANEL
              </h1>
              {hasUnsavedChanges ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  UNSAVED EDITS
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  <Check className="w-3 h-3" />
                  PUBLISHED
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              Complete Freedom Management • Shahid Shaikh
            </p>
          </div>
        </div>

        {/* Primary Action Controls (SAVE, DISCARD, RESET, Undo, Redo, Preview, Logout) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* DISCARD CHANGES (Only active if unsaved edits exist) */}
          <button
            onClick={handleDiscardClick}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-950/40 text-zinc-400 hover:text-red-300 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-zinc-400 text-xs font-mono transition-colors cursor-pointer disabled:cursor-not-allowed border border-white/5 hover:border-red-500/30"
            title="Discard pending changes and revert to last saved state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Discard</span>
          </button>

          {/* RESET TO DEFAULT BUTTON */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/10 text-zinc-300 hover:text-amber-300 text-xs font-mono transition-colors cursor-pointer border border-white/5 hover:border-amber-500/30"
            title="Restore baseline defaults for current section or full website"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          {/* Undo / Redo */}
          <div className="hidden lg:flex items-center gap-1 border-x border-white/10 px-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-300 text-xs font-mono transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Undo last change (Ctrl+Z)"
            >
              <RotateCcw className="w-3 h-3" />
              {undoCount > 0 && <span className="text-[10px] text-amber-400">({undoCount})</span>}
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-300 text-xs font-mono transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Redo next change"
            >
              <RotateCw className="w-3 h-3" />
              {redoCount > 0 && <span className="text-[10px] text-amber-400">({redoCount})</span>}
            </button>
          </div>

          {/* PROMINENT SAVE CHANGES BUTTON */}
          <button
            onClick={handleSaveClick}
            disabled={isSaving || !hasUnsavedChanges}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg ${
              hasUnsavedChanges
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 shadow-emerald-500/30 ring-2 ring-emerald-400/50 scale-[1.02]'
                : 'bg-zinc-800 text-zinc-400 border border-white/10 cursor-default opacity-70'
            }`}
            title="Publish and persist changes to the public portfolio"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>SAVING...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>SAVE CHANGES</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>SAVED</span>
              </>
            )}
          </button>

          {/* View Website (Guarded with requestExitCMS) */}
          <button
            onClick={requestExitCMS}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold tracking-wider transition-colors cursor-pointer shadow-md shadow-amber-500/20"
            title="Preview public live website"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview Website</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-medium transition-colors cursor-pointer"
            title="Logout Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Floating Save Notification */}
      {saveBanner && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-white/10">
          {[
            { id: 'sections', label: 'ADD / REMOVE SECTIONS', icon: ToggleLeft },
            { id: 'catalogs', label: 'CATALOG & FOLDER TREES', icon: FolderTree },
            { id: 'videos', label: 'VIDEO SHOWCASE (WEDDING, REELS, CINEMA)', icon: Film },
            { id: 'photos', label: 'PHOTOGRAPHY', icon: Camera },
            { id: 'shoots', label: 'SHOOT SERVICES', icon: Video },
            { id: 'direction', label: 'VIDEO DIRECTION', icon: Sparkles },
            { id: 'songs', label: 'MY SONGS', icon: Music },
            { id: 'experience', label: 'EXPERIENCE', icon: Briefcase },
            { id: 'skills', label: 'SKILLS', icon: Layers },
            { id: 'hero', label: 'HERO & HOME', icon: Layout },
            { id: 'about', label: 'ABOUT & STATS', icon: User },
            { id: 'contact', label: 'CONTACT & SOCIAL', icon: Phone },
            { id: 'general', label: 'GENERAL / SEO', icon: Sparkles },
            { id: 'trash', label: 'TRASH & RECOVERY', icon: Trash2 },
            { id: 'backup', label: 'SNAPSHOTS & BACKUPS', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 0: SECTION VISIBILITY (ADD/REMOVE SECTIONS) */}
        {activeTab === 'sections' && (
          <SectionsManager
            sections={activeData.sections}
            onToggle={(key) => {
              toggleSectionVisibility(key);
              showNotification(`Section visibility updated`);
            }}
          />
        )}

        {/* Tab 0.5: HIERARCHICAL CATALOG SYSTEM (VIDEOS, PHOTOS, SONGS) */}
        {activeTab === 'catalogs' && (
          <div className="space-y-6">
            {/* Switch between Video Tree, Photo Tree, and Song Tree */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-950 border border-white/10 max-w-lg">
              <button
                type="button"
                onClick={() => setCatalogSubTab('video')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogSubTab === 'video'
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Video Catalogs</span>
              </button>
              <button
                type="button"
                onClick={() => setCatalogSubTab('photo')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogSubTab === 'photo'
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Photo Catalogs</span>
              </button>
              <button
                type="button"
                onClick={() => setCatalogSubTab('song')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogSubTab === 'song'
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>Song Catalogs</span>
              </button>
            </div>

            <CatalogTreeManager type={catalogSubTab} />
          </div>
        )}

        {/* Tab 1: VIDEO PROJECTS MANAGEMENT */}
        {activeTab === 'videos' && (
          <VideosManager
            projects={activeData.videoProjects}
            catalogues={activeData.videoCatalogues || ['Wedding Films', 'Cinematic', 'Trailers', 'Teasers', 'Reels', 'Commercial & Teasers', 'Podcasts', 'Music Videos']}
            onUpdate={(updater) => {
              updateData((prev) => ({ ...prev, videoProjects: updater(prev.videoProjects) }));
              showNotification('Video projects updated in draft');
            }}
            onUpdateCatalogues={(newCats) => {
              updateData((prev) => ({ ...prev, videoCatalogues: newCats }));
              showNotification('Video catalogues updated in draft');
            }}
            onImageUpload={handleImageFileUpload}
          />
        )}

        {/* Tab 2: PHOTOGRAPHY MANAGEMENT */}
        {activeTab === 'photos' && (
          <PhotosManager
            photos={activeData.photography}
            catalogues={activeData.photoCatalogues || ['WEDDINGS', 'PORTRAITS', 'EVENTS', 'LIFESTYLE', 'STREET', 'CREATIVE']}
            onUpdate={(updater) => {
              updateData((prev) => ({ ...prev, photography: updater(prev.photography) }));
              showNotification('Photography gallery updated in draft');
            }}
            onUpdateCatalogues={(newCats) => {
              updateData((prev) => ({ ...prev, photoCatalogues: newCats }));
              showNotification('Photo catalogues updated in draft');
            }}
            onImageUpload={handleImageFileUpload}
          />
        )}

        {/* Tab 3: SHOOT SERVICES MANAGEMENT */}
        {activeTab === 'shoots' && (
          <ShootsManager
            services={activeData.shootServices}
            onUpdate={(updater) => {
              updateData((prev) => ({ ...prev, shootServices: updater(prev.shootServices) }));
              showNotification('Shoot services updated in draft');
            }}
            onImageUpload={handleImageFileUpload}
          />
        )}

        {/* Tab 4: VIDEO DIRECTION MANAGEMENT */}
        {activeTab === 'direction' && (
          <DirectionManager
            projects={activeData.directionProjects}
            onUpdate={(updater) => {
              updateData((prev) => ({ ...prev, directionProjects: updater(prev.directionProjects) }));
              showNotification('Directorial projects updated in draft');
            }}
            onImageUpload={handleImageFileUpload}
          />
        )}

        {/* Tab 5: MY SONGS MANAGEMENT */}
        {activeTab === 'songs' && <SongManager />}

        {/* Tab 6: EXPERIENCE MANAGEMENT */}
        {activeTab === 'experience' && (
          <ExperienceManager
            experiences={activeData.experiences}
            onUpdate={(updater) => {
              updateData((prev) => ({ ...prev, experiences: updater(prev.experiences) }));
              showNotification('Experience timeline updated in draft');
            }}
          />
        )}

        {/* Tab 7: SKILLS MANAGEMENT */}
        {activeTab === 'skills' && (
          <SkillsManager
            skills={activeData.skills}
            onUpdate={(newSkills) => {
              updateData((prev) => ({ ...prev, skills: newSkills }));
              showNotification('Skills updated in draft');
            }}
          />
        )}

        {/* Tab 8: HERO & HOME MANAGEMENT */}
        {activeTab === 'hero' && (
          <HeroManager
            hero={activeData.hero}
            onUpdate={(newHero) => {
              updateData((prev) => ({ ...prev, hero: newHero }));
              showNotification('Hero section updated in draft');
            }}
            onImageUpload={handleImageFileUpload}
          />
        )}

        {/* Tab 9: ABOUT & STATS MANAGEMENT */}
        {activeTab === 'about' && (
          <AboutManager
            about={activeData.about}
            onUpdate={(newAbout) => {
              updateData((prev) => ({ ...prev, about: newAbout }));
              showNotification('About section updated in draft');
            }}
            onImageUpload={handleImageFileUpload}
          />
        )}

        {/* Tab 10: CONTACT & SOCIAL MANAGEMENT */}
        {activeTab === 'contact' && (
          <ContactManager
            contact={activeData.contact}
            onUpdate={(newContact) => {
              updateData((prev) => ({ ...prev, contact: newContact }));
              showNotification('Contact details updated in draft');
            }}
          />
        )}

        {/* Tab 11: GENERAL / SEO MANAGEMENT */}
        {activeTab === 'general' && (
          <GeneralManager
            general={activeData.general}
            onUpdate={(newGen) => {
              updateData((prev) => ({ ...prev, general: newGen }));
              showNotification('General settings updated in draft');
            }}
          />
        )}

        {/* Tab 12: TRASH & RECOVERY (SAFE DELETE) */}
        {activeTab === 'trash' && <TrashManager />}

        {/* Tab 13: BACKUP, SNAPSHOTS & RECOVERY */}
        {activeTab === 'backup' && <CloudBackupManager />}
      </div>

      {/* Floating Bottom Sticky Bar when Unsaved Changes Exist */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 border border-amber-500/50 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-xl flex items-center gap-4 text-xs font-mono animate-in fade-in slide-in-from-bottom-4 ring-4 ring-amber-500/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-zinc-200 font-sans font-medium hidden sm:inline">You have unsaved changes in draft.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscardClick}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold uppercase transition-all shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5 text-amber-400">
                <RefreshCw className="w-5 h-5" />
                <h3 className="text-base font-bold text-white uppercase font-display">Reset Options</h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Choose how you want to restore defaults. Changes will be loaded into your working draft first, so you can review and explicitly save them when ready.
            </p>

            <div className="space-y-3">
              {getCurrentSectionKey() && (
                <button
                  onClick={handleResetCurrentSection}
                  className="w-full text-left p-4 rounded-xl bg-zinc-900/80 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center justify-between">
                    <span>RESET CURRENT SECTION ({activeTab.toUpperCase()})</span>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 font-light">
                    Restores only the active tab ({activeTab}) back to default baseline without touching other sections.
                  </p>
                </button>
              )}

              <button
                onClick={handleResetEntireSite}
                className="w-full text-left p-4 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/50 transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-red-300 group-hover:text-red-200 flex items-center justify-between">
                  <span>RESET ENTIRE PORTFOLIO TO DEFAULTS</span>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-light">
                  Restores all sections, projects, catalog trees, and texts to Shahid Shaikh's clean factory baseline.
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal (when trying to leave CMS) */}
      {isUnsavedPromptOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 ring-4 ring-amber-500/10">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">Unsaved Changes in Draft</h3>
                <p className="text-xs text-amber-300/80 font-mono">Changes have not been published</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              You have modified your portfolio. Would you like to publish and save your changes to the live site before leaving the CMS?
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={handleSaveAndLeave}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes &amp; Preview Website</span>
              </button>

              <button
                onClick={handleDiscardAndLeave}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 text-red-300 hover:text-red-200 font-bold text-xs uppercase transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Discard Changes &amp; Exit</span>
              </button>

              <button
                onClick={() => setIsUnsavedPromptOpen(false)}
                className="w-full py-2 text-center text-xs text-zinc-400 hover:text-white font-mono transition-colors cursor-pointer"
              >
                Keep Editing in CMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 0: SECTION VISIBILITY (ADD / REMOVE SECTIONS)
   ========================================================================= */
const SectionsManager: React.FC<{
  sections?: SectionVisibility;
  onToggle: (key: keyof SectionVisibility) => void;
}> = ({ sections, onToggle }) => {
  const s = sections || {
    hero: true,
    about: true,
    videoEditing: true,
    photography: true,
    shootServices: true,
    videoDirection: true,
    mySongs: true,
    experience: true,
    skills: true,
    contact: true,
  };

  const sectionList: {
    key: keyof SectionVisibility;
    title: string;
    description: string;
    icon: any;
    recommended?: boolean;
  }[] = [
    {
      key: 'hero',
      title: 'Hero & Home Intro',
      description: 'Fullscreen cinematic background video, brand tagline, and quick reels spotlight.',
      icon: Layout,
      recommended: true,
    },
    {
      key: 'about',
      title: 'About Me & Creative Story',
      description: 'Biography, creative philosophy, stats milestones, and editorial portrait.',
      icon: User,
      recommended: true,
    },
    {
      key: 'videoEditing',
      title: 'Video Showcase (Wedding, Cinema, Trailers, Teasers, Reels)',
      description: 'The primary video showcase featuring Wedding Films, Cinematic, Theatrical Trailers, Teasers & 9:16 Vertical Reels.',
      icon: Film,
      recommended: true,
    },
    {
      key: 'photography',
      title: 'Photography Masonry Gallery',
      description: 'Curated high-resolution photography catalog with full-screen lightbox and category filtering.',
      icon: Camera,
    },
    {
      key: 'shootServices',
      title: 'On-Location Shoot Services',
      description: 'Videography, Drone/Aerial Cinema, Pre-Wedding, Commercials, and equipment gear breakdown.',
      icon: Video,
    },
    {
      key: 'videoDirection',
      title: 'Video Direction & Concept Films',
      description: 'Directorial vision, script breakdown, vision moodboards, and shot composition showreel.',
      icon: Sparkles,
    },
    {
      key: 'mySongs',
      title: 'My Songs & Audio Discography',
      description: 'YouTube official music videos, Spotify tracks, and interactive audio stream player.',
      icon: Music,
    },
    {
      key: 'experience',
      title: 'Career Experience & Timeline',
      description: 'Work chronology, studio credits, senior video editor positions, and company history.',
      icon: Briefcase,
    },
    {
      key: 'skills',
      title: 'Creative Software & Hardware Suite',
      description: 'Premiere Pro, DaVinci Resolve, After Effects, color grading workflows & cameras.',
      icon: Layers,
    },
    {
      key: 'contact',
      title: 'Contact & Inquiry Booking',
      description: 'Booking request form, direct WhatsApp/phone contact, and official social media handles.',
      icon: Phone,
      recommended: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-amber-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <ToggleLeft className="w-4 h-4" />
              <span>Section Visibility &amp; Layout Manager</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase font-display">
              Add or Remove Portfolio Sections
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Turn any section ON or OFF with 1-click. When a section is turned OFF, it is cleanly removed from the live website and navigation bar immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionList.map((item) => {
          const Icon = item.icon;
          const isVisible = s[item.key] !== false;

          return (
            <div
              key={item.key}
              className={`p-5 rounded-2xl border transition-all duration-300 flex items-start justify-between gap-4 ${
                isVisible
                  ? 'bg-zinc-950/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-zinc-950/40 border-white/[0.06] opacity-60'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isVisible
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-900 text-zinc-600 border-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-white truncate">
                      {item.title}
                    </h3>
                    {item.recommended && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-mono border border-amber-500/20">
                        CORE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-light mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Toggle Switch Button */}
              <button
                type="button"
                onClick={() => onToggle(item.key)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isVisible ? 'bg-amber-500' : 'bg-zinc-800'
                }`}
                title={isVisible ? 'Click to Remove/Hide Section' : 'Click to Add/Show Section'}
                aria-label={`Toggle ${item.title}`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-zinc-950 shadow-md ring-0 transition duration-200 ease-in-out ${
                    isVisible ? 'translate-x-5 bg-zinc-950' : 'translate-x-0 bg-zinc-400'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 1: VIDEO PROJECTS (WITH CATALOGUES & ASPECT RATIOS)
   ========================================================================= */
const VideosManager: React.FC<{
  projects: VideoProject[];
  catalogues: string[];
  onUpdate: (updater: (prev: VideoProject[]) => VideoProject[]) => void;
  onUpdateCatalogues: (cats: string[]) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => void;
}> = ({ projects, catalogues, onUpdate, onUpdateCatalogues, onImageUpload }) => {
  const { allGlobalCatalogs, allGlobalCatalogNames, renameCatalogEverywhere, deleteCatalogEverywhere } = usePortfolio();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCatIdx, setEditingCatIdx] = useState<number | null>(null);
  const [editingCatText, setEditingCatText] = useState('');
  const [showCatManager, setShowCatManager] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Universal Modals
  const [moveCopyTarget, setMoveCopyTarget] = useState<VideoProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VideoProject | null>(null);

  // Effective list of catalogues
  const activeCatalogues = React.useMemo(() => {
    return catalogues && catalogues.length > 0
      ? catalogues
      : ['Wedding Films', 'Cinematic', 'Trailers', 'Teasers', 'Reels', 'Commercial & Teasers', 'Podcasts', 'Music Videos'];
  }, [catalogues]);

  const handleAddCatalogue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (!activeCatalogues.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      onUpdateCatalogues([...activeCatalogues, trimmed]);
    }
    setNewCatInput('');
  };

  const handleDeleteCatalogue = (catToDelete: string) => {
    deleteCatalogEverywhere(catToDelete, 'video');
    if (activeFilter.toLowerCase() === catToDelete.toLowerCase()) {
      setActiveFilter('ALL');
    }
  };

  const handleSaveRenameCatalogue = (idx: number) => {
    const oldName = activeCatalogues[idx];
    const newName = editingCatText.trim();
    if (newName && newName.toLowerCase() !== oldName.toLowerCase()) {
      renameCatalogEverywhere(oldName, newName, 'video');
    }
    setEditingCatIdx(null);
    setEditingCatText('');
  };

  const handleAddNew = (presetCategory?: string) => {
    const defaultCat = presetCategory || (activeCatalogues[0] || 'Wedding Films');
    const newProj: VideoProject = {
      id: `vid-${Date.now()}`,
      title: 'New Video Project',
      category: defaultCat,
      year: new Date().getFullYear().toString(),
      description: 'Enter description of the project, cinematic color grade, and narrative style...',
      thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200&auto=format&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      client: 'Private Client',
      duration: '3:30',
      aspectRatio: defaultCat.toLowerCase().includes('reel') ? '9:16' : '16:9',
      tags: ['Color Grading', 'Premiere Pro'],
      buttonText: 'WATCH VIDEO',
    };
    onUpdate((prev) => [newProj, ...prev]);
    setEditingId(newProj.id);
  };

  const handleDelete = (id: string) => {
    onUpdate((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleDuplicate = (project: VideoProject) => {
    const copy: VideoProject = {
      ...project,
      id: `vid-${Date.now()}`,
      title: `${project.title} (Copy)`,
    };
    onUpdate((prev) => [copy, ...prev]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    onUpdate((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleSaveField = (id: string, field: keyof VideoProject, value: any) => {
    onUpdate((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const filteredProjects = activeFilter === 'ALL'
    ? projects
    : projects.filter((p) => p.category.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase mb-1">
            <Film className="w-4 h-4" />
            <span>Video Content Catalog ({projects.length} Total)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white uppercase font-display">
            Video Showcase &amp; Reel Manager
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Add, delete, customize catalogues, reorder videos, and filter projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCatManager(!showCatManager)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showCatManager
                ? 'bg-amber-500 text-zinc-950 border-amber-500'
                : 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-amber-500/40'
            }`}
            title="Toggle Catalogues Management Panel"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage Catalogues ({activeCatalogues.length})</span>
          </button>

          <button
            onClick={() => handleAddNew('Wedding Films')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Wedding Film</span>
          </button>

          <button
            onClick={() => handleAddNew('Reels')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ 9:16 Reel</span>
          </button>

          <button
            onClick={() => handleAddNew()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>ADD VIDEO</span>
          </button>
        </div>
      </div>

      {/* CATALOGUE MANAGEMENT CARDS GRID */}
      {showCatManager && (
        <VideoCatalogCardManager
          catalogues={activeCatalogues}
          projects={projects}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          onUpdateCatalogues={onUpdateCatalogues}
          onUpdateProjects={onUpdate}
          onAddNewProject={(category) => handleAddNew(category)}
          onEditProject={(id) => setEditingId(id)}
          onImageUpload={onImageUpload}
        />
      )}

      {/* Category Filter Tabs inside Admin */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          ALL VIDEOS ({projects.length})
        </button>
        {activeCatalogues.map((cat) => {
          const count = projects.filter((p) => p.category.toLowerCase().includes(cat.toLowerCase())).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeFilter.toLowerCase() === cat.toLowerCase()
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.toUpperCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-zinc-950/60 rounded-2xl border border-white/10">
            <Film className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">No videos found for this catalogue.</p>
            <button
              onClick={() => handleAddNew(activeFilter === 'ALL' ? undefined : activeFilter)}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Video</span>
            </button>
          </div>
        ) : (
          filteredProjects.map((project, index) => {
            const isEditing = editingId === project.id;
            return (
              <div
                key={project.id}
                className={`rounded-2xl border transition-all ${
                  isEditing
                    ? 'bg-zinc-950 border-amber-500/60 shadow-xl'
                    : 'bg-zinc-950/60 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Header Bar */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`rounded-lg bg-zinc-900 overflow-hidden shrink-0 border border-white/10 relative ${
                        project.aspectRatio === '9:16' ? 'w-10 h-16' : 'w-16 h-10 sm:w-20 sm:h-12'
                      }`}
                    >
                      <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono uppercase">
                          {project.category}
                        </span>
                        {project.aspectRatio && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 text-[10px] font-mono">
                            {project.aspectRatio}
                          </span>
                        )}
                        <span className="text-xs text-zinc-400 font-mono">{project.year}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                        {project.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === filteredProjects.length - 1}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMoveCopyTarget(project)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 cursor-pointer"
                      title="Move or Copy to another Catalog"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(project)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(isEditing ? null : project.id)}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        isEditing ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                      }`}
                      title={isEditing ? 'Close' : 'Edit'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(project)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 cursor-pointer"
                      title="Delete or Remove from Catalog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Editing Form Panel */}
                {isEditing && (
                  <div className="p-6 pt-2 border-t border-white/10 space-y-4 bg-zinc-900/40 rounded-b-2xl">
                    {/* Universal Global Catalog Assignment */}
                    <UniversalCatalogPicker
                      label="Assign to Global / Video Catalogues"
                      selectedCategory={project.category}
                      selectedCatalogId={project.catalogId}
                      selectedCatalogIds={project.catalogIds || []}
                      onSelectCategory={(catName, catId) => {
                        handleSaveField(project.id, 'category', catName);
                        if (catId) handleSaveField(project.id, 'catalogId', catId);
                        if (catName.toLowerCase().includes('reel')) {
                          handleSaveField(project.id, 'aspectRatio', '9:16');
                        }
                      }}
                      onToggleAdditionalCatalog={(cid) => {
                        const current = project.catalogIds || [];
                        const updated = current.includes(cid) ? current.filter((id) => id !== cid) : [...current, cid];
                        handleSaveField(project.id, 'catalogIds', updated);
                      }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Project Title *
                        </label>
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => handleSaveField(project.id, 'title', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Category / Primary Catalogue Name *
                        </label>
                        <input
                          type="text"
                          value={project.category}
                          onChange={(e) => handleSaveField(project.id, 'category', e.target.value)}
                          placeholder="e.g. Wedding Films, Cinematic, Trailers, Reels"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Aspect Ratio Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Video Frame Aspect Ratio
                        </label>
                        <div className="flex gap-2">
                          {['16:9', '9:16', '4:3', '1:1'].map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => handleSaveField(project.id, 'aspectRatio', ratio)}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                                (project.aspectRatio || '16:9') === ratio
                                  ? 'bg-amber-500 text-zinc-950 font-bold'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                              }`}
                            >
                              {ratio} {ratio === '9:16' ? '(Reel)' : ratio === '16:9' ? '(Cinema)' : ''}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Duration / Timecode
                        </label>
                        <input
                          type="text"
                          value={project.duration || ''}
                          onChange={(e) => handleSaveField(project.id, 'duration', e.target.value)}
                          placeholder="e.g. 4:32 or 0:30"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Year
                        </label>
                        <input
                          type="text"
                          value={project.year}
                          onChange={(e) => handleSaveField(project.id, 'year', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Client / Production Studio
                        </label>
                        <input
                          type="text"
                          value={project.client || ''}
                          onChange={(e) => handleSaveField(project.id, 'client', e.target.value)}
                          placeholder="e.g. Eternity Wedding Films"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Button Action Text
                        </label>
                        <input
                          type="text"
                          value={project.buttonText || 'WATCH FILM'}
                          onChange={(e) => handleSaveField(project.id, 'buttonText', e.target.value)}
                          placeholder="WATCH FILM"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Reels Specific Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Views / Reach Display (e.g. For Reels)
                        </label>
                        <input
                          type="text"
                          value={project.viewsCount || ''}
                          onChange={(e) => handleSaveField(project.id, 'viewsCount', e.target.value)}
                          placeholder="e.g. 2.4M Views, 850K Plays"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                          Audio Track / Song Name (For Reels)
                        </label>
                        <input
                          type="text"
                          value={project.audioTrack || ''}
                          onChange={(e) => handleSaveField(project.id, 'audioTrack', e.target.value)}
                          placeholder="e.g. Original Sound - Shahid Shaikh Cinematic"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Video URL */}
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Video Stream URL (YouTube, Vimeo, or MP4 direct link) *
                      </label>
                      <input
                        type="text"
                        value={project.videoUrl}
                        onChange={(e) => handleSaveField(project.id, 'videoUrl', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>

                    {/* Thumbnail Image URL & Upload */}
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Thumbnail Image (URL or Upload File)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={project.thumbnail}
                          onChange={(e) => handleSaveField(project.id, 'thumbnail', e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                        />
                        <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              onImageUpload(e, (url) => handleSaveField(project.id, 'thumbnail', url))
                            }
                          />
                        </label>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Project Description
                      </label>
                      <textarea
                        rows={2}
                        value={project.description}
                        onChange={(e) => handleSaveField(project.id, 'description', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Tags (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={project.tags?.join(', ') || ''}
                        onChange={(e) =>
                          handleSaveField(
                            project.id,
                            'tags',
                            e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                          )
                        }
                        placeholder="Wedding Cinema, 4K Color Grading, Sound Design"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Universal Move / Copy Modal for Video Projects */}
      {moveCopyTarget && (
        <UniversalMoveCopyModal
          isOpen={true}
          itemTitle={moveCopyTarget.title}
          currentCategory={moveCopyTarget.category}
          onClose={() => setMoveCopyTarget(null)}
          onMove={(targetCatName, targetCatId) => {
            onUpdate((prev) =>
              prev.map((p) =>
                p.id === moveCopyTarget.id
                  ? { ...p, category: targetCatName, catalogId: targetCatId }
                  : p
              )
            );
            setMoveCopyTarget(null);
          }}
          onCopy={(targetCatName, targetCatId) => {
            const newCopy: VideoProject = {
              ...moveCopyTarget,
              id: `vid-${Date.now()}`,
              title: `${moveCopyTarget.title} (Copy)`,
              category: targetCatName,
              catalogId: targetCatId,
            };
            onUpdate((prev) => [newCopy, ...prev]);
            setMoveCopyTarget(null);
          }}
        />
      )}

      {/* Universal Safe Delete / Remove Modal for Video Projects */}
      {deleteTarget && (
        <UniversalDeleteConfirmModal
          isOpen={true}
          itemType="video"
          itemId={deleteTarget.id}
          itemTitle={deleteTarget.title}
          currentCatalogName={deleteTarget.category}
          onClose={() => setDeleteTarget(null)}
          onRemoveFromCatalog={() => {
            onUpdate((prev) =>
              prev.map((p) =>
                p.id === deleteTarget.id
                  ? { ...p, category: '', catalogId: undefined, catalogIds: [] }
                  : p
              )
            );
            setDeleteTarget(null);
          }}
          onDeletePermanently={() => {
            onUpdate((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            if (editingId === deleteTarget.id) setEditingId(null);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 2: PHOTOGRAPHY (WITH CATALOGUES)
   ========================================================================= */
const PhotosManager: React.FC<{
  photos: PhotoItem[];
  catalogues: string[];
  onUpdate: (updater: (prev: PhotoItem[]) => PhotoItem[]) => void;
  onUpdateCatalogues: (cats: string[]) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => void;
}> = ({ photos, catalogues, onUpdate, onUpdateCatalogues, onImageUpload }) => {
  const { allGlobalCatalogs, allGlobalCatalogNames, renameCatalogEverywhere, deleteCatalogEverywhere } = usePortfolio();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCatIdx, setEditingCatIdx] = useState<number | null>(null);
  const [editingCatText, setEditingCatText] = useState('');
  const [showCatManager, setShowCatManager] = useState(true);

  // Universal Modals
  const [moveCopyTarget, setMoveCopyTarget] = useState<PhotoItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PhotoItem | null>(null);

  const activeCatalogues = React.useMemo(() => {
    return catalogues && catalogues.length > 0
      ? catalogues
      : ['WEDDINGS', 'PORTRAITS', 'EVENTS', 'LIFESTYLE', 'STREET', 'CREATIVE'];
  }, [catalogues]);

  const handleAddCatalogue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCatInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!activeCatalogues.some((c) => c.toUpperCase() === trimmed)) {
      onUpdateCatalogues([...activeCatalogues, trimmed]);
    }
    setNewCatInput('');
  };

  const handleDeleteCatalogue = (catToDelete: string) => {
    deleteCatalogEverywhere(catToDelete, 'photo');
    if (activeFilter.toUpperCase() === catToDelete.toUpperCase()) {
      setActiveFilter('ALL');
    }
  };

  const handleSaveRenameCatalogue = (idx: number) => {
    const oldName = activeCatalogues[idx];
    const newName = editingCatText.trim().toUpperCase();
    if (newName && newName.toLowerCase() !== oldName.toLowerCase()) {
      renameCatalogEverywhere(oldName, newName, 'photo');
    }
    setEditingCatIdx(null);
    setEditingCatText('');
  };

  const handleAddNew = () => {
    const newPhoto: PhotoItem = {
      id: `p-${Date.now()}`,
      title: 'New Editorial Still',
      category: activeCatalogues[0] || 'PORTRAITS',
      description: 'Atmospheric light study...',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
      location: 'Mumbai',
      year: new Date().getFullYear().toString(),
    };
    onUpdate((prev) => [newPhoto, ...prev]);
    setEditingId(newPhoto.id);
  };

  const handleDelete = (id: string) => {
    onUpdate((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSaveField = (id: string, field: keyof PhotoItem, value: any) => {
    onUpdate((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const filteredPhotos = activeFilter === 'ALL'
    ? photos
    : photos.filter((p) => p.category?.toUpperCase() === activeFilter.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950 border border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white uppercase font-display">
            Photography Gallery ({photos.length})
          </h2>
          <p className="text-xs text-zinc-400">
            Manage your photography catalogues and still images.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCatManager(!showCatManager)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showCatManager
                ? 'bg-amber-500 text-zinc-950 border-amber-500'
                : 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-amber-500/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage Catalogues ({activeCatalogues.length})</span>
          </button>

          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ADD PHOTO</span>
          </button>
        </div>
      </div>

      {/* PHOTO CATALOGUES TOOLBAR */}
      {showCatManager && (
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold text-white uppercase font-display tracking-wider">
              Photography Catalogues / Categories
            </h3>
            <span className="text-[11px] text-zinc-400 font-mono">
              Add or remove photo categories dynamically
            </span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {activeCatalogues.map((cat, idx) => {
              const isEditing = editingCatIdx === idx;
              const count = photos.filter((p) => p.category?.toUpperCase() === cat.toUpperCase()).length;
              return (
                <div
                  key={cat + idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-xs font-mono"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        autoFocus
                        value={editingCatText}
                        onChange={(e) => setEditingCatText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRenameCatalogue(idx);
                          if (e.key === 'Escape') setEditingCatIdx(null);
                        }}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-amber-500 text-white text-xs uppercase"
                      />
                      <button
                        onClick={() => handleSaveRenameCatalogue(idx)}
                        className="p-1 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold text-white uppercase">{cat}</span>
                      <span className="text-[10px] text-zinc-500 px-1 rounded bg-white/5">{count}</span>
                      <button
                        onClick={() => {
                          setEditingCatIdx(idx);
                          setEditingCatText(cat);
                        }}
                        className="p-1 text-zinc-400 hover:text-amber-300 cursor-pointer"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCatalogue(cat)}
                        className="p-1 text-zinc-400 hover:text-red-400 cursor-pointer"
                        title="Delete Catalogue"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleAddCatalogue} className="flex items-center gap-2 pt-2 border-t border-white/5">
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="Add photo catalogue (e.g. FASHION, MATERNITY, PRE-WEDDING, AUTOMOTIVE)..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none uppercase"
            />
            <button
              type="submit"
              disabled={!newCatInput.trim()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold text-xs uppercase cursor-pointer"
            >
              Add Catalogue
            </button>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          ALL ({photos.length})
        </button>
        {activeCatalogues.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilter.toUpperCase() === cat.toUpperCase()
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {cat.toUpperCase()} ({photos.filter((p) => p.category?.toUpperCase() === cat.toUpperCase()).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => {
          const isEditing = editingId === photo.id;
          return (
            <div
              key={photo.id}
              className={`rounded-2xl border overflow-hidden transition-all ${
                isEditing
                  ? 'bg-zinc-950 border-amber-500/60 shadow-xl'
                  : 'bg-zinc-950/80 border-white/10'
              }`}
            >
              <div className="relative aspect-[4/3] bg-zinc-900">
                <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded bg-black/80 text-amber-300 text-[10px] font-mono uppercase">
                    {photo.category}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white truncate">{photo.title}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setMoveCopyTarget(photo)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 cursor-pointer"
                      title="Move or Copy to another Catalog"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(isEditing ? null : photo.id)}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        isEditing ? 'bg-amber-500 text-zinc-950' : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(photo)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 cursor-pointer"
                      title="Delete or Remove from Catalog"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={photo.title}
                        onChange={(e) => handleSaveField(photo.id, 'title', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>

                    {/* Universal Global Catalog Assignment */}
                    <UniversalCatalogPicker
                      label="Assign to Photo / Global Catalogues"
                      selectedCategory={photo.category}
                      selectedCatalogId={photo.catalogId}
                      selectedCatalogIds={photo.catalogIds || []}
                      onSelectCategory={(catName, catId) => {
                        handleSaveField(photo.id, 'category', catName);
                        if (catId) handleSaveField(photo.id, 'catalogId', catId);
                      }}
                      onToggleAdditionalCatalog={(cid) => {
                        const current = photo.catalogIds || [];
                        const updated = current.includes(cid) ? current.filter((id) => id !== cid) : [...current, cid];
                        handleSaveField(photo.id, 'catalogIds', updated);
                      }}
                    />

                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                        Image URL / Upload
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={photo.imageUrl}
                          onChange={(e) => handleSaveField(photo.id, 'imageUrl', e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                        />
                        <label className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              onImageUpload(e, (url) => handleSaveField(photo.id, 'imageUrl', url))
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={photo.location || ''}
                        onChange={(e) => handleSaveField(photo.id, 'location', e.target.value)}
                        placeholder="e.g. Mumbai Studio"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Universal Move / Copy Modal for Photos */}
      {moveCopyTarget && (
        <UniversalMoveCopyModal
          isOpen={true}
          itemTitle={moveCopyTarget.title}
          currentCategory={moveCopyTarget.category}
          onClose={() => setMoveCopyTarget(null)}
          onMove={(targetCatName, targetCatId) => {
            onUpdate((prev) =>
              prev.map((p) =>
                p.id === moveCopyTarget.id
                  ? { ...p, category: targetCatName, catalogId: targetCatId }
                  : p
              )
            );
            setMoveCopyTarget(null);
          }}
          onCopy={(targetCatName, targetCatId) => {
            const newCopy: PhotoItem = {
              ...moveCopyTarget,
              id: `p-${Date.now()}`,
              title: `${moveCopyTarget.title} (Copy)`,
              category: targetCatName,
              catalogId: targetCatId,
            };
            onUpdate((prev) => [newCopy, ...prev]);
            setMoveCopyTarget(null);
          }}
        />
      )}

      {/* Universal Safe Delete / Remove Modal for Photos */}
      {deleteTarget && (
        <UniversalDeleteConfirmModal
          isOpen={true}
          itemType="photo"
          itemId={deleteTarget.id}
          itemTitle={deleteTarget.title}
          currentCatalogName={deleteTarget.category}
          onClose={() => setDeleteTarget(null)}
          onRemoveFromCatalog={() => {
            onUpdate((prev) =>
              prev.map((p) =>
                p.id === deleteTarget.id
                  ? { ...p, category: '', catalogId: undefined, catalogIds: [] }
                  : p
              )
            );
            setDeleteTarget(null);
          }}
          onDeletePermanently={() => {
            onUpdate((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            if (editingId === deleteTarget.id) setEditingId(null);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 3: SHOOT SERVICES
   ========================================================================= */
const ShootsManager: React.FC<{
  services: ShootService[];
  onUpdate: (updater: (prev: ShootService[]) => ShootService[]) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => void;
}> = ({ services, onUpdate, onImageUpload }) => {
  const { allGlobalCatalogs } = usePortfolio();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Universal Modals
  const [moveCopyTarget, setMoveCopyTarget] = useState<ShootService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShootService | null>(null);

  const handleAddNew = () => {
    const newService: ShootService = {
      id: `shoot-${Date.now()}`,
      title: 'New Shoot Production Service',
      category: 'Cinematography',
      description: 'Full production description...',
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1000&auto=format&fit=crop',
      deliverables: ['Full Highlight Video', 'Color Graded Stills'],
      turnaround: '1-2 Weeks',
    };
    onUpdate((prev) => [newService, ...prev]);
    setEditingId(newService.id);
  };

  const handleDelete = (id: string) => {
    onUpdate((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSaveField = (id: string, field: keyof ShootService, value: any) => {
    onUpdate((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950 border border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white uppercase font-display">
            Video &amp; Photo Shoot Services ({services.length})
          </h2>
          <p className="text-xs text-zinc-400">
            Configure on-location visual production offerings (Wedding, Pre-Wedding, Portrait, Brand shoots).
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ADD SHOOT SERVICE</span>
        </button>
      </div>

      <div className="space-y-4">
        {services.map((shoot) => {
          const isEditing = editingId === shoot.id;
          return (
            <div
              key={shoot.id}
              className={`rounded-2xl border p-5 transition-all ${
                isEditing ? 'bg-zinc-950 border-amber-500/60' : 'bg-zinc-950/60 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded-lg bg-zinc-900 overflow-hidden shrink-0">
                    <img src={shoot.imageUrl} alt={shoot.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{shoot.title}</h3>
                    <div className="text-xs text-zinc-400 font-mono">{shoot.category || 'Production'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMoveCopyTarget(shoot)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 cursor-pointer"
                    title="Move or Copy to another Catalog"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(isEditing ? null : shoot.id)}
                    className={`p-2 rounded-lg cursor-pointer ${
                      isEditing ? 'bg-amber-500 text-zinc-950' : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(shoot)}
                    className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:text-red-200 cursor-pointer"
                    title="Delete or Remove from Catalog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                  {/* Universal Global Catalog Assignment */}
                  <UniversalCatalogPicker
                    label="Assign to Shoot / Global Catalogues"
                    selectedCategory={shoot.category}
                    selectedCatalogId={shoot.catalogId}
                    selectedCatalogIds={shoot.catalogIds || []}
                    onSelectCategory={(catName, catId) => {
                      handleSaveField(shoot.id, 'category', catName);
                      if (catId) handleSaveField(shoot.id, 'catalogId', catId);
                    }}
                    onToggleAdditionalCatalog={(cid) => {
                      const current = shoot.catalogIds || [];
                      const updated = current.includes(cid) ? current.filter((id) => id !== cid) : [...current, cid];
                      handleSaveField(shoot.id, 'catalogIds', updated);
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Service Title
                      </label>
                      <input
                        type="text"
                        value={shoot.title}
                        onChange={(e) => handleSaveField(shoot.id, 'title', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Turnaround Time
                      </label>
                      <input
                        type="text"
                        value={shoot.turnaround || ''}
                        onChange={(e) => handleSaveField(shoot.id, 'turnaround', e.target.value)}
                        placeholder="e.g. 7-10 Days"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                      Image URL / Upload
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={shoot.imageUrl}
                        onChange={(e) => handleSaveField(shoot.id, 'imageUrl', e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                      <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            onImageUpload(e, (url) => handleSaveField(shoot.id, 'imageUrl', url))
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={shoot.description}
                      onChange={(e) => handleSaveField(shoot.id, 'description', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                      Deliverables (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={shoot.deliverables?.join(', ') || ''}
                      onChange={(e) =>
                        handleSaveField(
                          shoot.id,
                          'deliverables',
                          e.target.value.split(',').map((d) => d.trim()).filter(Boolean)
                        )
                      }
                      placeholder="Ceremony Film, Teaser Reel, 100+ Photos"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Universal Move / Copy Modal for Shoots */}
      {moveCopyTarget && (
        <UniversalMoveCopyModal
          isOpen={true}
          itemTitle={moveCopyTarget.title}
          currentCategory={moveCopyTarget.category}
          onClose={() => setMoveCopyTarget(null)}
          onMove={(targetCatName, targetCatId) => {
            onUpdate((prev) =>
              prev.map((s) =>
                s.id === moveCopyTarget.id
                  ? { ...s, category: targetCatName, catalogId: targetCatId }
                  : s
              )
            );
            setMoveCopyTarget(null);
          }}
          onCopy={(targetCatName, targetCatId) => {
            const newCopy: ShootService = {
              ...moveCopyTarget,
              id: `shoot-${Date.now()}`,
              title: `${moveCopyTarget.title} (Copy)`,
              category: targetCatName,
              catalogId: targetCatId,
            };
            onUpdate((prev) => [newCopy, ...prev]);
            setMoveCopyTarget(null);
          }}
        />
      )}

      {/* Universal Safe Delete / Remove Modal for Shoots */}
      {deleteTarget && (
        <UniversalDeleteConfirmModal
          isOpen={true}
          itemType="shoot"
          itemId={deleteTarget.id}
          itemTitle={deleteTarget.title}
          currentCatalogName={deleteTarget.category}
          onClose={() => setDeleteTarget(null)}
          onRemoveFromCatalog={() => {
            onUpdate((prev) =>
              prev.map((s) =>
                s.id === deleteTarget.id
                  ? { ...s, category: '', catalogId: undefined, catalogIds: [] }
                  : s
              )
            );
            setDeleteTarget(null);
          }}
          onDeletePermanently={() => {
            onUpdate((prev) => prev.filter((s) => s.id !== deleteTarget.id));
            if (editingId === deleteTarget.id) setEditingId(null);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 4: VIDEO DIRECTION
   ========================================================================= */
const DirectionManager: React.FC<{
  projects: DirectionProject[];
  onUpdate: (updater: (prev: DirectionProject[]) => DirectionProject[]) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => void;
}> = ({ projects, onUpdate, onImageUpload }) => {
  const { allGlobalCatalogs } = usePortfolio();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Universal Modals
  const [moveCopyTarget, setMoveCopyTarget] = useState<DirectionProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DirectionProject | null>(null);

  const handleAddNew = () => {
    const newDir: DirectionProject = {
      id: `dir-${Date.now()}`,
      title: 'New Directorial Concept Film',
      category: 'Short Films',
      year: '2025',
      description: 'A moody visual treatment...',
      thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      credits: {
        director: 'Shahid Shaikh',
        dop: 'Director of Photography',
        editor: 'Shahid Shaikh',
        colorist: 'Shahid Shaikh',
      },
      concept: 'Narrative concept exploration...',
      duration: '5:00',
    };
    onUpdate((prev) => [newDir, ...prev]);
    setEditingId(newDir.id);
  };

  const handleDelete = (id: string) => {
    onUpdate((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSaveField = (id: string, field: keyof DirectionProject, value: any) => {
    onUpdate((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950 border border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white uppercase font-display">
            Video Direction Projects ({projects.length})
          </h2>
          <p className="text-xs text-zinc-400">
            Showcase narrative films, music videos, and creative commercial treatments where you directed the story.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ADD DIRECTION PROJECT</span>
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          const isEditing = editingId === project.id;
          return (
            <div
              key={project.id}
              className={`rounded-2xl border p-5 transition-all ${
                isEditing ? 'bg-zinc-950 border-amber-500/60' : 'bg-zinc-950/60 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded-lg bg-zinc-900 overflow-hidden shrink-0">
                    <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{project.title}</h3>
                    <div className="text-xs text-amber-400 font-mono">
                      {project.category} • {project.year}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMoveCopyTarget(project)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 cursor-pointer"
                    title="Move or Copy to another Catalog"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(isEditing ? null : project.id)}
                    className={`p-2 rounded-lg cursor-pointer ${
                      isEditing ? 'bg-amber-500 text-zinc-950' : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:text-red-200 cursor-pointer"
                    title="Delete or Remove from Catalog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                  {/* Universal Global Catalog Assignment */}
                  <UniversalCatalogPicker
                    label="Assign to Direction / Global Catalogues"
                    selectedCategory={project.category}
                    selectedCatalogId={project.catalogId}
                    selectedCatalogIds={project.catalogIds || []}
                    onSelectCategory={(catName, catId) => {
                      handleSaveField(project.id, 'category', catName);
                      if (catId) handleSaveField(project.id, 'catalogId', catId);
                    }}
                    onToggleAdditionalCatalog={(cid) => {
                      const current = project.catalogIds || [];
                      const updated = current.includes(cid) ? current.filter((id) => id !== cid) : [...current, cid];
                      handleSaveField(project.id, 'catalogIds', updated);
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => handleSaveField(project.id, 'title', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={project.category}
                        onChange={(e) => handleSaveField(project.id, 'category', e.target.value)}
                        placeholder="Short Films, Music Videos, Wedding Films"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Video URL
                      </label>
                      <input
                        type="text"
                        value={project.videoUrl}
                        onChange={(e) => handleSaveField(project.id, 'videoUrl', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                        Thumbnail URL / Upload
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={project.thumbnail}
                          onChange={(e) => handleSaveField(project.id, 'thumbnail', e.target.value)}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                        />
                        <label className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              onImageUpload(e, (url) => handleSaveField(project.id, 'thumbnail', url))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                      Directorial Concept &amp; Approach
                    </label>
                    <textarea
                      rows={2}
                      value={project.concept || ''}
                      onChange={(e) => handleSaveField(project.id, 'concept', e.target.value)}
                      placeholder="Visual metaphors, lighting mood, color intention..."
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                        Director
                      </label>
                      <input
                        type="text"
                        value={project.credits?.director || ''}
                        onChange={(e) =>
                          handleSaveField(project.id, 'credits', { ...project.credits, director: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                        Cinematographer (DOP)
                      </label>
                      <input
                        type="text"
                        value={project.credits?.dop || ''}
                        onChange={(e) =>
                          handleSaveField(project.id, 'credits', { ...project.credits, dop: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                        Colorist / Post
                      </label>
                      <input
                        type="text"
                        value={project.credits?.colorist || ''}
                        onChange={(e) =>
                          handleSaveField(project.id, 'credits', { ...project.credits, colorist: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Universal Move / Copy Modal for Direction Projects */}
      {moveCopyTarget && (
        <UniversalMoveCopyModal
          isOpen={true}
          itemTitle={moveCopyTarget.title}
          currentCategory={moveCopyTarget.category}
          onClose={() => setMoveCopyTarget(null)}
          onMove={(targetCatName, targetCatId) => {
            onUpdate((prev) =>
              prev.map((p) =>
                p.id === moveCopyTarget.id
                  ? { ...p, category: targetCatName, catalogId: targetCatId }
                  : p
              )
            );
            setMoveCopyTarget(null);
          }}
          onCopy={(targetCatName, targetCatId) => {
            const newCopy: DirectionProject = {
              ...moveCopyTarget,
              id: `dir-${Date.now()}`,
              title: `${moveCopyTarget.title} (Copy)`,
              category: targetCatName,
              catalogId: targetCatId,
            };
            onUpdate((prev) => [newCopy, ...prev]);
            setMoveCopyTarget(null);
          }}
        />
      )}

      {/* Universal Safe Delete / Remove Modal for Direction Projects */}
      {deleteTarget && (
        <UniversalDeleteConfirmModal
          isOpen={true}
          itemType="direction"
          itemId={deleteTarget.id}
          itemTitle={deleteTarget.title}
          currentCatalogName={deleteTarget.category}
          onClose={() => setDeleteTarget(null)}
          onRemoveFromCatalog={() => {
            onUpdate((prev) =>
              prev.map((p) =>
                p.id === deleteTarget.id
                  ? { ...p, category: '', catalogId: undefined, catalogIds: [] }
                  : p
              )
            );
            setDeleteTarget(null);
          }}
          onDeletePermanently={() => {
            onUpdate((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            if (editingId === deleteTarget.id) setEditingId(null);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 5: SONGS
   ========================================================================= */
const SongsManager: React.FC<{
  songs: { youtubeSongs: YouTubeSong[]; spotifySongs: SpotifySong[]; audioTracks: AudioTrack[] };
  onUpdate: (updater: (prev: any) => any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => void;
}> = ({ songs, onUpdate, onImageUpload }) => {
  const { permanentlyDeleteItem } = usePortfolio();
  const [subTab, setSubTab] = useState<'audio' | 'youtube' | 'spotify'>('audio');

  const handleDeleteItem = async (type: 'audio' | 'youtube' | 'spotify', id: string, title: string) => {
    if (window.confirm(`Permanently delete "${title}" from music library?`)) {
      if (type === 'audio') {
        onUpdate((prev: any) => ({
          ...prev,
          audioTracks: prev.audioTracks.filter((t: any) => t.id !== id),
        }));
      } else if (type === 'youtube') {
        onUpdate((prev: any) => ({
          ...prev,
          youtubeSongs: prev.youtubeSongs.filter((y: any) => y.id !== id),
        }));
      } else if (type === 'spotify') {
        onUpdate((prev: any) => ({
          ...prev,
          spotifySongs: prev.spotifySongs.filter((s: any) => s.id !== id),
        }));
      }
      await permanentlyDeleteItem('song', id);
    }
  };

  const handleAddAudio = () => {
    const newTrack: AudioTrack = {
      id: `aud-${Date.now()}`,
      title: 'New Master Audio Track',
      artist: 'Shahid Shaikh — Stone GD',
      coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: '3:30',
      genre: 'Cinematic Beat',
    };
    onUpdate((prev: any) => ({
      ...prev,
      audioTracks: [newTrack, ...prev.audioTracks],
    }));
  };

  const handleAddYouTube = () => {
    const newYt: YouTubeSong = {
      id: `yt-${Date.now()}`,
      title: 'New Official Video Release',
      artist: 'Stone GD',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
      youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      views: '50K Views',
      year: '2025',
    };
    onUpdate((prev: any) => ({
      ...prev,
      youtubeSongs: [newYt, ...prev.youtubeSongs],
    }));
  };

  const handleAddSpotify = () => {
    const newSp: SpotifySong = {
      id: `sp-${Date.now()}`,
      title: 'New Spotify Release',
      artist: 'Stone GD',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
      spotifyUrl: 'https://open.spotify.com/artist/stonegd',
      album: 'Single',
    };
    onUpdate((prev: any) => ({
      ...prev,
      spotifySongs: [newSp, ...prev.spotifySongs],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950 border border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white uppercase font-display">
            Music &amp; Audio Library
          </h2>
          <p className="text-xs text-zinc-400">
            Manage your original tracks, YouTube releases, and Spotify discography.
          </p>
        </div>

        {/* Sub tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('audio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              subTab === 'audio' ? 'bg-amber-500 text-zinc-950' : 'bg-white/5 text-zinc-300'
            }`}
          >
            Audio Tracks ({songs.audioTracks.length})
          </button>
          <button
            onClick={() => setSubTab('youtube')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              subTab === 'youtube' ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-300'
            }`}
          >
            YouTube ({songs.youtubeSongs.length})
          </button>
          <button
            onClick={() => setSubTab('spotify')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              subTab === 'spotify' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-zinc-300'
            }`}
          >
            Spotify ({songs.spotifySongs.length})
          </button>
        </div>
      </div>

      {/* AUDIO TRACKS */}
      {subTab === 'audio' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleAddAudio}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>ADD AUDIO TRACK</span>
            </button>
          </div>

          {songs.audioTracks.map((track) => (
            <div key={track.id} className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                    Song Title
                  </label>
                  <input
                    type="text"
                    value={track.title}
                    onChange={(e) =>
                      onUpdate((prev: any) => ({
                        ...prev,
                        audioTracks: prev.audioTracks.map((t: any) =>
                          t.id === track.id ? { ...t, title: e.target.value } : t
                        ),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={track.artist}
                    onChange={(e) =>
                      onUpdate((prev: any) => ({
                        ...prev,
                        audioTracks: prev.audioTracks.map((t: any) =>
                          t.id === track.id ? { ...t, artist: e.target.value } : t
                        ),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                    Audio File / MP3 Stream URL
                  </label>
                  <input
                    type="text"
                    value={track.audioUrl}
                    onChange={(e) =>
                      onUpdate((prev: any) => ({
                        ...prev,
                        audioTracks: prev.audioTracks.map((t: any) =>
                          t.id === track.id ? { ...t, audioUrl: e.target.value } : t
                        ),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteItem('audio', track.id, track.title)}
                  className="text-xs text-red-400 hover:text-red-200 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Track</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* YOUTUBE SONGS */}
      {subTab === 'youtube' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleAddYouTube}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>ADD YOUTUBE SONG</span>
            </button>
          </div>

          {songs.youtubeSongs.map((yt) => (
            <div key={yt.id} className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={yt.title}
                    onChange={(e) =>
                      onUpdate((prev: any) => ({
                        ...prev,
                        youtubeSongs: prev.youtubeSongs.map((y: any) =>
                          y.id === yt.id ? { ...y, title: e.target.value } : y
                        ),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="text"
                    value={yt.youtubeUrl}
                    onChange={(e) =>
                      onUpdate((prev: any) => ({
                        ...prev,
                        youtubeSongs: prev.youtubeSongs.map((y: any) =>
                          y.id === yt.id ? { ...y, youtubeUrl: e.target.value } : y
                        ),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                    Thumbnail
                  </label>
                  <input
                    type="text"
                    value={yt.thumbnail}
                    onChange={(e) =>
                      onUpdate((prev: any) => ({
                        ...prev,
                        youtubeSongs: prev.youtubeSongs.map((y: any) =>
                          y.id === yt.id ? { ...y, thumbnail: e.target.value } : y
                        ),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteItem('youtube', yt.id, yt.title)}
                  className="text-xs text-red-400 hover:text-red-200 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Release</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SPOTIFY SONGS */}
      {subTab === 'spotify' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleAddSpotify}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>ADD SPOTIFY SONG</span>
            </button>
          </div>

          {songs.spotifySongs.map((sp) => (
            <div key={sp.id} className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={sp.title}
                    onChange={(e) =>
                      onUpdate((prev: any) => ({
                        ...prev,
                        spotifySongs: prev.spotifySongs.map((s: any) =>
                          s.id === sp.id ? { ...s, title: e.target.value } : s
                        ),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                    Spotify Track / Artist URL
                  </label>
                  <input
                    type="text"
                    value={sp.spotifyUrl}
                    onChange={(e) =>
                      onUpdate((prev: any) => ({
                        ...prev,
                        spotifySongs: prev.spotifySongs.map((s: any) =>
                          s.id === sp.id ? { ...s, spotifyUrl: e.target.value } : s
                        ),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                    Cover Image
                  </label>
                  <input
                    type="text"
                    value={sp.coverImage}
                    onChange={(e) =>
                      onUpdate((prev: any) => ({
                        ...prev,
                        spotifySongs: prev.spotifySongs.map((s: any) =>
                          s.id === sp.id ? { ...s, coverImage: e.target.value } : s
                        ),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteItem('spotify', sp.id, sp.title)}
                  className="text-xs text-red-400 hover:text-red-200 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 6: EXPERIENCE
   ========================================================================= */
const ExperienceManager: React.FC<{
  experiences: ExperienceItem[];
  onUpdate: (updater: (prev: ExperienceItem[]) => ExperienceItem[]) => void;
}> = ({ experiences, onUpdate }) => {
  const { permanentlyDeleteItem } = usePortfolio();

  const handleAddNew = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      year: '2026',
      company: 'NEW STUDIO / AGENCY',
      position: 'Senior Video Editor & Colorist',
      description: 'Lead commercial post-production...',
      highlights: ['Cinematic color grading', 'Editorial pacing'],
    };
    onUpdate((prev) => [newExp, ...prev]);
  };

  const handleDelete = async (id: string, name?: string) => {
    if (window.confirm(`Permanently delete "${name || 'this studio'}" from timeline?`)) {
      onUpdate((prev) => prev.filter((e) => e.id !== id));
      await permanentlyDeleteItem('experience', id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950 border border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white uppercase font-display">
            Career Experience Timeline ({experiences.length})
          </h2>
          <p className="text-xs text-zinc-400">
            Manage your studios and brand partnerships (e.g. Urban Company, Crafty Shots, Tanvi Taufu, Eternity Wedding Films).
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD EXPERIENCE</span>
        </button>
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Year / Period *
                </label>
                <input
                  type="text"
                  value={exp.year}
                  onChange={(e) =>
                    onUpdate((prev) =>
                      prev.map((item) => (item.id === exp.id ? { ...item, year: e.target.value } : item))
                    )
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Company / Studio Name *
                </label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) =>
                    onUpdate((prev) =>
                      prev.map((item) => (item.id === exp.id ? { ...item, company: e.target.value } : item))
                    )
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Position / Role *
                </label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) =>
                    onUpdate((prev) =>
                      prev.map((item) => (item.id === exp.id ? { ...item, position: e.target.value } : item))
                    )
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                Description &amp; Achievements
              </label>
              <textarea
                rows={2}
                value={exp.description}
                onChange={(e) =>
                  onUpdate((prev) =>
                    prev.map((item) => (item.id === exp.id ? { ...item, description: e.target.value } : item))
                  )
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                onClick={() => handleDelete(exp.id)}
                className="text-xs text-red-400 hover:text-red-200 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Studio</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 7: SKILLS
   ========================================================================= */
const SkillsManager: React.FC<{
  skills: string[];
  onUpdate: (newSkills: string[]) => void;
}> = ({ skills, onUpdate }) => {
  const [newSkillInput, setNewSkillInput] = useState('');

  const handleAdd = () => {
    if (newSkillInput.trim()) {
      onUpdate([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemove = (index: number) => {
    onUpdate(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
        <h2 className="text-lg font-bold text-white uppercase font-display">
          Creative Skills &amp; Software ({skills.length})
        </h2>
        <p className="text-xs text-zinc-400">
          Add or remove professional capabilities showcased in the SKILLS section.
        </p>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. 3D Camera Tracking, Sound Foley, Anamorphic Grading..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
          />
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wider uppercase cursor-pointer"
          >
            + ADD SKILL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {skills.map((skill, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/80 border border-white/10 text-xs font-semibold text-white group"
          >
            <span>{skill}</span>
            <button
              onClick={() => handleRemove(idx)}
              className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
              title="Remove"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 8: HERO & HOME
   ========================================================================= */
const HeroManager: React.FC<{
  hero: any;
  onUpdate: (newHero: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => void;
}> = ({ hero, onUpdate, onImageUpload }) => {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white uppercase font-display">
          Hero &amp; Home Screen Customization
        </h2>
        <p className="text-xs text-zinc-400">
          Customize the main entrance, cinematic background visual, and top headline.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={hero.name}
            onChange={(e) => onUpdate({ ...hero, name: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
            Tagline / Main Title
          </label>
          <input
            type="text"
            value={hero.tagline}
            onChange={(e) => onUpdate({ ...hero, tagline: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
          Sub-Roles (Comma separated)
        </label>
        <input
          type="text"
          value={hero.subRoles?.join(', ') || ''}
          onChange={(e) =>
            onUpdate({
              ...hero,
              subRoles: e.target.value.split(',').map((r: string) => r.trim()).filter(Boolean),
            })
          }
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
        />
      </div>

      <div>
        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
          Introduction Quote
        </label>
        <textarea
          rows={2}
          value={hero.bioQuote}
          onChange={(e) => onUpdate({ ...hero, bioQuote: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
        />
      </div>

      <div>
        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
          Cinematic Background Image (URL or Upload)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={hero.backgroundImage}
            onChange={(e) => onUpdate({ ...hero, backgroundImage: e.target.value })}
            className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
          />
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer shrink-0">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onImageUpload(e, (url) => onUpdate({ ...hero, backgroundImage: url }))}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
            Primary CTA Button Text
          </label>
          <input
            type="text"
            value={hero.ctaPrimaryText}
            onChange={(e) => onUpdate({ ...hero, ctaPrimaryText: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
            Secondary CTA Button Text
          </label>
          <input
            type="text"
            value={hero.ctaSecondaryText}
            onChange={(e) => onUpdate({ ...hero, ctaSecondaryText: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 9: ABOUT & STATS
   ========================================================================= */
const AboutManager: React.FC<{
  about: any;
  onUpdate: (newAbout: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => void;
}> = ({ about, onUpdate, onImageUpload }) => {
  const handleStatChange = (id: string, field: string, val: string) => {
    onUpdate({
      ...about,
      stats: about.stats.map((s: StatItem) => (s.id === id ? { ...s, [field]: val } : s)),
    });
  };

  const handleAddStat = () => {
    const newStat: StatItem = {
      id: `st-${Date.now()}`,
      number: '10+',
      label: 'New Metric',
      subtext: 'Description',
    };
    onUpdate({ ...about, stats: [...about.stats, newStat] });
  };

  const handleDeleteStat = (id: string) => {
    onUpdate({ ...about, stats: about.stats.filter((s: StatItem) => s.id !== id) });
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white uppercase font-display">
          About Me &amp; Creative Statistics
        </h2>
        <p className="text-xs text-zinc-400">
          Update your biography text, portrait photo, and interactive metric counters.
        </p>
      </div>

      <div>
        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
          Profile Image (URL or Upload)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={about.profileImage}
            onChange={(e) => onUpdate({ ...about, profileImage: e.target.value })}
            className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
          />
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer shrink-0">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onImageUpload(e, (url) => onUpdate({ ...about, profileImage: url }))}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
          About Paragraphs (Line breaks create paragraphs)
        </label>
        <textarea
          rows={4}
          value={about.paragraphs?.join('\n\n') || ''}
          onChange={(e) =>
            onUpdate({
              ...about,
              paragraphs: e.target.value.split('\n\n').filter(Boolean),
            })
          }
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs leading-relaxed"
        />
      </div>

      {/* Stats Editor */}
      <div className="pt-4 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-400 uppercase font-mono">
            Editable Statistics Counters
          </label>
          <button
            onClick={handleAddStat}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase cursor-pointer"
          >
            + Add Metric
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {about.stats?.map((stat: StatItem) => (
            <div key={stat.id} className="p-3.5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={stat.number}
                  onChange={(e) => handleStatChange(stat.id, 'number', e.target.value)}
                  placeholder="e.g. 7+"
                  className="w-24 px-2 py-1 rounded bg-zinc-950 border border-white/10 text-amber-400 font-bold text-sm font-display"
                />
                <button
                  onClick={() => handleDeleteStat(stat.id)}
                  className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={stat.label}
                onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)}
                placeholder="e.g. Wedding Films"
                className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs font-semibold"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 10: CONTACT & SOCIALS
   ========================================================================= */
const ContactManager: React.FC<{
  contact: any;
  onUpdate: (newContact: any) => void;
}> = ({ contact, onUpdate }) => {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white uppercase font-display">
          Contact Details &amp; Social Links
        </h2>
        <p className="text-xs text-zinc-400">
          Update phone, email, location, and Instagram connection.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => onUpdate({ ...contact, email: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
            Phone Number (for dial link)
          </label>
          <input
            type="text"
            value={contact.phone}
            onChange={(e) => onUpdate({ ...contact, phone: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
            Location / Studio Base
          </label>
          <input
            type="text"
            value={contact.location}
            onChange={(e) => onUpdate({ ...contact, location: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
            Instagram URL
          </label>
          <input
            type="text"
            value={contact.instagramUrl}
            onChange={(e) => onUpdate({ ...contact, instagramUrl: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
          Contact Section Headline
        </label>
        <input
          type="text"
          value={contact.headline}
          onChange={(e) => onUpdate({ ...contact, headline: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold uppercase"
        />
      </div>
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 11: GENERAL & SEO
   ========================================================================= */
const GeneralManager: React.FC<{
  general: any;
  onUpdate: (newGen: any) => void;
}> = ({ general, onUpdate }) => {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white uppercase font-display">
          Website Settings &amp; SEO
        </h2>
        <p className="text-xs text-zinc-400">
          Global brand identity, browser tab title, and search engine optimization description.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
            Brand Logo / Name
          </label>
          <input
            type="text"
            value={general.brandName}
            onChange={(e) => onUpdate({ ...general, brandName: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
            Browser Page Title
          </label>
          <input
            type="text"
            value={general.siteTitle}
            onChange={(e) => onUpdate({ ...general, siteTitle: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
          SEO Meta Description
        </label>
        <textarea
          rows={3}
          value={general.metaDescription}
          onChange={(e) => onUpdate({ ...general, metaDescription: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
        />
      </div>
    </div>
  );
};

/* =========================================================================
   SUB-MANAGER 12: BACKUP & RESET
   ========================================================================= */
const BackupManager: React.FC<{
  data: any;
  onExport: () => void;
  onImport: (json: string) => Promise<boolean>;
  onReset: () => Promise<void>;
}> = ({ onExport, onImport, onReset }) => {
  const [importJsonText, setImportJsonText] = useState('');

  const handleImport = async () => {
    if (!importJsonText.trim()) return;
    const ok = await onImport(importJsonText);
    if (ok) {
      setImportJsonText('');
      alert('Portfolio data successfully restored!');
    } else {
      alert('Failed to import JSON. Please verify the structure.');
    }
  };

  const handleResetConfirm = async () => {
    if (
      confirm(
        'Are you sure you want to reset all portfolio data to defaults? This will erase custom additions unless backed up.'
      )
    ) {
      await onReset();
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 space-y-8">
      <div>
        <h2 className="text-lg font-bold text-white uppercase font-display">
          Backup, Export &amp; Reset System
        </h2>
        <p className="text-xs text-zinc-400">
          Save your complete portfolio configuration as a JSON file or restore from a backup.
        </p>
      </div>

      {/* Export Button */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Export Full Portfolio Backup</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Download a .json file containing all your video projects, photography, songs, and settings.
          </p>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD BACKUP JSON</span>
        </button>
      </div>

      {/* Import Textarea */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
        <h3 className="text-sm font-bold text-white">Import Portfolio From JSON</h3>
        <p className="text-xs text-zinc-400">
          Paste the contents of your backup .json file below to restore your content:
        </p>
        <textarea
          rows={4}
          value={importJsonText}
          onChange={(e) => setImportJsonText(e.target.value)}
          placeholder='{"general": {...}, "hero": {...}, "videoProjects": [...]}'
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono text-xs"
        />
        <button
          onClick={handleImport}
          disabled={!importJsonText.trim()}
          className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase disabled:opacity-40 cursor-pointer"
        >
          APPLY IMPORTED JSON
        </button>
      </div>

      {/* Reset to Factory Defaults */}
      <div className="pt-4 border-t border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-red-400">Reset to Defaults</h3>
          <p className="text-xs text-zinc-500">
            Reverts all portfolio projects and information back to Shahid Shaikh's default baseline.
          </p>
        </div>
        <button
          onClick={handleResetConfirm}
          className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-bold text-xs uppercase cursor-pointer"
        >
          RESET TO DEFAULTS
        </button>
      </div>
    </div>
  );
};
