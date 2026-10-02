import React, { useState } from 'react';
import { TerminalElement as TerminalElementType } from '../../types/canvas';
import { useCanvasStore } from '../../store/canvasStore';
import { Play, Trash2, Edit2, Check } from 'lucide-react';

interface TerminalProps {
  element: TerminalElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const TerminalElement: React.FC<TerminalProps> = ({ element, isSelected, onSelect }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);

  const [isEditing, setIsEditing] = useState(false);
  const [commandDraft, setCommandDraft] = useState(element.command || 'python app.py');
  const [outputDraft, setOutputDraft] = useState((element.output || ['Hello World', 'Process finished with exit code 0']).join('\n'));

  const handleSave = () => {
    setIsEditing(false);
    updateElement(element.id, {
      command: commandDraft,
      output: outputDraft.split('\n'),
    });
  };

  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={Math.max(element.width, 360)}
      height={Math.max(element.height, 220)}
      className="overflow-visible"
    >
      <div
        onClick={onSelect}
        className={`w-full h-full bg-[#0d1117] border rounded-xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs select-none transition-all ${
          isSelected ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-slate-800'
        }`}
      >
        {/* Terminal Title Bar */}
        <div className="h-9 bg-[#161b22] px-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-slate-400 font-semibold ml-2">bash — 80x24</span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                if (isEditing) handleSave();
                else setIsEditing(true);
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title={isEditing ? 'Save command' : 'Edit command & output'}
            >
              {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5" />}
            </button>
            {isSelected && (
              <button
                onClick={() => deleteElement(element.id)}
                className="p-1 text-red-400 hover:bg-red-950/40 rounded transition-colors"
                title="Delete terminal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-2 text-slate-200">
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-500">Command:</label>
                <input
                  type="text"
                  value={commandDraft}
                  onChange={(e) => setCommandDraft(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Output Lines:</label>
                <textarea
                  value={outputDraft}
                  onChange={(e) => setOutputDraft(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none resize-none"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Command Prompt */}
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">$</span>
                <span className="text-white font-semibold">{element.command || 'python app.py'}</span>
              </div>

              {/* Output */}
              <div className="pt-1 space-y-1 text-slate-300">
                {(element.output || []).map((line, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>

              {/* Exit Code Badge */}
              <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Process finished with exit code {element.exitCode ?? 0}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </foreignObject>
  );
};
