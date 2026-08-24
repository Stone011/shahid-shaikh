import React, { useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Camera } from 'lucide-react';

export const PhotoLightbox: React.FC = () => {
  const {
    activePhotoIndex,
    activePhotoList,
    closePhotoLightbox,
    nextPhoto,
    prevPhoto,
  } = usePortfolio();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'Escape') closePhotoLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };

    if (activePhotoIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activePhotoIndex, closePhotoLightbox, nextPhoto, prevPhoto]);

  if (activePhotoIndex === null || !activePhotoList[activePhotoIndex]) return null;

  const currentPhoto = activePhotoList[activePhotoIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={closePhotoLightbox}
    >
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-black/70 border border-white/10 backdrop-blur-md text-xs font-mono text-zinc-300 pointer-events-auto">
          {activePhotoIndex + 1} / {activePhotoList.length}
        </div>

        <button
          onClick={closePhotoLightbox}
          className="p-2.5 rounded-full bg-black/70 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md transition-colors cursor-pointer pointer-events-auto"
          title="Close Lightbox (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Arrows */}
      {activePhotoList.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/70 hover:bg-amber-500 text-white hover:text-zinc-950 border border-white/10 backdrop-blur-md transition-all cursor-pointer"
            title="Previous Photo (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/70 hover:bg-amber-500 text-white hover:text-zinc-950 border border-white/10 backdrop-blur-md transition-all cursor-pointer"
            title="Next Photo (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image Frame & Info Box */}
      <div
        className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentPhoto.imageUrl}
          alt={currentPhoto.title}
          className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl select-none"
        />

        {/* Caption & Metadata Bar */}
        <div className="mt-4 px-6 py-3 rounded-xl bg-zinc-950/85 border border-white/10 backdrop-blur-md text-center max-w-2xl">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono uppercase">
              {currentPhoto.category}
            </span>
            {currentPhoto.location && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                <MapPin className="w-3 h-3 text-amber-400" />
                {currentPhoto.location}
              </span>
            )}
          </div>
          <h4 className="font-display text-base font-bold text-white uppercase">
            {currentPhoto.title}
          </h4>
          {currentPhoto.description && (
            <p className="text-xs text-zinc-300 font-light mt-1">{currentPhoto.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
