import React, { useRef, useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';

const STANDARD_LIGHT_COLORS = [
  { name: 'Dark Slate', hex: '#1e293b' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
];

const DARK_CANVAS_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Light Slate', hex: '#94a3b8' },
  { name: 'Yellow', hex: '#fde047' },
  { name: 'Cyan', hex: '#38bdf8' },
  { name: 'Green', hex: '#4ade80' },
  { name: 'Pink', hex: '#f472b6' },
  { name: 'Orange', hex: '#fb923c' },
  { name: 'Red', hex: '#f87171' },
  { name: 'Purple', hex: '#c084fc' },
  { name: 'Blue', hex: '#60a5fa' },
];

const HIGHLIGHTER_COLORS = [
  { name: 'Neon Yellow', hex: '#fef08a' },
  { name: 'Neon Green', hex: '#86efac' },
  { name: 'Sky Cyan', hex: '#7dd3fc' },
  { name: 'Neon Pink', hex: '#f472b6' },
  { name: 'Peach Orange', hex: '#fed7aa' },
  { name: 'Soft Lavender', hex: '#e9d5ff' },
  { name: 'Coral Red', hex: '#fca5a5' },
  { name: 'Lime Green', hex: '#bef264' },
];

export const ColorPicker: React.FC = () => {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const penColor = useCanvasStore((s) => s.penColor);
  const setPenColor = useCanvasStore((s) => s.setPenColor);
  const highlighterColor = useCanvasStore((s) => s.highlighterColor);
  const setHighlighterColor = useCanvasStore((s) => s.setHighlighterColor);
  const background = useCanvasStore((s) => s.background);

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

  const customColorInputRef = useRef<HTMLInputElement>(null);

  const isHighlighterMode = activeTool === 'highlighter';
  const currentColor = isHighlighterMode ? highlighterColor : penColor;

  // Automatically adjust default pen color contrast between light and dark canvas
  useEffect(() => {
    if (isDarkCanvas) {
      if (penColor === '#1e293b' || penColor === '#0f172a' || penColor === '#000000') {
        setPenColor('#ffffff');
      }
    } else {
      if (penColor === '#ffffff' || penColor === '#f8fafc') {
        setPenColor('#1e293b');
      }
    }
  }, [isDarkCanvas, penColor, setPenColor]);

  // Select palette based on tool: Highlighter has its own colors, Pen has its own colors
  const activePalette = isHighlighterMode
    ? HIGHLIGHTER_COLORS
    : isDarkCanvas
    ? DARK_CANVAS_COLORS
    : STANDARD_LIGHT_COLORS;

  const handleColorSelect = (hex: string) => {
    if (isHighlighterMode) {
      setHighlighterColor(hex);
    } else {
      setPenColor(hex);
    }
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-xl shadow-2xs flex-shrink-0 transition-colors ${
        isHighlighterMode
          ? 'bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40'
          : 'bg-white dark:bg-[#161926] border border-[#EAE5DC] dark:border-slate-700/80'
      }`}
      title={isHighlighterMode ? 'Highlighter Colors' : 'Pen Colors'}
    >
      {/* Tool label indicator */}
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 select-none mr-0.5 hidden xl:inline">
        {isHighlighterMode ? 'Highlight' : 'Ink'}
      </span>

      {activePalette.map((preset) => {
        const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase();
        const isWhiteShade = preset.hex === '#ffffff' || preset.hex === '#f8fafc';

        return (
          <button
            key={preset.hex}
            onClick={() => handleColorSelect(preset.hex)}
            className={`w-4 h-4 rounded-full transition-transform flex-shrink-0 ${
              isSelected
                ? 'scale-125 ring-2 ring-[#5B50E6] ring-offset-1 ring-offset-white dark:ring-offset-[#161926]'
                : 'hover:scale-110'
            } ${isWhiteShade ? 'border border-slate-300 dark:border-white/40' : ''}`}
            style={{ backgroundColor: preset.hex }}
            title={preset.name}
          />
        );
      })}

      {/* Custom Color Wheel Button */}
      <div className="relative flex items-center ml-0.5">
        <button
          onClick={() => customColorInputRef.current?.click()}
          className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs hover:scale-110 transition-transform overflow-hidden flex-shrink-0"
          style={{
            background:
              'conic-gradient(from 90deg, red, yellow, lime, aqua, blue, magenta, red)',
          }}
          title={`Custom ${isHighlighterMode ? 'Highlighter' : 'Pen'} Color`}
        />
        <input
          ref={customColorInputRef}
          type="color"
          value={currentColor}
          onChange={(e) => handleColorSelect(e.target.value)}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
        />
      </div>
    </div>
  );
};
