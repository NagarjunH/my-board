import { create } from 'zustand';
import { Board, Page } from '../types/board';
import { BackgroundConfig, CanvasElement, ViewportTransform } from '../types/canvas';
import { INITIAL_BOARDS } from '../utils/sampleData';

const LOCAL_STORAGE_KEY = 'myboard_data_v2';
const PRESET_BOARD_IDS = new Set(['board-js', 'board-python', 'board-dsa', 'board-webdev', 'board-trading']);

// Load stored boards or fallback to clean initial board, filtering out any demo presets
function loadInitialBoards(): Board[] {
  try {
    // 1. Check v2
    const savedV2 = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedV2) {
      const parsed = JSON.parse(savedV2);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // 2. Check legacy v1 and migrate only user-created boards
    const savedV1 = localStorage.getItem('myboard_data_v1');
    if (savedV1) {
      const parsed = JSON.parse(savedV1);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const userCreated = parsed.filter(
          (b: Board) =>
            !PRESET_BOARD_IDS.has(b.id) &&
            !b.name.toLowerCase().includes('javascript series') &&
            !b.name.toLowerCase().includes('javascript complete') &&
            !b.name.toLowerCase().includes('python series') &&
            !b.name.toLowerCase().includes('trading notes') &&
            !b.name.toLowerCase().includes('dsa') &&
            !b.name.toLowerCase().includes('web development')
        );
        if (userCreated.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userCreated));
          return userCreated;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached boards from localStorage', e);
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_BOARDS));
  } catch {}
  return INITIAL_BOARDS;
}

interface BoardStoreState {
  boards: Board[];
  activeBoardId: string;
  activePageId: string;
  searchQuery: string;
  saveStatus: 'saved' | 'saving' | 'offline' | 'error';
  lastSavedAt: string | null;

  // Actions
  setBoards: (boards: Board[]) => void;
  setActiveBoardId: (boardId: string) => void;
  setActivePageId: (pageId: string) => void;
  setSearchQuery: (query: string) => void;
  setSaveStatus: (status: 'saved' | 'saving' | 'offline' | 'error') => void;

  createBoard: (name: string, description?: string) => Board;
  deleteBoard: (boardId: string) => void;
  renameBoard: (boardId: string, name: string) => void;

  createPage: (boardId: string, name?: string) => Page;
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;
  duplicatePage: (pageId: string) => Page | null;
  reorderPages: (boardId: string, orderedPageIds: string[]) => void;

  updatePageContent: (
    pageId: string,
    elements: CanvasElement[],
    viewport: ViewportTransform,
    background: BackgroundConfig
  ) => void;

  getActiveBoard: () => Board | undefined;
  getActivePage: () => Page | undefined;
}

