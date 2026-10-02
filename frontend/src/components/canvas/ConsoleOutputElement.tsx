import React, { useState } from 'react';
import { ConsoleElement as ConsoleElementType } from '../../types/canvas';
import { useCanvasStore } from '../../store/canvasStore';
import { Terminal, Plus, Trash2, RotateCcw } from 'lucide-react';

interface ConsoleProps {
  element: ConsoleElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const ConsoleOutputElement: React.FC<ConsoleProps> = ({ element, isSelected, onSelect }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);
  const [newLogText, setNewLogText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim()) return;
    const updated = [...(element.logs || []), newLogText.trim()];
    updateElement(element.id, { logs: updated });
    setNewLogText('');
    setIsAdding(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, { logs: [] });
  };

  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={Math.max(element.width, 300)}
      height={Math.max(element.height, 180)}
      className="overflow-visible"
    >
      <div
        onClick={onSelect}
        className={`w-full h-full bg-[#12141c] border rounded-xl shadow-2xl flex flex-col overflow-hidden select-none transition-all ${
          isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/40' : 'border-slate-800'
        }`}
      >
        {/* Header Bar */}
        <div className="h-9 bg-[#1a1d27] px-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              {element.title || 'Console'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Add console entry"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Clear console"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {isSelected && (
              <button
                onClick={() => deleteElement(element.id)}
                className="p-1 text-red-400 hover:bg-red-950/40 rounded transition-colors"
                title="Delete console widget"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Console Logs Output */}
        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 bg-[#0c0d12]/90">
          {(!element.logs || element.logs.length === 0) ? (
            <div className="text-slate-600 italic text-[11px] select-none py-2">
              &gt; Console is ready. No output yet.
            </div>
          ) : (
            element.logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300 border-b border-slate-900/60 pb-1">
                <span className="text-slate-600 select-none">&gt;</span>
                <span className="text-emerald-400/90 whitespace-pre-wrap">{log}</span>
              </div>
            ))
          )}

          {isAdding && (
            <form onSubmit={handleAddLog} className="pt-2 flex items-center gap-1">
              <span className="text-emerald-400">&gt;</span>
              <input
                type="text"
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder="Log output text..."
                autoFocus
                className="w-full bg-slate-900 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
              />
            </form>
          )}
        </div>
      </div>
    </foreignObject>
  );
};
