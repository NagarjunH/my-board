import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-css';
import { Copy, Check, Edit3, Eye, Trash2, Highlighter, AlertCircle, Sun, Moon } from 'lucide-react';
import { CodeBlockElement as CodeBlockElementType, CodeLanguage } from '../../types/canvas';
import { useCanvasStore } from '../../store/canvasStore';

interface CodeBlockProps {
  element: CodeBlockElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

const LANGUAGES: { id: CodeLanguage; label: string }[] = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'jsx', label: 'React/JSX' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'json', label: 'JSON' },
  { id: 'sql', label: 'SQL' },
  { id: 'bash', label: 'Bash' },
];

export const CodeBlockElement: React.FC<CodeBlockProps> = ({ element, isSelected, onSelect }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);

  const [isEditing, setIsEditing] = useState(false);
  const [codeDraft, setCodeDraft] = useState(element.code);
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const highlightedLines = element.highlightedLines || [];
  const errorLines = element.errorLines || [];
  const theme = element.theme || 'dark';

  useEffect(() => {
    setCodeDraft(element.code);
  }, [element.code]);

  useEffect(() => {
    if (!isEditing && codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [element.code, element.language, isEditing]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(element.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
    if (codeDraft !== element.code) {
      updateElement(element.id, { code: codeDraft });
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateElement(element.id, { language: e.target.value as CodeLanguage });
  };

  const toggleLineHighlight = (lineNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isHighlighted = highlightedLines.includes(lineNum);
    const updated = isHighlighted
      ? highlightedLines.filter((l) => l !== lineNum)
      : [...highlightedLines, lineNum];
    updateElement(element.id, { highlightedLines: updated });
  };

  const toggleErrorLine = (lineNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isError = errorLines.includes(lineNum);
    const updated = isError
      ? errorLines.filter((l) => l !== lineNum)
      : [...errorLines, lineNum];
    updateElement(element.id, { errorLines: updated });
  };

  const lines = (element.code || '').split('\n');

  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={Math.max(element.width, 420)}
      height={Math.max(element.height, 260)}
      className="overflow-visible"
    >
      <div
        onClick={onSelect}
        className={`w-full h-full rounded-2xl shadow-2xl border transition-all flex flex-col overflow-hidden select-none ${
          theme === 'light' ? 'bg-[#f8fafc] text-slate-800' : 'bg-[#181a24] text-slate-100'
        } ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-500/50'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        {/* Header Bar */}
        <div
          className={`h-9 px-3 flex items-center justify-between border-b cursor-move ${
            theme === 'light' ? 'bg-slate-200/80 border-slate-300' : 'bg-[#11131a] border-slate-800/80'
          }`}
        >
          {/* Mac-style Window Dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] font-mono text-slate-400 ml-2 font-medium">
              {element.title || `code.${element.language}`}
            </span>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Language Selector */}
            <select
              value={element.language}
              onChange={handleLanguageChange}
              className={`rounded px-1.5 py-0.5 text-[11px] font-mono focus:outline-none ${
                theme === 'light'
                  ? 'bg-white border border-slate-300 text-slate-800'
                  : 'bg-slate-900 border border-slate-700 text-slate-300'
              }`}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>

            {/* Theme Toggle */}
            <button
              onClick={() => updateElement(element.id, { theme: theme === 'dark' ? 'light' : 'dark' })}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Toggle Code Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Toggle Edit / Preview */}
            <button
              onClick={() => {
                if (isEditing) handleFinishEditing();
                else setIsEditing(true);
              }}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              title={isEditing ? 'Preview Code' : 'Edit Code'}
            >
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Delete button */}
            {isSelected && (
              <button
                onClick={() => deleteElement(element.id)}
                className="p-1 text-red-400 hover:bg-red-950/40 rounded transition-colors"
                title="Delete Code Block"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Code Content Area with Line Numbers & Highlights */}
        <div className="flex-1 flex overflow-auto font-mono text-[13px] leading-relaxed">
          {isEditing ? (
            <textarea
              value={codeDraft}
              onChange={(e) => setCodeDraft(e.target.value)}
              onBlur={handleFinishEditing}
              autoFocus
              className="w-full h-full p-3.5 bg-transparent text-slate-200 resize-none focus:outline-none font-mono text-[13px] leading-relaxed"
              spellCheck={false}
            />
          ) : (
            <div className="flex w-full py-2">
              {/* Line Numbers Gutter */}
              <div className="flex flex-col text-right select-none pr-3 pl-2 border-r border-slate-800/60 opacity-50 text-[11px] font-mono shrink-0">
                {lines.map((_, i) => {
                  const lineNum = i + 1;
                  const isHl = highlightedLines.includes(lineNum);
                  const isErr = errorLines.includes(lineNum);
                  return (
                    <div
                      key={i}
                      onClick={(e) => toggleLineHighlight(lineNum, e)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        toggleErrorLine(lineNum, e);
                      }}
                      className={`h-6 flex items-center justify-end px-1 cursor-pointer transition-colors hover:opacity-100 ${
                        isErr
                          ? 'text-red-400 font-bold'
                          : isHl
                          ? 'text-blue-400 font-bold'
                          : 'hover:text-slate-300'
                      }`}
                      title="Click to highlight line, Right-click for error flag"
                    >
                      {lineNum}
                    </div>
                  );
                })}
              </div>

              {/* Code Lines with Highlights */}
              <div className="flex-1 overflow-x-auto">
                {lines.map((line, i) => {
                  const lineNum = i + 1;
                  const isHl = highlightedLines.includes(lineNum);
                  const isErr = errorLines.includes(lineNum);

                  return (
                    <div
                      key={i}
                      className={`h-6 px-3 flex items-center whitespace-pre font-mono transition-colors ${
                        isErr
                          ? 'bg-rose-500/25 border-l-2 border-l-rose-500 text-rose-200 shadow-sm'
                          : isHl
                          ? 'bg-blue-500/20 border-l-2 border-l-blue-400 text-blue-100 shadow-sm'
                          : ''
                      }`}
                    >
                      <span>{line}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Teaching Guide */}
        <div className="h-6 px-3 bg-black/20 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
          <span>Click line # to highlight • Right-click for error tag</span>
          {highlightedLines.length > 0 && (
            <span className="text-blue-400 font-semibold">
              Focusing on Line {highlightedLines.join(', ')}
            </span>
          )}
        </div>
      </div>
    </foreignObject>
  );
};
