import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer,
  Pen,
  Highlighter,
  Eraser,
  Type,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Image as ImageIcon,
  Shapes,
  ChevronDown,
  Sparkles,
  Grid,
  Zap,
  Clock,
  BookOpen,
  Presentation,
  ShieldCheck,
} from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { useUIStore } from '../../store/uiStore';
import { ToolType } from '../../types/canvas';
import { ColorPicker } from './ColorPicker';
import { BackgroundSelector } from '../background-selector/BackgroundSelector';
import { uploadApi } from '../../services/uploadApi';

interface ToolItem {
  id: ToolType;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
}

const PRIMARY_TOOLS: ToolItem[] = [
  { id: 'select', label: 'Select (V)', icon: MousePointer, shortcut: 'V' },
  { id: 'pen', label: 'Pen (P)', icon: Pen, shortcut: 'P' },
  { id: 'smart-shape', label: 'Smart Shapes (S)', icon: Sparkles, shortcut: 'S' },
  { id: 'highlighter', label: 'Highlighter', icon: Highlighter },
  { id: 'eraser', label: 'Eraser (E)', icon: Eraser, shortcut: 'E' },
  { id: 'laser', label: 'Laser Pointer', icon: Zap },
  { id: 'text', label: 'Text (T)', icon: Type, shortcut: 'T' },
];





const ERASER_SIZES = [
  { size: 16, label: '16px' },
  { size: 32, label: '32px' },
  { size: 64, label: '64px' },
  { size: 96, label: '96px' },
];