export const useBoardStore = create<BoardStoreState>((set, get) => {
  const initialBoards = loadInitialBoards();

  return {
    boards: initialBoards,
    activeBoardId: initialBoards[0]?.id || '',
    activePageId: initialBoards[0]?.pages?.[0]?.id || '',
    searchQuery: '',
    saveStatus: 'saved',
    lastSavedAt: new Date().toISOString(),

    setBoards: (boards) => {
      set({ boards });
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(boards));
      } catch (err) {
        console.error('LocalStorage write error', err);
      }
    },

    setActiveBoardId: (activeBoardId) => {
      const board = get().boards.find((b) => b.id === activeBoardId);
      const firstPage = board?.pages?.[0];
      set({
        activeBoardId,
        activePageId: firstPage ? firstPage.id : '',
      });
    },

    setActivePageId: (activePageId) => set({ activePageId }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSaveStatus: (saveStatus) =>
      set({
        saveStatus,
        lastSavedAt: saveStatus === 'saved' ? new Date().toISOString() : get().lastSavedAt,
      }),

    createBoard: (name, description = '') => {
      const newPageId = `page-${Date.now()}`;
      const newBoardId = `board-${Date.now()}`;
      const firstPage: Page = {
        id: newPageId,
        boardId: newBoardId,
        name: '01. Lesson Overview',
        position: 0,
        canvasState: {
          elements: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
        backgroundConfig: { style: 'white' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newBoard: Board = {
        id: newBoardId,
        userId: 'user-current',
        name,
        description,
        pages: [firstPage],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedBoards = [newBoard, ...get().boards];
      get().setBoards(updatedBoards);
      set({
        activeBoardId: newBoard.id,
        activePageId: firstPage.id,
      });
      return newBoard;
    },

    deleteBoard: (boardId) => {
      const remaining = get().boards.filter((b) => b.id !== boardId);
      if (remaining.length === 0) {
        get().createBoard('Untitled Board');
        return;
      }
      get().setBoards(remaining);
      if (get().activeBoardId === boardId) {
        const nextBoard = remaining[0];
        set({
          activeBoardId: nextBoard.id,
          activePageId: nextBoard.pages?.[0]?.id || '',
        });
      }
    },

    renameBoard: (boardId, name) => {
      const updated = get().boards.map((b) => (b.id === boardId ? { ...b, name, updatedAt: new Date().toISOString() } : b));
      get().setBoards(updated);
    },

    createPage: (boardId, name) => {
      const board = get().boards.find((b) => b.id === boardId);
      const existingPages = board?.pages || [];
      const pageIndex = existingPages.length + 1;
      const formattedNum = pageIndex < 10 ? `0${pageIndex}` : `${pageIndex}`;
      const pageName = name || `${formattedNum}. Untitled Lesson`;

      const newPage: Page = {
        id: `page-${Date.now()}`,
        boardId,
        name: pageName,
        position: existingPages.length,
        canvasState: {
          elements: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
        backgroundConfig: { style: 'white' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedBoards = get().boards.map((b) => {
        if (b.id === boardId) {
          return {
            ...b,
            pages: [...(b.pages || []), newPage],
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      });

      get().setBoards(updatedBoards);
      set({ activePageId: newPage.id });
      return newPage;
    },

    deletePage: (pageId) => {
      const board = get().getActiveBoard();
      if (!board || !board.pages || board.pages.length <= 1) return; // Keep at least one page

      const updatedPages = board.pages.filter((p) => p.id !== pageId);
      const updatedBoards = get().boards.map((b) => (b.id === board.id ? { ...b, pages: updatedPages } : b));
      get().setBoards(updatedBoards);

      if (get().activePageId === pageId) {
        set({ activePageId: updatedPages[0].id });
      }
    },

    renamePage: (pageId, name) => {
      const board = get().getActiveBoard();
      if (!board || !board.pages) return;
      const updatedPages = board.pages.map((p) => (p.id === pageId ? { ...p, name, updatedAt: new Date().toISOString() } : p));
      const updatedBoards = get().boards.map((b) => (b.id === board.id ? { ...b, pages: updatedPages } : b));
      get().setBoards(updatedBoards);
    },

    duplicatePage: (pageId) => {
      const board = get().getActiveBoard();
      if (!board || !board.pages) return null;
      const targetPage = board.pages.find((p) => p.id === pageId);
      if (!targetPage) return null;

      const newPage: Page = {
        ...targetPage,
        id: `page-${Date.now()}`,
        name: `${targetPage.name} (Copy)`,
        position: targetPage.position + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedPages = [...board.pages, newPage];
      const updatedBoards = get().boards.map((b) => (b.id === board.id ? { ...b, pages: updatedPages } : b));
      get().setBoards(updatedBoards);
      set({ activePageId: newPage.id });
      return newPage;
    },

    reorderPages: (boardId, orderedPageIds) => {
      const board = get().boards.find((b) => b.id === boardId);
      if (!board || !board.pages) return;

      const pageMap = new Map(board.pages.map((p) => [p.id, p]));
      const newPages: Page[] = [];
      orderedPageIds.forEach((id, index) => {
        const page = pageMap.get(id);
        if (page) {
          newPages.push({ ...page, position: index });
        }
      });

      const updatedBoards = get().boards.map((b) => (b.id === boardId ? { ...b, pages: newPages } : b));
      get().setBoards(updatedBoards);
    },

    updatePageContent: (pageId, elements, viewport, background) => {
      const updatedBoards = get().boards.map((b) => {
        if (!b.pages) return b;
        const pageExists = b.pages.some((p) => p.id === pageId);
        if (!pageExists) return b;

        const updatedPages = b.pages.map((p) => {
          if (p.id === pageId) {
            return {
              ...p,
              canvasState: { elements, viewport },
              backgroundConfig: background,
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        });

        return { ...b, pages: updatedPages };
      });

      get().setBoards(updatedBoards);
    },

    getActiveBoard: () => get().boards.find((b) => b.id === get().activeBoardId),
    getActivePage: () => {
      const board = get().getActiveBoard();
      return board?.pages?.find((p) => p.id === get().activePageId);
    },
  };
});
