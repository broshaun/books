import { createSignal, onCleanup, createEffect } from "solid-js";
import localforage from "localforage";
import type { Rendition } from "epubjs";

export interface NewNote {
  bookId: string;
  bookName: string;
  index: number;
  cfiRange: string;
  // 🌟 新增：支持多标签/分类数组（例如 ['灵感', '代码', '重要']）
  tags?: string[];
  text: string;
  title?: string;
  color?: string;
  isUnderline?: boolean;
  content?: string;
  updatedAt?: number;
}

export function useEpubNotes(rendition: () => Rendition | null) {
  const [current, setCurrent] = createSignal<NewNote | null>(null);
  const [currentIndexNodes, setCurrentIndexNodes] = createSignal<NewNote[]>([]);

  let notes: NewNote[] = [];
  let isLoaded = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // 1. 获取版本无关的稳定唯一标识与书名
  const getBookMeta = () => {
    const inst = rendition();
    const metadata = inst?.book?.packaging?.metadata;
    const baseId = (metadata?.identifier || `${metadata?.title || "未知书名"}_${metadata?.creator || "未知作者"}`).trim();
    
    const bookId = String(baseId)
      .replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, "_")
      .substring(0, 64) || "default_book";

    return { bookId, bookName: metadata?.title || "未知书名" };
  };

  const removeAnnotationInstance = (cfiRange: string) => {
    try {
      rendition()?.annotations.remove(cfiRange, "highlight");
      rendition()?.annotations.remove(cfiRange, "underline");
    } catch {}
  };

  const updateCurrentIndexNodes = (list: NewNote[]) => {
    const inst = rendition();
    if (!inst || !(inst as any).manager) return;
    try {
      const sectionIndex = (inst.currentLocation() as any)?.start?.index;
      setCurrentIndexNodes(sectionIndex !== undefined ? list.filter((n) => String(n.index) === String(sectionIndex)) : []);
    } catch {
      setCurrentIndexNodes([]);
    }
  };

  const renderAnnotation = (note: NewNote) => {
    const inst = rendition();
    if (!inst || !note.cfiRange) return;

    removeAnnotationInstance(note.cfiRange);
    const isUl = note.isUnderline;
    const color = note.color || "#fffa65";

    try {
      inst.annotations.add(
        isUl ? "underline" : "highlight",
        note.cfiRange,
        { id: note.cfiRange },
        () => setCurrent({ ...(notes.find((i) => i.cfiRange === note.cfiRange) || note) }),
        isUl ? "epub-note-underline" : "epub-note-highlight",
        isUl 
          ? { stroke: color, color, "stroke-width": "2.5px" }
          : { fill: color, "fill-opacity": "0.4", stroke: color, backgroundColor: color }
      );
    } catch {}
  };

  const persist = (list: NewNote[]) => {
    const { bookId } = getBookMeta();
    if (bookId && isLoaded) void localforage.setItem(`epub_notes_${bookId}`, list);
  };

  const setInternal = (list: NewNote[]) => {
    if (!Array.isArray(list)) return;
    notes.forEach((n) => removeAnnotationInstance(n.cfiRange));

    const { bookId, bookName } = getBookMeta();
    notes = list.map((item) => ({
      ...item,
      bookId: item.bookId || bookId,
      bookName: item.bookName || bookName,
      color: item.color || "#fffa65",
      tags: Array.isArray(item.tags) ? item.tags : [], // 确保初始化时 tags 为数组
      isUnderline: item.isUnderline ?? false,
      updatedAt: item.updatedAt || Date.now(),
    }));

    isLoaded = true;
    persist(notes);
    updateCurrentIndexNodes(notes);
    notes.forEach(renderAnnotation);
  };

  const set = (list: NewNote[]) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => setInternal(list), 300);
  };

  createEffect(() => {
    const inst = rendition();
    if (!inst) return;

    let mounted = true;
    const { bookId } = getBookMeta();
    if (!bookId) return;

    const loadNotes = async () => {
      try {
        const saved = await localforage.getItem<NewNote[]>(`epub_notes_${bookId}`);
        if (!mounted) return;
        notes = Array.isArray(saved) ? saved : [];
      } catch (error) {
        console.error("加载本地笔记失败:", error);
        notes = [];
      } finally {
        isLoaded = true;
        if (mounted && rendition()) {
          notes.forEach(renderAnnotation);
          updateCurrentIndexNodes(notes);
        }
      }
    };

    void loadNotes();

    const injectStyles = (doc: Document) => {
      if (!doc || doc.getElementById("epub-custom-highlight-style")) return;
      const style = doc.createElement("style");
      style.id = "epub-custom-highlight-style";
      style.innerHTML = `
        .epub-note-highlight { cursor: pointer; border-radius: 2px; }
        rect.epubjs-hl, .epubjs-hl { fill-opacity: 0.4 !important; mix-blend-mode: multiply !important; }
        .epub-note-underline line, .epubjs-ul line, g[epub-type='underline'] line {
          stroke-width: 2.5px !important;
          stroke-linecap: round !important;
        }
      `;
      doc.head.appendChild(style);
    };

    const contentHandler = (contents: any) => {
      injectStyles(contents.document);
      if (isLoaded) {
        notes.forEach((n) => String(n.index) === String(contents.sectionIndex) && renderAnnotation(n));
      }
    };

    const handleRelocated = (location: any) => {
      const idx = location?.start?.index;
      if (idx !== undefined) setCurrentIndexNodes(notes.filter((n) => String(n.index) === String(idx)));
    };

    inst.hooks.content.register(contentHandler);
    inst.on("relocated", handleRelocated);

    onCleanup(() => {
      mounted = false;
      if (debounceTimer) clearTimeout(debounceTimer);
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
    const existingIndex = notes.findIndex((n) => n.cfiRange === noteData.cfiRange);

    const fullNote: NewNote = existingIndex >= 0
      ? { 
          ...notes[existingIndex], 
          ...noteData, 
          bookId, 
          bookName: notes[existingIndex].bookName || bookName, 
          tags: noteData.tags ?? notes[existingIndex].tags ?? [],
          updatedAt: Date.now() 
        }
      : { 
          color: "#fffa65", 
          isUnderline: false, 
          tags: noteData.tags ?? [],
          ...noteData, 
          title: noteData.title || "读书笔记", 
          bookId, 
          bookName, 
          updatedAt: Date.now() 
        };

    notes = existingIndex >= 0 ? notes.map((n, i) => (i === existingIndex ? fullNote : n)) : [...notes, fullNote];
    
    persist(notes);
    updateCurrentIndexNodes(notes);
    setCurrent(fullNote);
    renderAnnotation(fullNote);
  };

  const remove = (cfiRange: string) => {
    if (!cfiRange || !isLoaded) return;
    removeAnnotationInstance(cfiRange);

    notes = notes.filter((n) => n.cfiRange !== cfiRange);
    persist(notes);
    updateCurrentIndexNodes(notes);
    setCurrent((prev) => (prev?.cfiRange === cfiRange ? null : prev));
  };

  // 🌟 新增：根据标签筛选笔记的方法
  const getByTag = (tag: string) => {
    if (!tag || tag === 'all') return notes;
    return notes.filter((n) => n.tags?.includes(tag));
  };

  // 🌟 新增：获取当前所有使用过的标签列表（用于动态渲染标签页 Tabs）
  const getAllTags = () => {
    const tagSet = new Set<string>();
    notes.forEach((n) => n.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  };

  return { 
    get: () => notes, 
    set, 
    put, 
    remove, 
    getByTag,       // 👈 新增筛选
    getAllTags,     // 👈 新增获取所有标签
    currentIndexNodes, 
    current 
  };
}