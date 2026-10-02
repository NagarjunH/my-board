import React from 'react';
import { CanvasElement } from '../../types/canvas';
import { getElementBounds } from '../../utils/geometry';

interface SelectionOverlayProps {
  element: CanvasElement;
  onResizeStart?: (handle: 'nw' | 'ne' | 'se' | 'sw', e: React.MouseEvent) => void;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ element, onResizeStart }) => {
  const bounds = getElementBounds(element);
  const handleSize = 8;

  return (
    <g className="pointer-events-none">
      {/* Bounding box outline */}
      <rect
        x={bounds.minX - 2}
        y={bounds.minY - 2}
        width={bounds.width + 4}
        height={bounds.height + 4}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeDasharray="4,4"
      />

      {/* Interactive Corner Resize Handles */}
      <rect
        x={bounds.minX - handleSize / 2}
        y={bounds.minY - handleSize / 2}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke="#3b82f6"
        strokeWidth="1.5"
        className="pointer-events-auto cursor-nwse-resize"
        onMouseDown={(e) => onResizeStart?.('nw', e)}
      />
      <rect
        x={bounds.maxX - handleSize / 2}
        y={bounds.minY - handleSize / 2}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke="#3b82f6"
        strokeWidth="1.5"
        className="pointer-events-auto cursor-nesw-resize"
        onMouseDown={(e) => onResizeStart?.('ne', e)}
      />
      <rect
        x={bounds.maxX - handleSize / 2}
        y={bounds.maxY - handleSize / 2}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke="#3b82f6"
        strokeWidth="1.5"
        className="pointer-events-auto cursor-nwse-resize"
        onMouseDown={(e) => onResizeStart?.('se', e)}
      />
      <rect
        x={bounds.minX - handleSize / 2}
        y={bounds.maxY - handleSize / 2}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke="#3b82f6"
        strokeWidth="1.5"
        className="pointer-events-auto cursor-nesw-resize"
        onMouseDown={(e) => onResizeStart?.('sw', e)}
      />
    </g>
  );
};
