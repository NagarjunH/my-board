import React, { useState, useRef, useEffect } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Zap,
  Type,
  Undo2,
  Redo2,
  X,
  Palette,
  Maximize2,
  Minimize2,
  Trash2,
  Sliders,
  FileText,
} from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { useUIStore } from '../../store/uiStore';

// Rich, high-contrast colors curated specifically for YouTube video lectures & diagrams
const YOUTUBE_DARK_CANVAS_COLORS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Vibrant Yellow', hex: '#fde047' },
  { name: 'Sky Cyan', hex: '#38bdf8' },
  { name: 'Neon Green', hex: '#4ade80' },
  { name: 'Hot Pink', hex: '#f472b6' },
  { name: 'Vivid Orange', hex: '#fb923c' },
  { name: 'Bright Blue', hex: '#60a5fa' },
  { name: 'Electric Purple', hex: '#c084fc' },
  { name: 'Coral Red', hex: '#f87171' },
  { name: 'Emerald', hex: '#34d399' },
  { name: 'Gold / Amber', hex: '#fbbf24' },
  { name: 'Light Slate', hex: '#94a3b8' },
  { name: 'Deep Lavender', hex: '#e879f9' },
  { name: 'Mint Leaf', hex: '#a7f3d0' },
  { name: 'Sunset Crimson', hex: '#fb7185' },
];

