import { getStroke } from 'perfect-freehand';
import { Point } from '../types/canvas';

/**
 * Filters out microscopic sensor noise and micro-tremors from pen tablets / stylus,
 * while preserving every subtle curve and loop of natural handwriting.
 */
export function smoothPoints(points: Point[], minDistance: number = 0.6): Point[] {
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
 * Converts a polygon outline (array of [x, y] pairs) into a continuous,
 * G1-smooth quadratic Bézier SVG path string without angular faceting or kinks.
 */
export function getSvgPathFromStroke(stroke: number[][], closed: boolean = true): string {
  const len = stroke.length;
  if (!len) return '';
  if (len === 1) {
    const [x, y] = stroke[0];
    return `M ${x.toFixed(2)} ${y.toFixed(2)} Z`;
  }
  if (len < 4) {
    return `M ${stroke.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ')} Z`;
  }

  const average = (a: number, b: number) => (a + b) / 2;

  let a = stroke[0];
  let b = stroke[1];
  const c = stroke[2];

  let result = `M ${a[0].toFixed(2)} ${a[1].toFixed(2)} Q ${b[0].toFixed(2)} ${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)} ${average(b[1], c[1]).toFixed(2)} T `;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = stroke[i];
    b = stroke[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)} ${average(a[1], b[1]).toFixed(2)} `;
  }

  if (closed) {
    result += 'Z';
  }
  return result;
}

/**
 * Normalizes stylus/touch/mouse pressure to provide an effortless, fatigue-free feel.
 * Applies an ergonomic curve so light touches (even 0.05) produce solid visible lines
 * without needing to press the stylus hard.
 */
function normalizePressure(rawPressure?: number): number {
  if (rawPressure === undefined || rawPressure === null || rawPressure === 0) return 0.55;
  // Ergonomic curve: baseline of 0.46 + smooth sqrt curve for consistent handwriting
  return Math.min(Math.max(0.46 + Math.sqrt(rawPressure) * 0.54, 0.46), 1.0);
}

/**
 * Generates an ultra-smooth, organic SVG path data string for a pen stroke.
 * Optimized with immediate dot/tap recognition for full stops, commas, and dots,
 * and high-responsiveness low-latency streamline tracking for natural cursive handwriting.
 */
export function renderPenStroke(
  points: Point[],
  size: number = 4,
  isComplete: boolean = true,
  thinning: number = 0.10,
  smoothing: number = 0.48,
  streamline: number = 0.28
): string {
  if (points.length === 0) return '';

  // 1. Single point tap (instant dot)
  if (points.length === 1) {
    const p = points[0];
    const r = Math.max(size * 0.5, 1.8);
    return `M ${(p.x - r).toFixed(2)} ${p.y.toFixed(2)} a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(r * 2).toFixed(2)} 0 a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-r * 2).toFixed(2)} 0`;
  }

  // 2. Full Stop / Dot / Short tap detection:
  // When tapping lightly with a stylus or mouse to place a dot (.),
  // hardware registers 2 to 4 micro-events spanning < 6px.
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistance += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }

  const tapThreshold = Math.max(size * 0.8, 5.0);
  if (totalDistance < tapThreshold || (points.length <= 4 && totalDistance < 6.5)) {
    // Render clean, crisp round dot at the centroid
    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const r = Math.max(size * 0.5, 1.8);
    return `M ${(cx - r).toFixed(2)} ${cy.toFixed(2)} a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(r * 2).toFixed(2)} 0 a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-r * 2).toFixed(2)} 0`;
  }

  const filtered = smoothPoints(points, 0.6);
  const strokePoints = filtered.map((p) => [p.x, p.y, normalizePressure(p.pressure)]);
  const stroke = getStroke(strokePoints, {
    size,
    thinning,
    smoothing,
    streamline,
    simulatePressure: false,
    last: isComplete,
    start: {
      cap: true,
      taper: isComplete ? Math.min(size * 0.15, 0.8) : 0,
    },
    end: {
      cap: true,
      taper: isComplete ? Math.min(size * 0.15, 0.8) : 0,
    },
  });

  return getSvgPathFromStroke(stroke, true);
}

/**
 * Generates a translucent highlighter stroke with dynamic width up to 100px.
 */
export function renderHighlighterStroke(
  points: Point[],
  size: number = 28,
  isComplete: boolean = true
): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    const r = size / 2;
    return `M ${(p.x - r).toFixed(2)} ${p.y.toFixed(2)} a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(r * 2).toFixed(2)} 0 a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-r * 2).toFixed(2)} 0`;
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
    return `M ${(cx - r).toFixed(2)} ${cy.toFixed(2)} a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(r * 2).toFixed(2)} 0 a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-r * 2).toFixed(2)} 0`;
  }

  const filtered = smoothPoints(points, 0.8);
  const strokePoints = filtered.map((p) => [p.x, p.y, 0.5]);
  const stroke = getStroke(strokePoints, {
    size,
    thinning: 0,
    smoothing: 0.60,
    streamline: 0.25,
    simulatePressure: false,
    last: isComplete,
    start: { taper: 0, cap: true },
    end: { taper: 0, cap: true },
  });

  return getSvgPathFromStroke(stroke, true);
}
