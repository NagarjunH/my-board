import React, { useEffect } from 'react';
import { Header } from './components/toolbar/Header';
import { Toolbar } from './components/toolbar/Toolbar';
import { Sidebar } from './components/sidebar/Sidebar';
import { Canvas } from './components/canvas/Canvas';
import { PageTabBar } from './components/pages/PageTabBar';
import { YouTubeFloatingToolbar } from './components/toolbar/YouTubeFloatingToolbar';
import { ShareModal } from './components/dialogs/ShareModal';
import { ExportModal } from './components/dialogs/ExportModal';
import { CreateBoardModal } from './components/dialogs/CreateBoardModal';
import { TimerWidget } from './components/toolbar/TimerWidget';
import { PresenterNotesDrawer } from './components/dialogs/PresenterNotesDrawer';
import { SlidePresentationBar } from './components/toolbar/SlidePresentationBar';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useUIStore } from './store/uiStore';

export function App() {
  // Activate Autosave & Global Shortcuts
  useAutoSave(1500);
  useKeyboardShortcuts();

  const isYouTubeMode = useUIStore((s) => s.isYouTubeMode);
  const theme = useUIStore((s) => s.theme);

  // Keep <html> and body strictly in sync with theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div
      className={`flex flex-col w-screen h-screen overflow-hidden select-none transition-colors duration-150 ${
        theme === 'dark' ? 'dark bg-[#0c0d12] text-slate-100' : 'bg-[#FAF8F5] text-slate-800'
      }`}
    >
      {/* Top Header - hidden in YouTube Mode */}
      {!isYouTubeMode && <Header />}

      {/* Main Workspace Body */}
      <div className="flex flex-1 w-full h-[calc(100vh-56px)] overflow-hidden relative">
        {/* Left Sidebar - hidden in YouTube Mode */}
        {!isYouTubeMode && <Sidebar />}

        {/* Central Whiteboard Canvas & Toolbar */}
        <div className="flex flex-col flex-1 h-full overflow-hidden relative">
          {/* Top Canvas Toolbar */}
          {!isYouTubeMode && <Toolbar />}

          {/* Whiteboard Interactive Canvas */}
          <div className="flex-1 w-full h-full relative overflow-hidden">
            <Canvas />
          </div>

          {/* Bottom Page Navigation Tabs */}
          {!isYouTubeMode && <PageTabBar />}
        </div>
      </div>

      {/* YouTube Recording Floating Toolbar */}
      <YouTubeFloatingToolbar />

      {/* Teacher Presentation Workflows (Countdown, Presenter Notes, Slide Deck) */}
      <TimerWidget />
      <PresenterNotesDrawer />
      <SlidePresentationBar />

      {/* Modals & Dialogs */}
      <ShareModal />
      <ExportModal />
      <CreateBoardModal />
    </div>
  );
}

export default App;
