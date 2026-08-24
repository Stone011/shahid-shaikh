import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCategoryScrollerProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  scrollAmount?: number;
}

export const HorizontalCategoryScroller: React.FC<HorizontalCategoryScrollerProps> = ({
  children,
  className = '',
  innerClassName = '',
  scrollAmount = 280,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Allow slight tolerance
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    // Also observe DOM changes in children
    const observer = new MutationObserver(() => {
      updateScrollState();
    });
    observer.observe(el, { childList: true, subtree: true, attributes: true });

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, children]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative flex items-center group/scroller ${className}`}>
      {/* Left Navigation Arrow */}
      <button
        type="button"
        onClick={handleScrollLeft}
        disabled={!canScrollLeft}
        aria-label="Scroll categories left"
        className={`shrink-0 mr-1.5 sm:mr-2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-zinc-900/90 border border-white/10 text-zinc-300 hover:text-amber-300 hover:border-amber-500/50 hover:bg-zinc-800 transition-all duration-200 shadow-md ${
          canScrollLeft
            ? 'opacity-100 cursor-pointer scale-100'
            : 'opacity-25 cursor-not-allowed pointer-events-none'
        }`}
      >
        <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </button>

      {/* Scrollable Items Container */}
      <div
        ref={scrollRef}
        className={`flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 ${innerClassName}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {/* Right Navigation Arrow */}
      <button
        type="button"
        onClick={handleScrollRight}
        disabled={!canScrollRight}
        aria-label="Scroll categories right"
        className={`shrink-0 ml-1.5 sm:mr-0 sm:ml-2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-zinc-900/90 border border-white/10 text-zinc-300 hover:text-amber-300 hover:border-amber-500/50 hover:bg-zinc-800 transition-all duration-200 shadow-md ${
          canScrollRight
            ? 'opacity-100 cursor-pointer scale-100'
            : 'opacity-25 cursor-not-allowed pointer-events-none'
        }`}
      >
        <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </button>
    </div>
  );
};
