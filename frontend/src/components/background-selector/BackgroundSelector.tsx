import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { BackgroundStyle, BackgroundConfig } from '../../types/canvas';
import {
  ChevronDown,
  Sparkles,
  Star,
  X,
  Sliders,
  Check,
  Palette,
  Eye,
  RotateCcw,
} from 'lucide-react';

interface BackgroundItem {
  id: BackgroundStyle;
  name: string;
  category: 'solid' | 'paper' | 'tech';
  description: string;
  previewBg: string;
  previewStyle?: React.CSSProperties;
  defaultConfig: Partial<BackgroundConfig>;
}

// 12 Curated YouTube Backgrounds + Tech variants
const BACKGROUND_CATALOG: BackgroundItem[] = [
  // 1. Soft White (Recommended Default)
  {
    id: 'soft-white',
    name: 'Soft White',
    category: 'solid',
    description: 'Warmer than white, easy on eyes',
    previewBg: '#FAFAF8',
    defaultConfig: { style: 'soft-white' },
  },
  // 2. Pure White
  {
    id: 'white',
    name: 'Pure White',
    category: 'solid',
    description: 'Cleanest contrast for coding',
    previewBg: '#FFFFFF',
    defaultConfig: { style: 'white' },
  },
  // 3. Light Gray
  {
    id: 'light-gray',
    name: 'Light Gray',
    category: 'solid',
    description: 'Subtle contrast for diagrams',
    previewBg: '#F5F5F5',
    defaultConfig: { style: 'light-gray' },
  },
  // 4. Cream
  {
    id: 'cream',
    name: 'Warm Cream',
    category: 'solid',
    description: 'Paper warmth for handwriting',
    previewBg: '#FFF7E6',
    defaultConfig: { style: 'cream' },
  },
  // 5. Pale Blue
  {
    id: 'pale-blue',
    name: 'Pale Blue',
    category: 'solid',
    description: 'Clean tint for schemas',
    previewBg: '#EFF7FF',
    defaultConfig: { style: 'pale-blue' },
  },
  // 6. YouTube Dark
  {
    id: 'dark',
    name: 'YouTube Dark',
    category: 'solid',
    description: 'High contrast dark canvas',
    previewBg: '#111318',
    defaultConfig: { style: 'dark' },
  },
  // 7. Deep Navy
  {
    id: 'navy',
    name: 'Deep Navy',
    category: 'solid',
    description: 'Cloud, AWS & system design',
    previewBg: '#0B1220',
    defaultConfig: { style: 'navy' },
  },
  // 8. Classic (Black + Dot)
  {
    id: 'classic-black-dot',
    name: 'Classic (Black + Dot)',
    category: 'paper',
    description: 'Pitch black with clean slate alignment dots',
    previewBg: '#0B0D13',
    previewStyle: {
      backgroundImage: 'radial-gradient(#475569 1.5px, transparent 1.5px)',
      backgroundSize: '8px 8px',
    },
    defaultConfig: {
      style: 'classic-black-dot',
      gridSize: 28,
      gridOpacity: 0.65,
      dotSize: 1.5,
      patternColor: '#475569',
      customColor: '#0B0D13',
    },
  },
  // 9. Dotted Paper
  {
    id: 'dotted',
    name: 'Dotted Paper',
    category: 'paper',
    description: 'Alignment without visual noise',
    previewBg: '#FFFFFF',
    previewStyle: {
      backgroundImage: 'radial-gradient(#D9DDE3 1.5px, transparent 1.5px)',
      backgroundSize: '8px 8px',
    },
    defaultConfig: {
      style: 'dotted',
      gridSize: 28,
      gridOpacity: 0.85,
      dotSize: 1.5,
      patternColor: '#D9DDE3',
    },
  },
  // 10. Graph Paper
  {
    id: 'graph',
    name: 'Graph Paper',
    category: 'paper',
    description: 'Grids for algorithms & DSA',
    previewBg: '#FFFFFF',
    previewStyle: {
      backgroundImage:
        'linear-gradient(to right, #DDE3EA 1px, transparent 1px), linear-gradient(to bottom, #DDE3EA 1px, transparent 1px)',
      backgroundSize: '8px 8px',
    },
    defaultConfig: {
      style: 'graph',
      gridSize: 28,
      gridOpacity: 0.85,
      lineThickness: 0.8,
      patternColor: '#DDE3EA',
    },
  },
  // 11. Ruled Notebook
  {
    id: 'ruled',
    name: 'Ruled Notebook',
    category: 'paper',
    description: 'Notebook lines & margin guide',
    previewBg: '#FFFDF7',
    previewStyle: {
      backgroundImage: 'linear-gradient(to bottom, transparent 7px, #D8E0EA 7px, #D8E0EA 8px)',
      backgroundSize: '100% 8px',
    },
    defaultConfig: {
      style: 'ruled',
      lineSpacing: 28,
      gridOpacity: 0.85,
      lineThickness: 0.8,
      patternColor: '#D8E0EA',
    },
  },
  // 12. Blueprint
  {
    id: 'blueprint',
    name: 'Blueprint',
    category: 'tech',
    description: 'Architecture & schema grid',
    previewBg: '#0F2A43',
    previewStyle: {
      backgroundImage:
        'linear-gradient(to right, #315A78 1px, transparent 1px), linear-gradient(to bottom, #315A78 1px, transparent 1px)',
      backgroundSize: '8px 8px',
    },
    defaultConfig: {
      style: 'blueprint',
      gridSize: 28,
      gridOpacity: 0.85,
      lineThickness: 0.8,
      patternColor: '#315A78',
    },
  },
  // Additional tech styles
  {
    id: 'midnight-grid',
    name: 'Midnight Grid',
    category: 'tech',
    description: 'Deep navy system design grid',
    previewBg: '#0B1220',
    previewStyle: {
      backgroundImage:
        'linear-gradient(to right, #1E293B 1px, transparent 1px), linear-gradient(to bottom, #1E293B 1px, transparent 1px)',
      backgroundSize: '8px 8px',
    },
    defaultConfig: {
      style: 'midnight-grid',
      gridSize: 28,
      gridOpacity: 0.85,
      lineThickness: 0.8,
      patternColor: '#1E293B',
    },
  },
  {
    id: 'dark-dots',
    name: 'Dark Dots',
    category: 'tech',
    description: 'Dark canvas with dot matrix',
    previewBg: '#111318',
    previewStyle: {
      backgroundImage: 'radial-gradient(#334155 1.5px, transparent 1.5px)',
      backgroundSize: '8px 8px',
    },
    defaultConfig: {
      style: 'dark-dots',
      gridSize: 28,
      gridOpacity: 0.85,
      dotSize: 1.5,
      patternColor: '#334155',
    },
  },
  {
    id: 'black',
    name: 'Pitch Black',
    category: 'solid',
    description: 'Pure OLED black background',
    previewBg: '#090A0F',
    defaultConfig: { style: 'black' },
  },
];

