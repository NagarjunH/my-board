import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useCanvasStore } from '../../store/canvasStore';
import { Search, X } from 'lucide-react';

export const MagnifierOverlay: React.FC = () => {
  const isMagnifierActive = useUIStore((s) => s.isMagnifierActive);
  const toggleMagnifier = useUIStore((s) => s.toggleMagnifier);
  const viewport = useCanvasStore((s) => s.viewport);

  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    if (!isMagnifierActive) return;
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [isMagnifierActive]);

  if (!isMagnifierActive) return null;

  const size = 200;
  const zoomFactor = 2;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 select-none">
      {/* Magnifier lens following the cursor */}
      <div
        style={{
          left: mousePos.x - size / 2,
          top: mousePos.y - size / 2,
          width: size,
          height: size,
        }}
        className="absolute rounded-full border-4 border-blue-500/80 shadow-[0_0_25px_rgba(59,130,246,0.5)] overflow-hidden bg-slate-900/10 backdrop-blur-[0.5px] pointer-events-auto cursor-crosshair flex items-center justify-center group"
      >
        {/* Loupe Crosshair overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-[1px] bg-blue-400/60" />
          <div className="h-8 w-[1px] bg-blue-400/60 absolute" />
        </div>

        {/* Badge & Close Button on hover */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Search className="w-3 h-3" />
          <span>{zoomFactor}X Loupe</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMagnifier();
            }}
            className="ml-1 hover:text-red-200"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
