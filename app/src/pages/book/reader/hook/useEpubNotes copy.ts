import { createSignal, onCleanup, createEffect } from "solid-js";
import localforage from "localforage";
import type { Rendition } from "epubjs";

export interface NewNote {
  bookId: string;
  bookName: string;
  index: number;
  cfiRange: string;
  tags?: string[];
  text: string;
  title?: string;
  color?: string;
  isUnderline?: boolean;
  content?: string;
  updatedAt?: number;
}

const GLOBAL_STORAGE_KEY = "epub_global_notes";

export const getAllGlobalNotes = async (): Promise<NewNote[]> => {
  const saved = await localforage.getItem<NewNote[]>(GLOBAL_STORAGE_KEY);
  return Array.isArray(saved) ? saved : [];
};

export const setAllGlobalNotes = (list: NewNote[]) => localforage.setItem(GLOBAL_STORAGE_KEY, list);

export function useEpubNotes(rendition: () => Rendition | null) {
  const [current, setCurrent] = createSignal<NewNote | null>(null);
  const [currentIndexNodes, setCurrentIndexNodes] = createSignal<NewNote[]>([]);
  const [notes, setNotes] = createSignal<NewNote[]>([]);

  let isLoaded = false;

  const getBookMeta = () => {
    const inst = rendition();
    const meta = inst?.book?.packaging?.metadata;
    const baseId = meta?.identifier || `${meta?.title || "未知书名"}_${meta?.creator || "未知作者"}`;
    const bookId = String(baseId).replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, "_").substring(0, 64) || "default_book";
    return { bookId, bookName: meta?.title || "未知书名" };
  };

  const removeAnnotationInstance = (cfiRange: string) => {
    try {
      const inst = rendition();
      inst?.annotations.remove(cfiRange, "highlight");
      inst?.annotations.remove(cfiRange, "underline");
    } catch {}
  };

  const updateCurrentIndexNodes = (allNotes: NewNote[]) => {
    const inst = rendition();
    if (!inst || !(inst as any).manager) return; // 👈 解决 manager 类型报错
    
    const { bookId } = getBookMeta();
    const bookNotes = allNotes.filter((n) => n.bookId === bookId);
    
    try {
      const sectionIndex = (inst.currentLocation() as any)?.start?.index;
      setCurrentIndexNodes(sectionIndex !== undefined ? bookNotes.filter((n) => String(n.index) === String(sectionIndex)) : []);
    } catch {
      setCurrentIndexNodes([]);
    }
  };

  const renderAnnotation = (note: NewNote) => {
    const inst = rendition();
    if (!inst || !note.cfiRange) return;

    const { bookId } = getBookMeta();
    if (note.bookId && note.bookId !== bookId) return;

    removeAnnotationInstance(note.cfiRange);
    const isUl = note.isUnderline;
    const color = note.color || "#fffa65";

    try {
      inst.annotations.add(
        isUl ? "underline" : "highlight",
        note.cfiRange,
        { id: note.cfiRange },
        () => {
          const matched = notes().find((i) => i.cfiRange === note.cfiRange && i.bookId === bookId);
          if (matched) setCurrent(matched);
        },
        isUl ? "epub-note-underline" : "epub-note-highlight",
        isUl 
          ? { stroke: color, color, "stroke-width": "2.5px" }
          : { fill: color, "fill-opacity": "0.4", stroke: color, backgroundColor: color }
      );
    } catch {}
  };

  // 注入高亮样式的函数
  const injectStyles = (doc: Document) => {
    if (!doc || doc.getElementById("epub-custom-highlight-style")) return;
    const style = doc.createElement("style");
    style.id = "epub-custom-highlight-style";
    style.innerHTML = `
      .epub-note-highlight { cursor: pointer; border-radius: 2px; }
      rect.epubjs-hl, .epubjs-hl { fill-opacity: 0.4 !important; mix-blend-mode: multiply !important; }
      .epub-note-underline line, .epubjs-ul line, g[epub-type='underline'] line { stroke-width: 2.5px !important; stroke-linecap: round !important; }
    `;
    doc.head.appendChild(style);
  };

  createEffect(() => {
    const inst = rendition();
    if (!inst) return;

    let mounted = true;

    void getAllGlobalNotes().then((saved) => {
      if (!mounted) return;
      setNotes(saved);
      isLoaded = true;
      
      const { bookId } = getBookMeta();
      saved.forEach((n) => n.bookId === bookId && renderAnnotation(n));
      updateCurrentIndexNodes(saved);
    });

    const contentHandler = (contents: any) => {
      injectStyles(contents.document); // 👈 正确通过 contents.document 注入样式
      if (isLoaded) {
        const { bookId } = getBookMeta();
        notes().forEach((n) => n.bookId === bookId && String(n.index) === String(contents.sectionIndex) && renderAnnotation(n));
      }
    };

    const handleRelocated = (location: any) => {
      const idx = location?.start?.index;
      if (idx !== undefined) updateCurrentIndexNodes(notes());
    };

    inst.hooks.content.register(contentHandler);
    inst.on("relocated", handleRelocated);

    onCleanup(() => {
      mounted = false;
      try {
        inst.hooks.content.deregister?.(contentHandler);
        inst.off("relocated", handleRelocated);
      } catch {}
    });
  });

  const put = (noteData: Omit<NewNote, "bookId" | "bookName" | "updatedAt">) => {
    if (!noteData.cfiRange || !isLoaded) return;
    removeAnnotationInstance(noteData.cfiRange);

    const { bookId, bookName } = getBookMeta();
    const currentNotes = notes();
    const existingIndex = currentNotes.findIndex((n) => n.cfiRange === noteData.cfiRange && n.bookId === bookId);

    const fullNote: NewNote = existingIndex >= 0
      ? { ...currentNotes[existingIndex], ...noteData, bookId, bookName: currentNotes[existingIndex].bookName || bookName, updatedAt: Date.now() }
      : { color: "#fffa65", isUnderline: false, tags: [], title: "读书笔记", ...noteData, bookId, bookName, updatedAt: Date.now() };

    const updatedList = existingIndex >= 0 
      ? currentNotes.map((n, i) => (i === existingIndex ? fullNote : n)) 
      : [...currentNotes, fullNote];
    
    setNotes(updatedList);
    void setAllGlobalNotes(updatedList);
    updateCurrentIndexNodes(updatedList);
    setCurrent(fullNote);
    renderAnnotation(fullNote);
  };

  const remove = (cfiRange: string) => {
    if (!cfiRange || !isLoaded) return;
    removeAnnotationInstance(cfiRange);

    const { bookId } = getBookMeta();
    const updatedList = notes().filter((n) => !(n.cfiRange === cfiRange && n.bookId === bookId));
    
    setNotes(updatedList);
    void setAllGlobalNotes(updatedList);
    updateCurrentIndexNodes(updatedList);
    setCurrent((prev) => (prev?.cfiRange === cfiRange && prev?.bookId === bookId ? null : prev));
  };

  return { put, remove, currentIndexNodes, current };
}