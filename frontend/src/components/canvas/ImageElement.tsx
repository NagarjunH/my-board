import React from 'react';
import { ImageElement as ImageElementType } from '../../types/canvas';

interface ImageElementProps {
  element: ImageElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const ImageElement: React.FC<ImageElementProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={Math.max(element.width, 40)}
      height={Math.max(element.height, 40)}
      className="overflow-visible"
    >
      <div
        onClick={onSelect}
        className={`w-full h-full rounded-xl overflow-hidden shadow-lg select-none cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-slate-400'
        }`}
      >
        <img
          src={element.src}
          alt="Whiteboard Asset"
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>
    </foreignObject>
  );
};
