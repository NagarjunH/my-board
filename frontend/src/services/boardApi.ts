import { request } from './api';
import { Board, BoardShare, Page } from '../types/board';
import { BackgroundConfig, CanvasElement, ViewportTransform } from '../types/canvas';

export const boardApi = {
  getBoards: (): Promise<{ boards: Board[] }> =>
    request('/boards', { method: 'GET' }),

  getBoard: (id: string): Promise<{ board: Board }> =>
    request(`/boards/${id}`, { method: 'GET' }),

  createBoard: (name: string, description?: string): Promise<{ board: Board }> =>
    request('/boards', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),

  updateBoard: (id: string, patch: Partial<Board>): Promise<{ board: Board }> =>
    request(`/boards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  deleteBoard: (id: string): Promise<{ success: boolean }> =>
    request(`/boards/${id}`, { method: 'DELETE' }),

  createShareLink: (boardId: string, permission: 'view' | 'edit', expiresInDays?: number): Promise<{ share: BoardShare; shareUrl: string }> =>
    request(`/boards/${boardId}/share`, {
      method: 'POST',
      body: JSON.stringify({ permission, expires_in_days: expiresInDays }),
    }),

  getSharedBoard: (token: string): Promise<{ board: Board; permission: 'view' | 'edit' }> =>
    request(`/share/${token}`, { method: 'GET' }),
};

export const pageApi = {
  getPages: (boardId: string): Promise<{ pages: Page[] }> =>
    request(`/boards/${boardId}/pages`, { method: 'GET' }),

  getPage: (id: string): Promise<{ page: Page }> =>
    request(`/pages/${id}`, { method: 'GET' }),

  createPage: (boardId: string, name: string, position?: number): Promise<{ page: Page }> =>
    request(`/boards/${boardId}/pages`, {
      method: 'POST',
      body: JSON.stringify({ name, position }),
    }),

  updatePage: (
    id: string,
    data: {
      name?: string;
      canvas_state?: { elements: CanvasElement[]; viewport: ViewportTransform };
      background_config?: BackgroundConfig;
      position?: number;
    }
  ): Promise<{ page: Page }> =>
    request(`/pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deletePage: (id: string): Promise<{ success: boolean }> =>
    request(`/pages/${id}`, { method: 'DELETE' }),
};
