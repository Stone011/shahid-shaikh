import React, { useEffect, useState, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  X,
  ExternalLink,
  Maximize,
  Minimize,
  Film,
  Sparkles,
  Smartphone,
  AlertCircle,
  RefreshCw,
  Play,
  RotateCcw,
  Monitor,
} from 'lucide-react';
import { parseVideoUrl, VideoInfo } from '../utils/videoPlayerUtils';

export const VideoModal: React.FC = () => {
  const { activeVideo, closeVideoModal } = usePortfolio();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [forcedAspect, setForcedAspect] = useState<'16/9' | '9/16' | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Parse active video metadata
  const videoInfo: VideoInfo | null = activeVideo
    ? parseVideoUrl(activeVideo.url)
    : null;

  // Reset loading and error when activeVideo changes
  useEffect(() => {
    if (activeVideo) {
      setIsLoading(true);
      setLoadError(false);
      setForcedAspect(null);

      if (videoInfo?.platform === 'instagram') {
        try {
          if (typeof (window as any).instgrm !== 'undefined') {
            (window as any).instgrm.Embeds?.process?.();
          }
        } catch {
          // Ignore any embed process errors
        }
      }

      // Safety timeout: If iframe takes longer than 6 seconds to trigger onLoad
      // (common when Instagram or third-party cookies are blocked by browser tracking protection),
      // dismiss loading spinner so user isn't stuck waiting.
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [activeVideo?.url]);

  // Keyboard Shortcuts (Escape to close, F for fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeVideoModal();
      } else if (e.key.toLowerCase() === 'f' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    if (activeVideo) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeVideo, closeVideoModal]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!activeVideo || !videoInfo) return null;

  const currentAspect = forcedAspect || videoInfo.aspectRatio;
  const isVertical = currentAspect === '9/16';

  const handleIframeLoaded = () => {
    setIsLoading(false);
    if (videoInfo?.platform === 'instagram') {
      try {
        if (typeof (window as any).instgrm !== 'undefined') {
          (window as any).instgrm.Embeds?.process?.();
        }
      } catch {
        // Ignore
      }
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setLoadError(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={closeVideoModal}
    >
      <div
        ref={containerRef}
        className={`relative w-full bg-zinc-950 border border-white/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
          isVertical ? 'max-w-md sm:max-w-lg' : 'max-w-5xl'
        } ${isFullscreen ? 'h-screen w-screen max-w-none rounded-none border-0' : 'max-h-[92vh]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Toolbar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-black/80 backdrop-blur-md shrink-0">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              {activeVideo.category && (
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                  {activeVideo.category}
                </span>
              )}
              {/* Automatic Platform Detection Badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${videoInfo.platformBg}`}
              >
                {videoInfo.platformName}
              </span>
            </div>
            <h3 className="font-display text-sm sm:text-base font-bold text-white uppercase truncate">
              {activeVideo.title}
            </h3>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Aspect Ratio Toggle (16:9 vs 9:16) */}
            <button
              type="button"
              onClick={() => setForcedAspect(isVertical ? '16/9' : '9/16')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={isVertical ? 'Switch to 16:9 Landscape' : 'Switch to 9:16 Vertical Reel'}
            >
              {isVertical ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:flex"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Open in New Tab */}
            <a
              href={activeVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Open Original Link in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeVideoModal}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-zinc-300 transition-colors cursor-pointer"
              title="Close Video Player (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Display Container */}
        <div
          className={`relative w-full bg-black flex items-center justify-center overflow-hidden ${
            isVertical ? 'aspect-[9/16] max-h-[75vh]' : 'aspect-video'
          }`}
        >
          {/* Loading Animation / Skeleton Shimmer */}
          {isLoading && !loadError && videoInfo.embedType !== 'fallback' && (
            <div className="absolute inset-0 z-20 bg-zinc-950 flex flex-col items-center justify-center gap-3 animate-pulse">
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                <Film className="w-6 h-6 text-amber-400 absolute" />
              </div>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                Buffering {videoInfo.platformName}...
              </p>
            </div>
          )}

          {/* 1. DIRECT HTML5 VIDEO */}
          {videoInfo.embedType === 'video' && videoInfo.embedUrl && (
            <video
              ref={videoRef}
              src={videoInfo.embedUrl}
              controls
              autoPlay
              playsInline
              onLoadedData={() => setIsLoading(false)}
              onError={handleIframeError}
              className="w-full h-full object-contain bg-black"
            />
          )}

          {/* 2. EMBEDDABLE IFRAME (YouTube, Instagram, Facebook, Vimeo, TikTok, Loom, Google Drive, Dailymotion) */}
          {videoInfo.embedType === 'iframe' && videoInfo.embedUrl && !loadError && (
            <iframe
              key={videoInfo.embedUrl}
              src={videoInfo.embedUrl}
              title={activeVideo.title}
              className="w-full h-full border-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              onLoad={handleIframeLoaded}
              onError={handleIframeError}
            />
          )}

          {/* 3. PLATFORM RESTRICTION / FALLBACK (e.g. Twitter/X, private embeds, or load errors) */}
          {(videoInfo.embedType === 'fallback' || loadError) && (
            <div className="p-8 max-w-lg text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-2xl">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>

              <div className="space-y-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${videoInfo.platformBg}`}
                >
                  {videoInfo.platformName}
                </span>
                <h4 className="font-display text-lg font-bold text-white uppercase">
                  {activeVideo.title}
                </h4>
                <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-md mx-auto">
                  {videoInfo.fallbackReason ||
                    `${videoInfo.platformName} requires direct playback via their official player.`}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={activeVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 cursor-pointer"
                >
                  <span>WATCH ON {videoInfo.platformName.toUpperCase()}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {loadError && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoadError(false);
                      setIsLoading(true);
                    }}
                    className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" />
                    Retry
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status / Tip Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-black/90 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500 flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-zinc-400 truncate">{videoInfo.platformName} Player</span>
            {videoInfo.embedNotice && (
              <span className="hidden md:inline text-zinc-500 truncate max-w-md">
                • {videoInfo.embedNotice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={activeVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1 font-sans font-medium"
            >
              <span>Watch on {videoInfo.platformName}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="hidden sm:inline">Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
