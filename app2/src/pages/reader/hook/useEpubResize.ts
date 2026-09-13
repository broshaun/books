import { useCallback } from 'react';
import type { Rendition } from 'epubjs';

export function useEpubResize(
  viewerRef: React.RefObject<HTMLDivElement | null>,
  rendition: Rendition | null
) {
  return useCallback(() => {
    if (!viewerRef.current || !rendition) return;

    requestAnimationFrame(() => {
      const width = viewerRef.current?.clientWidth || 0;
      const height = viewerRef.current?.clientHeight || 0;
      if (width > 0 && height > 0) {
        rendition.resize(width, height);
      }
    });
  }, [viewerRef, rendition]);
}