export const Toolbar: React.FC = () => {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const addElement = useCanvasStore((s) => s.addElement);
  const viewport = useCanvasStore((s) => s.viewport);

  // Pen, Eraser, Smart Drawing, Snap
  const penThickness = useCanvasStore((s) => s.penThickness);
  const setPenThickness = useCanvasStore((s) => s.setPenThickness);
  const highlighterSize = useCanvasStore((s) => s.highlighterSize);
  const setHighlighterSize = useCanvasStore((s) => s.setHighlighterSize);
  const eraserSize = useCanvasStore((s) => s.eraserSize);
  const setEraserSize = useCanvasStore((s) => s.setEraserSize);
  const isGridSnapEnabled = useCanvasStore((s) => s.isGridSnapEnabled);
  const toggleGridSnap = useCanvasStore((s) => s.toggleGridSnap);
  const isPalmRejectionEnabled = useCanvasStore((s) => s.isPalmRejectionEnabled);
  const togglePalmRejection = useCanvasStore((s) => s.togglePalmRejection);

  // Custom Pen Thickness text input state
  const [thicknessInput, setThicknessInput] = useState<string>(penThickness.toString());

  useEffect(() => {
    setThicknessInput(penThickness.toString());
  }, [penThickness]);

  const handleCustomThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setThicknessInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 32) {
      setPenThickness(Math.round(parsed * 10) / 10);
    }
  };

  const handleCustomThicknessBlur = () => {
    const parsed = parseFloat(thicknessInput);
    if (isNaN(parsed) || parsed < 0.5) {
      setPenThickness(2.8);
      setThicknessInput('2.8');
    } else if (parsed > 32) {
      setPenThickness(32);
      setThicknessInput('32');
    } else {
      const rounded = Math.round(parsed * 10) / 10;
      setPenThickness(rounded);
      setThicknessInput(rounded.toString());
    }
  };

  // Dynamic Highlighter Thickness state (up to 100px)
  const [highlighterInput, setHighlighterInput] = useState<string>(highlighterSize.toString());

  useEffect(() => {
    setHighlighterInput(highlighterSize.toString());
  }, [highlighterSize]);

  const handleHighlighterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHighlighterInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 4 && parsed <= 100) {
      setHighlighterSize(Math.round(parsed));
    }
  };

  const handleHighlighterInputBlur = () => {
    const parsed = parseFloat(highlighterInput);
    if (isNaN(parsed) || parsed < 4) {
      setHighlighterSize(28);
      setHighlighterInput('28');
    } else if (parsed > 100) {
      setHighlighterSize(100);
      setHighlighterInput('100');
    } else {
      const rounded = Math.round(parsed);
      setHighlighterSize(rounded);
      setHighlighterInput(rounded.toString());
    }
  };

  // Teacher tools from UIStore (Only Countdown, Presenter Notes, Slide Deck)
  const toggleTimer = useUIStore((s) => s.toggleTimer);
  const isTimerActive = useUIStore((s) => s.isTimerActive);
  const togglePresenterNotes = useUIStore((s) => s.togglePresenterNotes);
  const isPresenterNotesOpen = useUIStore((s) => s.isPresenterNotesOpen);
  const toggleSlideMode = useUIStore((s) => s.toggleSlideMode);
  const isSlideModeActive = useUIStore((s) => s.isSlideModeActive);

  // Dropdown states
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  const [isTeacherMenuOpen, setIsTeacherMenuOpen] = useState(false);
  const teacherMenuRef = useRef<HTMLDivElement>(null);
  const shapesMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (teacherMenuRef.current && !teacherMenuRef.current.contains(e.target as Node)) {
        setIsTeacherMenuOpen(false);
      }
      if (shapesMenuRef.current && !shapesMenuRef.current.contains(e.target as Node)) {
        setIsShapesOpen(false);
      }
    };
    if (isTeacherMenuOpen || isShapesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTeacherMenuOpen, isShapesOpen]);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadApi.uploadImage(file);
      const insertX = Math.max(-viewport.x + 300, 80);
      const insertY = Math.max(-viewport.y + 150, 80);

      addElement({
        id: `img-${Date.now()}`,
        type: 'image',
        src: res.url,
        x: insertX,
        y: insertY,
        width: 320,
        height: 240,
        originalWidth: res.width || 320,
        originalHeight: res.height || 240,
        zIndex: 5,
      });
      setActiveTool('select');
    } catch (err) {
      console.error('Failed to load image', err);
    }
  };

  return (
    <div className="relative flex items-center justify-between px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0f111a]/95 backdrop-blur-md border-b border-[#EAE5DC] dark:border-slate-800 text-slate-800 dark:text-slate-200 z-40 select-none shadow-2xs overflow-visible">
      {/* Left: Tools List + Contextual Properties in a Unified Non-overlapping Flow */}
      <div className="flex items-center gap-1 flex-shrink-0 overflow-visible">
        {/* Tool Icons */}
        <div className="flex items-center gap-0.5 bg-white dark:bg-[#161926] p-1 rounded-xl border border-[#EAE5DC] dark:border-slate-800 shadow-2xs">
          {PRIMARY_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 text-[#5B50E6] dark:text-[#a5b4fc] shadow-xs font-semibold ring-1 ring-[#5B50E6]/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[#FAF8F5] dark:hover:bg-slate-800/80'
                }`}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}

          {/* Shapes Dropdown Tool */}
          <div className="relative" ref={shapesMenuRef}>
            <button
              onClick={() => setIsShapesOpen(!isShapesOpen)}
              className={`h-9 px-1.5 rounded-lg flex items-center gap-0.5 transition-all flex-shrink-0 ${
                ['rectangle', 'circle', 'arrow', 'line', 'rounded-rectangle', 'triangle'].includes(activeTool)
                  ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 text-[#5B50E6] dark:text-[#a5b4fc] shadow-xs ring-1 ring-[#5B50E6]/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[#FAF8F5] dark:hover:bg-slate-800/80'
              }`}
              title="Geometry Shapes"
            >
              <Shapes className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isShapesOpen && (
              <div className="absolute left-0 top-full mt-2 w-44 bg-white dark:bg-[#161926] rounded-xl shadow-2xl border border-[#EAE5DC] dark:border-slate-700/80 p-1.5 z-50 space-y-0.5 animate-in fade-in slide-in-from-top-1 text-slate-700 dark:text-slate-300">
                <button
                  onClick={() => {
                    setActiveTool('rectangle');
                    setIsShapesOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#FAF8F5] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg flex items-center gap-2"
                >
                  <Square className="w-3.5 h-3.5 text-[#5B50E6]" />
                  Rectangle
                </button>
                <button
                  onClick={() => {
                    setActiveTool('circle');
                    setIsShapesOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#FAF8F5] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg flex items-center gap-2"
                >
                  <Circle className="w-3.5 h-3.5 text-emerald-500" />
                  Circle
                </button>
                <button
                  onClick={() => {
                    setActiveTool('arrow');
                    setIsShapesOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#FAF8F5] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg flex items-center gap-2"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                  Arrow
                </button>
                <button
                  onClick={() => {
                    setActiveTool('line');
                    setIsShapesOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#FAF8F5] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg flex items-center gap-2"
                >
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                  Line
                </button>
                <button
                  onClick={() => {
                    setActiveTool('triangle');
                    setIsShapesOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#FAF8F5] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg flex items-center gap-2"
                >
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-rose-500" />
                  Triangle
                </button>
              </div>
            )}
          </div>

          {/* Image Upload Tool */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[#FAF8F5] dark:hover:bg-slate-800/80 transition-all flex-shrink-0"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-[#EAE5DC] dark:bg-slate-800 mx-1 flex-shrink-0" />

        {/* Dynamic Contextual Properties for Currently Selected Tool */}
        <div className="flex items-center flex-shrink-0">
          {/* 1. Custom Pen Thickness: Direct decimal input (e.g., 2.4, 2.9, 3.2), live dot preview, range slider & presets */}
          {activeTool === 'pen' && (
            <div className="flex items-center gap-2 bg-white dark:bg-[#161926] px-2.5 py-1 rounded-xl border border-[#EAE5DC] dark:border-slate-800 shadow-2xs animate-in fade-in">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Thickness</span>

              {/* Dynamic live preview dot */}
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" title={`Current thickness: ${penThickness}px`}>
                <div
                  className="rounded-full bg-[#5B50E6] dark:bg-[#818cf8] transition-all"
                  style={{
                    width: `${Math.min(Math.max(penThickness * 1.5, 3), 14)}px`,
                    height: `${Math.min(Math.max(penThickness * 1.5, 3), 14)}px`,
                  }}
                />
              </div>

              {/* Direct decimal number input (allows 2.4, 2.9, 3.2, etc.) */}
              <div className="flex items-center gap-0.5 bg-[#FAF8F5] dark:bg-slate-800/80 px-1.5 py-0.5 rounded-lg border border-[#EAE5DC]/80 dark:border-slate-700/60 focus-within:ring-1 focus-within:ring-[#5B50E6]">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="32"
                  value={thicknessInput}
                  onChange={handleCustomThicknessChange}
                  onBlur={handleCustomThicknessBlur}
                  className="w-10 text-center text-xs font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  title="Type any custom thickness (e.g. 2.4, 2.9, 3.2)"
                />
                <span className="text-[10px] text-slate-400 font-medium select-none">px</span>
              </div>

              {/* Slider for smooth continuous dragging */}
              <input
                type="range"
                min="0.8"
                max="16.0"
                step="0.1"
                value={penThickness}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPenThickness(val);
                  setThicknessInput(val.toFixed(1));
                }}
                className="w-14 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#5B50E6]"
                title={`Drag to adjust: ${penThickness}px`}
              />

              {/* Quick Preset Chips */}
              <div className="flex items-center gap-0.5 bg-[#FAF8F5] dark:bg-slate-800/80 p-0.5 rounded-lg border border-[#EAE5DC]/60 dark:border-transparent">
                {[
                  { size: 2.0, label: '2.0' },
                  { size: 2.8, label: '2.8' },
                  { size: 3.5, label: '3.5' },
                  { size: 5.0, label: '5.0' },
                  { size: 8.0, label: '8.0' },
                ].map((item) => (
                  <button
                    key={item.size}
                    onClick={() => {
                      setPenThickness(item.size);
                      setThicknessInput(item.size.toString());
                    }}
                    className={`h-6 px-1.5 rounded-md text-[10px] font-medium transition-all ${
                      penThickness === item.size
                        ? 'bg-[#5B50E6] text-white font-bold ring-1 ring-[#5B50E6]/40 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700/60'
                    }`}
                    title={`${item.label}px Pen Preset`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Palm Guard Rejection Button */}
              <button
                onClick={togglePalmRejection}
                className={`h-6 px-2 rounded-md text-[10px] font-semibold transition-all border flex items-center gap-1 ${
                  isPalmRejectionEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-700/50'
                    : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}
                title="Hardware Stylus Palm Rejection (Prevents accidental palm touch smudges while writing)"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Palm Guard: {isPalmRejectionEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          )}

          {/* 2. Smart Shapes Mode Active */}
          {activeTool === 'smart-shape' && (
            <div className="flex items-center gap-2 bg-[#EEEDFC] dark:bg-purple-950/30 border border-[#5B50E6]/30 dark:border-purple-500/40 px-2.5 py-1 rounded-xl animate-in fade-in">
              <div className="flex items-center gap-1 text-[#5B50E6] dark:text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Auto-Snap</span>
              </div>
              <div className="flex items-center gap-0.5 bg-white/80 dark:bg-slate-900/80 p-0.5 rounded-lg border border-[#5B50E6]/20">
                {[2, 4, 6, 10].map((size) => (
                  <button
                    key={size}
                    onClick={() => setPenThickness(size)}
                    className={`h-6 px-1.5 rounded-md text-[10px] transition-all ${
                      penThickness === size
                        ? 'bg-[#5B50E6] text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-[#5B50E6]/80 dark:text-purple-300/80 hidden lg:inline">
                Circle, Rect, Line, Triangle
              </span>
            </div>
          )}

          {/* 3. Dynamic Highlighter Width (up to 100px) */}
          {activeTool === 'highlighter' && (
            <div className="flex items-center gap-2 bg-amber-50/90 dark:bg-[#161926] px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800/40 shadow-2xs animate-in fade-in">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold tracking-wider">
                Width
              </span>

              {/* Dynamic live preview indicator */}
              <div
                className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                title={`Highlighter width: ${highlighterSize}px`}
              >
                <div
                  className="rounded-xs bg-amber-400 dark:bg-amber-300 opacity-80 transition-all"
                  style={{
                    width: '14px',
                    height: `${Math.min(Math.max((highlighterSize / 100) * 16, 3), 16)}px`,
                  }}
                />
              </div>

              {/* Direct number input (Allows up to 100px dynamic entry) */}
              <div className="flex items-center gap-0.5 bg-white dark:bg-slate-800/80 px-1.5 py-0.5 rounded-lg border border-amber-300/60 dark:border-slate-700/60 focus-within:ring-1 focus-within:ring-amber-500">
                <input
                  type="number"
                  min="4"
                  max="100"
                  step="1"
                  value={highlighterInput}
                  onChange={handleHighlighterInputChange}
                  onBlur={handleHighlighterInputBlur}
                  className="w-11 text-center text-xs font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  title="Dynamic highlighter width (4px to 100px)"
                />
                <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 font-medium select-none">
                  px
                </span>
              </div>

              {/* Continuous range slider up to 100px */}
              <input
                type="range"
                min="6"
                max="100"
                step="1"
                value={highlighterSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setHighlighterSize(val);
                  setHighlighterInput(val.toString());
                }}
                className="w-16 h-1 bg-amber-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                title={`Slide to adjust width: ${highlighterSize}px`}
              />

              {/* Quick Preset Chips */}
              <div className="flex items-center gap-0.5 bg-white/90 dark:bg-slate-800/80 p-0.5 rounded-lg border border-amber-200/60 dark:border-transparent">
                {[16, 28, 48, 72, 100].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setHighlighterSize(size);
                      setHighlighterInput(size.toString());
                    }}
                    className={`h-6 px-1.5 rounded-md text-[10px] font-medium transition-all ${
                      highlighterSize === size
                        ? 'bg-amber-500 text-white font-bold shadow-2xs'
                        : 'text-amber-800 dark:text-slate-300 hover:text-amber-950 dark:hover:text-white hover:bg-amber-100/60 dark:hover:bg-slate-700/60'
                    }`}
                    title={`${size}px Highlighter`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Eraser Size */}
          {activeTool === 'eraser' && (
            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-red-950/30 border border-rose-200 dark:border-red-500/40 px-2.5 py-1 rounded-xl shadow-2xs animate-in fade-in">
              <span className="text-[10px] text-rose-600 dark:text-red-400 uppercase font-bold tracking-wider">Eraser</span>
              <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900/80 p-0.5 rounded-lg border border-rose-200/60 dark:border-transparent">
                {ERASER_SIZES.map((opt) => (
                  <button
                    key={opt.size}
                    onClick={() => setEraserSize(opt.size)}
                    className={`h-6 px-1.5 rounded-md text-[10px] font-medium transition-all ${
                      eraserSize === opt.size
                        ? 'bg-rose-600 text-white font-bold ring-1 ring-rose-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Laser Pointer Active Notice */}
          {activeTool === 'laser' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px] animate-in fade-in">
              <Zap className="w-3.5 h-3.5 text-rose-500" />
              <span>Laser Pointer (4px)</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Teacher Mode, Snap Toggle, Color Palette & Background Selector */}
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto pl-2 overflow-visible">
        {/* Teacher Mode Dropdown (Only Countdown, Presenter Notes, Slide Deck Mode) */}
        <div className="relative flex-shrink-0" ref={teacherMenuRef}>
          <button
            onClick={() => setIsTeacherMenuOpen(!isTeacherMenuOpen)}
            className={`flex items-center gap-1.5 h-9 px-2.5 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap flex-shrink-0 ${
              isTeacherMenuOpen || isTimerActive || isPresenterNotesOpen || isSlideModeActive
                ? 'bg-[#10B981] text-white shadow-xs border-[#10B981]'
                : 'bg-white dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 border-[#EAE5DC] dark:border-emerald-800/40 shadow-2xs'
            }`}
            title="Teacher Presentation Mode"
          >
            <Presentation className="w-4 h-4" />
            <span className="text-[11px]">Teacher</span>
            <ChevronDown className={`w-3 h-3 opacity-70 transition-transform duration-150 ${isTeacherMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTeacherMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#161926] rounded-2xl shadow-2xl border border-[#EAE5DC] dark:border-slate-700/80 p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-1 text-slate-700 dark:text-slate-200">
              <div className="px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Teacher Presentation
              </div>

              {/* 1. Countdown Timer */}
              <button
                onClick={() => {
                  toggleTimer();
                  setIsTeacherMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-2 text-xs rounded-xl flex items-center justify-between transition-colors ${
                  isTimerActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-[#FAF8F5] dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Countdown Timer</span>
                </div>
                {isTimerActive && <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold">Active</span>}
              </button>

              {/* 2. Presenter Notes */}
              <button
                onClick={() => {
                  togglePresenterNotes();
                  setIsTeacherMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-2 text-xs rounded-xl flex items-center justify-between transition-colors ${
                  isPresenterNotesOpen
                    ? 'bg-[#EEEDFC] dark:bg-purple-500/20 text-[#5B50E6] dark:text-purple-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-[#FAF8F5] dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#5B50E6]" />
                  <span>Presenter Notes</span>
                </div>
                {isPresenterNotesOpen && <span className="text-[10px] text-[#5B50E6] bg-[#EEEDFC] px-1.5 py-0.5 rounded font-bold">Open</span>}
              </button>

              {/* 3. Slide Deck Mode */}
              <button
                onClick={() => {
                  toggleSlideMode();
                  setIsTeacherMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-2 text-xs rounded-xl flex items-center justify-between transition-colors ${
                  isSlideModeActive
                    ? 'bg-rose-50 dark:bg-red-500/20 text-rose-700 dark:text-red-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-[#FAF8F5] dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-rose-600" />
                  <span>Slide Deck Mode</span>
                </div>
                {isSlideModeActive && <span className="text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-bold">Live</span>}
              </button>
            </div>
          )}
        </div>

        {/* Snap Toggle Button */}
        <button
          onClick={toggleGridSnap}
          className={`flex items-center gap-1 h-9 px-2.5 rounded-xl text-xs transition-all border flex-shrink-0 ${
            isGridSnapEnabled
              ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 text-[#5B50E6] dark:text-[#a5b4fc] border-[#5B50E6]/30 font-semibold shadow-xs'
              : 'bg-white dark:bg-[#161926] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-[#EAE5DC] dark:border-slate-800 hover:bg-[#FAF8F5] shadow-2xs'
          }`}
          title="Toggle 20px Grid Snapping"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="text-[11px]">Snap</span>
        </button>

        {/* Color Palette */}
        <ColorPicker />

        {/* Background Selector */}
        <BackgroundSelector />
      </div>
    </div>
  );
};
