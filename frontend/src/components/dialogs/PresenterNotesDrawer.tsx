import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useBoardStore } from '../../store/boardStore';
import { BookOpen, X, Check } from 'lucide-react';

export const PresenterNotesDrawer: React.FC = () => {
  const isPresenterNotesOpen = useUIStore((s) => s.isPresenterNotesOpen);
  const togglePresenterNotes = useUIStore((s) => s.togglePresenterNotes);
  const activePage = useBoardStore((s) => s.getActivePage());

  const storageKey = `myboard_notes_${activePage?.id || 'default'}`;
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setNotes(saved);
    } else {
      setNotes(
        `• Welcome students & explain lesson goals.\n• Introduce memory representation diagram.\n• Key interview trick: explain why const doesn't mean immutable in JS objects!\n• Ask audience to comment their answer to the Quiz card below.`
      );
    }
  }, [storageKey]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    localStorage.setItem(storageKey, e.target.value);
  };

  if (!isPresenterNotesOpen) return null;

  return (
    <div className="fixed bottom-14 right-6 z-50 w-80 bg-[#161926]/95 backdrop-blur-lg border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 select-none animate-in fade-in slide-in-from-bottom-2">
      {/* Header Bar */}
      <div className="h-9 px-3 bg-[#1d2133] border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">Presenter Notes</span>
          <span className="text-[10px] text-emerald-400/80 bg-emerald-950/40 px-1.5 rounded">Private</span>
        </div>

        <button
          onClick={togglePresenterNotes}
          className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          title="Close presenter notes"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notes Body */}
      <div className="p-3 bg-[#0d0f17]">
        <textarea
          value={notes}
          onChange={handleChange}
          rows={6}
          placeholder="Type talking points for your video recording..."
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 resize-none focus:outline-none leading-relaxed font-sans"
        />
        <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between border-t border-slate-800">
          <span>Auto-saved locally for this lesson</span>
          <Check className="w-3 h-3 text-emerald-500" />
        </div>
      </div>
    </div>
  );
};
