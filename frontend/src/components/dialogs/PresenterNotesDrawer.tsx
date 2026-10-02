import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useBoardStore } from '../../store/boardStore';
import {
  FileText,
  Play,
  Pause,
  RotateCcw,
  X,
  Check,
  ChevronDown,
  Sparkles,
  CheckSquare,
  Square,
  Eye,
  Minimize2,
  Maximize2,
  Move,
  Type,
} from 'lucide-react';

const SCRIPT_TEMPLATES = [
  {
    name: 'YouTube Tutorial Blueprint',
    content: `🔥 [00:00] HOOK:
- Problem: "Why does your React component re-render 50 times?"
- Value: "In 5 minutes, you'll master useMemo vs useCallback forever."

📚 [00:30] CONCEPT BREAKDOWN:
- Point 1: React re-rendering lifecycle
- Point 2: Memory address comparison (===)

💻 [01:30] LIVE CODE DEMO:
- Draw Parent and Child component diagram on board
- Write bad code example ➔ Show profiling lag
- Optimize with useMemo ➔ Highlight difference

⚠️ [03:30] COMMON PITFALLS:
- Mistake: Over-optimizing small calculations
- Interview tip: When NOT to use memoization!

🎯 [04:30] OUTRO & CTA:
- Challenge: Try the quiz question on screen
- "Comment your solution below & Subscribe for Lesson 2!"`,
  },
  {
    name: 'Coding Interview / DSA Pattern',
    content: `💡 [Step 1] Problem Breakdown:
- Input/Output format & Constraints
- Edge cases: Empty input, negative numbers, duplicates

🐢 [Step 2] Brute Force:
- Time Complexity: O(N²) - Explain why it's too slow

⚡ [Step 3] Optimal Approach:
- Data structure: Hash Map / Two Pointers
- Draw the step-by-step iteration pointer on board

📊 [Step 4] Space & Time Complexity:
- Time: O(N), Space: O(1)

🎯 [Step 5] Follow-up Questions:
- What if data does not fit in memory?`,
  },
  {
    name: 'Quick Talking Points',
    content: `• Welcome viewers & share today's agenda
• Draw architecture diagram first
• Write clean syntax example
• Give practical real-world analogy
• Ask audience to pause video and solve question`,
  },
];

type ViewTab = 'edit' | 'teleprompter' | 'checklist';

