import { Point, ShapeType } from '../types/canvas';

export interface RecognizedShape {
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Resamples and simplifies points by minimum distance.
 */
function simplifyStroke(points: Point[], minGap = 4): Point[] {
  if (points.length <= 2) return points;
  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    if (Math.hypot(curr.x - prev.x, curr.y - prev.y) >= minGap) {
      result.push(curr);
    }
  }
  if (result.length < 2) result.push(points[points.length - 1]);
  return result;
}

/**
 * Recognizes rough hand-drawn freehand strokes and snaps them to clean geometric vector shapes.
 * Handles Lines, Circles, Ellipses, Rectangles, and Triangles with forgiving tolerances.
 */
export function recognizeDrawnShape(rawPoints: Point[]): RecognizedShape | null {
  if (rawPoints.length < 4) return null;

  const points = simplifyStroke(rawPoints, 3);
  if (points.length < 3) return null;

  const start = points[0];
  const end = points[points.length - 1];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let totalLength = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;

    if (i > 0) {
      totalLength += Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y);
    }
  }

  const width = maxX - minX;
  const height = maxY - minY;

  // Ignore accidental tiny taps
  if (width < 20 && height < 20 && totalLength < 35) return null;

  const startEndDist = Math.hypot(end.x - start.x, end.y - start.y);

  // -------------------------------------------------------------
  // 1. STRAIGHT LINE DETECTION
  // -------------------------------------------------------------
  // Check if start and end are far apart and path doesn't loop
  if (startEndDist >= 30 && totalLength > 0) {
    const chordRatio = startEndDist / totalLength;

    // Calculate max perpendicular distance from chord
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lineMag = Math.hypot(dx, dy);

    let maxPerpDist = 0;
    if (lineMag > 0) {
      for (const p of points) {
        // Distance from point to line formula: |dy*x - dx*y + x2*y1 - y2*x1| / lineMag
        const perp = Math.abs(dy * p.x - dx * p.y + end.x * start.y - end.y * start.x) / lineMag;
        if (perp > maxPerpDist) maxPerpDist = perp;
      }
    }

    // If points stay very close to the chord line
    if (chordRatio > 0.72 && maxPerpDist < Math.max(startEndDist * 0.18, 24)) {
      return {
        type: 'line',
        x: start.x,
        y: start.y,
        width: end.x - start.x,
        height: end.y - start.y,
      };
    }
  }

  // -------------------------------------------------------------
  // 2. CLOSED SHAPE DETECTION (Circle, Ellipse, Rectangle, Triangle)
  // -------------------------------------------------------------
  const closingThreshold = Math.max(totalLength * 0.35, 75);
  const isClosed = startEndDist <= closingThreshold;

  if (isClosed && points.length >= 6) {
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const avgRadius = (width + height) / 4;

    // Calculate radial deviation from center
    let totalDev = 0;
    for (const p of points) {
      const d = Math.hypot(p.x - centerX, p.y - centerY);
      totalDev += Math.abs(d - avgRadius);
    }
    const avgDeviation = totalDev / points.length;
    const relDeviation = avgRadius > 0 ? avgDeviation / avgRadius : 1;
    const aspectRatio = width / (height || 1);

    // Circle: radial deviation is low and aspect ratio close to 1:1
    if (relDeviation < 0.30 && aspectRatio >= 0.65 && aspectRatio <= 1.55) {
      const radius = Math.max(width, height) / 2;
      return {
        type: 'circle',
        x: centerX - radius,
        y: centerY - radius,
        width: radius * 2,
        height: radius * 2,
      };
    }

    // Ellipse: radial deviation low but elongated
    if (relDeviation < 0.28) {
      return {
        type: 'ellipse',
        x: minX,
        y: minY,
        width,
        height,
      };
    }

    // Detect sharp corners by measuring direction turns
    let cornerCount = 0;
    const step = Math.max(Math.floor(points.length / 10), 2);
    for (let i = step; i < points.length - step; i += step) {
      const prev = points[i - step];
      const curr = points[i];
      const next = points[i + step];

      const v1x = curr.x - prev.x;
      const v1y = curr.y - prev.y;
      const v2x = next.x - curr.x;
      const v2y = next.y - curr.y;

      const m1 = Math.hypot(v1x, v1y);
      const m2 = Math.hypot(v2x, v2y);

      if (m1 > 0 && m2 > 0) {
        const dot = (v1x * v2x + v1y * v2y) / (m1 * m2);
        // Angle sharper than ~75 degrees (cos < 0.25)
        if (dot < 0.25) {
          cornerCount++;
        }
      }
    }

    // Triangle check: ~3 sharp corners
    if (cornerCount === 3) {
      return {
        type: 'triangle',
        x: minX,
        y: minY,
        width,
        height,
      };
    }

    // Rectangle check: ~4 corners or closed perimeter
    return {
      type: 'rectangle',
      x: minX,
      y: minY,
      width,
      height,
    };
  }

  return null;
}
