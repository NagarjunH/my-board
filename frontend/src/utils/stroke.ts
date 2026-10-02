import { getStroke } from 'perfect-freehand';
import { Point } from '../types/canvas';

/**
 * Filters out microscopic jitter and micro-tremors from pen tablets / stylus.
 */
export function smoothPoints(points: Point[], minDistance: number = 1.2): Point[] {
  if (points.length <= 2) return points;
  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const d = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    if (d >= minDistance || i === points.length - 1) {
      result.push(curr);
    }
  }
  return result;
}

/**
 * Converts a polygon outline (array of [x, y] pairs) into an SVG path string.
 */
export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
}

/**
 * Normalizes stylus/touch/mouse pressure to provide an effortless, fatigue-free feel.
 * Applies an ergonomic curve so light touches (even 0.05) produce solid visible lines
 * without needing to press the stylus hard.
 */
function normalizePressure(rawPressure?: number): number {
  if (rawPressure === undefined || rawPressure === null) return 0.65;
  if (rawPressure <= 0) return 0.55;
  // Ergonomic curve: baseline of 0.42 + smooth sqrt curve
  return Math.min(Math.max(0.42 + Math.sqrt(rawPressure) * 0.58, 0.42), 1.0);
}

/**
 * Generates an ultra-smooth, organic SVG path data string for a pen stroke.
 * Optimized with immediate dot/tap recognition for full stops, commas, and dots,
 * and high-responsiveness low-latency streamline tracking for natural handwriting.
 */
export function renderPenStroke(
  points: Point[],
  size: number = 4,
  thinning: number = 0.15,
  smoothing: number = 0.55,
  streamline: number = 0.35
): string {
  if (points.length === 0) return '';

  // 1. Single point tap
  if (points.length === 1) {
    const p = points[0];
    const r = Math.max(size * 0.55, 1.8);
    return `M ${p.x - r} ${p.y} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`;
  }

  // 2. Full Stop / Dot / Short tap detection:
  // When tapping lightly with a stylus or mouse to place a dot (.),
  // hardware registers 2 to 4 micro-events spanning < 4px.
  // We compute total trajectory distance:
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistance += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }

  const tapThreshold = Math.max(size * 0.85, 4.5);
  if (totalDistance < tapThreshold || (points.length <= 2 && totalDistance < 6.0)) {
    // Render clean, crisp round dot at the centroid
    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const r = Math.max(size * 0.55, 1.8);
    return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`;
  }

  const filtered = smoothPoints(points, 1.0);
  const strokePoints = filtered.map((p) => [p.x, p.y, normalizePressure(p.pressure)]);
  const stroke = getStroke(strokePoints, {
    size,
    thinning,
    smoothing,
    streamline,
    easing: (t) => Math.sin((t * Math.PI) / 2),
    start: {
      taper: Math.min(size * 0.08, 0.6),
      cap: true,
    },
    end: {
      taper: Math.min(size * 0.08, 0.6),
      cap: true,
    },
  });

  return getSvgPathFromStroke(stroke);
}

/**
 * Generates a translucent highlighter stroke with dynamic width up to 100px.
 */
export function renderHighlighterStroke(points: Point[], size: number = 28): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    const r = size / 2;
    return `M ${p.x - r} ${p.y} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`;
  }

  // Handle micro-taps with highlighter
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistance += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }

  if (totalDistance < Math.min(size * 0.4, 6.0)) {
    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const r = size / 2;
    return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`;
  }

  const filtered = smoothPoints(points, 1.5);
  const strokePoints = filtered.map((p) => [p.x, p.y, 0.5]);
  const stroke = getStroke(strokePoints, {
    size,
    thinning: 0,
    smoothing: 0.75,
    streamline: 0.5,
    simulatePressure: false,
    start: { taper: 0, cap: true },
    end: { taper: 0, cap: true },
  });

  return getSvgPathFromStroke(stroke);
}