export const PresenterNotesDrawer: React.FC = () => {
  const isPresenterNotesOpen = useUIStore((s) => s.isPresenterNotesOpen);
  const togglePresenterNotes = useUIStore((s) => s.togglePresenterNotes);
  const activePage = useBoardStore((s) => s.getActivePage());

  const storageKey = `myboard_notes_${activePage?.id || 'default'}`;
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<ViewTab>('teleprompter');
  const [isMinimized, setIsMinimized] = useState(false);

  // Position state for dragging
  const [position, setPosition] = useState({ x: 300, y: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  // Teleprompter auto-scroll state
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1.5);
  const [fontSize, setFontSize] = useState(16);
  const [opacity, setOpacity] = useState(0.94);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Checked items in checklist mode
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);

  // Set default initial position near top center (below webcam)
  useEffect(() => {
    const defaultX = Math.max(20, Math.round((window.innerWidth - 440) / 2));
    setPosition({ x: defaultX, y: 65 });
  }, []);

  // Load notes per page
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setNotes(saved);
    } else {
      setNotes(
        `• Welcome students & introduce lesson topic.\n• Draw the core concept diagram on the board.\n• Explain why this is asked in top tech company interviews!\n• Live code walkthrough: point out common syntax bugs.\n• Ask students to comment their solution to the challenge below.`
      );
    }
    setCheckedItems({});
    setIsPlaying(false);
  }, [storageKey]);

  // Smooth Teleprompter auto-scroll loop
  useEffect(() => {
    if (!isPlaying || activeTab !== 'teleprompter') return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const scrollLoop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed * 25 * delta;
      }
      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    animationFrameId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, scrollSpeed, activeTab]);

  // Dragging handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, select')) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 300, dragStartRef.current.startX + dx)),
      y: Math.max(10, Math.min(window.innerHeight - 150, dragStartRef.current.startY + dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    localStorage.setItem(storageKey, val);
  };

  const handleApplyTemplate = (tmplContent: string) => {
    handleNotesChange(tmplContent);
    setIsTemplateMenuOpen(false);
  };

  const toggleCheckItem = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!isPresenterNotesOpen) return null;

  // Split lines for checklist mode
  const bulletLines = notes
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // If minimized into a compact floating pill
  if (isMinimized) {
    return (
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="fixed z-50 flex items-center gap-2 bg-[#161926]/95 backdrop-blur-xl border border-slate-700/90 text-slate-200 px-3 py-1.5 rounded-full shadow-2xl cursor-grab active:cursor-grabbing select-none text-xs hover:border-[#5B50E6] transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-100">📝 Teacher Script</span>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1 hover:text-white rounded"
          title="Expand script & teleprompter"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={togglePresenterNotes}
          className="p-1 hover:text-rose-400 rounded"
          title="Close script"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: opacity,
      }}
      className="fixed z-50 w-96 max-w-[95vw] bg-[#11131e] backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* 1. Header Drag Handle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="h-10 px-3 bg-[#181b2a] border-b border-slate-800 flex items-center justify-between text-xs cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-slate-400 opacity-70" />
          <span className="font-bold text-slate-200 tracking-tight flex items-center gap-1.5">
            <span>📝</span> Teacher Script & Prompter
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded font-mono">
            {activePage?.name ? activePage.name.slice(0, 15) : 'Lesson'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Opacity Cycle */}
          <button
            onClick={() => setOpacity(opacity === 0.94 ? 0.75 : opacity === 0.75 ? 0.5 : 0.94)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            title={`Ghost transparency (${Math.round(opacity * 100)}%)`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Minimize */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            title="Minimize to floating pill"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            onClick={togglePresenterNotes}
            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
            title="Close script (Alt+S)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Mode Navigation & Controls Bar */}
      <div className="px-3 py-1.5 bg-[#141624] border-b border-slate-800/90 flex items-center justify-between text-xs">
        {/* Tabs: Prompter / Checklist / Edit */}
        <div className="flex items-center bg-[#0d0f18] p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => {
              setActiveTab('teleprompter');
              setIsPlaying(false);
            }}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              activeTab === 'teleprompter'
                ? 'bg-[#5B50E6] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📜 Prompter
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              activeTab === 'checklist'
                ? 'bg-[#5B50E6] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✅ Points
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              activeTab === 'edit'
                ? 'bg-[#5B50E6] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✍️ Edit
          </button>
        </div>

        {/* Font Size & Templates */}
        <div className="flex items-center gap-1.5">
          {/* Font Controls */}
          <div className="flex items-center gap-1 bg-[#0d0f18] px-1 py-0.5 rounded-md border border-slate-800 text-[10px]">
            <Type className="w-2.5 h-2.5 text-slate-400" />
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              className="px-1 text-slate-300 hover:text-white"
              title="Smaller font"
            >
              -
            </button>
            <span className="font-mono text-slate-400">{fontSize}</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              className="px-1 text-slate-300 hover:text-white"
              title="Larger font"
            >
              +
            </button>
          </div>

          {/* Templates Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-semibold transition-colors"
              title="Insert YouTube or Interview script blueprint"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Blueprint</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {isTemplateMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[#1b1e2e] border border-slate-700 rounded-xl shadow-2xl p-1 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Script Templates
                </div>
                {SCRIPT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    onClick={() => handleApplyTemplate(tmpl.content)}
                    className="w-full text-left px-2 py-1.5 hover:bg-slate-800 rounded-lg text-slate-200 text-[11px]"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Body */}
      <div className="p-3 bg-[#0d0f17] flex flex-col h-64 overflow-hidden relative">
        {/* MODE A: TELEPROMPTER */}
        {activeTab === 'teleprompter' && (
          <div className="flex flex-col h-full">
            {/* Teleprompter Focus Line Guide */}
            <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 bg-blue-500/10 border-y border-blue-500/25 pointer-events-none" />

            <div
              ref={scrollRef}
              style={{ fontSize: `${fontSize}px` }}
              className="flex-1 overflow-y-auto pr-1 text-slate-100 font-sans leading-relaxed whitespace-pre-wrap select-text scroll-smooth"
            >
              {notes || 'No script yet. Switch to "Edit" tab to write talking points.'}
              {/* Extra spacing at the bottom so user can scroll completely */}
              <div className="h-36" />
            </div>

            {/* Prompter Controls: Play/Pause, Speed, Rewind */}
            <div className="pt-2 mt-1 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl font-bold transition-all ${
                    isPlaying
                      ? 'bg-amber-500 text-black hover:bg-amber-400'
                      : 'bg-[#5B50E6] text-white hover:bg-[#4E44D4] shadow-md shadow-[#5B50E6]/30'
                  }`}
                  title={isPlaying ? 'Pause auto-scroll' : 'Start auto-scroll teleprompter'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Scroll'}</span>
                </button>

                <button
                  onClick={() => {
                    if (scrollRef.current) scrollRef.current.scrollTop = 0;
                    setIsPlaying(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Rewind to beginning"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Speed Controller */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>Speed:</span>
                {[1, 1.5, 2.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setScrollSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      scrollSpeed === spd
                        ? 'bg-slate-700 text-white font-bold'
                        : 'hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE B: CHECKLIST POINTS */}
        {activeTab === 'checklist' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 select-text">
            {bulletLines.length === 0 ? (
              <div className="text-slate-500 text-xs italic text-center pt-8">
                No talking points written yet. Switch to "Edit" tab to add points.
              </div>
            ) : (
              bulletLines.map((line, idx) => {
                const isChecked = !!checkedItems[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheckItem(idx)}
                    className={`flex items-start gap-2 p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-500 line-through'
                        : 'bg-[#141624] border-slate-800/80 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <button className="mt-0.5 text-slate-400 flex-shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    <span style={{ fontSize: `${fontSize - 1}px` }} className="leading-snug">
                      {line.replace(/^[•\-\*]\s*/, '')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* MODE C: EDIT FULL SCRIPT */}
        {activeTab === 'edit' && (
          <div className="flex flex-col h-full">
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Paste or write your lesson talking points, code snippets, or YouTube video script..."
              style={{ fontSize: `${fontSize - 1}px` }}
              className="flex-1 w-full bg-transparent text-slate-200 placeholder-slate-500 resize-none focus:outline-none leading-relaxed font-sans"
            />
            <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between border-t border-slate-800">
              <span>Auto-saved locally for this lesson page</span>
              <Check className="w-3 h-3 text-emerald-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
