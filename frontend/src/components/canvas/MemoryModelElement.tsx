import React, { useState } from 'react';
import { MemoryViewElement as MemoryViewElementType, MemoryVariable } from '../../types/canvas';
import { useCanvasStore } from '../../store/canvasStore';
import { Cpu, Plus, Trash2, ArrowRight } from 'lucide-react';

interface MemoryModelProps {
  element: MemoryViewElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

const DEFAULT_VARS: MemoryVariable[] = [
  { id: '1', name: 'name', address: '0x7ffe4a', value: '"Nagarjun"', type: 'string' },
  { id: '2', name: 'age', address: '0x7ffe52', value: '25', type: 'number' },
  { id: '3', name: 'isCreator', address: '0x7ffe58', value: 'true', type: 'boolean' },
];

export const MemoryModelElement: React.FC<MemoryModelProps> = ({ element, isSelected, onSelect }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);

  const [editingVarId, setEditingVarId] = useState<string | null>(null);
  const [valDraft, setValDraft] = useState('');

  const variables = element.variables || DEFAULT_VARS;

  const handleUpdateValue = (id: string, newVal: string) => {
    const updated = variables.map((v) => (v.id === id ? { ...v, value: newVal } : v));
    updateElement(element.id, { variables: updated });
    setEditingVarId(null);
  };

  const handleAddVariable = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVar: MemoryVariable = {
      id: `${Date.now()}`,
      name: `var${variables.length + 1}`,
      address: `0x7ffe${Math.floor(Math.random() * 89 + 10)}`,
      value: '"new"',
      type: 'string',
    };
    updateElement(element.id, { variables: [...variables, newVar] });
  };

  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={Math.max(element.width, 420)}
      height={Math.max(element.height, 240)}
      className="overflow-visible"
    >
      <div
        onClick={onSelect}
        className={`w-full h-full bg-[#11131c] border rounded-2xl shadow-2xl flex flex-col overflow-hidden select-none transition-all ${
          isSelected ? 'border-amber-500 ring-2 ring-amber-500/40' : 'border-slate-800'
        }`}
      >
        {/* Header Bar */}
        <div className="h-9 bg-[#191c28] px-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-200">
              MEMORY VISUALIZER (STACK → HEAP)
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleAddVariable}
              className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1"
              title="Add variable mapping"
            >
              <Plus className="w-3 h-3" /> Add Var
            </button>
            {isSelected && (
              <button
                onClick={() => deleteElement(element.id)}
                className="p-1 text-red-400 hover:bg-red-950/40 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-12 px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-4">Variable Name</div>
          <div className="col-span-3 text-center">Pointer / Address</div>
          <div className="col-span-5 text-right pr-2">Allocated Memory</div>
        </div>

        {/* Variables List */}
        <div className="flex-1 p-2.5 overflow-y-auto space-y-2 bg-[#090b10] font-mono text-xs">
          {variables.map((v) => (
            <div
              key={v.id}
              className="grid grid-cols-12 items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              {/* Var Name Box */}
              <div className="col-span-4 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold truncate">
                  {v.name}
                </span>
              </div>

              {/* Arrow + Address */}
              <div className="col-span-3 flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{v.address}</span>
              </div>

              {/* Memory Block Value Box */}
              <div className="col-span-5 text-right" onClick={(e) => e.stopPropagation()}>
                {editingVarId === v.id ? (
                  <input
                    type="text"
                    value={valDraft}
                    onChange={(e) => setValDraft(e.target.value)}
                    onBlur={() => handleUpdateValue(v.id, valDraft)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateValue(v.id, valDraft);
                      if (e.key === 'Escape') setEditingVarId(null);
                    }}
                    autoFocus
                    className="w-full bg-slate-950 border border-amber-400 rounded px-2 py-0.5 text-xs text-emerald-300 focus:outline-none text-right"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditingVarId(v.id);
                      setValDraft(v.value);
                    }}
                    className="px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 font-bold text-xs transition-colors"
                    title="Click to edit value"
                  >
                    {v.value}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </foreignObject>
  );
};