const YOUTUBE_LIGHT_CANVAS_COLORS = [
  { name: 'Dark Slate', hex: '#1e293b' },
  { name: 'Rich Red', hex: '#ef4444' },
  { name: 'Sapphire Blue', hex: '#2563eb' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Deep Purple', hex: '#7c3aed' },
  { name: 'Vivid Orange', hex: '#ea580c' },
  { name: 'Deep Cyan', hex: '#0891b2' },
  { name: 'Magenta Pink', hex: '#db2777' },
  { name: 'Warm Amber', hex: '#d97706' },
  { name: 'Forest Green', hex: '#15803d' },
  { name: 'Royal Indigo', hex: '#4338ca' },
  { name: 'Crimson Wine', hex: '#be123c' },
  { name: 'Charcoal Black', hex: '#0f172a' },
  { name: 'Coffee Brown', hex: '#78350f' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
];

const YOUTUBE_HIGHLIGHTER_COLORS = [
  { name: 'Neon Yellow', hex: '#fef08a' },
  { name: 'Neon Green', hex: '#86efac' },
  { name: 'Sky Cyan', hex: '#7dd3fc' },
  { name: 'Neon Pink', hex: '#f472b6' },
  { name: 'Peach Orange', hex: '#fed7aa' },
  { name: 'Soft Lavender', hex: '#e9d5ff' },
  { name: 'Coral Red', hex: '#fca5a5' },
  { name: 'Lime Green', hex: '#bef264' },
];

const PEN_PRESETS = [2.0, 2.8, 3.5, 5.0, 8.0];
const HIGHLIGHTER_PRESETS = [16, 28, 48, 72, 100];

export const YouTubeFloatingToolbar: React.FC = () => {
  const isYouTubeMode = useUIStore((s) => s.isYouTubeMode);
  const toggleYouTubeMode = useUIStore((s) => s.toggleYouTubeMode);
  const isPresenterNotesOpen = useUIStore((s) => s.isPresenterNotesOpen);
  const togglePresenterNotes = useUIStore((s) => s.togglePresenterNotes);

  // Canvas Store
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const penColor = useCanvasStore((s) => s.penColor);
  const setPenColor = useCanvasStore((s) => s.setPenColor);
  const highlighterColor = useCanvasStore((s) => s.highlighterColor);
  const setHighlighterColor = useCanvasStore((s) => s.setHighlighterColor);
  const penThickness = useCanvasStore((s) => s.penThickness);
  const setPenThickness = useCanvasStore((s) => s.setPenThickness);
  const highlighterSize = useCanvasStore((s) => s.highlighterSize);
  const setHighlighterSize = useCanvasStore((s) => s.setHighlighterSize);
  const isPalmRejectionEnabled = useCanvasStore((s) => s.isPalmRejectionEnabled);
  const togglePalmRejection = useCanvasStore((s) => s.togglePalmRejection);
  const background = useCanvasStore((s) => s.background);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const clearCanvas = useCanvasStore((s) => s.clearCanvas);

  // Popout state
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [isThicknessOpen, setIsThicknessOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const flyoutRef = useRef<HTMLDivElement>(null);
  const customColorInputRef = useRef<HTMLInputElement>(null);

  const isDarkCanvas = [
    'dark',
    'navy',
    'black',
    'classic-black-dot',
    'blueprint',
    'dark-grid',
    'midnight-grid',
    'dark-dots',
  ].includes(background.style);

  const isHighlighter = activeTool === 'highlighter';
  const currentColor = isHighlighter ? highlighterColor : penColor;

  // Sync fullscreen state with document
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Close flyout on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setIsColorPaletteOpen(false);
        setIsThicknessOpen(false);
      }
    };
    if (isColorPaletteOpen || isThicknessOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isColorPaletteOpen, isThicknessOpen]);

  if (!isYouTubeMode) return null;

  // Toggle fullscreen mode
  // Note: Clean borderless window mode is best for recording to avoid Chrome's top overlay cross
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleColorChange = (hex: string) => {
    if (isHighlighter) {
      setHighlighterColor(hex);
    } else {
      setPenColor(hex);
    }
  };

  // Quick swatches for vertical dock (top 5 essential colors based on canvas)
  const quickDockColors = isHighlighter
    ? YOUTUBE_HIGHLIGHTER_COLORS.slice(0, 5)
    : isDarkCanvas
    ? YOUTUBE_DARK_CANVAS_COLORS.slice(0, 5)
    : YOUTUBE_LIGHT_CANVAS_COLORS.slice(0, 5);

  const fullPalette = isHighlighter
    ? YOUTUBE_HIGHLIGHTER_COLORS
    : isDarkCanvas
    ? YOUTUBE_DARK_CANVAS_COLORS
    : YOUTUBE_LIGHT_CANVAS_COLORS;

  return (
    <div
      ref={flyoutRef}
      className="fixed left-3 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1.5 bg-[#0f111a]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2 shadow-2xl select-none animate-in fade-in slide-in-from-left-4 duration-200"
    >
      {/* 1. YouTube Live Badge (Compact Vertical) */}
      <div
        className="flex flex-col items-center justify-center px-1 py-1.5 bg-red-600/20 border border-red-500/40 rounded-xl mb-0.5"
        title="YouTube Lecture Mode Active"
      >
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[8px] font-black text-red-400 tracking-wider uppercase font-mono mt-0.5 leading-none">
          LIVE
        </span>
      </div>

      {/* 2. Primary Teaching Tools */}
      <div className="flex flex-col items-center gap-1">
        {/* Pen */}
        <button
          onClick={() => {
            setActiveTool('pen');
            setIsColorPaletteOpen(false);
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'pen'
              ? 'bg-[#5B50E6] text-white shadow-lg shadow-[#5B50E6]/30 font-bold scale-105 ring-1 ring-[#5B50E6]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Pen (P)"
        >
          <Pen className="w-4 h-4" />
        </button>

        {/* Highlighter */}
        <button
          onClick={() => {
            setActiveTool('highlighter');
            setIsColorPaletteOpen(false);
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'highlighter'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 font-bold scale-105 ring-1 ring-amber-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Highlighter"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        {/* Laser Pointer (4px) */}
        <button
          onClick={() => {
            setActiveTool('laser');
            setIsColorPaletteOpen(false);
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'laser'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold scale-105 ring-1 ring-rose-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Laser Pointer (4px) - Clean lecture pointer without permanent marks"
        >
          <Zap className="w-4 h-4" />
        </button>

        {/* Eraser */}
        <button
          onClick={() => {
            setActiveTool('eraser');
            setIsColorPaletteOpen(false);
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'eraser'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold scale-105 ring-1 ring-rose-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Eraser (E)"
        >
          <Eraser className="w-4 h-4" />
        </button>

        {/* Text */}
        <button
          onClick={() => {
            setActiveTool('text');
            setIsColorPaletteOpen(false);
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'text'
              ? 'bg-[#5B50E6] text-white shadow-lg shadow-[#5B50E6]/30 font-bold scale-105 ring-1 ring-[#5B50E6]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Text (T)"
        >
          <Type className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-slate-700/80 my-0.5" />

      {/* 3. Quick Color Swatches directly on vertical dock */}
      <div className="flex flex-col items-center gap-1.5">
        {quickDockColors.map((c) => {
          const isSelected = currentColor.toLowerCase() === c.hex.toLowerCase();
          const isWhite = c.hex === '#ffffff';

          return (
            <button
              key={c.hex}
              onClick={() => handleColorChange(c.hex)}
              className={`w-5 h-5 rounded-full transition-transform flex-shrink-0 ${
                isSelected
                  ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0f111a]'
                  : 'hover:scale-110 opacity-90'
              } ${isWhite ? 'border border-slate-400' : ''}`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          );
        })}

        {/* More Colors Popout Button */}
        <button
          onClick={() => {
            setIsColorPaletteOpen(!isColorPaletteOpen);
            setIsThicknessOpen(false);
          }}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all mt-0.5 ${
            isColorPaletteOpen
              ? 'bg-[#5B50E6] text-white ring-2 ring-white/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="More Colors & Custom Color Wheel"
        >
          <Palette className="w-3.5 h-3.5" />
        </button>

        {/* Thickness Quick Adjuster Button */}
        <button
          onClick={() => {
            setIsThicknessOpen(!isThicknessOpen);
            setIsColorPaletteOpen(false);
          }}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            isThicknessOpen
              ? 'bg-amber-500 text-white ring-2 ring-white/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Adjust Pen / Highlighter Thickness"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-slate-700/80 my-0.5" />

      {/* 4. Canvas Actions: Undo / Redo / Clear */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={undo}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (window.confirm('Clear all drawings on the board?')) {
              clearCanvas();
            }
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          title="Clear Whiteboard"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-slate-700/80 my-0.5" />

      {/* 5. Window / Fullscreen / Script / Exit Actions */}
      <div className="flex flex-col items-center gap-1">
        {/* Teacher Script / Teleprompter Toggle */}
        <button
          onClick={togglePresenterNotes}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isPresenterNotesOpen
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold scale-105 ring-1 ring-emerald-400'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
          }`}
          title="Teacher Script & Auto-Scroll Teleprompter (Alt+S)"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Toggle Fullscreen / Clean Borderless Window */}
        <button
          onClick={toggleFullscreen}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isFullscreen
              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={
            isFullscreen
              ? 'Exit Fullscreen (Returns to clean borderless window without Chrome cross)'
              : 'Toggle Fullscreen Mode'
          }
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Exit YouTube Mode */}
        <button
          onClick={() => {
            toggleYouTubeMode();
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
            }
          }}
          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-md"
          title="Exit YouTube Mode (Ctrl+Shift+F)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 6. More Colors Popout Drawer (Floats to the right)       */}
      {/* ======================================================== */}
      {isColorPaletteOpen && (
        <div className="absolute left-full ml-3 top-0 w-60 bg-[#161926]/98 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 duration-150 text-slate-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isHighlighter ? 'Highlighter Colors' : 'Pen Presentation Colors'}
            </span>
            <button
              onClick={() => setIsColorPaletteOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Grid of All Available Colors */}
          <div className="grid grid-cols-5 gap-2 mb-3">
            {fullPalette.map((item) => {
              const isSelected = currentColor.toLowerCase() === item.hex.toLowerCase();
              const isWhite = item.hex === '#ffffff';

              return (
                <button
                  key={item.hex}
                  onClick={() => {
                    handleColorChange(item.hex);
                  }}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#161926] shadow-md'
                      : 'hover:scale-105 opacity-90 hover:opacity-100'
                  } ${isWhite ? 'border border-slate-400' : ''}`}
                  style={{ backgroundColor: item.hex }}
                  title={item.name}
                />
              );
            })}
          </div>

          {/* Custom Color Wheel Picker */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Custom Color</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => customColorInputRef.current?.click()}
                className="w-6 h-6 rounded-full border border-slate-500 shadow-sm hover:scale-110 transition-transform overflow-hidden flex-shrink-0"
                style={{
                  background:
                    'conic-gradient(from 90deg, red, yellow, lime, aqua, blue, magenta, red)',
                }}
                title="Custom Color Wheel"
              />
              <span className="text-[11px] font-mono text-slate-300 uppercase">
                {currentColor}
              </span>
              <input
                ref={customColorInputRef}
                type="color"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="opacity-0 w-0 h-0 pointer-events-none absolute"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. Thickness Quick Adjuster Popout (Floats to the right) */}
      {/* ======================================================== */}
      {isThicknessOpen && (
        <div className="absolute left-full ml-3 top-28 w-56 bg-[#161926]/98 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 duration-150 text-slate-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isHighlighter ? 'Highlighter Width' : 'Pen Thickness'}
            </span>
            <button
              onClick={() => setIsThicknessOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {isHighlighter ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Current:</span>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {highlighterSize}px
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="100"
                step="1"
                value={highlighterSize}
                onChange={(e) => setHighlighterSize(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex items-center justify-between gap-1">
                {HIGHLIGHTER_PRESETS.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setHighlighterSize(sz)}
                    className={`px-1.5 py-1 text-[10px] rounded-lg font-medium transition-all ${
                      highlighterSize === sz
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Current:</span>
                <span className="text-xs font-bold text-[#a5b4fc] font-mono">
                  {penThickness}px
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="16.0"
                step="0.1"
                value={penThickness}
                onChange={(e) => setPenThickness(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#5B50E6]"
              />
              <div className="flex items-center justify-between gap-1">
                {PEN_PRESETS.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setPenThickness(sz)}
                    className={`px-1.5 py-1 text-[10px] rounded-lg font-medium transition-all ${
                      penThickness === sz
                        ? 'bg-[#5B50E6] text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hardware Palm Rejection Toggle */}
          <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-300">Palm Rejection</span>
              <span className="text-[9px] text-slate-500">Stylus Priority Protection</span>
            </div>
            <button
              onClick={togglePalmRejection}
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider transition-colors ${
                isPalmRejectionEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isPalmRejectionEnabled ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
