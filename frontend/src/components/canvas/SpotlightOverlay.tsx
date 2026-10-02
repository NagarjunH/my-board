import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useCanvasStore } from '../../store/canvasStore';
import { getElementBounds } from '../../utils/geometry';

export const SpotlightOverlay: React.FC = () => {
  const isSpotlightActive = useUIStore((s) => s.isSpotlightActive);
  const toggleSpotlight = useUIStore((s) => s.toggleSpotlight);
  const elements = useCanvasStore((s) => s.elements);
  const selectedElementIds = useCanvasStore((s) => s.selectedElementIds);
  const viewport = useCanvasStore((s) => s.viewport);

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    if (isSpotlightActive) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isSpotlightActive]);

  if (!isSpotlightActive) return null;

  // If an element is selected, spotlight that element, otherwise follow mouse
  let spotX = mousePos.x;
  let spotY = mousePos.y;
  let spotRadius = 140;

  if (selectedElementIds.length > 0) {
    const target = elements.find((el) => el.id === selectedElementIds[0]);
    if (target) {
      const bounds = getElementBounds(target);
      const screenX = bounds.minX * viewport.zoom + viewport.x + (bounds.width * viewport.zoom) / 2;
      const screenY = bounds.minY * viewport.zoom + viewport.y + (bounds.height * viewport.zoom) / 2;
      spotX = screenX;
      spotY = screenY;
      spotRadius = Math.max((Math.max(bounds.width, bounds.height) * viewport.zoom) / 2 + 50, 120);
    }
  }

  return (
    <div
      onClick={toggleSpotlight}
      className="fixed inset-0 z-50 pointer-events-auto cursor-pointer"
      title="Click to exit Spotlight mode"
    >
      <svg className="w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            {/* White background reveals the black dimming mask */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black circle cuts a hole for the spotlight beam */}
            <circle cx={spotX} cy={spotY} r={spotRadius} fill="black" />
          </mask>
        </defs>

        {/* Darkening overlay */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(5, 7, 14, 0.82)"
          mask="url(#spotlight-mask)"
        />

        {/* Illuminated halo ring around spotlight */}
        <circle
          cx={spotX}
          cy={spotY}
          r={spotRadius}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeDasharray="6,6"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};
