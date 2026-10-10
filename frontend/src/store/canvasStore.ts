import { create } from 'zustand';
import {
  BackgroundConfig,
  CanvasElement,
  Point,
  ToolType,
  ViewportTransform,
} from '../types/canvas';
import { INITIAL_CANVAS_ELEMENTS } from '../utils/sampleData';

interface CanvasStoreState {
  elements: CanvasElement[];
  selectedElementIds: string[];
  activeTool: ToolType;
  color: string;
  strokeWidth: number;
  brushSize: number;
  opacity: number;
  fontFamily: 'handwriting' | 'sans' | 'mono';
  fontSize: number;
  background: BackgroundConfig;
  viewport: ViewportTransform;
  history: CanvasElement[][];
  historyIndex: number;
  isDrawing: boolean;
  currentDraftStroke: Point[] | null;

  penThickness: number;
  highlighterSize: number;
  eraserSize: number;
  isSmartDrawingEnabled: boolean;
  isGridSnapEnabled: boolean;
  isFocusModeEnabled: boolean;
  isPalmRejectionEnabled: boolean;

  penColor: string;
  highlighterColor: string;

  // Actions
  setActiveTool: (tool: ToolType) => void;
  setColor: (color: string) => void;
  setPenColor: (color: string) => void;
  setHighlighterColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setBrushSize: (size: number) => void;
  setPenThickness: (thickness: number) => void;
  setHighlighterSize: (size: number) => void;
  setEraserSize: (size: number) => void;
  toggleSmartDrawing: () => void;
  toggleGridSnap: () => void;
  toggleFocusMode: () => void;
  togglePalmRejection: () => void;
  setOpacity: (opacity: number) => void;
  setFontFamily: (font: 'handwriting' | 'sans' | 'mono') => void;
  setFontSize: (size: number) => void;
  setBackground: (bg: BackgroundConfig) => void;
  setViewport: (transform: Partial<ViewportTransform> | ((prev: ViewportTransform) => ViewportTransform)) => void;
  setSelectedElementIds: (ids: string[]) => void;
  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  deleteSelectedElements: () => void;
  deleteElement: (id: string) => void;
  clearCanvas: () => void;
  setCurrentDraftStroke: (points: Point[] | null) => void;

  // History Actions
  pushHistory: (newElements?: CanvasElement[]) => void;
  undo: () => void;
  redo: () => void;

  // Zoom helpers
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
  elements: INITIAL_CANVAS_ELEMENTS,
  selectedElementIds: [],
  activeTool: 'pen',
  color: '#1e293b',
  penColor: '#1e293b',
  highlighterColor: '#fef08a',
  strokeWidth: 3,
  brushSize: 4,
  opacity: 1,
  fontFamily: 'handwriting',
  fontSize: 24,
  background: { style: 'soft-white' },
  viewport: { x: 0, y: 0, zoom: 1 },
  history: [INITIAL_CANVAS_ELEMENTS],
  historyIndex: 0,
  isDrawing: false,
  currentDraftStroke: null,

  penThickness: 4,
  highlighterSize: 28,
  eraserSize: 24,
  isSmartDrawingEnabled: false,
  isGridSnapEnabled: false,
  isFocusModeEnabled: false,
  isPalmRejectionEnabled: true,

  setActiveTool: (activeTool) => {
    const state = get();
    let nextColor = state.color;
    if (activeTool === 'pen' || activeTool === 'smart-shape') {
      nextColor = state.penColor;
    } else if (activeTool === 'highlighter') {
      nextColor = state.highlighterColor;
    }
    set({ activeTool, color: nextColor, selectedElementIds: [] });
  },
  setColor: (color) => {
    const currentTool = get().activeTool;
    if (currentTool === 'highlighter') {
      set({ highlighterColor: color, color });
    } else if (currentTool === 'pen' || currentTool === 'smart-shape') {
      set({ penColor: color, color });
    } else {
      set({ color });
    }
  },
  setPenColor: (penColor) => {
    const currentTool = get().activeTool;
    set({
      penColor,
      color: currentTool === 'pen' || currentTool === 'smart-shape' ? penColor : get().color,
    });
  },
  setHighlighterColor: (highlighterColor) => {
    const currentTool = get().activeTool;
    set({
      highlighterColor,
      color: currentTool === 'highlighter' ? highlighterColor : get().color,
    });
  },
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setBrushSize: (brushSize) => set({ brushSize, penThickness: brushSize }),
  setPenThickness: (penThickness) => set({ penThickness, brushSize: penThickness }),
  setHighlighterSize: (highlighterSize) => set({ highlighterSize }),
  setEraserSize: (eraserSize) => set({ eraserSize }),
  toggleSmartDrawing: () => set((s) => ({ isSmartDrawingEnabled: !s.isSmartDrawingEnabled })),
  toggleGridSnap: () => set((s) => ({ isGridSnapEnabled: !s.isGridSnapEnabled })),
  toggleFocusMode: () => set((s) => ({ isFocusModeEnabled: !s.isFocusModeEnabled })),
  togglePalmRejection: () => set((s) => ({ isPalmRejectionEnabled: !s.isPalmRejectionEnabled })),
  setOpacity: (opacity) => set({ opacity }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize }),
  setBackground: (background) => set({ background }),

  setViewport: (transform) =>
    set((state) => {
      const nextViewport =
        typeof transform === 'function' ? transform(state.viewport) : { ...state.viewport, ...transform };
      // Clamp zoom between 0.2 and 4.0
      nextViewport.zoom = Math.min(Math.max(nextViewport.zoom, 0.2), 4.0);
      return { viewport: nextViewport };
    }),

  setSelectedElementIds: (selectedElementIds) => set({ selectedElementIds }),

  setElements: (elements) => {
    set({ elements, history: [elements], historyIndex: 0 });
  },

  addElement: (element) => {
    const next = [...get().elements, element];
    get().pushHistory(next);
  },

  updateElement: (id, patch) => {
    const next = get().elements.map((el) => (el.id === id ? ({ ...el, ...patch } as CanvasElement) : el));
    get().pushHistory(next);
  },

  deleteSelectedElements: () => {
    const { selectedElementIds, elements } = get();
    if (selectedElementIds.length === 0) return;
    const next = elements.filter((el) => !selectedElementIds.includes(el.id));
    set({ selectedElementIds: [] });
    get().pushHistory(next);
  },

  deleteElement: (id) => {
    const next = get().elements.filter((el) => el.id !== id);
    get().pushHistory(next);
  },

  clearCanvas: () => {
    get().pushHistory([]);
    set({ selectedElementIds: [] });
  },

  setCurrentDraftStroke: (currentDraftStroke) => set({ currentDraftStroke }),

  pushHistory: (newElements) => {
    const state = get();
    const updated = newElements ?? state.elements;
    const history = state.history.slice(0, state.historyIndex + 1);
    history.push(updated);
    // Limit history stack size to 50
    if (history.length > 50) history.shift();
    set({
      elements: updated,
      history,
      historyIndex: history.length - 1,
    });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      set({
        elements: history[nextIndex],
        historyIndex: nextIndex,
        selectedElementIds: [],
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({
        elements: history[nextIndex],
        historyIndex: nextIndex,
        selectedElementIds: [],
      });
    }
  },

  zoomIn: () => {
    get().setViewport((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 0.1, 4.0) }));
  },

  zoomOut: () => {
    get().setViewport((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 0.1, 0.2) }));
  },

  resetZoom: () => {
    get().setViewport({ x: 0, y: 0, zoom: 1 });
  },
}));
