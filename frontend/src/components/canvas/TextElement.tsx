import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TextElement as TextElementType } from '../../types/canvas';
import { useCanvasStore } from '../../store/canvasStore';

interface TextElementProps {
  element: TextElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const TextElement: React.FC<TextElementProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const background = useCanvasStore((s) => s.background);
  const isDarkCanvas = [
    'dark',
    'navy',
    'black',
    'classic-black-dot',
    'blueprint',
    'dark-grid',
    'midnight-grid',
    'dark-dots',
  ].includes(background.style);

  const displayColor = useMemo(() => {
    if (isDarkCanvas && (element.color === '#0f172a' || element.color === '#1e293b' || element.color === '#000000')) {
      return '#f1f5f9';
    }
    if (!isDarkCanvas && (element.color === '#ffffff' || element.color === '#f8fafc' || element.color === '#f1f5f9')) {
      return '#1e293b';
    }
    return element.color;
  }, [isDarkCanvas, element.color]);

  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(element.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const getFontFamilyClass = () => {
    if (element.fontFamily === 'handwriting') return 'font-handwriting';
    if (element.fontFamily === 'mono') return 'font-mono-code';
    return 'font-sans';
  };

  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={Math.max(element.width, 140)}
      height={Math.max(element.height, 40)}
      className="overflow-visible"
    >
      <div
        onClick={onSelect}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className={`w-full h-full select-none cursor-pointer rounded transition-all ${
          isSelected ? 'ring-2 ring-blue-500/80 ring-offset-1' : ''
        }`}
        style={{
          color: displayColor,
          fontSize: `${element.fontSize}px`,
          fontWeight: element.bold ? 700 : 400,
          fontStyle: element.italic ? 'italic' : 'normal',
          textDecoration: element.underline ? 'underline' : 'none',
          textAlign: element.align || 'left',
          lineHeight: '1.25',
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onBlur={handleFinishEditing}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsEditing(false);
              }
            }}
            className={`w-full h-full bg-white/95 text-slate-900 border border-blue-500 rounded p-1 resize-none focus:outline-none shadow-md ${getFontFamilyClass()}`}
            style={{
              fontSize: `${element.fontSize}px`,
              lineHeight: '1.25',
            }}
          />
        ) : (
          <div
            className={`whitespace-pre-wrap ${getFontFamilyClass()}`}
            style={{
              letterSpacing: element.fontFamily === 'handwriting' ? '0.3px' : 'normal',
            }}
          >
            {element.text}
          </div>
        )}
      </div>
    </foreignObject>
  );
};
