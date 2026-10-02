export type ToolType =
  | 'select'
  | 'hand'
  | 'pen'
  | 'smart-shape'
  | 'highlighter'
  | 'eraser'
  | 'laser'
  | 'text'
  | 'sticky-note'
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'double-arrow'
  | 'image'
  | 'code'
  | 'console'
  | 'terminal'
  | 'html-preview'
  | 'call-stack'
  | 'memory-view'
  | 'quiz';

export type BackgroundStyle =
  | 'white'
  | 'soft-white'
  | 'light-gray'
  | 'cream'
  | 'pale-blue'
  | 'dark'
  | 'navy'
  | 'classic-black-dot'
  | 'dotted'
  | 'graph'
  | 'ruled'
  | 'blueprint'
  | 'midnight-grid'
  | 'dark-dots'
  | 'black'
  | 'grid'
  | 'notebook'
  | 'custom';

export interface BackgroundConfig {
  style: BackgroundStyle;
  customColor?: string;
  gridSize?: number;
  gridOpacity?: number;
  lineThickness?: number;
  patternColor?: string;
  dotSize?: number;
  lineSpacing?: number;
}

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  isLocked?: boolean;
}

export interface StrokeElement extends BaseElement {
  type: 'pen' | 'highlighter';
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  smoothing?: number;
}

export type ShapeType =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'double-arrow';

export interface ShapeElement extends BaseElement {
  type: ShapeType;
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: 'handwriting' | 'sans' | 'mono';
  fontSize: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  badgeNumber?: number;
}

export type StickyColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

export interface StickyNoteElement extends BaseElement {
  type: 'sticky-note';
  text: string;
  color: StickyColor;
  fontSize: number;
}

export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'html'
  | 'css'
  | 'json'
  | 'sql'
  | 'bash'
  | 'jsx';

export interface CodeBlockElement extends BaseElement {
  type: 'code';
  code: string;
  language: CodeLanguage;
  theme?: 'dark' | 'light' | 'monokai';
  title?: string;
  highlightedLines?: number[];
  errorLines?: number[];
}

export interface ConsoleElement extends BaseElement {
  type: 'console';
  title: string;
  logs: string[];
}

export interface TerminalElement extends BaseElement {
  type: 'terminal';
  command: string;
  output: string[];
  exitCode?: number;
}

export interface HtmlPreviewElement extends BaseElement {
  type: 'html-preview';
  html: string;
  css: string;
  activeTab: 'split' | 'code' | 'preview';
}

export interface CallStackElement extends BaseElement {
  type: 'call-stack';
  frames: string[];
  maxFrames?: number;
}

export interface MemoryVariable {
  id: string;
  name: string;
  address: string;
  value: string;
  type: string;
}

export interface MemoryViewElement extends BaseElement {
  type: 'memory-view';
  variables: MemoryVariable[];
}

export interface QuizCardElement extends BaseElement {
  type: 'quiz';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  isRevealed: boolean;
  userSelection?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  originalWidth: number;
  originalHeight: number;
}

export type CanvasElement =
  | StrokeElement
  | ShapeElement
  | TextElement
  | StickyNoteElement
  | CodeBlockElement
  | ConsoleElement
  | TerminalElement
  | HtmlPreviewElement
  | CallStackElement
  | MemoryViewElement
  | QuizCardElement
  | ImageElement;

export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasState {
  elements: CanvasElement[];
  viewport: ViewportTransform;
  background: BackgroundConfig;
}
