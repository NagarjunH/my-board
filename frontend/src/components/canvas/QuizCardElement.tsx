import React, { useState } from 'react';
import { QuizCardElement as QuizCardElementType } from '../../types/canvas';
import { useCanvasStore } from '../../store/canvasStore';
import { HelpCircle, CheckCircle2, Eye, EyeOff, Trash2 } from 'lucide-react';

interface QuizCardProps {
  element: QuizCardElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const QuizCardElement: React.FC<QuizCardProps> = ({ element, isSelected, onSelect }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);

  const [selectedOption, setSelectedOption] = useState<number | null>(element.userSelection ?? null);
  const isRevealed = element.isRevealed ?? false;

  const question = element.question || 'What is the output of console.log(typeof null); in JavaScript?';
  const options = element.options || ['"null"', '"object"', '"undefined"', 'ReferenceError'];
  const correctAnswer = element.correctAnswer ?? 1; // "object"
  const explanation = element.explanation || 'Due to a historical bug in JavaScript 1.0, typeof null returns "object".';

  const handleSelectOption = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption(idx);
    updateElement(element.id, { userSelection: idx });
  };

  const handleToggleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, { isRevealed: !isRevealed });
  };

  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={Math.max(element.width, 380)}
      height={Math.max(element.height, 270)}
      className="overflow-visible"
    >
      <div
        onClick={onSelect}
        className={`w-full h-full bg-[#141724] border rounded-2xl shadow-2xl flex flex-col overflow-hidden select-none transition-all ${
          isSelected ? 'border-purple-500 ring-2 ring-purple-500/40' : 'border-slate-800'
        }`}
      >
        {/* Header Bar */}
        <div className="h-9 bg-[#1d2133] px-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              YouTube Quiz Card
            </span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleToggleReveal}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                isRevealed
                  ? 'bg-purple-600 text-white shadow-purple-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isRevealed ? 'Hide Answer' : 'Reveal Answer'}</span>
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

        {/* Question Area */}
        <div className="p-3.5 border-b border-slate-800/80 bg-[#0e101a]">
          <h4 className="text-xs font-semibold text-slate-100 leading-relaxed">{question}</h4>
        </div>

        {/* Options List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-1.5 bg-[#0a0c14]">
          {options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isUserPick = selectedOption === idx;
            const isCorrect = isRevealed && idx === correctAnswer;
            const isWrong = isRevealed && isUserPick && idx !== correctAnswer;

            return (
              <button
                key={idx}
                onClick={(e) => handleSelectOption(idx, e)}
                className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                  isCorrect
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md'
                    : isWrong
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                    : isUserPick
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-bold text-[10px]">
                    {letter}
                  </span>
                  <span className="font-mono">{opt}</span>
                </div>

                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>
            );
          })}

          {/* Explanation if Revealed */}
          {isRevealed && (
            <div className="p-2.5 mt-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200 leading-relaxed">
              <strong className="text-emerald-400 font-bold">Answer: {options[correctAnswer]}</strong>
              <div className="mt-0.5 text-slate-400">{explanation}</div>
            </div>
          )}
        </div>
      </div>
    </foreignObject>
  );
};
