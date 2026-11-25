import React, { useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DestinationItem } from '../types';
import { SafeImage } from './BrandMark';

interface ImageLightboxProps {
  items: DestinationItem[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
  onEnquire: (destination: DestinationItem) => void;
}

export function ImageLightbox({
  items,
  activeIndex,
  onClose,
  onChangeIndex,
  onEnquire,
}: ImageLightboxProps) {
  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < items.length;
  const current = isOpen ? items[activeIndex] : null;

  useEffect(() => {
    if (!isOpen || activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        onChangeIndex((activeIndex + 1) % items.length);
      } else if (e.key === 'ArrowLeft') {
        onChangeIndex((activeIndex - 1 + items.length) % items.length);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex, items.length, onClose, onChangeIndex]);

  if (!isOpen || !current || activeIndex === null) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0A1726]/92 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Full view of ${current.name}`}
      onClick={onClose}
    >
      <div
        className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <p className="text-xs text-[#FF5252] truncate">
            {current.region} · {current.country} ·{' '}
            <span className="tabular-nums">
              {activeIndex + 1} / {items.length}
            </span>
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-white truncate">
            {current.name}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close full image view"
          className="w-11 h-11 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        className="relative max-w-6xl w-full mx-auto flex-1 flex items-center justify-center my-4 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onChangeIndex((activeIndex - 1 + items.length) % items.length)}
            aria-label="Previous destination image"
            className="hidden sm:flex w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors mr-3 shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="relative max-h-[72vh] w-full flex items-center justify-center overflow-hidden rounded-lg">
          <SafeImage
            src={current.imageUrl}
            alt={`${current.name} — ${current.country}`}
            className="max-h-[72vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl"
          />
        </div>

        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onChangeIndex((activeIndex + 1) % items.length)}
            aria-label="Next destination image"
            className="hidden sm:flex w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors ml-3 shrink-0 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      <div
        className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/15 text-[#FAF8F3]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-[#FAF8F3]/80 max-w-3xl leading-relaxed">{current.shortDescription}</p>
        <div className="flex items-center gap-2 shrink-0">
          {items.length > 1 && (
            <div className="flex sm:hidden items-center gap-1.5 mr-1">
              <button
                type="button"
                onClick={() => onChangeIndex((activeIndex - 1 + items.length) % items.length)}
                aria-label="Previous image"
                className="w-11 h-11 rounded-md bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeIndex((activeIndex + 1) % items.length)}
                aria-label="Next image"
                className="w-11 h-11 rounded-md bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              onClose();
              onEnquire(current);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-md bg-[#C9A45C] text-[#10243B] text-sm font-semibold hover:bg-[#E4C98D] transition-colors cursor-pointer whitespace-nowrap"
          >
            Enquire About {current.name}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
