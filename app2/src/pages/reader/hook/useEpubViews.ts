import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type { Rendition } from 'epubjs';

const NOTE_CONTAINERS = `
  aside,
  section[epub\\:type*="footnote"],
  div[epub\\:type*="footnote"],
  div[epub\\:type*="annotation"],
  div[epub\\:type*="note"],
  .footnotes,
  .footnote-content,
  .annotation-content,
  .jingwen-note
`;

const NOTE_REFS = `
  a[epub\\:type*="noteref"],
  a.footnote-ref,
  a.noteref,
  a.ref,
  .jingwen-note-ref
`;

const STYLE_ID = 'epub-notes-toggle-style';

export function useEpubViews(rendition: Rendition | null | undefined, initialHide = true) {
  const [hideNotes, setHideNotes] = useState(initialHide);
  const hideNotesRef = useRef(initialHide);
  hideNotesRef.current = hideNotes;

  const applyTransparentBackground = useCallback((targetRendition: Rendition) => {
    targetRendition.themes.default({
      html: { background: 'transparent !important' },
      body: { background: 'transparent !important' },
    });
  }, []);

  const applyNotesStyle = useCallback((shouldHide: boolean, targetRendition?: Rendition | null) => {
    const target = targetRendition ?? rendition;
    if (!target) return;

    const cssRules = `
      ${NOTE_CONTAINERS} {
        display: ${shouldHide ? 'none !important' : 'block !important'};
      }

      ${NOTE_REFS} {
        display: inline !important;
        opacity: 1 !important;
        visibility: visible !important;
        background: transparent !important;
        color: inherit !important;
        text-decoration: underline dotted !important;
        font-size: 0.8em !important;
        vertical-align: super !important;
        cursor: pointer !important;
      }

      ${NOTE_REFS}:hover {
        text-decoration: underline solid !important;
      }
    `;

    const rawContents = (target as any).getContents?.() ?? [];
    const contentsList = Array.isArray(rawContents) ? rawContents : [rawContents];

    contentsList.forEach((contents: any) => {
      const doc = contents?.document as Document | undefined;
      if (!doc?.head) return;

      const styleEl =
        (doc.getElementById(STYLE_ID) as HTMLStyleElement | null) ??
        doc.createElement('style');

      if (!styleEl.isConnected) {
        styleEl.id = STYLE_ID;
        doc.head.appendChild(styleEl);
      }

      styleEl.textContent = cssRules;
    });
  }, [rendition]);

  // 当 rendition 或 hideNotes 发生变化时自动应用样式和背景
  useEffect(() => {
    if (!rendition) return;

    applyTransparentBackground(rendition);
    applyNotesStyle(hideNotes, rendition);

    const handleContent = (contents: any) => {
      setTimeout(() => {
        applyNotesStyle(hideNotesRef.current, rendition);
      }, 0);
    };

    rendition.hooks.content.register(handleContent);

    return () => {
      try {
        rendition.hooks.content.deregister?.(handleContent);
      } catch {}
    };
  }, [rendition, hideNotes, applyTransparentBackground, applyNotesStyle]);

  const toggleNotes = useCallback(() => {
    setHideNotes((prev) => !prev);
  }, []);

  return {
    hideNotes,
    toggleNotes,
  };
}