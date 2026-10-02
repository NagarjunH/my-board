import React from 'react';
import { BackgroundConfig } from '../../types/canvas';

interface CanvasBackgroundProps {
  config: BackgroundConfig;
  zoom: number;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({ config, zoom }) => {
  const {
    style,
    customColor,
    gridSize = 28,
    gridOpacity = 0.85,
    lineThickness = 0.8,
    patternColor,
    dotSize = 1.5,
    lineSpacing = 28,
  } = config;

  // 1. Pure White
  if (style === 'white') {
    return <div className="absolute inset-0 bg-[#FFFFFF] pointer-events-none" />;
  }

  // 2. Soft White (Warmer than pure white, subtle dots - Reference Default)
  if (style === 'soft-white') {
    const spacing = Math.max(gridSize * zoom, 16);
    const color = patternColor || '#DCD6CB';
    const r = Math.max(dotSize * Math.min(zoom, 1.5), 1.0);
    const bgColor = customColor || '#FAF8F2';

    return (
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: bgColor }}>
        <svg className="w-full h-full">
          <defs>
            <pattern id="soft-white-dots" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
              <circle
                cx={spacing / 2}
                cy={spacing / 2}
                r={r}
                fill={color}
                fillOpacity={0.75}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#soft-white-dots)" />
        </svg>
      </div>
    );
  }

  // 3. Light Gray (Excellent for black text & colored diagrams)
  if (style === 'light-gray') {
    return <div className="absolute inset-0 bg-[#F5F5F5] pointer-events-none" />;
  }

  // 4. Cream (Warm alternative to white for handwritten notes)
  if (style === 'cream') {
    return <div className="absolute inset-0 bg-[#FFF7E6] pointer-events-none" />;
  }

  // 5. Pale Blue (Great for technical diagrams)
  if (style === 'pale-blue') {
    return <div className="absolute inset-0 bg-[#EFF7FF] pointer-events-none" />;
  }

  // 6. Dark (#111318 - YouTube High Contrast)
  if (style === 'dark') {
    return <div className="absolute inset-0 bg-[#111318] pointer-events-none" />;
  }

  // 7. Deep Navy (#0B1220 - Cloud, AWS, System Design)
  if (style === 'navy') {
    return <div className="absolute inset-0 bg-[#0B1220] pointer-events-none" />;
  }

  // 8. Pure Black
  if (style === 'black') {
    return <div className="absolute inset-0 bg-[#090A0F] pointer-events-none" />;
  }

  // 9. Classic (Black + Dot) — Pristine deep black background with clean slate alignment dots
  if (style === 'classic-black-dot') {
    const spacing = Math.max(gridSize * zoom, 16);
    const color = patternColor || '#475569';
    const r = Math.max(dotSize * Math.min(zoom, 1.5), 1.0);
    const bgColor = customColor || '#0B0D13';

    return (
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: bgColor }}>
        <svg className="w-full h-full">
          <defs>
            <pattern id="classic-black-dot-pattern" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
              <circle
                cx={spacing / 2}
                cy={spacing / 2}
                r={r}
                fill={color}
                fillOpacity={gridOpacity}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#classic-black-dot-pattern)" />
        </svg>
      </div>
    );
  }

  // 10. Dotted Paper (Background: #FFFFFF, Dots: #D9DDE3)
  if (style === 'dotted') {
    const spacing = Math.max(gridSize * zoom, 12);
    const color = patternColor || '#D9DDE3';
    const r = Math.max(dotSize * Math.min(zoom, 1.5), 0.8);
    const bgColor = customColor || '#FFFFFF';

    return (
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: bgColor }}>
        <svg className="w-full h-full">
          <defs>
            <pattern id="dotted-pattern" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
              <circle
                cx={spacing / 2}
                cy={spacing / 2}
                r={r}
                fill={color}
                fillOpacity={gridOpacity}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotted-pattern)" />
        </svg>
      </div>
    );
  }

  // 11. Graph Paper (Background: #FFFFFF, Grid: #DDE3EA)
  if (style === 'graph' || style === 'grid') {
    const spacing = Math.max(gridSize * zoom, 12);
    const color = patternColor || '#DDE3EA';
    const strokeWidth = Math.max(lineThickness * Math.min(zoom, 1.2), 0.5);
    const bgColor = customColor || '#FFFFFF';

    return (
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: bgColor }}>
        <svg className="w-full h-full">
          <defs>
            <pattern id="graph-paper-pattern" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
              <path
                d={`M ${spacing} 0 L 0 0 0 ${spacing}`}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeOpacity={gridOpacity}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-paper-pattern)" />
        </svg>
      </div>
    );
  }

  // 12. Ruled Notebook (Background: #FFFDF7, Lines: #D8E0EA)
  if (style === 'ruled' || style === 'notebook') {
    const spacing = Math.max(lineSpacing * zoom, 16);
    const color = patternColor || '#D8E0EA';
    const strokeWidth = Math.max(lineThickness * Math.min(zoom, 1.2), 0.8);
    const bgColor = customColor || '#FFFDF7';
    const marginPos = 80 * zoom;

    return (
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: bgColor }}>
        <svg className="w-full h-full">
          <defs>
            <pattern id="ruled-paper-pattern" width="100" height={spacing} patternUnits="userSpaceOnUse">
              <line
                x1="0"
                y1={spacing - 1}
                x2="100"
                y2={spacing - 1}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeOpacity={gridOpacity}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ruled-paper-pattern)" />
          {/* Subtle notebook vertical margin line */}
          <line
            x1={marginPos}
            y1="0"
            x2={marginPos}
            y2="100%"
            stroke="#FCA5A5"
            strokeWidth={1.2 * Math.min(zoom, 1.2)}
            strokeOpacity={0.65}
          />
        </svg>
      </div>
    );
  }

  // 13. Blueprint (Background: #0F2A43, Grid: #315A78)
  if (style === 'blueprint') {
    const spacing = Math.max(gridSize * zoom, 16);
    const color = patternColor || '#315A78';
    const strokeWidth = Math.max(lineThickness * Math.min(zoom, 1.2), 0.75);

    return (
      <div className="absolute inset-0 bg-[#0F2A43] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id="blueprint-pattern" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
              <path
                d={`M ${spacing} 0 L 0 0 0 ${spacing}`}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeOpacity={gridOpacity}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-pattern)" />
        </svg>
      </div>
    );
  }

  // 14. Midnight Grid (Background: #0B1220, Grid: #1E293B)
  if (style === 'midnight-grid') {
    const spacing = Math.max(gridSize * zoom, 16);
    const color = patternColor || '#1E293B';
    const strokeWidth = Math.max(lineThickness * Math.min(zoom, 1.2), 0.75);

    return (
      <div className="absolute inset-0 bg-[#0B1220] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id="midnight-pattern" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
              <path
                d={`M ${spacing} 0 L 0 0 0 ${spacing}`}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeOpacity={gridOpacity}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#midnight-pattern)" />
        </svg>
      </div>
    );
  }

  // 15. Dark Mode Dots (Background: #111318, Dots: #334155)
  if (style === 'dark-dots') {
    const spacing = Math.max(gridSize * zoom, 16);
    const color = patternColor || '#334155';
    const r = Math.max(dotSize * Math.min(zoom, 1.5), 1.0);

    return (
      <div className="absolute inset-0 bg-[#111318] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id="dark-dots-pattern" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
              <circle
                cx={spacing / 2}
                cy={spacing / 2}
                r={r}
                fill={color}
                fillOpacity={gridOpacity}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dark-dots-pattern)" />
        </svg>
      </div>
    );
  }

  // Fallback / Custom Solid Color
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ backgroundColor: customColor || '#FAFAF8' }}
    />
  );
};
