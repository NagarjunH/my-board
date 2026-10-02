import React, { useState } from 'react';
import { HtmlPreviewElement as HtmlPreviewElementType } from '../../types/canvas';
import { useCanvasStore } from '../../store/canvasStore';
import { Layout, Code, Eye, Trash2 } from 'lucide-react';

interface HtmlPreviewProps {
  element: HtmlPreviewElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const HtmlPreviewElement: React.FC<HtmlPreviewProps> = ({ element, isSelected, onSelect }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);

  const [activeTab, setActiveTab] = useState<'split' | 'code' | 'preview'>(element.activeTab || 'split');
  const [htmlCode, setHtmlCode] = useState(
    element.html || `<div class="card">\n  <h2>Hello World</h2>\n  <button onclick="alert('Clicked!')">Click Me</button>\n</div>`
  );
  const [cssCode, setCssCode] = useState(
    element.css || `.card { font-family: sans-serif; padding: 16px; background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; text-align: center; }\nh2 { color: #15803d; margin: 0 0 10px; }\nbutton { background: #22c55e; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; }`
  );

  const handleHtmlChange = (newHtml: string) => {
    setHtmlCode(newHtml);
    updateElement(element.id, { html: newHtml });
  };

  const handleCssChange = (newCss: string) => {
    setCssCode(newCss);
    updateElement(element.id, { css: newCss });
  };

  const combinedSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${cssCode}</style>
      </head>
      <body style="margin: 0; padding: 12px; display: flex; align-items: center; justify-content: center; min-height: 100vh; box-sizing: border-box;">
        ${htmlCode}
      </body>
    </html>
  `;

  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={Math.max(element.width, 480)}
      height={Math.max(element.height, 260)}
      className="overflow-visible"
    >
      <div
        onClick={onSelect}
        className={`w-full h-full bg-[#181a24] border rounded-2xl shadow-2xl flex flex-col overflow-hidden select-none transition-all ${
          isSelected ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-slate-800'
        }`}
      >
        {/* Header Bar */}
        <div className="h-9 bg-[#11131a] px-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200">HTML & CSS Sandbox</span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setActiveTab('split')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeTab === 'split' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
              </button>
            </div>

            {isSelected && (
              <button
                onClick={() => deleteElement(element.id)}
                className="p-1 text-red-400 hover:bg-red-950/40 rounded transition-colors"
                title="Delete HTML sandbox"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Code Pane */}
          {(activeTab === 'split' || activeTab === 'code') && (
            <div className={`flex-1 flex flex-col p-2 bg-[#0e1017] border-r border-slate-800/80 overflow-hidden font-mono text-[11px]`}>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">HTML</div>
              <textarea
                value={htmlCode}
                onChange={(e) => handleHtmlChange(e.target.value)}
                className="flex-1 bg-transparent text-emerald-400 resize-none focus:outline-none leading-relaxed"
                spellCheck={false}
              />
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2 mb-1 border-t border-slate-800 pt-1">CSS</div>
              <textarea
                value={cssCode}
                onChange={(e) => handleCssChange(e.target.value)}
                className="h-20 bg-transparent text-sky-400 resize-none focus:outline-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

          {/* Live Preview Pane */}
          {(activeTab === 'split' || activeTab === 'preview') && (
            <div className="flex-1 bg-white relative">
              <iframe
                title="HTML Preview Sandbox"
                srcDoc={combinedSrcDoc}
                sandbox="allow-scripts"
                className="w-full h-full border-none pointer-events-auto"
              />
            </div>
          )}
        </div>
      </div>
    </foreignObject>
  );
};
