import { jsPDF } from 'jspdf';
import { Board, Page } from '../types/board';
import { CanvasElement } from '../types/canvas';
import { renderHighlighterStroke, renderPenStroke } from '../utils/stroke';
import { getArrowHeadPoints, BoundingBox } from '../utils/geometry';

/**
 * Calculates the bounding box enclosing ALL elements on a page.
 * Adds comfortable padding so no stroke or block is ever clipped.
 */
export function getPageContentBounds(elements: CanvasElement[], padding: number = 80): BoundingBox {
  if (!elements || elements.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 1920,
      maxY: 1080,
      width: 1920,
      height: 1080,
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    if (el.type === 'pen' || el.type === 'highlighter') {
      const halfSize = (el.size || 4) / 2;
      for (const p of el.points) {
        if (p.x - halfSize < minX) minX = p.x - halfSize;
        if (p.y - halfSize < minY) minY = p.y - halfSize;
        if (p.x + halfSize > maxX) maxX = p.x + halfSize;
        if (p.y + halfSize > maxY) maxY = p.y + halfSize;
      }
    } else {
      const elW = Math.abs(el.width || 100);
      const elH = Math.abs(el.height || 60);
      if (el.x < minX) minX = el.x;
      if (el.y < minY) minY = el.y;
      if (el.x + elW > maxX) maxX = el.x + elW;
      if (el.y + elH > maxY) maxY = el.y + elH;
    }
  }

  // Fallback if numbers are invalid
  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    return { minX: 0, minY: 0, maxX: 1920, maxY: 1080, width: 1920, height: 1080 };
  }

  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const width = Math.max(maxX - minX, 400);
  const height = Math.max(maxY - minY, 300);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
  };
}

/**
 * Returns background fill color and pattern config for rendering.
 */
function getBackgroundStyleInfo(style?: string): { color: string; isDark: boolean; pattern?: 'dots' | 'grid' } {
  switch (style) {
    case 'soft-white':
      return { color: '#FAF8F2', isDark: false, pattern: 'dots' };
    case 'light-gray':
      return { color: '#F5F5F5', isDark: false };
    case 'cream':
      return { color: '#FFF7E6', isDark: false };
    case 'pale-blue':
      return { color: '#EFF7FF', isDark: false };
    case 'dark':
      return { color: '#111318', isDark: true };
    case 'navy':
      return { color: '#0B1220', isDark: true };
    case 'black':
      return { color: '#090A0F', isDark: true };
    case 'classic-black-dot':
      return { color: '#0B0D13', isDark: true, pattern: 'dots' };
    case 'blueprint':
      return { color: '#003366', isDark: true, pattern: 'grid' };
    case 'chalkboard':
      return { color: '#1E382B', isDark: true };
    case 'dark-grid':
      return { color: '#111318', isDark: true, pattern: 'grid' };
    case 'grid':
      return { color: '#FAF8F2', isDark: false, pattern: 'grid' };
    case 'white':
    default:
      return { color: '#FFFFFF', isDark: false };
  }
}

/**
 * High-fidelity Canvas 2D rasterizer for an entire lesson page.
 * Renders all vector paths, text, shapes, and code blocks at 2x sharpness.
 */
