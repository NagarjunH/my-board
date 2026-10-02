import { useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { useUIStore } from '../store/uiStore';

export function useKeyboardShortcuts() {
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const deleteSelectedElements = useCanvasStore((s) => s.deleteSelectedElements);
  const toggleYouTubeMode = useUIStore((s) => s.toggleYouTubeMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts when user is typing inside an input, textarea, or contentEditable element
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }

      // Check modifier keys
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (isCtrlOrMeta && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        toggleYouTubeMode();
        return;
      }

      if (isCtrlOrMeta && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (isCtrlOrMeta && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
        return;
      }

      if (isCtrlOrMeta && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        // Autosave handles saving; can show visual pulse if needed
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedElements();
        return;
      }

      // Tool shortcut keys (no Ctrl/Alt pressed)
      if (!isCtrlOrMeta && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'h':
            setActiveTool('hand');
            break;
          case 'p':
            setActiveTool('pen');
            break;
          case 'e':
            setActiveTool('eraser');
            break;
          case 't':
            setActiveTool('text');
            break;
          case 'r':
            setActiveTool('rectangle');
            break;
          case 'c':
            setActiveTool('circle');
            break;
          case 'l':
            setActiveTool('line');
            break;
          case 'a':
            setActiveTool('arrow');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, undo, redo, deleteSelectedElements, toggleYouTubeMode]);
}
