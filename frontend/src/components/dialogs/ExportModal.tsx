import React, { useState } from 'react';
import { X, Download, FileImage, FileCode, FileText, Check } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useBoardStore } from '../../store/boardStore';
import { jsPDF } from 'jspdf';

export const ExportModal: React.FC = () => {
  const isExportModalOpen = useUIStore((s) => s.isExportModalOpen);
  const setExportModalOpen = useUIStore((s) => s.setExportModalOpen);
  const activePage = useBoardStore((s) => s.getActivePage());

  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'pdf'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isExportModalOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    const svgElement = document.getElementById('whiteboard-svg-canvas') as unknown as SVGSVGElement;
    const pageName = activePage?.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'whiteboard';

    try {
      if (exportFormat === 'svg') {
        if (!svgElement) return;
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pageName}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'png') {
        if (!svgElement) return;
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URLObj = window.URL || window.webkitURL || window;
        const blobURL = URLObj.createObjectURL(svgBlob);

        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1920;
          canvas.height = 1080;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const pngURL = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngURL;
            a.download = `${pageName}.png`;
            a.click();
          }
          URLObj.revokeObjectURL(blobURL);
        };
        image.src = blobURL;
      } else if (exportFormat === 'pdf') {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1920, 1080],
        });
        doc.text(`MyBoard Lesson: ${activePage?.name || 'Whiteboard'}`, 40, 40);
        doc.save(`${pageName}.pdf`);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsExporting(false);
        setExportModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Export failed', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#161822] border border-[#EAE5DC] dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#EEEDFC] text-[#5B50E6]">
              <Download className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold">Export Whiteboard</h2>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export pristine lecture notes and diagrams for your YouTube video description or student handouts.
        </p>

        {/* Format Selector */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setExportFormat('png')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
              exportFormat === 'png'
                ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 border-[#5B50E6] text-[#5B50E6] dark:text-[#a5b4fc] ring-1 ring-[#5B50E6]/30 font-semibold shadow-2xs'
                : 'bg-[#FAF8F5] dark:bg-slate-900 border-[#EAE5DC] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileImage className="w-6 h-6" />
            <span className="text-xs font-semibold">PNG Image</span>
            <span className="text-[10px] opacity-75">1080p High-Res</span>
          </button>

          <button
            onClick={() => setExportFormat('svg')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
              exportFormat === 'svg'
                ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 border-[#5B50E6] text-[#5B50E6] dark:text-[#a5b4fc] ring-1 ring-[#5B50E6]/30 font-semibold shadow-2xs'
                : 'bg-[#FAF8F5] dark:bg-slate-900 border-[#EAE5DC] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileCode className="w-6 h-6" />
            <span className="text-xs font-semibold">SVG Vector</span>
            <span className="text-[10px] opacity-75">Infinite Scale</span>
          </button>

          <button
            onClick={() => setExportFormat('pdf')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
              exportFormat === 'pdf'
                ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 border-[#5B50E6] text-[#5B50E6] dark:text-[#a5b4fc] ring-1 ring-[#5B50E6]/30 font-semibold shadow-2xs'
                : 'bg-[#FAF8F5] dark:bg-slate-900 border-[#EAE5DC] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-6 h-6" />
            <span className="text-xs font-semibold">PDF Document</span>
            <span className="text-[10px] opacity-75">Handout Ready</span>
          </button>
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
              <span>Export Complete!</span>
            </>
          ) : isExporting ? (
            <span>Preparing Export...</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download {exportFormat.toUpperCase()}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