interface YouTubePreset {
  id: string;
  name: string;
  tag: string;
  recommendedFor: string;
  backgroundStyle: BackgroundStyle;
  previewBg: string;
  previewStyle?: React.CSSProperties;
  config: Partial<BackgroundConfig>;
}

const YOUTUBE_PRESETS: YouTubePreset[] = [
  {
    id: 'yt-clean',
    name: 'Clean',
    tag: 'Soft White',
    recommendedFor: 'YouTube coding & tutorials',
    backgroundStyle: 'soft-white',
    previewBg: '#FAFAF8',
    config: { style: 'soft-white' },
  },
  {
    id: 'yt-classic',
    name: 'Classic',
    tag: 'White + Dots',
    recommendedFor: 'Flowcharts & UI layouts',
    backgroundStyle: 'dotted',
    previewBg: '#FFFFFF',
    previewStyle: {
      backgroundImage: 'radial-gradient(#D9DDE3 1.5px, transparent 1.5px)',
      backgroundSize: '8px 8px',
    },
    config: {
      style: 'dotted',
      gridSize: 28,
      gridOpacity: 0.85,
      dotSize: 1.5,
      patternColor: '#D9DDE3',
    },
  },
  {
    id: 'yt-notebook',
    name: 'Notebook',
    tag: 'Cream + Lines',
    recommendedFor: 'Pen handwriting & lectures',
    backgroundStyle: 'ruled',
    previewBg: '#FFFDF7',
    previewStyle: {
      backgroundImage: 'linear-gradient(to bottom, transparent 7px, #D8E0EA 7px, #D8E0EA 8px)',
      backgroundSize: '100% 8px',
    },
    config: {
      style: 'ruled',
      lineSpacing: 28,
      gridOpacity: 0.85,
      lineThickness: 0.8,
      patternColor: '#D8E0EA',
    },
  },
  {
    id: 'yt-grid',
    name: 'Grid',
    tag: 'White + Grid',
    recommendedFor: 'Algorithms & data structures',
    backgroundStyle: 'graph',
    previewBg: '#FFFFFF',
    previewStyle: {
      backgroundImage:
        'linear-gradient(to right, #DDE3EA 1px, transparent 1px), linear-gradient(to bottom, #DDE3EA 1px, transparent 1px)',
      backgroundSize: '8px 8px',
    },
    config: {
      style: 'graph',
      gridSize: 28,
      gridOpacity: 0.85,
      lineThickness: 0.8,
      patternColor: '#DDE3EA',
    },
  },
  {
    id: 'yt-dark',
    name: 'Dark',
    tag: '#111318',
    recommendedFor: 'Dark-mode videos & neon ink',
    backgroundStyle: 'dark',
    previewBg: '#111318',
    config: { style: 'dark' },
  },
  {
    id: 'yt-midnight',
    name: 'Midnight',
    tag: 'Navy + Grid',
    recommendedFor: 'Cloud architecture & AWS',
    backgroundStyle: 'midnight-grid',
    previewBg: '#0B1220',
    previewStyle: {
      backgroundImage:
        'linear-gradient(to right, #1E293B 1px, transparent 1px), linear-gradient(to bottom, #1E293B 1px, transparent 1px)',
      backgroundSize: '8px 8px',
    },
    config: {
      style: 'midnight-grid',
      gridSize: 28,
      gridOpacity: 0.85,
      lineThickness: 0.8,
      patternColor: '#1E293B',
    },
  },
  {
    id: 'yt-blueprint',
    name: 'Blueprint',
    tag: 'Blue + Grid',
    recommendedFor: 'Backend & DB schemas',
    backgroundStyle: 'blueprint',
    previewBg: '#0F2A43',
    previewStyle: {
      backgroundImage:
        'linear-gradient(to right, #315A78 1px, transparent 1px), linear-gradient(to bottom, #315A78 1px, transparent 1px)',
      backgroundSize: '8px 8px',
    },
    config: {
      style: 'blueprint',
      gridSize: 28,
      gridOpacity: 0.85,
      lineThickness: 0.8,
      patternColor: '#315A78',
    },
  },
  {
    id: 'yt-classic-black-dot',
    name: 'Classic (Black + Dot)',
    tag: 'Black + Dot',
    recommendedFor: 'YouTube teaching & programming',
    backgroundStyle: 'classic-black-dot',
    previewBg: '#0B0D13',
    previewStyle: {
      backgroundImage: 'radial-gradient(#475569 1.5px, transparent 1.5px)',
      backgroundSize: '8px 8px',
    },
    config: {
      style: 'classic-black-dot',
      gridSize: 28,
      gridOpacity: 0.65,
      dotSize: 1.5,
      patternColor: '#475569',
      customColor: '#0B0D13',
    },
  },
];

