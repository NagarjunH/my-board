import { Board, Page } from '../types/board';
import { CanvasElement } from '../types/canvas';

export const INITIAL_CANVAS_ELEMENTS: CanvasElement[] = [];

export const INITIAL_PAGE: Page = {
  id: 'page-1',
  boardId: 'board-1',
  name: 'Page 1',
  position: 0,
  canvasState: {
    elements: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  },
  backgroundConfig: {
    style: 'soft-white',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const INITIAL_BOARDS: Board[] = [
  {
    id: 'board-1',
    userId: 'user-default',
    name: 'Untitled Board',
    description: '',
    pages: [INITIAL_PAGE],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
