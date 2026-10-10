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

export interface NoteFilter {
  bookId?: string;
  tag?: string | null;
  [key: string]: any;
}

const GLOBAL_STORAGE_KEY = "epub_global_notes";

export const getAllGlobalNotes = async (): Promise<NewNote[]> => {
  const saved = await localforage.getItem<NewNote[]>(GLOBAL_STORAGE_KEY);
  return Array.isArray(saved) ? saved : [];
};

export const setAllGlobalNotes = (list: NewNote[]) => localforage.setItem(GLOBAL_STORAGE_KEY, list);

export function useEpubNotes(rendition: () => Rendition | null) {
  const [currentNote, setCurrentNote] = createSignal<NewNote | null>(null);
  const [indexTags, setIndexTags] = createSignal<Record<string, number>>({});
  const [currentIndexNotes, setCurrentIndexNotes] = createSignal<NewNote[]>([]);
  const [notes, setNotes] = createSignal<NewNote[]>([]);
  const [internalFilter, setInternalFilter] = createSignal<NoteFilter>({});

  let isLoaded = false;

  const getBookMeta = () => {
    const meta = rendition()?.book?.packaging?.metadata;
    const baseId = meta?.identifier || `${meta?.title || "未知书名"}_${meta?.creator || "未知作者"}`;
    return {
      bookId: String(baseId).replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, "_").substring(0, 64) || "default_book",
      bookName: meta?.title || "未知书名",
    };
  };

  const getResolvedFilter = (): NoteFilter => ({
    bookId: getBookMeta().bookId,
    tag: undefined,
    ...internalFilter(),
  });

  const removeAnnotation = (cfiRange: string) => {
    try {
      const inst = rendition();
      inst?.annotations.remove(cfiRange, "highlight");
      inst?.annotations.remove(cfiRange, "underline");
    } catch {}
  };

  const getFilteredNotes = (allNotes: NewNote[]) => {
    const { bookId, tag } = getResolvedFilter();
    return allNotes.filter((n) => {
      if (bookId && n.bookId !== bookId) return false;
      if (tag && !n.tags?.includes(tag)) return false;
      return true;
    });
  };

  const updateCurrentIndexData = (allNotes: NewNote[]) => {
    const inst = rendition();
    if (!inst || !(inst as any).manager) return;
    
    const { bookId } = getResolvedFilter();
    const bookFiltered = allNotes.filter((n) => !bookId || n.bookId === bookId);
    
    // 🌟 统计当前书本所有笔记的标签数，并默认带上 'all' 标签及总数
    const tagCountMap: Record<string, number> = {
      all: bookFiltered.length
    };
    
    bookFiltered.forEach((n) => {
      n.tags?.forEach((t) => { 
        tagCountMap[t] = (tagCountMap[t] || 0) + 1; 
      });
    });

    const sectionIndex = (inst.currentLocation() as any)?.start?.index;
    
    // 获取当前过滤条件下的当前章节笔记列表
    const filteredMatched = sectionIndex !== undefined 
      ? getFilteredNotes(allNotes).filter((n) => String(n.index) === String(sectionIndex))
      : [];

    setIndexTags(tagCountMap);
    setCurrentIndexNotes(filteredMatched);
  };

  const renderAnnotation = (note: NewNote) => {
    const inst = rendition();
    if (!inst || !note.cfiRange) return;

    const { bookId } = getResolvedFilter();
    if (bookId && note.bookId && note.bookId !== bookId) return;

    removeAnnotation(note.cfiRange);
    const isUl = note.isUnderline;
    const color = note.color || "#fffa65";

    try {
      inst.annotations.add(
        isUl ? "underline" : "highlight",
        note.cfiRange,
        { id: note.cfiRange },
        () => {
          const matched = notes().find((i) => i.cfiRange === note.cfiRange && i.bookId === note.bookId);
          if (matched) setCurrentNote(matched);
        },
        isUl ? "epub-note-underline" : "epub-note-highlight",
        isUl 
          ? { stroke: color, color, "stroke-width": "2.5px" }
          : { fill: color, "fill-opacity": "0.4", stroke: color, backgroundColor: color }
      );
    } catch {}
  };

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
    const { bookId } = getResolvedFilter();
    const allNotes = notes();
    if (!isLoaded) return;

    allNotes.forEach((n) => {
      if (!bookId || n.bookId === bookId) removeAnnotation(n.cfiRange);
    });

    getFilteredNotes(allNotes).forEach(renderAnnotation);
    updateCurrentIndexData(allNotes);
  });

  createEffect(() => {
    const inst = rendition();
    if (!inst) return;

    let mounted = true;
    void getAllGlobalNotes().then((saved) => {
      if (!mounted) return;
      setNotes(saved);
      isLoaded = true;
      getFilteredNotes(saved).forEach(renderAnnotation);
      updateCurrentIndexData(saved);
    });

    const contentHandler = (contents: any) => {
      injectStyles(contents.document);
      if (isLoaded) {
        getFilteredNotes(notes()).forEach((n) => {
          if (String(n.index) === String(contents.sectionIndex)) renderAnnotation(n);
        });
      }
    };

    const handleRelocated = () => updateCurrentIndexData(notes());

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
    removeAnnotation(noteData.cfiRange);

    const { bookId, bookName } = getBookMeta();
    const allNotes = notes();
    const existingIndex = allNotes.findIndex((n) => n.cfiRange === noteData.cfiRange && n.bookId === bookId);

    const fullNote: NewNote = existingIndex >= 0
      ? { ...allNotes[existingIndex], ...noteData, bookId, bookName: allNotes[existingIndex].bookName || bookName, updatedAt: Date.now() }
      : { color: "#fffa65", isUnderline: false, tags: [], title: "读书笔记", ...noteData, bookId, bookName, updatedAt: Date.now() };

    const updatedList = existingIndex >= 0 
      ? allNotes.map((n, i) => (i === existingIndex ? fullNote : n)) 
      : [...allNotes, fullNote];
    
    setNotes(updatedList);
    void setAllGlobalNotes(updatedList);
    updateCurrentIndexData(updatedList);
    setCurrentNote(fullNote);

    const { bookId: fBookId, tag: fTag } = getResolvedFilter();
    if ((!fBookId || fullNote.bookId === fBookId) && (!fTag || fullNote.tags?.includes(fTag))) {
      renderAnnotation(fullNote);
    }
  };

  const remove = (cfiRange: string) => {
    if (!cfiRange || !isLoaded) return;
    removeAnnotation(cfiRange);

    const { bookId } = getBookMeta();
    const updatedList = notes().filter((n) => !(n.cfiRange === cfiRange && n.bookId === bookId));
    
    setNotes(updatedList);
    void setAllGlobalNotes(updatedList);
    updateCurrentIndexData(updatedList);
    setCurrentNote((prev) => (prev?.cfiRange === cfiRange && prev?.bookId === bookId ? null : prev));
  };

  const filter = (newFilter?: NoteFilter) => {
    if (newFilter !== undefined) {
      setInternalFilter((prev) => ({ ...prev, ...newFilter }));
    }
    return getResolvedFilter();
  };

  return { 
    put, 
    remove, 
    currentNote, 
    indexTags, 
    currentIndexNotes, 
    filter 
  };
}