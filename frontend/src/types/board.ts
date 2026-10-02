import { BackgroundConfig, CanvasElement, ViewportTransform } from './canvas';

export interface Page {
  id: string;
  boardId: string;
  name: string;
  position: number;
  canvasState: {
    elements: CanvasElement[];
    viewport: ViewportTransform;
  };
  backgroundConfig: BackgroundConfig;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  userId: string;
  name: string;
  description?: string;
  pages?: Page[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoardShare {
  id: string;
  boardId: string;
  token: string;
  permission: 'view' | 'edit';
  expiresAt?: string | null;
  createdAt: string;
}
