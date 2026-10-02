import { CanvasElement, Point } from '../types/canvas';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function getElementBounds(element: CanvasElement): BoundingBox {
  if (element.type === 'pen' || element.type === 'highlighter') {
    if (element.points.length === 0) {
      return { minX: element.x, minY: element.y, maxX: element.x, maxY: element.y, width: 0, height: 0 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of element.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const pad = (element.size || 10) / 2;
    return {
      minX: minX - pad,
      minY: minY - pad,
      maxX: maxX + pad,
      maxY: maxY + pad,
      width: maxX - minX + pad * 2,
      height: maxY - minY + pad * 2,
    };
  }

  const minX = element.x;
  const minY = element.y;
  const maxX = element.x + Math.abs(element.width);
  const maxY = element.y + Math.abs(element.height);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.abs(element.width),
    height: Math.abs(element.height),
  };
}

export function isPointInsideBounds(point: Point, bounds: BoundingBox, tolerance: number = 5): boolean {
  return (
    point.x >= bounds.minX - tolerance &&
    point.x <= bounds.maxX + tolerance &&
    point.y >= bounds.minY - tolerance &&
    point.y <= bounds.maxY + tolerance
  );
}

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * Calculates arrowhead points for rendering directional arrows.
 */
export function getArrowHeadPoints(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  headLength: number = 14
): { p1: Point; p2: Point } {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const angle1 = angle - Math.PI / 6;
  const angle2 = angle + Math.PI / 6;

  return {
    p1: {
      x: toX - headLength * Math.cos(angle1),
      y: toY - headLength * Math.sin(angle1),
    },
    p2: {
      x: toX - headLength * Math.cos(angle2),
      y: toY - headLength * Math.sin(angle2),
    },
  };
}
