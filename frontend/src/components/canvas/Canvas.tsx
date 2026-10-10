import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { CanvasElement, Point } from '../../types/canvas';
import { CanvasBackground } from './CanvasBackground';
import { StrokeElement } from './StrokeElement';
import { ShapeElement } from './ShapeElement';
import { TextElement } from './TextElement';
import { CodeBlockElement } from './CodeBlockElement';
import { ImageElement } from './ImageElement';
import { StickyNoteElement } from './StickyNoteElement';
import { ConsoleOutputElement } from './ConsoleOutputElement';
import { TerminalElement } from './TerminalElement';
import { HtmlPreviewElement } from './HtmlPreviewElement';
import { CallStackElement } from './CallStackElement';
import { MemoryModelElement } from './MemoryModelElement';
import { QuizCardElement } from './QuizCardElement';
import { LaserPointerLayer } from './LaserPointerLayer';
import { SelectionOverlay } from './SelectionOverlay';
import { renderHighlighterStroke, renderPenStroke } from '../../utils/stroke';
import { isPointInsideBounds, getElementBounds } from '../../utils/geometry';
import { recognizeDrawnShape } from '../../utils/shapeRecognition';
import { uploadApi } from '../../services/uploadApi';

export const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas Store
  const elements = useCanvasStore((s) => s.elements);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const color = useCanvasStore((s) => s.color);
  const penColor = useCanvasStore((s) => s.penColor);
  const highlighterColor = useCanvasStore((s) => s.highlighterColor);
  const brushSize = useCanvasStore((s) => s.brushSize);
  const penThickness = useCanvasStore((s) => s.penThickness);
  const highlighterSize = useCanvasStore((s) => s.highlighterSize);
  const eraserSize = useCanvasStore((s) => s.eraserSize);
  const isSmartDrawingEnabled = useCanvasStore((s) => s.isSmartDrawingEnabled);
  const isGridSnapEnabled = useCanvasStore((s) => s.isGridSnapEnabled);
  const isPalmRejectionEnabled = useCanvasStore((s) => s.isPalmRejectionEnabled);
  const opacity = useCanvasStore((s) => s.opacity);
  const strokeWidth = useCanvasStore((s) => s.strokeWidth);
  const background = useCanvasStore((s) => s.background);
  const isDarkCanvas = [
    'dark',
    'navy',
    'black',
    'classic-black-dot',
    'blueprint',
    'dark-grid',
    'midnight-grid',
    'dark-dots',
  ].includes(background.style);
  const viewport = useCanvasStore((s) => s.viewport);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const selectedElementIds = useCanvasStore((s) => s.selectedElementIds);
  const setSelectedElementIds = useCanvasStore((s) => s.setSelectedElementIds);
  const addElement = useCanvasStore((s) => s.addElement);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);

  // Interaction State
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  const [elementStartPos, setElementStartPos] = useState<{ x: number; y: number } | null>(null);

  // Stylus Palm Rejection & Active Pointer Tracking
  const activePointerIdRef = useRef<number | null>(null);
  const activePointerTypeRef = useRef<string | null>(null);
  const hasSeenPenDeviceRef = useRef<boolean>(false);
  const lastPenTimeRef = useRef<number>(0);
  const rafDraftIdRef = useRef<number | null>(null);

  // High-performance draft path refs for zero-latency 120fps handwriting
  const draftPointsRef = useRef<Point[]>([]);
  const draftPathRef = useRef<SVGPathElement>(null);

  const [shapeStartPoint, setShapeStartPoint] = useState<Point | null>(null);
  const [shapeCurrentPoint, setShapeCurrentPoint] = useState<Point | null>(null);
  const [eraserHoverPos, setEraserHoverPos] = useState<Point | null>(null);

  // Accurate Eraser function: checks stroke points and element bounds with full eraser radius
  const eraseAtPoint = useCallback(
    (worldPoint: Point) => {
      const eraseRadius = eraserSize / 2;
      const hits = elements.filter((el) => {
        if (el.type === 'pen' || el.type === 'highlighter') {
          const strokeHalf = (el.size || 4) / 2;
          return el.points.some(
            (p) => Math.hypot(p.x - worldPoint.x, p.y - worldPoint.y) <= eraseRadius + strokeHalf
          );
        }
        const b = getElementBounds(el);
        return isPointInsideBounds(worldPoint, b, eraseRadius);
      });

      for (const h of hits) {
        deleteElement(h.id);
      }
    },
    [elements, eraserSize, deleteElement]
  );

  // Coordinate conversion: Screen -> Canvas World Space
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Point => {
      if (!containerRef.current) return { x: screenX, y: screenY };
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = screenX - rect.left;
      const clientY = screenY - rect.top;

      return {
        x: (clientX - viewport.x) / viewport.zoom,
        y: (clientY - viewport.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  // Zooming via Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const targetZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.2), 4.0);

      // Zoom towards mouse position
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - (mouseX - viewport.x) * (targetZoom / viewport.zoom);
        const newY = mouseY - (mouseY - viewport.y) * (targetZoom / viewport.zoom);

        setViewport({ x: newX, y: newY, zoom: targetZoom });
      }
    } else {
      // Pan
      setViewport((prev) => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  const isSpacePressedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpacePressedRef.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpacePressedRef.current = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (rafDraftIdRef.current !== null) {
        cancelAnimationFrame(rafDraftIdRef.current);
      }
    };
  }, []);

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent default browser touch/stylus gestures
    if (e.pointerType === 'pen' || e.pointerType === 'touch') {
      e.preventDefault();
    }

    if (e.pointerType === 'pen') {
      hasSeenPenDeviceRef.current = true;
      lastPenTimeRef.current = Date.now();

      // Stylus Preemption: If a touch contact (palm landing 50ms before stylus) was active,
      // immediately cancel and discard the touch so the stylus takes over seamlessly!
      if (activePointerIdRef.current !== null && activePointerTypeRef.current === 'touch') {
        if (rafDraftIdRef.current !== null) {
          cancelAnimationFrame(rafDraftIdRef.current);
          rafDraftIdRef.current = null;
        }
        draftPointsRef.current = [];
        if (draftPathRef.current) draftPathRef.current.setAttribute('d', '');
        try {
          containerRef.current?.releasePointerCapture?.(activePointerIdRef.current);
        } catch {}
        activePointerIdRef.current = null;
        activePointerTypeRef.current = null;
      }
    }

    // 1. Palm Rejection: If an active pointer is already drawing, reject any secondary contact (palm touch)
    if (activePointerIdRef.current !== null && activePointerIdRef.current !== e.pointerId) {
      e.preventDefault();
      return;
    }

    // 2. Stylus Priority Palm Rejection:
    // When using a stylus, the palm constantly rests on screen.
    // Reject touch contacts if palm rejection is enabled and a stylus was recently active (15s) or large palm surface detected.
    if (e.pointerType === 'touch' && isPalmRejectionEnabled) {
      const isPenRecentlyActive = hasSeenPenDeviceRef.current && (Date.now() - lastPenTimeRef.current < 15000);
      const isPalmSurface = (e.width && e.width > 16) || (e.height && e.height > 16);
      if ((isPenRecentlyActive || isPalmSurface) && (activeTool === 'pen' || activeTool === 'smart-shape' || activeTool === 'highlighter')) {
        e.preventDefault();
        return;
      }
    }

    // Only handle primary button or middle button (pan)
    if (e.button === 1 || activeTool === 'hand' || isSpacePressedRef.current) {
      setIsPanning(true);
      setDragStartPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    const worldPoint = screenToWorld(e.clientX, e.clientY);
    worldPoint.pressure = e.pressure !== 0 ? e.pressure : 0.55;

    // Stylus hardware eraser detection (buttons === 32 or button === 5) or Eraser tool
    const isHardwareEraser =
      (e.pointerType === 'pen' && (e.buttons === 32 || (e as any).button === 5)) ||
      activeTool === 'eraser';

    if (isHardwareEraser) {
      activePointerIdRef.current = e.pointerId;
      activePointerTypeRef.current = e.pointerType;
      containerRef.current?.setPointerCapture?.(e.pointerId);
      setIsPointerDown(true);
      setEraserHoverPos(worldPoint);
      eraseAtPoint(worldPoint);
      return;
    }

    if (e.button !== 0) return;

    activePointerIdRef.current = e.pointerId;
    activePointerTypeRef.current = e.pointerType;
    containerRef.current?.setPointerCapture?.(e.pointerId);
    setIsPointerDown(true);

    // Text Tool
    if (activeTool === 'text') {
      const snapX = isGridSnapEnabled ? Math.round(worldPoint.x / 20) * 20 : worldPoint.x;
      const snapY = isGridSnapEnabled ? Math.round(worldPoint.y / 20) * 20 : worldPoint.y;
      addElement({
        id: `text-${Date.now()}`,
        type: 'text',
        x: snapX,
        y: snapY,
        width: 200,
        height: 40,
        text: 'Click to edit text',
        fontFamily: 'handwriting',
        fontSize: 24,
        color: color,
        zIndex: 10,
      });
      return;
    }

    // Freehand Drawing (Pen, Smart Shapes, or Highlighter)
    if (activeTool === 'pen' || activeTool === 'smart-shape' || activeTool === 'highlighter') {
      draftPointsRef.current = [worldPoint];
      const isHighlighter = activeTool === 'highlighter';
      const strokeSize = isHighlighter ? (highlighterSize || 28) : (penThickness || brushSize || 4);
      const initialPath = isHighlighter
        ? renderHighlighterStroke([worldPoint], strokeSize, false)
        : renderPenStroke([worldPoint], strokeSize, false);

      if (draftPathRef.current) {
        draftPathRef.current.setAttribute('d', initialPath);
      }
      return;
    }

    // Vector Shapes
    if (
      [
        'rectangle',
        'rounded-rectangle',
        'circle',
        'ellipse',
        'triangle',
        'line',
        'arrow',
        'double-arrow',
      ].includes(activeTool)
    ) {
      setShapeStartPoint(worldPoint);
      setShapeCurrentPoint(worldPoint);
      return;
    }

    // Select Tool
    if (activeTool === 'select') {
      const hit = [...elements].reverse().find((el) => {
        const bounds = getElementBounds(el);
        return isPointInsideBounds(worldPoint, bounds, 8);
      });

      if (hit) {
        setSelectedElementIds([hit.id]);
        setIsDraggingElement(true);
        setDragStartPoint(worldPoint);
        setElementStartPos({ x: hit.x, y: hit.y });
      } else {
        setSelectedElementIds([]);
      }
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'pen' || e.pointerType === 'touch') {
      e.preventDefault();
    }

    if (e.pointerType === 'pen') {
      hasSeenPenDeviceRef.current = true;
      lastPenTimeRef.current = Date.now();
    }

    // Palm Rejection: Ignore events from non-active pointers (like palm shifting while pen writes)
    if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) {
      return;
    }

    // Panning
    if (isPanning && dragStartPoint) {
      const dx = e.clientX - dragStartPoint.x;
      const dy = e.clientY - dragStartPoint.y;
      setViewport((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setDragStartPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    const worldPoint = screenToWorld(e.clientX, e.clientY);
    worldPoint.pressure = e.pressure !== 0 ? e.pressure : 0.55;

    // Track on-screen eraser ring position
    if (activeTool === 'eraser') {
      setEraserHoverPos(worldPoint);
    }

    // Stylus hardware eraser or Eraser tool while dragging
    const isHardwareEraser =
      (e.pointerType === 'pen' && (e.buttons === 32 || (e as any).buttons === 32)) ||
      activeTool === 'eraser';

    if (isHardwareEraser) {
      if (isPointerDown) {
        eraseAtPoint(worldPoint);
      }
      return;
    }

    if (!isPointerDown) return;

    // Freehand drawing with zero-latency sub-millisecond tablet tracking + RAF batching
    if (activeTool === 'pen' || activeTool === 'smart-shape' || activeTool === 'highlighter') {
      const nativeEvent = e.nativeEvent as any;
      const rawEvents = (nativeEvent && typeof nativeEvent.getCoalescedEvents === 'function')
        ? nativeEvent.getCoalescedEvents()
        : [e];

      for (const ev of rawEvents) {
        const pt = screenToWorld(ev.clientX, ev.clientY);
        pt.pressure = ev.pressure !== 0 ? ev.pressure : 0.55;
        draftPointsRef.current.push(pt);
      }

      // Throttle SVG path generation to display refresh frame (60Hz / 120Hz)
      if (rafDraftIdRef.current === null) {
        rafDraftIdRef.current = requestAnimationFrame(() => {
          rafDraftIdRef.current = null;
          if (!draftPathRef.current || draftPointsRef.current.length === 0) return;
          const isHighlighter = activeTool === 'highlighter';
          const strokeSize = isHighlighter ? (highlighterSize || 28) : (penThickness || brushSize || 4);
          const updatedPath = isHighlighter
            ? renderHighlighterStroke(draftPointsRef.current, strokeSize, false)
            : renderPenStroke(draftPointsRef.current, strokeSize, false);

          draftPathRef.current.setAttribute('d', updatedPath);
        });
      }
      return;
    }

    // Shape drawing
    if (shapeStartPoint) {
      setShapeCurrentPoint(worldPoint);
      return;
    }

    // Dragging selected element
    if (isDraggingElement && dragStartPoint && elementStartPos && selectedElementIds.length > 0) {
      const dx = worldPoint.x - dragStartPoint.x;
      const dy = worldPoint.y - dragStartPoint.y;
      let targetX = elementStartPos.x + dx;
      let targetY = elementStartPos.y + dy;

      if (isGridSnapEnabled) {
        targetX = Math.round(targetX / 20) * 20;
        targetY = Math.round(targetY / 20) * 20;
      }

      const targetId = selectedElementIds[0];
      updateElement(targetId, {
        x: targetX,
        y: targetY,
      });
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    // Palm Rejection: If secondary pointer (like palm lifting while pen is still down) fires, ignore
    if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) {
      return;
    }

    if (rafDraftIdRef.current !== null) {
      cancelAnimationFrame(rafDraftIdRef.current);
      rafDraftIdRef.current = null;
    }

    if (isPanning) {
      setIsPanning(false);
      setDragStartPoint(null);
      activePointerIdRef.current = null;
      activePointerTypeRef.current = null;
      return;
    }

    if (!isPointerDown) {
      activePointerIdRef.current = null;
      activePointerTypeRef.current = null;
      return;
    }

    setIsPointerDown(false);
    activePointerIdRef.current = null;
    activePointerTypeRef.current = null;
    try {
      containerRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {}

    const pts = [...draftPointsRef.current];
    draftPointsRef.current = [];
    if (draftPathRef.current) {
      draftPathRef.current.setAttribute('d', '');
    }

    // Smart Drawing Recognition on Pen or Smart Shapes
    const isSmartMode = activeTool === 'smart-shape' || (activeTool === 'pen' && isSmartDrawingEnabled);
    if (isSmartMode && pts.length > 3) {
      const recognized = recognizeDrawnShape(pts);
      if (recognized) {
        const snapX = isGridSnapEnabled ? Math.round(recognized.x / 20) * 20 : recognized.x;
        const snapY = isGridSnapEnabled ? Math.round(recognized.y / 20) * 20 : recognized.y;
        addElement({
          id: `shape-${Date.now()}`,
          type: recognized.type,
          x: snapX,
          y: snapY,
          width: recognized.width,
          height: recognized.height,
          strokeColor: color,
          fillColor: 'transparent',
          strokeWidth: penThickness || brushSize || strokeWidth,
          strokeStyle: 'solid',
          zIndex: 3,
        });
        return;
      }
    }

    // Commit Freehand Stroke (Pen, Smart Shapes fallback, Highlighter)
    if ((activeTool === 'pen' || activeTool === 'smart-shape' || activeTool === 'highlighter') && pts.length > 0) {
      const isHighlighter = activeTool === 'highlighter';
      const strokeSize = isHighlighter ? (highlighterSize || 28) : (penThickness || brushSize || 4);
      const strokeColor = isHighlighter
        ? highlighterColor
        : (isDarkCanvas && (penColor === '#0f172a' || penColor === '#1e293b' || penColor === '#000000') ? '#ffffff' : penColor);

      addElement({
        id: `stroke-${Date.now()}`,
        type: isHighlighter ? 'highlighter' : 'pen',
        points: pts,
        color: strokeColor,
        size: strokeSize,
        opacity: isHighlighter ? 0.55 : opacity,
        x: pts[0].x,
        y: pts[0].y,
        width: 0,
        height: 0,
        zIndex: isHighlighter ? 2 : 4,
      });
    }

    // Commit Vector Shape
    if (shapeStartPoint && shapeCurrentPoint) {
      let x = Math.min(shapeStartPoint.x, shapeCurrentPoint.x);
      let y = Math.min(shapeStartPoint.y, shapeCurrentPoint.y);
      let width = Math.abs(shapeCurrentPoint.x - shapeStartPoint.x);
      let height = Math.abs(shapeCurrentPoint.y - shapeStartPoint.y);

      if (isGridSnapEnabled) {
        x = Math.round(x / 20) * 20;
        y = Math.round(y / 20) * 20;
        width = Math.round(width / 20) * 20;
        height = Math.round(height / 20) * 20;
      }

      if (width > 5 || height > 5) {
        addElement({
          id: `shape-${Date.now()}`,
          type: activeTool as any,
          x: ['line', 'arrow', 'double-arrow'].includes(activeTool) ? shapeStartPoint.x : x,
          y: ['line', 'arrow', 'double-arrow'].includes(activeTool) ? shapeStartPoint.y : y,
          width: ['line', 'arrow', 'double-arrow'].includes(activeTool)
            ? shapeCurrentPoint.x - shapeStartPoint.x
            : Math.max(width, 10),
          height: ['line', 'arrow', 'double-arrow'].includes(activeTool)
            ? shapeCurrentPoint.y - shapeStartPoint.y
            : Math.max(height, 10),
          strokeColor: color,
          fillColor: 'transparent',
          strokeWidth: strokeWidth,
          strokeStyle: 'solid',
          zIndex: 3,
        });
      }
      setShapeStartPoint(null);
      setShapeCurrentPoint(null);
    }

    if (isDraggingElement) {
      setIsDraggingElement(false);
      setDragStartPoint(null);
      setElementStartPos(null);
    }
  };

  // Pointer Cancel: Safe recovery if system gesture or palm rejection interrupts
  const handlePointerCancel = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) {
      return;
    }
    if (rafDraftIdRef.current !== null) {
      cancelAnimationFrame(rafDraftIdRef.current);
      rafDraftIdRef.current = null;
    }
    activePointerIdRef.current = null;
    activePointerTypeRef.current = null;
    setIsPointerDown(false);
    try {
      containerRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {}

    // Discard any draft points on cancel - DO NOT commit accidental palm touch strokes
    draftPointsRef.current = [];
    if (draftPathRef.current) {
      draftPathRef.current.setAttribute('d', '');
    }

    setIsDraggingElement(false);
    setDragStartPoint(null);
    setElementStartPos(null);
    setShapeStartPoint(null);
    setShapeCurrentPoint(null);
  };

  // Clipboard Paste Image Support
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const res = await uploadApi.uploadImage(file);
            const center = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
            addElement({
              id: `img-${Date.now()}`,
              type: 'image',
              src: res.url,
              x: center.x - 150,
              y: center.y - 100,
              width: 300,
              height: 200,
              originalWidth: 300,
              originalHeight: 200,
              zIndex: 5,
            });
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [screenToWorld, addElement]);

  // Drag & drop image files onto canvas
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const res = await uploadApi.uploadImage(files[0]);
      const dropWorld = screenToWorld(e.clientX, e.clientY);
      addElement({
        id: `img-${Date.now()}`,
        type: 'image',
        src: res.url,
        x: dropWorld.x,
        y: dropWorld.y,
        width: 320,
        height: 220,
        originalWidth: 320,
        originalHeight: 220,
        zIndex: 5,
      });
    }
  };

  // Custom precision cursor styling
  const getCanvasCursorStyle = (): React.CSSProperties => {
    if (activeTool === 'hand' || isPanning) {
      return { cursor: isPanning ? 'grabbing' : 'grab' };
    }
    if (activeTool === 'pen' || activeTool === 'smart-shape') {
      return {
        cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='2' fill='%232563eb' stroke='%23ffffff' stroke-width='1'/%3E%3Ccircle cx='12' cy='12' r='5' fill='none' stroke='%233b82f6' stroke-width='1' stroke-opacity='0.7' stroke-dasharray='2,2'/%3E%3C/svg%3E") 12 12, crosshair`,
      };
    }
    if (activeTool === 'laser') {
      return {
        cursor: 'none',
      };
    }
    if (activeTool === 'highlighter') {
      return {
        cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M3 21l3-1 11-11-2-2L4 18l-1 3z' fill='%23fef08a' stroke='%23ca8a04' stroke-width='1.5'/%3E%3C/svg%3E") 3 21, crosshair`,
      };
    }
    if (activeTool === 'eraser') {
      return { cursor: 'crosshair' };
    }
    if (activeTool === 'select') {
      return { cursor: 'default' };
    }
    return { cursor: 'crosshair' };
  };

  const selectedElement = elements.find((el) => selectedElementIds.includes(el.id));

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={() => {
        setEraserHoverPos(null);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={getCanvasCursorStyle()}
      className="relative w-full h-full overflow-hidden select-none touch-none"
    >
      {/* Background Layer */}
      <CanvasBackground config={background} zoom={viewport.zoom} />

      {/* World Space Matrix Transform Layer */}
      <svg
        id="whiteboard-svg-canvas"
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
      >

        <g
          transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}
          className={activeTool === 'select' ? "pointer-events-auto" : "pointer-events-none"}
        >
          {/* Render Elements Sorted by Z-Index */}
          {[...elements]
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => {
              const isSelected = selectedElementIds.includes(el.id);
              const handleSelect = (e: React.MouseEvent) => {
                if (activeTool === 'select') {
                  e.stopPropagation();
                  setSelectedElementIds([el.id]);
                }
              };

              switch (el.type) {
                case 'pen':
                case 'highlighter':
                  return (
                    <StrokeElement
                      key={el.id}
                      element={el}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                case 'rectangle':
                case 'rounded-rectangle':
                case 'circle':
                case 'ellipse':
                case 'triangle':
                case 'line':
                case 'arrow':
                case 'double-arrow':
                  return (
                    <ShapeElement
                      key={el.id}
                      element={el}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                case 'text':
                  return (
                    <TextElement
                      key={el.id}
                      element={el}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                case 'code':
                  return (
                    <CodeBlockElement
                      key={el.id}
                      element={el}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                case 'image':
                  return (
                    <ImageElement
                      key={el.id}
                      element={el}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                case 'sticky-note':
                  return (
                    <StickyNoteElement
                      key={el.id}
                      element={el as any}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                case 'console':
                  return (
                    <ConsoleOutputElement
                      key={el.id}
                      element={el as any}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                case 'terminal':
                  return (
                    <TerminalElement
                      key={el.id}
                      element={el as any}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                case 'html-preview':
                  return (
                    <HtmlPreviewElement
                      key={el.id}
                      element={el as any}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                case 'call-stack':
                  return (
                    <CallStackElement
                      key={el.id}
                      element={el as any}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                case 'memory-view':
                  return (
                    <MemoryModelElement
                      key={el.id}
                      element={el as any}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                case 'quiz':
                  return (
                    <QuizCardElement
                      key={el.id}
                      element={el as any}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  );
                default:
                  return null;
              }
            })}

          {/* Dynamic on-screen Eraser Ring showing exact radius */}
          {activeTool === 'eraser' && eraserHoverPos && (
            <circle
              cx={eraserHoverPos.x}
              cy={eraserHoverPos.y}
              r={eraserSize / 2}
              fill="rgba(239, 68, 68, 0.16)"
              stroke="#ef4444"
              strokeWidth={2 / viewport.zoom}
              strokeDasharray={`${5 / viewport.zoom}, ${4 / viewport.zoom}`}
              className="pointer-events-none"
            />
          )}

          {/* Active Freehand Draft Stroke (High-speed hardware direct path) */}
          <path
            ref={draftPathRef}
            d=""
            fill={
              activeTool === 'highlighter'
                ? highlighterColor
                : isDarkCanvas && (penColor === '#1e293b' || penColor === '#0f172a' || penColor === '#000000')
                ? '#ffffff'
                : penColor
            }
            fillOpacity={
              activeTool === 'highlighter'
                ? isDarkCanvas
                  ? 0.65
                  : 0.55
                : opacity
            }
            style={{
              mixBlendMode: activeTool === 'highlighter' ? (isDarkCanvas ? 'screen' : 'multiply') : 'normal',
            }}
            className="pointer-events-none"
          />

          {/* Active Shape Draft Preview */}
          {shapeStartPoint && shapeCurrentPoint && (
            <ShapeElement
              element={{
                id: 'draft-shape',
                type: activeTool as any,
                x: ['line', 'arrow', 'double-arrow'].includes(activeTool)
                  ? shapeStartPoint.x
                  : Math.min(shapeStartPoint.x, shapeCurrentPoint.x),
                y: ['line', 'arrow', 'double-arrow'].includes(activeTool)
                  ? shapeStartPoint.y
                  : Math.min(shapeStartPoint.y, shapeCurrentPoint.y),
                width: ['line', 'arrow', 'double-arrow'].includes(activeTool)
                  ? shapeCurrentPoint.x - shapeStartPoint.x
                  : Math.abs(shapeCurrentPoint.x - shapeStartPoint.x),
                height: ['line', 'arrow', 'double-arrow'].includes(activeTool)
                  ? shapeCurrentPoint.y - shapeStartPoint.y
                  : Math.abs(shapeCurrentPoint.y - shapeStartPoint.y),
                strokeColor: color,
                strokeWidth: strokeWidth,
                strokeStyle: 'solid',
                zIndex: 999,
              }}
              isSelected={false}
              onSelect={() => {}}
            />
          )}

          {/* Active Selection Overlay */}
          {selectedElement && activeTool === 'select' && (
            <SelectionOverlay element={selectedElement} />
          )}
        </g>
      </svg>

      {/* Ultra-Smooth Hardware-Accelerated Laser Pointer Overlay */}
      <LaserPointerLayer containerRef={containerRef} />
    </div>
  );
};
