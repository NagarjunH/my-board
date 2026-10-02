import React, { useMemo } from 'react';
import { ShapeElement as ShapeElementType } from '../../types/canvas';
import { getArrowHeadPoints } from '../../utils/geometry';
import { useCanvasStore } from '../../store/canvasStore';

interface ShapeElementProps {
  element: ShapeElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const ShapeElement: React.FC<ShapeElementProps> = ({
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

  const {
    type,
    x,
    y,
    width,
    height,
    strokeColor,
    fillColor = 'transparent',
    strokeWidth,
    strokeStyle,
    cornerRadius = 0,
  } = element;

  const displayStrokeColor = useMemo(() => {
    if (isDarkCanvas && (strokeColor === '#0f172a' || strokeColor === '#1e293b' || strokeColor === '#000000')) {
      return '#f1f5f9';
    }
    if (!isDarkCanvas && (strokeColor === '#ffffff' || strokeColor === '#f8fafc' || strokeColor === '#f1f5f9')) {
      return '#1e293b';
    }
    return strokeColor;
  }, [isDarkCanvas, strokeColor]);

  const strokeDasharray =
    strokeStyle === 'dashed' ? '6,6' : strokeStyle === 'dotted' ? '2,4' : undefined;

  const renderShape = () => {
    switch (type) {
      case 'rectangle':
        return (
          <rect
            x={x}
            y={y}
            width={Math.max(width, 1)}
            height={Math.max(height, 1)}
            stroke={displayStrokeColor}
            fill={fillColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        );

      case 'rounded-rectangle':
        return (
          <rect
            x={x}
            y={y}
            width={Math.max(width, 1)}
            height={Math.max(height, 1)}
            rx={cornerRadius || 10}
            ry={cornerRadius || 10}
            stroke={displayStrokeColor}
            fill={fillColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        );

      case 'circle': {
        const radius = Math.max(Math.min(Math.abs(width), Math.abs(height)) / 2, 2);
        return (
          <circle
            cx={x + radius}
            cy={y + radius}
            r={radius}
            stroke={displayStrokeColor}
            fill={fillColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        );
      }

      case 'ellipse': {
        const rx = Math.max(Math.abs(width) / 2, 2);
        const ry = Math.max(Math.abs(height) / 2, 2);
        return (
          <ellipse
            cx={x + rx}
            cy={y + ry}
            rx={rx}
            ry={ry}
            stroke={displayStrokeColor}
            fill={fillColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        );
      }

      case 'triangle': {
        const p1 = `${x + width / 2},${y}`;
        const p2 = `${x},${y + height}`;
        const p3 = `${x + width},${y + height}`;
        return (
          <polygon
            points={`${p1} ${p2} ${p3}`}
            stroke={displayStrokeColor}
            fill={fillColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        );
      }

      case 'line':
        return (
          <line
            x1={x}
            y1={y}
            x2={x + width}
            y2={y + height}
            stroke={displayStrokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        );

      case 'arrow': {
        const toX = x + width;
        const toY = y + height;
        const head = getArrowHeadPoints(x, y, toX, toY, 12);
        return (
          <g>
            <line
              x1={x}
              y1={y}
              x2={toX}
              y2={toY}
              stroke={displayStrokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
            <polygon
              points={`${toX},${toY} ${head.p1.x},${head.p1.y} ${head.p2.x},${head.p2.y}`}
              fill={displayStrokeColor}
            />
          </g>
        );
      }

      case 'double-arrow': {
        const toX = x + width;
        const toY = y + height;
        const headEnd = getArrowHeadPoints(x, y, toX, toY, 12);
        const headStart = getArrowHeadPoints(toX, toY, x, y, 12);
        return (
          <g>
            <line
              x1={x}
              y1={y}
              x2={toX}
              y2={toY}
              stroke={displayStrokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
            <polygon
              points={`${toX},${toY} ${headEnd.p1.x},${headEnd.p1.y} ${headEnd.p2.x},${headEnd.p2.y}`}
              fill={displayStrokeColor}
            />
            <polygon
              points={`${x},${y} ${headStart.p1.x},${headStart.p1.y} ${headStart.p2.x},${headStart.p2.y}`}
              fill={displayStrokeColor}
            />
          </g>
        );
      }

      default:
        return null;
    }
  };

  return (
    <g
      onClick={onSelect}
      className={`cursor-pointer transition-all ${
        isSelected ? 'filter drop-shadow-[0_0_3px_#3b82f6]' : ''
      }`}
    >
      {renderShape()}
    </g>
  );
};
