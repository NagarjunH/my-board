import React, { useState } from 'react';
import { X, Download, FileImage, FileCode, FileText, Check, BookOpen, Layers } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useBoardStore } from '../../store/boardStore';
import { useCanvasStore } from '../../store/canvasStore';
import {
  exportPageAsPng,
  exportPageAsSvg,
  exportBoardAsPdf,
  getPageContentBounds,
} from '../../services/exportService';

export const ExportModal: React.FC = () => {
  const isExportModalOpen = useUIStore((s) => s.isExportModalOpen);
  const setExportModalOpen = useUIStore((s) => s.setExportModalOpen);

  const activeBoard = useBoardStore((s) => s.getActiveBoard());
  const activePage = useBoardStore((s) => s.getActivePage());
  const liveCanvasElements = useCanvasStore((s) => s.elements);
  const liveBackground = useCanvasStore((s) => s.background);

  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'svg'>('pdf');
  const [scope, setScope] = useState<'current' | 'all'>('current');
  const [isExporting, setIsExporting] = useState(false);
  const [progressText, setProgressText] = useState<string>('');
  const [success, setSuccess] = useState(false);

  if (!isExportModalOpen) return null;

  // Prepare active page with current live elements
  const currentSyncedPage = activePage
    ? {
        ...activePage,
        canvasState: {
          elements: liveCanvasElements,
          viewport: { x: 0, y: 0, zoom: 1 },
        },
        backgroundConfig: liveBackground,
      }
    : undefined;

  const totalElementsCount = liveCanvasElements.length;
  const currentBounds = getPageContentBounds(liveCanvasElements, 80);
  const totalPagesCount = activeBoard?.pages?.length || 1;

  const handleExport = async () => {
    if (!currentSyncedPage || !activeBoard) return;
    setIsExporting(true);

    try {
      if (exportFormat === 'png') {
        setProgressText('Rendering high-resolution 2x image...');
        await exportPageAsPng(currentSyncedPage, activeBoard.name);
      } else if (exportFormat === 'svg') {
        setProgressText('Generating clean vector SVG...');
        exportPageAsSvg(currentSyncedPage, activeBoard.name);
      } else if (exportFormat === 'pdf') {
        if (scope === 'all' && activeBoard.pages && activeBoard.pages.length > 1) {
          // Sync current page into pages array
          const pagesToExport = activeBoard.pages.map((p) =>
            p.id === currentSyncedPage.id ? currentSyncedPage : p
          );
          await exportBoardAsPdf(activeBoard, pagesToExport, (curr, total) => {
            setProgressText(`Rendering Lesson ${curr} of ${total}...`);
          });
        } else {
          setProgressText('Generating full-content PDF handout...');
          await exportBoardAsPdf(activeBoard, [currentSyncedPage]);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsExporting(false);
        setExportModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. Please check the console for details.');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#151722] border border-[#EAE5DC] dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#EEEDFC] dark:bg-[#5B50E6]/20 text-[#5B50E6] dark:text-[#a5b4fc]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Export Whiteboard Content</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% full content bounds — zero clipping or cut-offs
              </p>
            </div>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope: Current Lesson vs Entire Chapter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Export Scope:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setScope('current')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                scope === 'current'
                  ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 border-[#5B50E6] text-[#5B50E6] dark:text-[#a5b4fc] ring-1 ring-[#5B50E6]/30 font-semibold'
                  : 'bg-[#FAF8F5] dark:bg-slate-900 border-[#EAE5DC] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs truncate font-semibold">
                  Current Lesson
                </div>
                <div className="text-[10px] opacity-75 truncate">
                  {activePage?.name || 'Lesson 1'}
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setScope('all');
                if (exportFormat !== 'pdf') setExportFormat('pdf');
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                scope === 'all'
                  ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 border-[#5B50E6] text-[#5B50E6] dark:text-[#a5b4fc] ring-1 ring-[#5B50E6]/30 font-semibold'
                  : 'bg-[#FAF8F5] dark:bg-slate-900 border-[#EAE5DC] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs truncate font-semibold">
                  All Lessons ({totalPagesCount})
                </div>
                <div className="text-[10px] opacity-75 truncate">
                  Multi-page PDF Handout
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Format Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Export Format:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setExportFormat('pdf')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                exportFormat === 'pdf'
                  ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 border-[#5B50E6] text-[#5B50E6] dark:text-[#a5b4fc] ring-1 ring-[#5B50E6]/30 font-semibold shadow-2xs'
                  : 'bg-[#FAF8F5] dark:bg-slate-900 border-[#EAE5DC] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-5 h-5 text-rose-500" />
              <span className="text-xs font-semibold">PDF Handout</span>
              <span className="text-[10px] opacity-75">Multi-Page A4</span>
            </button>

            <button
              onClick={() => {
                setExportFormat('png');
                setScope('current');
              }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                exportFormat === 'png'
                  ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 border-[#5B50E6] text-[#5B50E6] dark:text-[#a5b4fc] ring-1 ring-[#5B50E6]/30 font-semibold shadow-2xs'
                  : 'bg-[#FAF8F5] dark:bg-slate-900 border-[#EAE5DC] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileImage className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-semibold">PNG Image</span>
              <span className="text-[10px] opacity-75">2x High-DPI</span>
            </button>

            <button
              onClick={() => {
                setExportFormat('svg');
                setScope('current');
              }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                exportFormat === 'svg'
                  ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 border-[#5B50E6] text-[#5B50E6] dark:text-[#a5b4fc] ring-1 ring-[#5B50E6]/30 font-semibold shadow-2xs'
                  : 'bg-[#FAF8F5] dark:bg-slate-900 border-[#EAE5DC] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-semibold">SVG Vector</span>
              <span className="text-[10px] opacity-75">Infinite Scale</span>
            </button>
          </div>
        </div>

        {/* Content Bounds Details Badge */}
        <div className="bg-[#FAF8F5] dark:bg-[#0f1118] border border-[#EAE5DC] dark:border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
            <span>Canvas Content Detected:</span>
            <span className="font-bold text-[#5B50E6] dark:text-[#a5b4fc]">
              {totalElementsCount} element{totalElementsCount === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Full Content Canvas:</span>
            <span className="font-mono">
              {Math.round(currentBounds.width)} × {Math.round(currentBounds.height)} px
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1">
            <Check className="w-3 h-3 stroke-[2.5]" />
            <span>Automatic auto-fit bounds — all drawings & code blocks included</span>
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full py-2.5 bg-[#5B50E6] hover:bg-[#4E44D4] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
        >
          {success ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Download Complete!</span>
            </>
          ) : isExporting ? (
            <span>{progressText || 'Preparing Export...'}</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>
                Download {scope === 'all' ? 'All Lessons' : 'Complete'}{' '}
                {exportFormat.toUpperCase()}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