export async function renderPageToCanvas(
  page: Page,
  scale: number = 2
): Promise<{ canvas: HTMLCanvasElement; bounds: BoundingBox }> {
  const elements = page.canvasState?.elements || [];
  const bounds = getPageContentBounds(elements, 80);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bounds.width * scale);
  canvas.height = Math.round(bounds.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Scale for high-DPI output
  ctx.scale(scale, scale);

  const bgInfo = getBackgroundStyleInfo(page.backgroundConfig?.style);

  // 1. Fill Background
  ctx.fillStyle = bgInfo.color;
  ctx.fillRect(0, 0, bounds.width, bounds.height);

  // Background pattern (dots or grid)
  if (bgInfo.pattern === 'dots') {
    ctx.fillStyle = bgInfo.isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(203, 213, 225, 0.6)';
    const spacing = 28;
    const startX = ((bounds.minX % spacing) + spacing) % spacing;
    const startY = ((bounds.minY % spacing) + spacing) % spacing;
    for (let x = -startX; x < bounds.width; x += spacing) {
      for (let y = -startY; y < bounds.height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (bgInfo.pattern === 'grid') {
    ctx.strokeStyle = bgInfo.isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(203, 213, 225, 0.5)';
    ctx.lineWidth = 0.8;
    const spacing = 28;
    const startX = ((bounds.minX % spacing) + spacing) % spacing;
    const startY = ((bounds.minY % spacing) + spacing) % spacing;
    ctx.beginPath();
    for (let x = -startX; x < bounds.width; x += spacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, bounds.height);
    }
    for (let y = -startY; y < bounds.height; y += spacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(bounds.width, y);
    }
    ctx.stroke();
  }

  // 2. Sort and Draw All Elements
  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const el of sortedElements) {
    ctx.save();
    // Translate coordinate origin to bounds top-left
    ctx.translate(-bounds.minX, -bounds.minY);

    if (el.type === 'pen' || el.type === 'highlighter') {
      const isHighlighter = el.type === 'highlighter';
      const pathData = isHighlighter
        ? renderHighlighterStroke(el.points, el.size || 28)
        : renderPenStroke(el.points, el.size || 4);

      if (pathData) {
        try {
          const path = new Path2D(pathData);
          let strokeColor = el.color;
          if (!isHighlighter) {
            if (bgInfo.isDark && (strokeColor === '#000000' || strokeColor === '#1e293b' || strokeColor === '#0f172a')) {
              strokeColor = '#ffffff';
            }
          }
          ctx.fillStyle = strokeColor;
          ctx.globalAlpha = isHighlighter ? 0.6 : (el.opacity || 1);
          if (isHighlighter) {
            ctx.globalCompositeOperation = bgInfo.isDark ? 'screen' : 'multiply';
          }
          ctx.fill(path);
        } catch {}
      }
    } else if (
      el.type === 'rectangle' ||
      el.type === 'rounded-rectangle' ||
      el.type === 'circle' ||
      el.type === 'ellipse' ||
      el.type === 'triangle' ||
      el.type === 'line' ||
      el.type === 'arrow' ||
      el.type === 'double-arrow'
    ) {
      ctx.strokeStyle = el.strokeColor || '#3b82f6';
      ctx.lineWidth = el.strokeWidth || 3;
      if (el.strokeStyle === 'dashed') ctx.setLineDash([8, 6]);

      if (el.type === 'rectangle' || el.type === 'rounded-rectangle') {
        if (el.fillColor && el.fillColor !== 'transparent') {
          ctx.fillStyle = el.fillColor;
          ctx.fillRect(el.x, el.y, el.width, el.height);
        }
        if (el.type === 'rounded-rectangle' && typeof (ctx as any).roundRect === 'function') {
          ctx.beginPath();
          (ctx as any).roundRect(el.x, el.y, el.width, el.height, 12);
          ctx.stroke();
        } else {
          ctx.strokeRect(el.x, el.y, el.width, el.height);
        }
      } else if (el.type === 'circle' || el.type === 'ellipse') {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const rx = Math.abs(el.width / 2);
        const ry = Math.abs(el.height / 2);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (el.fillColor && el.fillColor !== 'transparent') {
          ctx.fillStyle = el.fillColor;
          ctx.fill();
        }
        ctx.stroke();
      } else if (el.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(el.x + el.width / 2, el.y);
        ctx.lineTo(el.x, el.y + el.height);
        ctx.lineTo(el.x + el.width, el.y + el.height);
        ctx.closePath();
        if (el.fillColor && el.fillColor !== 'transparent') {
          ctx.fillStyle = el.fillColor;
          ctx.fill();
        }
        ctx.stroke();
      } else if (el.type === 'line' || el.type === 'arrow' || el.type === 'double-arrow') {
        const toX = el.x + el.width;
        const toY = el.y + el.height;
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        if (el.type === 'arrow' || el.type === 'double-arrow') {
          const arrow1 = getArrowHeadPoints(el.x, el.y, toX, toY);
          ctx.beginPath();
          ctx.moveTo(arrow1.p1.x, arrow1.p1.y);
          ctx.lineTo(toX, toY);
          ctx.lineTo(arrow1.p2.x, arrow1.p2.y);
          ctx.fillStyle = el.strokeColor || '#3b82f6';
          ctx.fill();

          if (el.type === 'double-arrow') {
            const arrow2 = getArrowHeadPoints(toX, toY, el.x, el.y);
            ctx.beginPath();
            ctx.moveTo(arrow2.p1.x, arrow2.p1.y);
            ctx.lineTo(el.x, el.y);
            ctx.lineTo(arrow2.p2.x, arrow2.p2.y);
            ctx.fill();
          }
        }
      }
    } else if (el.type === 'code') {
      // High-resolution Code Block Card
      const cardW = Math.max(el.width || 420, 300);
      const cardH = Math.max(el.height || 260, 160);
      const isCardDark = el.theme !== 'light';

      // Card Background & Shadow
      ctx.fillStyle = isCardDark ? '#141622' : '#f8fafc';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(el.x, el.y, cardW, cardH, 12);
      } else {
        ctx.rect(el.x, el.y, cardW, cardH);
      }
      ctx.fill();
      ctx.strokeStyle = isCardDark ? '#2d3748' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Card Header
      ctx.fillStyle = isCardDark ? '#0f111a' : '#e2e8f0';
      ctx.fillRect(el.x, el.y, cardW, 32);

      // 3 Mac-style window dots
      const dotY = el.y + 16;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(el.x + 14, dotY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(el.x + 26, dotY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.arc(el.x + 38, dotY, 4, 0, Math.PI * 2); ctx.fill();

      // Title
      ctx.font = 'bold 11px Consolas, Monaco, monospace';
      ctx.fillStyle = isCardDark ? '#94a3b8' : '#64748b';
      ctx.fillText(el.title || `code.${el.language || 'js'}`, el.x + 52, dotY + 4);

      // Code text lines
      ctx.font = '13px Consolas, Monaco, "Courier New", monospace';
      const lines = (el.code || '').split('\n');
      let lineY = el.y + 54;
      for (let i = 0; i < lines.length && lineY < el.y + cardH - 12; i++) {
        // Line number
        ctx.fillStyle = '#64748b';
        ctx.fillText(String(i + 1).padStart(2, ' '), el.x + 12, lineY);
        // Code content
        ctx.fillStyle = isCardDark ? '#f1f5f9' : '#0f172a';
        ctx.fillText(lines[i], el.x + 40, lineY);
        lineY += 20;
      }
    } else if (el.type === 'sticky-note') {
      const noteW = el.width || 200;
      const noteH = el.height || 180;
      ctx.fillStyle = el.color || '#fef08a';
      ctx.fillRect(el.x, el.y, noteW, noteH);

      // Note shadow line
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(el.x, el.y, noteW, noteH);

      ctx.fillStyle = '#1e293b';
      ctx.font = '14px sans-serif';
      const lines = (el.text || '').split('\n');
      let noteY = el.y + 24;
      for (let i = 0; i < lines.length && noteY < el.y + noteH - 10; i++) {
        ctx.fillText(lines[i], el.x + 12, noteY);
        noteY += 20;
      }
    } else if (el.type === 'text') {
      let textColor = el.color || (bgInfo.isDark ? '#ffffff' : '#1e293b');
      if (bgInfo.isDark && (textColor === '#000000' || textColor === '#1e293b' || textColor === '#0f172a')) {
        textColor = '#ffffff';
      }
      ctx.fillStyle = textColor;
      ctx.font = `${el.fontSize || 24}px ${el.fontFamily === 'handwriting' ? 'Caveat, cursive' : 'sans-serif'}`;
      const lines = (el.text || '').split('\n');
      let textY = el.y + (el.fontSize || 24);
      for (const line of lines) {
        ctx.fillText(line, el.x, textY);
        textY += (el.fontSize || 24) * 1.25;
      }
    } else if (el.type === 'image' && el.src) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = el.src;
        await new Promise((resolve) => {
          if (img.complete) resolve(null);
          else {
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
          }
        });
        ctx.drawImage(img, el.x, el.y, el.width || 300, el.height || 200);
      } catch {}
    }

    ctx.restore();
  }

  return { canvas, bounds };
}

