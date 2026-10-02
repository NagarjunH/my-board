import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  Minus,
  Plus,
  Hand,
  Sun,
  Moon,
  Video,
  Save,
  Share2,
  Pencil,
  X,
  Menu,
  Check,
  Download,
  FolderOpen,
  FileText,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { useBoardStore } from '../../store/boardStore';
import { useUIStore } from '../../store/uiStore';
import {
  saveBoardToLocalDisk,
  saveNotesAsMarkdown,
  readBoardFromLocalDisk,
} from '../../utils/localFiles';

export const Header: React.FC = () => {
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleYouTubeMode = useUIStore((s) => s.toggleYouTubeMode);
  const setShareModalOpen = useUIStore((s) => s.setShareModalOpen);
  const setExportModalOpen = useUIStore((s) => s.setExportModalOpen);
  const isPresenterNotesOpen = useUIStore((s) => s.isPresenterNotesOpen);
  const togglePresenterNotes = useUIStore((s) => s.togglePresenterNotes);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const viewport = useCanvasStore((s) => s.viewport);
  const zoomIn = useCanvasStore((s) => s.zoomIn);
  const zoomOut = useCanvasStore((s) => s.zoomOut);
  const resetZoom = useCanvasStore((s) => s.resetZoom);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const setElements = useCanvasStore((s) => s.setElements);
  const setBackground = useCanvasStore((s) => s.setBackground);
  const setColor = useCanvasStore((s) => s.setColor);

  const activeBoard = useBoardStore((s) => s.getActiveBoard());
  const activePage = useBoardStore((s) => s.getActivePage());
  const renamePage = useBoardStore((s) => s.renamePage);
  const setBoards = useBoardStore((s) => s.setBoards);
  const setActiveBoardId = useBoardStore((s) => s.setActiveBoardId);
  const saveStatus = useBoardStore((s) => s.saveStatus);
  const setSaveStatus = useBoardStore((s) => s.setSaveStatus);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setIsSaveMenuOpen(false);
      }
    };
    if (isSaveMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSaveMenuOpen]);

  const zoomPercent = Math.round(viewport.zoom * 100);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startEditTitle = () => {
    if (activePage) {
      setTitleDraft(activePage.name);
      setIsEditingTitle(true);
    }
  };

  const finishEditTitle = () => {
    if (activePage && titleDraft.trim()) {
      renamePage(activePage.id, titleDraft.trim());
    }
    setIsEditingTitle(false);
  };

  // 1. Save Board to Local .myboard file
  const handleSaveToLocalFile = () => {
    if (!activeBoard) return;
    saveBoardToLocalDisk(activeBoard);
    setIsSaveMenuOpen(false);
    showToast('Saved board file (.myboard) to local disk!');
    setSaveStatus('saved');
  };

  // 2. Save Lesson Notes as Markdown
  const handleSaveNotesMarkdown = () => {
    if (!activeBoard || !activePage) return;
    saveNotesAsMarkdown(activeBoard.name, activePage);
    setIsSaveMenuOpen(false);
    showToast('Exported lesson notes as Markdown (.md)!');
  };

  // 3. Open Board from Local File
  const handleOpenFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedBoard = await readBoardFromLocalDisk(file);
      // Give a unique ID if already present
      importedBoard.id = `board-${Date.now()}`;
      const existingBoards = useBoardStore.getState().boards;
      setBoards([importedBoard, ...existingBoards]);
      setActiveBoardId(importedBoard.id);

      const firstPage = importedBoard.pages?.[0];
      if (firstPage) {
        setElements(firstPage.canvasState?.elements || []);
        setBackground(firstPage.backgroundConfig || { style: 'white' });
      }

      showToast(`Loaded "${importedBoard.name}" from local file!`);
      setIsSaveMenuOpen(false);
    } catch (err: any) {
      alert(`Could not open file: ${err.message}`);
    }
  };

  // 4. Toggle App Theme with Adaptive Canvas Contrast
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();

    const currentBg = useCanvasStore.getState().background;
    const currentColor = useCanvasStore.getState().color;

    if (nextTheme === 'dark') {
      // Switching from Light to Dark
      if (['soft-white', 'white', 'light-gray', 'cream', 'pale-blue'].includes(currentBg.style)) {
        setBackground({ style: 'dark' });
      }
      if (currentColor === '#1e293b' || currentColor === '#000000' || currentColor === '#0f172a') {
        setColor('#ffffff');
      }
    } else {
      // Switching from Dark to Light
      if (['dark', 'navy', 'black'].includes(currentBg.style)) {
        setBackground({ style: 'soft-white' });
      }
      if (currentColor === '#ffffff' || currentColor === '#f8fafc') {
        setColor('#1e293b');
      }
    }
  };

  return (
    <header className="h-14 bg-[#FAF8F5] dark:bg-[#11131a] border-b border-[#EAE5DC] dark:border-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-between px-3 select-none z-40 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#10B981] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left: Brand & Sidebar toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-2 border-r border-[#EAE5DC] dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-[#5B50E6] flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-base tracking-tight leading-none">M</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white hidden sm:inline">MyBoard</span>
          <button
            onClick={toggleSidebar}
            className="p-1.5 ml-0.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-[#F3EFE8] dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Editable Breadcrumb */}
        <div className="flex items-center gap-2 text-xs bg-white dark:bg-slate-900 border border-[#EAE5DC] dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            {activeBoard ? activeBoard.name.replace(' Series', '').replace(' Complete', '') : 'Board'}
          </span>
          <span className="text-slate-400 dark:text-slate-600">&gt;</span>

          {isEditingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishEditTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                className="bg-white dark:bg-slate-800 border border-[#5B50E6] rounded-md px-2 py-0.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={finishEditTitle}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditTitle}
              className="group flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold hover:text-[#5B50E6] transition-colors"
              title="Click to rename lesson"
            >
              <span>{activePage?.name || 'Untitled Lesson'}</span>
              <Pencil className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Undo/Redo, Zoom, Hand, Theme, YouTube Mode, Share, Save */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-[#EAE5DC] dark:border-slate-800 rounded-xl p-0.5 shadow-2xs">
          <button
            onClick={undo}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-[#EAE5DC] dark:border-slate-800 rounded-xl text-xs font-medium px-1 py-0.5 shadow-2xs">
          <button
            onClick={zoomOut}
            className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoom}
            className="px-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-mono"
            title="Reset to 100%"
          >
            {zoomPercent}%
          </button>
          <button
            onClick={zoomIn}
            className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded transition-colors"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hand Pan Tool */}
        <button
          onClick={() => setActiveTool(activeTool === 'hand' ? 'select' : 'hand')}
          className={`p-2 rounded-xl border transition-colors shadow-2xs ${
            activeTool === 'hand'
              ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 border-[#5B50E6]/30 text-[#5B50E6] dark:text-[#a5b4fc]'
              : 'bg-white dark:bg-slate-900 border-[#EAE5DC] dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-slate-800'
          }`}
          title="Hand / Pan Tool (H / Space+Drag)"
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={handleToggleTheme}
          className="p-2 bg-white dark:bg-slate-900 border border-[#EAE5DC] dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded-xl shadow-2xs transition-colors"
          title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Teacher Script / Teleprompter Toggle */}
        <button
          onClick={togglePresenterNotes}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl shadow-2xs border transition-all hover:scale-[1.02] active:scale-95 ${
            isPresenterNotesOpen
              ? 'bg-[#10B981] border-[#059669] text-white shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-[#EAE5DC] dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-slate-800'
          }`}
          title="Teacher Script & Auto-Scroll Teleprompter (Alt+S)"
        >
          <FileText className={`w-3.5 h-3.5 ${isPresenterNotesOpen ? 'text-white' : 'text-emerald-500 dark:text-emerald-400'}`} />
          <span>Script</span>
          <span className="text-[10px] font-mono opacity-60">Alt+S</span>
        </button>

        {/* YouTube Mode Button */}
        <button
          onClick={toggleYouTubeMode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-95"
          title="Enter YouTube Recording Mode (Ctrl+Shift+F)"
        >
          <Video className="w-3.5 h-3.5 fill-current" />
          <span>YouTube Mode</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5B50E6] hover:bg-[#4E44D4] text-white text-xs font-semibold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-95"
          title="Share board URL"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        {/* Save to Local Dropdown Button */}
        <div className="relative" ref={saveMenuRef}>
          <div className="flex items-center bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] rounded-xl shadow-2xs transition-all overflow-hidden font-semibold">
            <button
              onClick={handleSaveToLocalFile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#059669]"
              title="Save notes directly to local disk (.myboard file)"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{saveStatus === 'saving' ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={() => setIsSaveMenuOpen(!isSaveMenuOpen)}
              className="px-1.5 py-1.5 text-[#059669]/80 hover:text-[#059669] hover:bg-[#A7F3D0]/40 border-l border-[#A7F3D0]"
              title="More local save options"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {isSaveMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-[#161824] border border-[#EAE5DC] dark:border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Local Storage & Backup
              </div>

              <button
                onClick={handleSaveToLocalFile}
                className="w-full text-left px-2.5 py-2 text-xs hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-[#5B50E6]" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">Save Board (.myboard)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Complete backup of all lessons</div>
                </div>
              </button>

              <button
                onClick={handleSaveNotesMarkdown}
                className="w-full text-left px-2.5 py-2 text-xs hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">Save Notes (.md)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Markdown for YouTube description</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsSaveMenuOpen(false);
                  setExportModalOpen(true);
                }}
                className="w-full text-left px-2.5 py-2 text-xs hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">Export Image / PDF</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">1080p PNG, SVG, or PDF handout</div>
                </div>
              </button>

              <div className="h-px bg-[#EAE5DC] dark:bg-slate-800 my-1" />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-2.5 py-2 text-xs hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 text-amber-600 dark:text-amber-300"
              >
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-semibold">Open from Local File</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Restore a saved .myboard file</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Hidden File Input for Loading .myboard file */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".myboard,.json"
          onChange={handleOpenFile}
          className="hidden"
        />
      </div>
    </header>
  );
};
