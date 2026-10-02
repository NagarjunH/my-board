import React, { useState } from 'react';
import { CallStackElement as CallStackElementType } from '../../types/canvas';
import { useCanvasStore } from '../../store/canvasStore';
import { Layers, Plus, Minus, RotateCcw, Trash2, ArrowLeft } from 'lucide-react';

interface CallStackProps {
  element: CallStackElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const CallStackElement: React.FC<CallStackProps> = ({ element, isSelected, onSelect }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);

  const [inputFrame, setInputFrame] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const frames = element.frames || ['calculate()', 'main()', 'global()'];

  const handlePush = (name?: string) => {
    const frameName = name || inputFrame.trim() || `func${frames.length + 1}()`;
    updateElement(element.id, { frames: [frameName, ...frames] });
    setInputFrame('');
    setIsAdding(false);
  };

  const handlePop = () => {
    if (frames.length === 0) return;
    const [, ...rest] = frames;
    updateElement(element.id, { frames: rest });
  };

  const handleReset = () => {
    updateElement(element.id, { frames: ['calculate()', 'main()', 'global()'] });
  };

  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={Math.max(element.width, 320)}
      height={Math.max(element.height, 260)}
      className="overflow-visible"
    >
      <div
        onClick={onSelect}
        className={`w-full h-full bg-[#12141c] border rounded-2xl shadow-2xl flex flex-col overflow-hidden select-none transition-all ${
          isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/40' : 'border-slate-800'
        }`}
      >
        {/* Header Bar */}
        <div className="h-9 bg-[#191c28] px-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-200">
              CALL STACK
            </span>
            <span className="text-[10px] text-slate-500 font-mono">({frames.length} frames)</span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handlePush()}
              className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1"
              title="Push new stack frame"
            >
              <Plus className="w-3 h-3" /> Push
            </button>
            <button
              onClick={handlePop}
              disabled={frames.length === 0}
              className="px-2 py-0.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1 disabled:opacity-40"
              title="Pop top stack frame"
            >
              <Minus className="w-3 h-3" /> Pop
            </button>
            <button
              onClick={handleReset}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Reset stack"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            {isSelected && (
              <button
                onClick={() => deleteElement(element.id)}
                className="p-1 text-red-400 hover:bg-red-950/40 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Stack Visualizer Body */}
        <div className="flex-1 p-3 flex flex-col justify-end gap-1.5 overflow-y-auto bg-[#0a0c12]/95 font-mono">
          {frames.length === 0 ? (
            <div className="text-center text-slate-600 italic text-xs py-8">
              [ Stack is Empty — Call stack cleared ]
            </div>
          ) : (
            frames.map((frame, idx) => {
              const isTop = idx === 0;
              return (
                <div
                  key={`${frame}-${idx}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
                    isTop
                      ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300 font-bold shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-60">#{frames.length - idx}</span>
                    <span className="truncate">{frame}</span>
                  </div>

                  {isTop && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-400/10 px-1.5 py-0.5 rounded">
                      <ArrowLeft className="w-3 h-3" />
                      <span>TOP</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </foreignObject>
  );
};