const POPULAR_CUSTOM_COLORS = [
  { label: 'Soft White', hex: '#FAFAF8' },
  { label: 'Pure White', hex: '#FFFFFF' },
  { label: 'Warm Cream', hex: '#FFF7E6' },
  { label: 'Light Sage', hex: '#F0FDF4' },
  { label: 'Pale Blue', hex: '#EFF7FF' },
  { label: 'Light Gray', hex: '#F5F5F5' },
  { label: 'YouTube Dark', hex: '#111318' },
  { label: 'Deep Navy', hex: '#0B1220' },
  { label: 'Classic Black', hex: '#0B0D13' },
  { label: 'Pitch Black', hex: '#090A0F' },
];

const DEFAULT_FAVORITES: string[] = ['soft-white', 'dotted', 'dark', 'navy'];

export const BackgroundSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'presets' | 'solid' | 'paper' | 'tech' | 'settings'>('presets');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('myboard_bg_favorites');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_FAVORITES;
  });

  const [customHex, setCustomHex] = useState('#FAFAF8');
  const containerRef = useRef<HTMLDivElement>(null);

  const background = useCanvasStore((s) => s.background);
  const setBackground = useCanvasStore((s) => s.setBackground);

  // Sync custom hex with current background color
  useEffect(() => {
    if (background.customColor) {
      setCustomHex(background.customColor);
    }
  }, [background.customColor]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('myboard_bg_favorites', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const applyBackgroundConfig = (config: Partial<BackgroundConfig>) => {
    setBackground({
      ...background,
      ...config,
      customColor: config.style === 'custom' ? (config.customColor || customHex) : undefined,
    });
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex);
    setBackground({
      ...background,
      style:
        background.style === 'dotted' || background.style === 'graph' || background.style === 'ruled'
          ? background.style
          : 'custom',
      customColor: hex,
    });
  };

  // Identify active item for the toolbar trigger button
  const currentItem = useMemo(() => {
    const foundPreset = YOUTUBE_PRESETS.find((p) => p.backgroundStyle === background.style);
    if (foundPreset && !background.customColor) {
      return { name: foundPreset.name, bg: foundPreset.previewBg, style: foundPreset.previewStyle };
    }

    const foundCatalog = BACKGROUND_CATALOG.find((c) => c.id === background.style);
    if (foundCatalog) {
      return {
        name: foundCatalog.name,
        bg: background.customColor || foundCatalog.previewBg,
        style: foundCatalog.previewStyle,
      };
    }

    return { name: 'Custom', bg: background.customColor || '#FAFAF8' };
  }, [background]);

  const isPatternActive = [
    'dotted',
    'graph',
    'grid',
    'ruled',
    'notebook',
    'blueprint',
    'midnight-grid',
    'dark-dots',
  ].includes(background.style);

  return (
    <div ref={containerRef} className="relative select-none flex-shrink-0">
      {/* Toolbar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 h-9 px-2.5 rounded-xl border text-xs transition-all shadow-2xs flex-shrink-0 whitespace-nowrap ${
          isOpen
            ? 'bg-[#EEEDFC] dark:bg-[#5B50E6]/25 text-[#5B50E6] dark:text-[#a5b4fc] border-[#5B50E6]/40 dark:border-[#5B50E6]/50 font-semibold shadow-xs'
            : 'bg-white dark:bg-[#161926] hover:bg-[#FAF8F5] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#EAE5DC] dark:border-slate-750'
        }`}
        title="Background Studio - YouTube Presets & Styles"
      >
        <div
          className="w-4 h-4 rounded-md shadow-2xs border border-slate-300 dark:border-white/20 flex-shrink-0"
          style={{ backgroundColor: currentItem.bg, ...currentItem.style }}
        />
        <span className="font-semibold text-[11px] truncate max-w-[80px]">{currentItem.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Background Studio Modal / Popover */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1.5 w-[350px] max-h-[min(460px,calc(100vh-175px))] bg-white dark:bg-[#131622] rounded-2xl shadow-2xl border border-[#EAE5DC] dark:border-slate-700/80 flex flex-col overflow-hidden text-slate-800 dark:text-slate-200 z-50 animate-in fade-in slide-in-from-top-1"
          style={{ backdropFilter: 'blur(20px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#EAE5DC] dark:border-slate-800/80 bg-[#FAF8F5] dark:bg-[#161926]/90 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-[#EEEDFC] dark:bg-purple-500/20 text-[#5B50E6] dark:text-purple-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">Background Studio</h3>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">YouTube presets & canvas styles</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-[#EAE5DC] dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Favorites Bar */}
          <div className="px-3 py-1.5 bg-[#FAF8F5] dark:bg-slate-900/60 border-b border-[#EAE5DC] dark:border-slate-800/70 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                Favorites
              </span>
              <span className="text-[8px] text-slate-400">Star to pin</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {favorites.length === 0 ? (
                <span className="text-[10px] text-slate-400 italic">No favorites pinned yet</span>
              ) : (
                favorites.map((favId) => {
                  const catalogItem = BACKGROUND_CATALOG.find((c) => c.id === favId);
                  const presetItem = YOUTUBE_PRESETS.find((p) => p.id === favId);
                  const item = catalogItem || presetItem;
                  if (!item) return null;

                  const itemStyle = 'backgroundStyle' in item ? item.backgroundStyle : item.id;
                  const isSelected = background.style === itemStyle;
                  const previewBg = item.previewBg;
                  const previewStyle = item.previewStyle;
                  const label = item.name;

                  return (
                    <button
                      key={favId}
                      onClick={() => {
                        if (catalogItem) applyBackgroundConfig(catalogItem.defaultConfig);
                        else if (presetItem) applyBackgroundConfig(presetItem.config);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all flex-shrink-0 border ${
                        isSelected
                          ? 'bg-[#EEEDFC] text-[#5B50E6] border-[#5B50E6]/50 shadow-2xs font-semibold'
                          : 'bg-white dark:bg-[#181c2b] text-slate-700 dark:text-slate-300 border-[#EAE5DC] dark:border-slate-750 hover:bg-[#FAF8F5] dark:hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-sm border border-slate-300 dark:border-white/20 flex-shrink-0"
                        style={{ backgroundColor: previewBg, ...previewStyle }}
                      />
                      <span className="truncate max-w-[70px]">{label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-[#EAE5DC] dark:border-slate-800/80 bg-[#FAF8F5] dark:bg-[#141724] flex-shrink-0">
            {[
              { id: 'presets', label: '🎥 Presets' },
              { id: 'solid', label: 'Solid' },
              { id: 'paper', label: 'Paper' },
              { id: 'tech', label: 'Tech' },
              { id: 'settings', label: '⚙️ Tuning' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`flex-1 py-1 px-1 text-center text-[10px] rounded-lg transition-all ${
                  activeCategory === tab.id
                    ? 'bg-[#5B50E6] text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Body (Scrollable, with proper padding and clearance) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 overscroll-contain">
            {/* 1. YOUTUBE PRESETS TAB */}
            {activeCategory === 'presets' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    8 YouTube Teaching Presets
                  </span>
                  <span className="text-[8px] text-blue-400 font-medium">1080p Safe</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {YOUTUBE_PRESETS.map((preset) => {
                    const isSelected = background.style === preset.backgroundStyle && !background.customColor;
                    const isStarred = favorites.includes(preset.id) || favorites.includes(preset.backgroundStyle);

                    return (
                      <div
                        key={preset.id}
                        onClick={() => applyBackgroundConfig(preset.config)}
                        className={`group relative p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#EEEDFC] border-[#5B50E6] shadow-2xs ring-1 ring-[#5B50E6]/30'
                            : 'bg-white dark:bg-[#181c2b] border-[#EAE5DC] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-[#FAF8F5] dark:hover:bg-[#1e2336]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div
                            className="w-5 h-5 rounded-md shadow-2xs border border-slate-300 dark:border-white/20 flex-shrink-0"
                            style={{ backgroundColor: preset.previewBg, ...preset.previewStyle }}
                          />
                          <button
                            onClick={(e) => toggleFavorite(preset.backgroundStyle, e)}
                            className="p-0.5 rounded text-slate-400 hover:text-amber-500 transition-colors"
                            title={isStarred ? 'Unstar' : 'Pin to Favorites'}
                          >
                            <Star
                              className={`w-3 h-3 ${
                                isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'
                              }`}
                            />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-semibold leading-tight ${isSelected ? 'text-[#5B50E6]' : 'text-slate-800 dark:text-white'}`}>{preset.name}</span>
                            <span className="text-[8px] font-medium text-slate-400">{preset.tag}</span>
                          </div>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{preset.recommendedFor}</p>
                        </div>

                        {isSelected && (
                          <div className="absolute top-1.5 right-6 text-[#5B50E6]">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. SOLID COLORS TAB */}
            {activeCategory === 'solid' && (
              <div className="space-y-2.5">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Curated Solid Backgrounds
                </div>

                <div className="grid grid-cols-1 gap-1">
                  {BACKGROUND_CATALOG.filter((item) => item.category === 'solid').map((item) => {
                    const isSelected = background.style === item.id && !background.customColor;
                    const isStarred = favorites.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => applyBackgroundConfig(item.defaultConfig)}
                        className={`flex items-center justify-between p-1.5 px-2 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#EEEDFC] border-[#5B50E6] text-[#5B50E6] font-semibold shadow-2xs'
                            : 'bg-white dark:bg-[#181c2b] border-[#EAE5DC] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-[#FAF8F5] dark:hover:bg-[#1e2336]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-4 h-4 rounded-md border border-slate-300 dark:border-white/20 shadow-2xs flex-shrink-0"
                            style={{ backgroundColor: item.previewBg }}
                          />
                          <div className="truncate">
                            <span className={`text-[11px] font-medium ${isSelected ? 'text-[#5B50E6] font-semibold' : 'text-slate-800 dark:text-white'}`}>{item.name}</span>
                            <span className="text-[9px] text-slate-400 ml-1.5 font-mono">{item.previewBg}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#5B50E6]" />}
                          <button
                            onClick={(e) => toggleFavorite(item.id, e)}
                            className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors"
                          >
                            <Star
                              className={`w-3 h-3 ${isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Color Input within Solid tab */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Palette className="w-3 h-3 text-[#5B50E6]" />
                    Custom Solid Color
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[10px]">#</span>
                      <input
                        type="text"
                        value={customHex.replace('#', '')}
                        onChange={(e) => {
                          const val = `#${e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)}`;
                          setCustomHex(val);
                          if (val.length === 7) {
                            handleCustomColorChange(val);
                          }
                        }}
                        placeholder="FAFAF8"
                        maxLength={6}
                        className="w-full bg-white dark:bg-[#181c2b] border border-[#EAE5DC] dark:border-slate-750 rounded-lg pl-6 pr-2 py-1 text-xs text-slate-800 dark:text-white font-mono focus:outline-none focus:border-[#5B50E6] uppercase"
                      />
                    </div>
                    <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#EAE5DC] dark:border-slate-750 bg-white dark:bg-[#181c2b] hover:bg-[#FAF8F5] dark:hover:bg-slate-800 cursor-pointer text-xs text-slate-700 dark:text-slate-300 transition-colors">
                      <div
                        className="w-3 h-3 rounded-full border border-slate-300 dark:border-white/30"
                        style={{ backgroundColor: customHex }}
                      />
                      <span className="text-[10px]">Pick</span>
                      <input
                        type="color"
                        value={customHex.startsWith('#') && customHex.length === 7 ? customHex : '#FAFAF8'}
                        onChange={(e) => handleCustomColorChange(e.target.value)}
                        className="opacity-0 w-0 h-0 absolute pointer-events-none"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PAPER TAB */}
            {activeCategory === 'paper' && (
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Paper Textures & Grids
                </div>

                <div className="space-y-1.5">
                  {BACKGROUND_CATALOG.filter((item) => item.category === 'paper').map((item) => {
                    const isSelected = background.style === item.id;
                    const isStarred = favorites.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => applyBackgroundConfig(item.defaultConfig)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#EEEDFC] border-[#5B50E6] shadow-2xs'
                            : 'bg-white dark:bg-[#181c2b] border-[#EAE5DC] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-[#FAF8F5] dark:hover:bg-[#1e2336]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-md border border-slate-300 dark:border-white/20 shadow-2xs"
                              style={{ backgroundColor: item.previewBg, ...item.previewStyle }}
                            />
                            <div>
                              <div className={`text-[11px] font-bold ${isSelected ? 'text-[#5B50E6]' : 'text-slate-800 dark:text-white'}`}>{item.name}</div>
                              <div className="text-[9px] text-slate-500 dark:text-slate-400">{item.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#5B50E6]" />}
                            <button
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors"
                            >
                              <Star
                                className={`w-3 h-3 ${isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. TECH TAB */}
            {activeCategory === 'tech' && (
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Architecture & Tech Grids
                </div>

                <div className="space-y-1.5">
                  {BACKGROUND_CATALOG.filter((item) => item.category === 'tech').map((item) => {
                    const isSelected = background.style === item.id;
                    const isStarred = favorites.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => applyBackgroundConfig(item.defaultConfig)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#EEEDFC] border-[#5B50E6] shadow-2xs'
                            : 'bg-white dark:bg-[#181c2b] border-[#EAE5DC] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-[#FAF8F5] dark:hover:bg-[#1e2336]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-md border border-slate-300 dark:border-white/20 shadow-2xs"
                              style={{ backgroundColor: item.previewBg, ...item.previewStyle }}
                            />
                            <div>
                              <div className={`text-[11px] font-bold ${isSelected ? 'text-[#5B50E6]' : 'text-slate-800 dark:text-white'}`}>{item.name}</div>
                              <div className="text-[9px] text-slate-500 dark:text-slate-400">{item.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#5B50E6]" />}
                            <button
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors"
                            >
                              <Star
                                className={`w-3 h-3 ${isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. FINE-TUNING TAB */}
            {activeCategory === 'settings' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-blue-400" />
                    Grid & Pattern Tuning
                  </span>
                  <span className="text-[8px] text-slate-400">Live</span>
                </div>

                {!isPatternActive && (
                  <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-start gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-[10px] text-slate-300">
                      Solid bg active. Switch to a grid or dots to tune:
                      <div className="flex gap-1.5 mt-1.5">
                        <button
                          onClick={() => applyBackgroundConfig({ style: 'dotted' })}
                          className="px-2 py-0.5 rounded bg-blue-600 text-white text-[9px] font-medium"
                        >
                          Dots
                        </button>
                        <button
                          onClick={() => applyBackgroundConfig({ style: 'graph' })}
                          className="px-2 py-0.5 rounded bg-slate-700 text-white text-[9px] font-medium"
                        >
                          Grid
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid Size / Spacing */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">Spacing / Size</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {background.gridSize || 28}px
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { label: 'Small', size: 18 },
                      { label: 'Medium', size: 28 },
                      { label: 'Large', size: 42 },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() =>
                          setBackground({
                            ...background,
                            gridSize: opt.size,
                            lineSpacing: opt.size,
                          })
                        }
                        className={`py-1 rounded-lg text-[10px] font-medium border transition-all ${
                          (background.gridSize || 28) === opt.size
                            ? 'bg-[#5B50E6] text-white border-[#5B50E6] font-bold shadow-2xs'
                            : 'bg-white dark:bg-[#181c2b] text-slate-700 dark:text-slate-300 border-[#EAE5DC] dark:border-slate-800 hover:bg-[#FAF8F5] dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Opacity Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-300">Pattern Contrast</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {Math.round((background.gridOpacity ?? 0.85) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.15"
                    max="1"
                    step="0.05"
                    value={background.gridOpacity ?? 0.85}
                    onChange={(e) =>
                      setBackground({
                        ...background,
                        gridOpacity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-[#5B50E6] h-1.5 bg-[#EAE5DC] dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Line Thickness / Dot Size */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-300">Thickness / Dot Size</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {background.lineThickness || 0.8}px
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { label: 'Thin', line: 0.5, dot: 1.0 },
                      { label: 'Medium', line: 0.8, dot: 1.5 },
                      { label: 'Thick', line: 1.5, dot: 2.2 },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() =>
                          setBackground({
                            ...background,
                            lineThickness: opt.line,
                            dotSize: opt.dot,
                          })
                        }
                        className={`py-1 rounded-lg text-[10px] font-medium border transition-all ${
                          (background.lineThickness || 0.8) === opt.line
                            ? 'bg-[#5B50E6] text-white border-[#5B50E6] font-bold shadow-2xs'
                            : 'bg-white dark:bg-[#181c2b] text-slate-700 dark:text-slate-300 border-[#EAE5DC] dark:border-slate-800 hover:bg-[#FAF8F5] dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset to Recommended Default Button */}
                <button
                  onClick={() =>
                    setBackground({
                      ...background,
                      gridSize: 28,
                      lineSpacing: 28,
                      gridOpacity: 0.85,
                      lineThickness: 0.8,
                      dotSize: 1.5,
                    })
                  }
                  className="w-full py-1.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl bg-white dark:bg-slate-800/50 hover:bg-[#FAF8F5] dark:hover:bg-slate-800 border border-[#EAE5DC] dark:border-slate-750 transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3 text-[#5B50E6]" />
                  Reset to Default
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
