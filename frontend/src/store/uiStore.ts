import { create } from 'zustand';

interface UIStoreState {
  isSidebarOpen: boolean;
  isYouTubeMode: boolean;
  isShareModalOpen: boolean;
  isExportModalOpen: boolean;
  isCodeModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isCreateBoardModalOpen: boolean;
  theme: 'dark' | 'light';

  // Visual Teaching Tools
  isSpotlightActive: boolean;
  isMagnifierActive: boolean;
  isRulerActive: boolean;

  // Teaching Workflows
  isPresenterNotesOpen: boolean;
  isTimerActive: boolean;
  isSlideModeActive: boolean;
  currentSlideIndex: number;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleYouTubeMode: () => void;
  setYouTubeMode: (active: boolean) => void;
  setShareModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setCodeModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setCreateBoardModalOpen: (open: boolean) => void;
  toggleTheme: () => void;

  toggleSpotlight: () => void;
  toggleMagnifier: () => void;
  toggleRuler: () => void;
  togglePresenterNotes: () => void;
  toggleTimer: () => void;
  toggleSlideMode: () => void;
  setCurrentSlideIndex: (idx: number) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  isSidebarOpen: true,
  isYouTubeMode: false,
  isShareModalOpen: false,
  isExportModalOpen: false,
  isCodeModalOpen: false,
  isSettingsModalOpen: false,
  isCreateBoardModalOpen: false,
  theme: (() => {
    try {
      const stored = localStorage.getItem('myboard_theme');
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {}
    return 'light';
  })(),

  isSpotlightActive: false,
  isMagnifierActive: false,
  isRulerActive: false,
  isPresenterNotesOpen: false,
  isTimerActive: false,
  isSlideModeActive: false,
  currentSlideIndex: 0,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleYouTubeMode: () => set((state) => ({ isYouTubeMode: !state.isYouTubeMode })),
  setYouTubeMode: (isYouTubeMode) => set({ isYouTubeMode }),
  setShareModalOpen: (isShareModalOpen) => set({ isShareModalOpen }),
  setExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),
  setCodeModalOpen: (isCodeModalOpen) => set({ isCodeModalOpen }),
  setSettingsModalOpen: (isSettingsModalOpen) => set({ isSettingsModalOpen }),
  setCreateBoardModalOpen: (isCreateBoardModalOpen) => set({ isCreateBoardModalOpen }),
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('myboard_theme', nextTheme);
      } catch {}
      return { theme: nextTheme };
    }),

  toggleSpotlight: () => set((state) => ({ isSpotlightActive: !state.isSpotlightActive })),
  toggleMagnifier: () => set((state) => ({ isMagnifierActive: !state.isMagnifierActive })),
  toggleRuler: () => set((state) => ({ isRulerActive: !state.isRulerActive })),
  togglePresenterNotes: () => set((state) => ({ isPresenterNotesOpen: !state.isPresenterNotesOpen })),
  toggleTimer: () => set((state) => ({ isTimerActive: !state.isTimerActive })),
  toggleSlideMode: () => set((state) => ({ isSlideModeActive: !state.isSlideModeActive })),
  setCurrentSlideIndex: (currentSlideIndex) => set({ currentSlideIndex }),
}));
