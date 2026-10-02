import React, { useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useBoardStore } from '../../store/boardStore';
import { useCanvasStore } from '../../store/canvasStore';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X, Presentation } from 'lucide-react';

export const SlidePresentationBar: React.FC = () => {
  const isSlideModeActive = useUIStore((s) => s.isSlideModeActive);
  const toggleSlideMode = useUIStore((s) => s.toggleSlideMode);

  const activeBoard = useBoardStore((s) => s.getActiveBoard());
  const activePageId = useBoardStore((s) => s.activePageId);
  const setActivePageId = useBoardStore((s) => s.setActivePageId);
  const setElements = useCanvasStore((s) => s.setElements);
  const setBackground = useCanvasStore((s) => s.setBackground);

  const pages = activeBoard?.pages || [];
  const currentIndex = pages.findIndex((p) => p.id === activePageId);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < pages.length) {
      const targetPage = pages[index];
      setActivePageId(targetPage.id);
      setElements(targetPage.canvasState?.elements || []);
      setBackground(targetPage.backgroundConfig || { style: 'white' });
    }
  };

  useEffect(() => {
    if (!isSlideModeActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === 'Space') {
        e.preventDefault();
        goToSlide(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToSlide(currentIndex - 1);
      } else if (e.key === 'Escape') {
        toggleSlideMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlideModeActive, currentIndex, pages]);

  if (!isSlideModeActive || pages.length === 0) return null;

  const currentPage = pages[currentIndex] || pages[0];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#12141f]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 text-slate-100 select-none animate-in fade-in slide-in-from-bottom-3 duration-150">
      <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
        <Presentation className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-bold font-mono text-slate-300">
          Slide {currentIndex + 1} of {pages.length}
        </span>
      </div>

      <div className="max-w-xs truncate text-xs font-semibold text-white px-2">
        {currentPage.name}
      </div>

      <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2">
        <button
          onClick={() => goToSlide(currentIndex - 1)}
          disabled={currentIndex <= 0}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-30 transition-colors"
          title="Previous slide (Left Arrow / PageUp)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => goToSlide(currentIndex + 1)}
          disabled={currentIndex >= pages.length - 1}
          className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-30 transition-colors"
          title="Next slide (Right Arrow / PageDown)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={toggleSlideMode}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-red-950/40 rounded-lg transition-colors ml-1"
          title="Exit slide presentation (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
