import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  Download,
  Upload,
  RotateCcw,
  Cloud,
  HardDrive,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  FileCode,
  ShieldCheck,
  RefreshCw,
  X,
  FileJson,
} from 'lucide-react';

export const BackupManager: React.FC = () => {
  const {
    draftData,
    data,
    serverBackups,
    fetchServerBackups,
    restoreServerBackup,
    createServerSnapshot,
    createLocalSnapshot,
    restoreLocalSnapshot,
    deleteLocalSnapshot,
    exportDataJSON,
    importDataJSON,
  } = usePortfolio();

  const activeData = draftData || data;
  const localBackups = activeData.backups || [];

  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [isCreatingServerSnapshot, setIsCreatingServerSnapshot] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'server' | 'local' | 'json'>('server');

  const showBanner = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateCloudSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotLabel.trim()) return;

    setIsCreatingServerSnapshot(true);
    const ok = await createServerSnapshot(snapshotLabel.trim());
    setIsCreatingServerSnapshot(false);

    if (ok) {
      setSnapshotLabel('');
      showBanner('✓ Cloud Snapshot created and stored securely!');
    } else {
      // Create local fallback
      createLocalSnapshot(snapshotLabel.trim());
      setSnapshotLabel('');
      showBanner('✓ Snapshot saved to local storage archive.');
    }
  };

  const handleRestoreServer = async (filename: string, label: string) => {
    if (
      window.confirm(
        `Rollback portfolio data to cloud snapshot "${label}" (${filename})? An automated backup of current state will be created before restoring.`
      )
    ) {
      const ok = await restoreServerBackup(filename);
      if (ok) {
        showBanner(`✓ Successfully rolled back to ${label}`);
      } else {
        showBanner('Failed to restore cloud snapshot.');
      }
    }
  };

  const handleRestoreLocal = (id: string, label: string) => {
    if (window.confirm(`Restore draft to local version "${label}"?`)) {
      restoreLocalSnapshot(id);
      showBanner(`✓ Restored draft from ${label}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const success = await importDataJSON(content);
          if (success) {
            showBanner('✓ Portfolio JSON data imported successfully into draft! Review and click Save to publish.');
          } else {
            showBanner('Invalid portfolio JSON file.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6" id="backup-manager-container">
      {notification && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            Data Protection, Version History & Snapshots
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Every publish creates an automated server snapshot. You can also create manual snapshots or export full JSON backups anytime.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportDataJSON}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Download Complete Backup (.json)
          </button>
        </div>
      </div>

      {/* Snapshot Creation Form */}
      <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3">
        <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-500" />
          Create New Named Snapshot
        </h3>
        <form onSubmit={handleCreateCloudSnapshot} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            required
            placeholder="e.g. Before Urban Company Reel update, Wedding season batch..."
            value={snapshotLabel}
            onChange={(e) => setSnapshotLabel(e.target.value)}
            className="flex-1 min-w-[280px] bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={isCreatingServerSnapshot}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer shrink-0"
          >
            {isCreatingServerSnapshot ? 'Creating...' : 'Capture Snapshot'}
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('server')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'server'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            Server Cloud Snapshots ({serverBackups.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'local'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            Local Browser Versions ({localBackups.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'json'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <FileJson className="w-4 h-4" />
            JSON File Import / Export
          </button>
        </div>

        {activeTab === 'server' && (
          <button
            type="button"
            onClick={() => fetchServerBackups()}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh List
          </button>
        )}
      </div>

      {/* Server Snapshots Panel */}
      {activeTab === 'server' && (
        <div className="space-y-3">
          {serverBackups.length === 0 ? (
            <div className="p-10 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              <Cloud className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No cloud snapshots recorded yet</p>
              <p className="text-xs text-zinc-500 mt-1">
                A server snapshot will be generated automatically when you save changes or capture a named snapshot.
              </p>
            </div>
          ) : (
            serverBackups.map((b) => (
              <div
                key={b.filename}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-100">{b.label}</span>
                      <span className="text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                        {Math.round(b.sizeBytes / 1024)} KB
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                      <span>{new Date(b.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{b.videoProjectsCount} Videos</span>
                      <span>•</span>
                      <span>{b.photosCount} Photos</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRestoreServer(b.filename, b.label)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Rollback to this Version
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Local Versions Panel */}
      {activeTab === 'local' && (
        <div className="space-y-3">
          {localBackups.length === 0 ? (
            <div className="p-10 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              <HardDrive className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No local snapshots saved</p>
            </div>
          ) : (
            localBackups.map((b) => (
              <div
                key={b.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-100">{b.label}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(b.timestamp).toLocaleString()} • {b.itemCount || 0} items
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRestoreLocal(b.id, b.label)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLocalSnapshot(b.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* JSON File Import / Export */}
      {activeTab === 'json' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Export card */}
          <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-100">Export Complete Portfolio</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Downloads a clean, structured JSON file containing all video projects, photography, custom catalogs, songs, career highlights, and site configuration.
              </p>
            </div>
            <button
              type="button"
              onClick={exportDataJSON}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download shahid_portfolio_backup.json
            </button>
          </div>

          {/* Import card */}
          <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-100">Import Portfolio Backup</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Restore or migrate from a previously exported JSON backup file. All structures will be validated and loaded safely into your working draft.
              </p>
            </div>
            <div>
              <label className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl border border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-sky-400" />
                Select Backup JSON File
                <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
