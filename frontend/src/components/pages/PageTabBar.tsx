import React from 'react';
import { Plus, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import { useCanvasStore } from '../../store/canvasStore';

export const PageTabBar: React.FC = () => {
  const activeBoard = useBoardStore((s) => s.getActiveBoard());
  const activePageId = useBoardStore((s) => s.activePageId);
  const setActivePageId = useBoardStore((s) => s.setActivePageId);
  const createPage = useBoardStore((s) => s.createPage);

  const setElements = useCanvasStore((s) => s.setElements);
  const setBackground = useCanvasStore((s) => s.setBackground);

  if (!activeBoard || !activeBoard.pages || activeBoard.pages.length === 0) {
    return null;
  }

  const handleSelectPage = (pageId: string) => {
    setActivePageId(pageId);
    const targetPage = activeBoard.pages?.find((p) => p.id === pageId);
    if (targetPage) {
      setElements(targetPage.canvasState.elements || []);
      setBackground(targetPage.backgroundConfig || { style: 'white' });
    }
  };

  const handleAddPage = () => {
    const newPage = createPage(activeBoard.id);
    handleSelectPage(newPage.id);
  };

  return (
    <div className="h-11 bg-[#FAF8F5] dark:bg-[#11131a] border-t border-[#EAE5DC] dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between px-3 select-none z-30 shrink-0">
      {/* Left: Scrollable Page Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 py-1">
        {activeBoard.pages.map((page, index) => {
          const isActive = page.id === activePageId;
          return (
            <button
              key={page.id}
              onClick={() => handleSelectPage(page.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shadow-2xs ${
                isActive
                  ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 text-[#5B50E6] dark:text-[#a5b4fc] border border-[#5B50E6]/40 dark:border-[#5B50E6]/50 ring-1 ring-[#5B50E6]/20'
                  : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border border-[#EAE5DC] dark:border-slate-800'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-[#5B50E6] dark:text-[#a5b4fc]' : 'text-slate-400'}`} />
              <span>{page.name}</span>
            </button>
          );
        })}

        {/* Add Page Button */}
        <button
          onClick={handleAddPage}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#5B50E6] hover:bg-[#EEEDFC] dark:hover:bg-slate-800 rounded-xl border border-[#EAE5DC] dark:border-slate-800 shadow-2xs text-xs font-medium transition-colors"
          title="Add new lesson page"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Page</span>
        </button>
      </div>

      {/* Right: Quick pagination counter */}
      <div className="flex items-center gap-2 pl-3 border-l border-[#EAE5DC] dark:border-slate-800 text-xs text-slate-500 font-mono">
        <span>
          Page {activeBoard.pages.findIndex((p) => p.id === activePageId) + 1} of {activeBoard.pages.length}
        </span>
      </div>
    </div>
  );
};
