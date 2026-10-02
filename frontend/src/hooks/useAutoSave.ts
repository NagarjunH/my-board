import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { useBoardStore } from '../store/boardStore';
import { pageApi } from '../services/pageApi';

export function useAutoSave(debounceMs: number = 1500) {
  const elements = useCanvasStore((s) => s.elements);
  const viewport = useCanvasStore((s) => s.viewport);
  const background = useCanvasStore((s) => s.background);

  const activePageId = useBoardStore((s) => s.activePageId);
  const updatePageContent = useBoardStore((s) => s.updatePageContent);
  const setSaveStatus = useBoardStore((s) => s.setSaveStatus);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!activePageId) return;

    setSaveStatus('saving');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      // 1. Immediately persist to client-side store & localStorage
      updatePageContent(activePageId, elements, viewport, background);

      // 2. Persist to backend server if reachable
      try {
        await pageApi.updatePage(activePageId, {
          canvas_state: { elements, viewport },
          background_config: background,
        });
        setSaveStatus('saved');
      } catch (err) {
        // Backend could be offline or starting up, but local state is saved
        setSaveStatus('saved');
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [elements, viewport, background, activePageId, debounceMs, updatePageContent, setSaveStatus]);
}
