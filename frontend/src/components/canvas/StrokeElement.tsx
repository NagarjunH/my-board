import React, { useMemo } from 'react';
import { StrokeElement as StrokeElementType } from '../../types/canvas';
import { renderHighlighterStroke, renderPenStroke } from '../../utils/stroke';
import { useCanvasStore } from '../../store/canvasStore';

interface StrokeElementProps {
  element: StrokeElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const StrokeElement: React.FC<StrokeElementProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
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

  const pathData = useMemo(() => {
    if (element.type === 'highlighter') {
      return renderHighlighterStroke(element.points, element.size);
    }
    return renderPenStroke(element.points, element.size);
  }, [element.points, element.size, element.type]);

  const displayColor = useMemo(() => {
    if (element.type === 'highlighter') {
      return element.color;
    }
    if (isDarkCanvas && (element.color === '#1e293b' || element.color === '#0f172a' || element.color === '#000000')) {
      return '#ffffff';
    }
    if (!isDarkCanvas && (element.color === '#ffffff' || element.color === '#f8fafc')) {
      return '#1e293b';
    }
    return element.color;
  }, [element.color, element.type, isDarkCanvas]);

  if (!pathData) return null;

  const isHighlighter = element.type === 'highlighter';

  return (
    <g
      onClick={onSelect}
      className={`cursor-pointer transition-opacity ${isSelected ? 'filter drop-shadow-[0_0_2px_#3b82f6]' : ''}`}
      style={{
        mixBlendMode: isHighlighter ? (isDarkCanvas ? 'screen' : 'multiply') : 'normal',
      }}
    >
      <path
        d={pathData}
        fill={displayColor}
        fillOpacity={isHighlighter && isDarkCanvas ? 0.65 : element.opacity}
      />
    </g>
  );
};
