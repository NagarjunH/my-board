import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '../../store/canvasStore';

interface TrailPoint {
  worldX: number;
  worldY: number;
  time: number;
}

interface PingEffect {
  x: number;
  y: number;
  time: number;
}

interface LaserPointerLayerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(239, 68, 68, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const LaserPointerLayer: React.FC<LaserPointerLayerProps> = ({ containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const viewport = useCanvasStore((s) => s.viewport);
  const color = useCanvasStore((s) => s.color);

  // Active laser color (defaults to classic red #ef4444 on dark/light ink defaults)
  const laserColor =
    color === '#1e293b' || color === '#0f172a' || color === '#000000' || color === '#ffffff' || color === '#f8fafc'
      ? '#ef4444'
      : color;

  const pointsRef = useRef<TrailPoint[]>([]);
  const pingsRef = useRef<PingEffect[]>([]);
  const isPointerDownRef = useRef(false);
  const cursorRef = useRef<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  // Pointer event listeners on the canvas container
  useEffect(() => {
    if (activeTool !== 'laser') {
      pointsRef.current = [];
      pingsRef.current = [];
      cursorRef.current.visible = false;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const toWorld = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const vp = viewportRef.current;
      return {
        screenX: sx,
        screenY: sy,
        worldX: (sx - vp.x) / vp.zoom,
        worldY: (sy - vp.y) / vp.zoom,
      };
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isPointerDownRef.current = true;
      const { screenX, screenY, worldX, worldY } = toWorld(e.clientX, e.clientY);
      cursorRef.current = { x: screenX, y: screenY, visible: true };

      const now = Date.now();
      pointsRef.current.push({ worldX, worldY, time: now });
      pingsRef.current.push({ x: screenX, y: screenY, time: now });
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!isInside && !isPointerDownRef.current) {
        cursorRef.current.visible = false;
        return;
      }

      const { screenX, screenY, worldX, worldY } = toWorld(e.clientX, e.clientY);
      cursorRef.current = { x: screenX, y: screenY, visible: true };

      if (isPointerDownRef.current) {
        // Collect coalesced events for high-refresh-rate tablet precision
        const rawEvents = (e as any).getCoalescedEvents ? (e as any).getCoalescedEvents() : [e];
        const now = Date.now();

        for (const ev of rawEvents) {
          const pt = toWorld(ev.clientX, ev.clientY);
          const pts = pointsRef.current;
          const last = pts[pts.length - 1];

          // Threshold: 1.5 world px avoids micro-jitter while preserving curves
          if (!last || Math.hypot(pt.worldX - last.worldX, pt.worldY - last.worldY) >= 1.5) {
            pts.push({ worldX: pt.worldX, worldY: pt.worldY, time: now });
          }
        }
      }
    };

    const handlePointerUp = () => {
      isPointerDownRef.current = false;
    };

    const handlePointerEnter = (e: PointerEvent) => {
      const { screenX, screenY } = toWorld(e.clientX, e.clientY);
      cursorRef.current = { x: screenX, y: screenY, visible: true };
    };

    const handlePointerLeave = () => {
      if (!isPointerDownRef.current) {
        cursorRef.current.visible = false;
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointerenter', handlePointerEnter);
    container.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [activeTool, containerRef]);

  // High-performance 60-120fps hardware-accelerated canvas render loop
  useEffect(() => {
    if (activeTool !== 'laser') return;

    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        animId = requestAnimationFrame(render);
        return;
      }

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Ensure canvas resolution matches container bounds
      const displayWidth = Math.round(rect.width * dpr);
      const displayHeight = Math.round(rect.height * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();
      const DURATION = 1100; // 1.1s decay duration

      // 1. Purge expired trail points
      pointsRef.current = pointsRef.current.filter((p) => now - p.time < DURATION);
      const rawPoints = pointsRef.current;
      const vp = viewportRef.current;

      // Map world points to screen coordinates
      const screenPoints = rawPoints.map((p) => ({
        x: (p.worldX * vp.zoom + vp.x) * dpr,
        y: (p.worldY * vp.zoom + vp.y) * dpr,
        time: p.time,
      }));

      // 2. Render Buttery-Smooth Bézier Spline Laser Trail
      if (screenPoints.length >= 2) {
        for (let i = 0; i < screenPoints.length - 1; i++) {
          const p0 = i > 0 ? screenPoints[i - 1] : screenPoints[i];
          const p1 = screenPoints[i];
          const p2 = screenPoints[i + 1];

          const startX = (p0.x + p1.x) / 2;
          const startY = (p0.y + p1.y) / 2;
          const endX = (p1.x + p2.x) / 2;
          const endY = (p1.y + p2.y) / 2;

          const age = now - p1.time;
          const progress = Math.min(Math.max(age / DURATION, 0), 1);
          const alpha = Math.pow(1 - progress, 1.3);
          if (alpha <= 0.01) continue;

          // 4px laser pointer with smooth tail taper
          const LASER_SIZE = 4.0;
          const width = (2.8 * Math.pow(1 - progress, 0.7) + 1.2) * dpr; // Peaks at 4px
          if (width < 0.5 * dpr) continue;

          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Pass 1: Outer diffuse neon glow
          ctx.strokeStyle = hexToRgba(laserColor, alpha * 0.35);
          ctx.lineWidth = width * 1.8;
          ctx.shadowColor = laserColor;
          ctx.shadowBlur = 6 * dpr;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(p1.x, p1.y, endX, endY);
          ctx.stroke();

          // Pass 2: Main vibrant 4px laser beam
          ctx.strokeStyle = hexToRgba(laserColor, alpha * 0.95);
          ctx.lineWidth = width;
          ctx.shadowColor = laserColor;
          ctx.shadowBlur = 3 * dpr;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(p1.x, p1.y, endX, endY);
          ctx.stroke();

          // Pass 3: Sizzling hot white core filament
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
          ctx.lineWidth = Math.max(width * 0.35, 1.0 * dpr);
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 1.5 * dpr;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(p1.x, p1.y, endX, endY);
          ctx.stroke();

          ctx.restore();
        }
      }

      // 3. Render Click Shockwave / Pings
      pingsRef.current = pingsRef.current.filter((p) => now - p.time < 400);
      for (const ping of pingsRef.current) {
        const elapsed = now - ping.time;
        const t = elapsed / 400;
        const r = (3 + t * 18) * dpr;
        const alpha = Math.max(0, 1 - t);

        ctx.save();
        ctx.strokeStyle = hexToRgba(laserColor, alpha * 0.9);
        ctx.lineWidth = Math.max(0.8, 1.8 * (1 - t * 0.6)) * dpr;
        ctx.shadowColor = laserColor;
        ctx.shadowBlur = 4 * dpr;
        ctx.beginPath();
        ctx.arc(ping.x * dpr, ping.y * dpr, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Render Glowing Laser Tip (4px Cursor Dot)
      if (cursorRef.current.visible) {
        const cx = cursorRef.current.x * dpr;
        const cy = cursorRef.current.y * dpr;
        const pulse = Math.sin(now / 100) * 0.8 * dpr;

        ctx.save();

        // Layer 1: Subtle outer halo
        const radius = 7 * dpr + pulse;
        const grad = ctx.createRadialGradient(cx, cy, 1 * dpr, cx, cy, radius);
        grad.addColorStop(0, hexToRgba(laserColor, 0.75));
        grad.addColorStop(0.5, hexToRgba(laserColor, 0.25));
        grad.addColorStop(1, hexToRgba(laserColor, 0));

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Layer 2: 4px neon core (radius = 2px)
        ctx.fillStyle = laserColor;
        ctx.shadowColor = laserColor;
        ctx.shadowBlur = 5 * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.0 * dpr, 0, Math.PI * 2);
        ctx.fill();

        // Layer 3: Piercing white center point (radius = 1px)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 2 * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, 1.0 * dpr, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTool, containerRef, laserColor]);

  if (activeTool !== 'laser') return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
    />
  );
};