/**
 * 1. Export Page as High-Resolution PNG (No content clipped)
 */
export async function exportPageAsPng(page: Page, fallbackName?: string): Promise<void> {
  const { canvas } = await renderPageToCanvas(page, 2);
  const dataUrl = canvas.toDataURL('image/png');
  const filename = `${(page.name || fallbackName || 'whiteboard').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * 2. Export Page as Clean Standalone SVG Vector
 */
export function exportPageAsSvg(page: Page, fallbackName?: string): void {
  const elements = page.canvasState?.elements || [];
  const bounds = getPageContentBounds(elements, 80);
  const bgInfo = getBackgroundStyleInfo(page.backgroundConfig?.style);

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}" width="${bounds.width}" height="${bounds.height}">\n`;
  svgContent += `  <rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="${bgInfo.color}" />\n`;

  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const el of sortedElements) {
    if (el.type === 'pen' || el.type === 'highlighter') {
      const isHighlighter = el.type === 'highlighter';
      const pathData = isHighlighter
        ? renderHighlighterStroke(el.points, el.size || 28)
        : renderPenStroke(el.points, el.size || 4);

      if (pathData) {
        let strokeColor = el.color;
        if (!isHighlighter && bgInfo.isDark && (strokeColor === '#000000' || strokeColor === '#1e293b' || strokeColor === '#0f172a')) {
          strokeColor = '#ffffff';
        }
        svgContent += `  <path d="${pathData}" fill="${strokeColor}" fill-opacity="${isHighlighter ? 0.6 : (el.opacity || 1)}" />\n`;
      }
    } else if (el.type === 'rectangle' || el.type === 'rounded-rectangle') {
      svgContent += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.type === 'rounded-rectangle' ? 12 : 0}" fill="${el.fillColor || 'transparent'}" stroke="${el.strokeColor || '#3b82f6'}" stroke-width="${el.strokeWidth || 3}" />\n`;
    } else if (el.type === 'circle' || el.type === 'ellipse') {
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      svgContent += `  <ellipse cx="${cx}" cy="${cy}" rx="${Math.abs(el.width / 2)}" ry="${Math.abs(el.height / 2)}" fill="${el.fillColor || 'transparent'}" stroke="${el.strokeColor || '#3b82f6'}" stroke-width="${el.strokeWidth || 3}" />\n`;
    } else if (el.type === 'text') {
      svgContent += `  <text x="${el.x}" y="${el.y + (el.fontSize || 24)}" fill="${el.color || (bgInfo.isDark ? '#fff' : '#000')}" font-size="${el.fontSize || 24}" font-family="sans-serif">${el.text || ''}</text>\n`;
    }
  }

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${(page.name || fallbackName || 'whiteboard').replace(/[^a-zA-Z0-9_-]/g, '_')}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 3. Export as PDF Document (Single Page or All Pages in Chapter)
 * Generates an executive lecture handout with 100% of the content.
 */
