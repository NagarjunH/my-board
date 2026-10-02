import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { X, RotateCw } from 'lucide-react';

export const RulerOverlay: React.FC = () => {
  const isRulerActive = useUIStore((s) => s.isRulerActive);
  const toggleRuler = useUIStore((s) => s.toggleRuler);

  const [pos, setPos] = useState({ x: 200, y: 300 });
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (!isRulerActive) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAngle((prev) => (prev + 45) % 360);
  };

  const totalUnits = 24; // 24 cm equivalent

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${angle}deg)`,
        transformOrigin: '0 0',
      }}
      className="fixed z-50 w-[540px] h-20 bg-amber-50/80 backdrop-blur-md border border-amber-300 rounded-xl shadow-2xl cursor-move select-none flex flex-col justify-between p-2 font-mono text-slate-800"
    >
      {/* Top Ruler Metric Marks */}
      <div className="relative w-full h-8 border-b border-amber-400/80 flex items-start">
        {Array.from({ length: totalUnits + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{ left: `${(i / totalUnits) * 100}%` }}
          >
            <div className={`w-px bg-slate-800 ${i % 5 === 0 ? 'h-5' : 'h-2.5'}`} />
            {i % 2 === 0 && <span className="text-[9px] font-bold mt-0.5">{i}</span>}
          </div>
        ))}
      </div>

      {/* Middle Tools & Angle label */}
      <div className="flex items-center justify-between text-xs px-2 text-slate-600">
        <span className="font-bold text-[11px] tracking-wider text-amber-900">ACRYLIC RULER — {angle}°</span>

        <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={handleRotate}
            className="p-1 hover:bg-amber-200/60 rounded text-slate-700 transition-colors"
            title="Rotate 45°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleRuler}
            className="p-1 hover:bg-rose-200/60 text-rose-700 rounded transition-colors"
            title="Close ruler"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
