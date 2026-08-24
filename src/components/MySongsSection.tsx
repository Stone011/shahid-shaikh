import React, { useState, useRef, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Youtube,
  Radio,
  Disc3,
  SkipForward,
  SkipBack,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { YouTubeSong, SpotifySong, AudioTrack } from '../types';

export const MySongsSection: React.FC = () => {
  const { data, openVideoModal } = usePortfolio();
  const { songs } = data;
  const { youtubeSongs, spotifySongs, audioTracks } = songs;

  const [activeTab, setActiveTab] = useState<'AUDIO' | 'YOUTUBE' | 'SPOTIFY'>('AUDIO');

  // Custom Audio Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack: AudioTrack | undefined = audioTracks[currentTrackIndex] || audioTracks[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // When track changes, update src and play if was playing
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('Audio play prevented:', e);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleNextTrack = () => {
    if (audioTracks.length > 0) {
      setCurrentTrackIndex((prev) => (prev + 1) % audioTracks.length);
    }
  };

  const handlePrevTrack = () => {
    if (audioTracks.length > 0) {
      setCurrentTrackIndex((prev) => (prev - 1 + audioTracks.length) % audioTracks.length);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleWatchYouTube = (song: YouTubeSong) => {
    if (song.youtubeUrl) {
      openVideoModal(song.youtubeUrl, song.title, `Music Video • ${song.artist}`);
    }
  };

  return (
    <section id="my-songs" className="relative py-24 sm:py-32 bg-[#060608] text-white border-t border-white/[0.05]">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNextTrack}
      />

      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Artist Branding */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs tracking-[0.25em] font-semibold uppercase mb-2">
              <Disc3 className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>ARTIST &amp; AUDIO PRODUCTIONS</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">
              MY SONGS
            </h2>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span className="text-zinc-400 text-xs font-mono tracking-widest uppercase">
              STONE GD • SOUND DESIGN &amp; TRACKS
            </span>
          </div>
        </div>

        {/* 3 Sub-Section Tabs: AUDIO, YOUTUBE, SPOTIFY */}
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-10 pb-2 border-b border-white/[0.06]">
          <button
            onClick={() => setActiveTab('AUDIO')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              activeTab === 'AUDIO'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border border-white/[0.06]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>ORIGINAL AUDIO PLAYER</span>
          </button>

          <button
            onClick={() => setActiveTab('YOUTUBE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              activeTab === 'YOUTUBE'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border border-white/[0.06]'
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>YOUTUBE RELEASES</span>
          </button>

          <button
            onClick={() => setActiveTab('SPOTIFY')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              activeTab === 'SPOTIFY'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border border-white/[0.06]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>SPOTIFY TRACKS</span>
          </button>
        </div>

        {/* 1. AUDIO TAB: Custom Interactive Player & Tracklist */}
        {activeTab === 'AUDIO' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Master Player Deck */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-zinc-950/90 border border-amber-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Vinyl / Cover Art with spinning animation when playing */}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/10 group">
                  <img
                    src={currentTrack?.coverImage || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop'}
                    alt={currentTrack?.title}
                    className={`w-full h-full object-cover ${isPlaying ? 'scale-105 transition-transform duration-700' : ''}`}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500/80 text-zinc-950 flex items-center justify-center">
                      <Disc3 className={`w-6 h-6 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                    </div>
                  </div>
                </div>

                {/* Track Metadata */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="inline-block px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300 uppercase">
                    {currentTrack?.genre || 'Cinematic Score'}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white uppercase">
                    {currentTrack?.title || 'Select a Track'}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 font-mono">
                    {currentTrack?.artist || 'Shahid Shaikh'}
                  </p>
                  {currentTrack?.bpm && (
                    <div className="text-[11px] text-zinc-400 font-mono pt-1">
                      Tempo: <span className="text-zinc-300">{currentTrack.bpm}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Waveform / Scrubber Progress Bar */}
              <div className="mt-8 space-y-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration ? formatTime(duration) : currentTrack?.duration || '3:45'}</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/[0.06]">
                {/* Volume Controller */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Toggle mute"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-zinc-300" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-16 sm:w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Main Playback Center Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrevTrack}
                    className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Previous track"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-xl shadow-amber-500/30 transition-all hover:scale-105 cursor-pointer"
                    aria-label={isPlaying ? 'Pause track' : 'Play track'}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-1" />
                    )}
                  </button>

                  <button
                    onClick={handleNextTrack}
                    className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Next track"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-[10px] font-mono text-zinc-400 uppercase hidden sm:block">
                  Stereo 320kbps
                </div>
              </div>
            </div>

            {/* Right: Audio Playlist Queue */}
            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest px-2 mb-2">
                Production Audio Library ({audioTracks.length} Tracks)
              </div>

              {audioTracks.map((track, idx) => {
                const isSelected = currentTrackIndex === idx;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5'
                        : 'bg-zinc-950/60 hover:bg-zinc-900 border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative bg-zinc-800">
                        <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-500/40 flex items-center justify-center">
                            <Disc3 className="w-4 h-4 text-white animate-spin" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className={`text-sm font-bold ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                          {track.title}
                        </h4>
                        <div className="text-xs text-zinc-400">{track.artist}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                      {track.genre && (
                        <span className="hidden sm:inline px-2 py-0.5 rounded bg-white/5 text-[10px]">
                          {track.genre}
                        </span>
                      )}
                      <span>{track.duration}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelected) {
                            togglePlay();
                          } else {
                            setCurrentTrackIndex(idx);
                            setIsPlaying(true);
                          }
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-amber-500 text-zinc-950' : 'bg-white/5 hover:bg-white/15 text-white'
                        }`}
                      >
                        {isSelected && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. YOUTUBE RELEASES TAB */}
        {activeTab === 'YOUTUBE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {youtubeSongs.map((song) => (
              <div
                key={song.id}
                className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-950/80 border border-white/[0.08] hover:border-red-500/50 transition-all duration-300 shadow-xl"
              >
                <div
                  className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900 cursor-pointer"
                  onClick={() => handleWatchYouTube(song)}
                >
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  {song.views && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                      {song.views}
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-white group-hover:text-red-400 transition-colors">
                      {song.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-1">{song.artist}</p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => handleWatchYouTube(song)}
                      className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 uppercase cursor-pointer"
                    >
                      <Youtube className="w-4 h-4" />
                      <span>WATCH ON YOUTUBE</span>
                    </button>

                    {song.youtubeUrl && (
                      <a
                        href={song.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white p-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. SPOTIFY RELEASES TAB */}
        {activeTab === 'SPOTIFY' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {spotifySongs.map((song) => (
              <div
                key={song.id}
                className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-950/80 border border-white/[0.08] hover:border-emerald-500/50 transition-all duration-300 shadow-xl"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-900">
                  <img
                    src={song.coverImage}
                    alt={song.title}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase">
                      {song.album || 'Single Track'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {song.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-1">{song.artist}</p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <a
                      href={song.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 uppercase transition-colors"
                    >
                      <Radio className="w-4 h-4" />
                      <span>LISTEN ON SPOTIFY</span>
                    </a>

                    <a
                      href={song.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