export async function exportBoardAsPdf(
  board: Board,
  pagesToExport: Page[],
  progressCallback?: (current: number, total: number) => void
): Promise<void> {
  if (pagesToExport.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4', // Standard landscape A4
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pagesToExport.length; i++) {
    const page = pagesToExport[i];
    progressCallback?.(i + 1, pagesToExport.length);

    if (i > 0) {
      pdf.addPage('a4', 'landscape');
    }

    // Render page canvas
    const { canvas, bounds } = await renderPageToCanvas(page, 2);
    const imgData = canvas.toDataURL('image/jpeg', 0.94);

    // Calculate aspect ratio preserving dimensions
    const margin = 24;
    const headerHeight = 30;
    const footerHeight = 24;
    const availableWidth = pdfWidth - margin * 2;
    const availableHeight = pdfHeight - margin * 2 - headerHeight - footerHeight;

    const contentAspect = bounds.width / bounds.height;
    const containerAspect = availableWidth / availableHeight;

    let drawW = availableWidth;
    let drawH = availableHeight;
    let drawX = margin;
    let drawY = margin + headerHeight;

    if (contentAspect > containerAspect) {
      drawW = availableWidth;
      drawH = availableWidth / contentAspect;
      drawY = margin + headerHeight + (availableHeight - drawH) / 2;
    } else {
      drawH = availableHeight;
      drawW = availableHeight * contentAspect;
      drawX = margin + (availableWidth - drawW) / 2;
    }

    // Header Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(51, 65, 85);
    pdf.text(`${board.name} — ${page.name || `Lesson ${i + 1}`}`, margin, margin + 18);

    // Draw full-canvas image
    pdf.addImage(imgData, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST');

    // Footer Page Number & Branding
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`MyBoard Educator Handout`, margin, pdfHeight - 12);
    pdf.text(
      `Page ${i + 1} of ${pagesToExport.length}`,
      pdfWidth - margin - 50,
      pdfHeight - 12
    );
  }

  const safeTitle = (board.name || 'MyBoard').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${safeTitle}_Complete_Chapter.pdf`);
}
