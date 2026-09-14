import type { Rendition } from "epubjs";

export function useEpubResize(
  viewerRef: () => HTMLDivElement | null | undefined,
  rendition: () => Rendition | null | undefined
) {
  return () => {
    const viewer = viewerRef();
    const inst = rendition();
    if (!viewer || !inst) return;

    requestAnimationFrame(() => {
      const width = viewer.clientWidth || 0;
      const height = viewer.clientHeight || 0;
      if (width > 0 && height > 0) {
        inst.resize(width, height);
      }
    });
  };
}