import React, { useState, useEffect, useRef } from 'react';
import { StickyNoteElement as StickyNoteElementType, StickyColor } from '../../types/canvas';
import { useCanvasStore } from '../../store/canvasStore';
import { Trash2, Palette } from 'lucide-react';

interface StickyNoteProps {
  element: StickyNoteElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

const STICKY_COLORS: Record<StickyColor, { bg: string; border: string; text: string; shadow: string }> = {
  yellow: { bg: '#fef08a', border: '#facc15', text: '#713f12', shadow: 'rgba(234, 179, 8, 0.25)' },
  green: { bg: '#bbf7d0', border: '#86efac', text: '#14532d', shadow: 'rgba(34, 197, 94, 0.25)' },
  blue: { bg: '#bae6fd', border: '#7dd3fc', text: '#0c4a6e', shadow: 'rgba(14, 165, 233, 0.25)' },
  pink: { bg: '#fbcfe8', border: '#f472b6', text: '#831843', shadow: 'rgba(236, 72, 153, 0.25)' },
  purple: { bg: '#e9d5ff', border: '#c084fc', text: '#581c87', shadow: 'rgba(168, 85, 247, 0.25)' },
};

export const StickyNoteElement: React.FC<StickyNoteProps> = ({ element, isSelected, onSelect }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);

  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(element.text);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const theme = STICKY_COLORS[element.color || 'yellow'];

  useEffect(() => {
    setDraftText(element.text);
  }, [element.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleFinishEditing = () => {
    setIsEditing(false);
    if (draftText !== element.text) {
      updateElement(element.id, { text: draftText });
    }
  };

  const handleColorChange = (c: StickyColor, e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, { color: c });
    setShowColorPicker(false);
  };

  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={Math.max(element.width, 180)}
      height={Math.max(element.height, 180)}
      className="overflow-visible"
    >
      <div
        onClick={onSelect}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className={`w-full h-full p-4 rounded-xl flex flex-col justify-between cursor-pointer select-none transition-all relative ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:scale-[1.01]'
        }`}
        style={{
          backgroundColor: theme.bg,
          border: `1.5px solid ${theme.border}`,
          color: theme.text,
          boxShadow: `0 10px 25px -5px ${theme.shadow}, 0 8px 10px -6px ${theme.shadow}`,
          transform: `rotate(${element.rotation || -1.5}deg)`,
        }}
      >
        {/* Top Fold Ribbon / Pin */}
        <div className="flex items-center justify-between pb-1">
          <div className="w-12 h-2.5 rounded bg-black/10 backdrop-blur-xs mx-auto -mt-2 shadow-xs" />
          {isSelected && (
            <div className="absolute top-2 right-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1 rounded bg-black/10 hover:bg-black/20 text-current"
                title="Change note color"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteElement(element.id)}
                className="p-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-700"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Color picker popup */}
        {showColorPicker && (
          <div
            className="absolute top-9 right-2 bg-white rounded-lg shadow-xl p-1.5 flex gap-1 z-50 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {(Object.keys(STICKY_COLORS) as StickyColor[]).map((c) => (
              <button
                key={c}
                onClick={(e) => handleColorChange(c, e)}
                className="w-4 h-4 rounded-full border border-black/20 hover:scale-125 transition-transform"
                style={{ backgroundColor: STICKY_COLORS[c].bg }}
              />
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 font-handwriting text-lg leading-snug overflow-hidden mt-1">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onBlur={handleFinishEditing}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-full h-full bg-transparent resize-none focus:outline-none font-handwriting text-lg leading-snug"
            />
          ) : (
            <div className="whitespace-pre-wrap">{element.text}</div>
          )}
        </div>

        {/* Bottom Fold Accent */}
        <div className="text-[10px] opacity-60 text-right font-sans font-medium">
          double-click to edit
        </div>
      </div>
    </foreignObject>
  );
};
