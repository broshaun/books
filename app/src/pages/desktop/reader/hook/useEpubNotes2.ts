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

export function useEpubNotes(renditionGetter: () => Rendition | null) {
  const [notes, setNotes] = createSignal<NewNote[]>([]);
  let isLoaded = false;

  // 获取当前书本的元数据与 bookId
  const getBookMeta = () => {
    const meta = renditionGetter()?.book?.packaging?.metadata;
    const baseId = meta?.identifier || `${meta?.title || "未知书名"}_${meta?.creator || "未知作者"}`;
    return {
      bookId: String(baseId).replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, "_").substring(0, 64) || "default_book",
      bookName: meta?.title || "未知书名",
    };
  };

  // 移除视窗中的高亮标注
  const removeAnnotation = (cfiRange: string) => {
    try {
      const inst = renditionGetter();
      inst?.annotations.remove(cfiRange, "highlight");
      inst?.annotations.remove(cfiRange, "underline");
    } catch { }
  };

  // 渲染单条高亮到视窗
  const renderAnnotation = (note: NewNote) => {
    const inst = renditionGetter();
    if (!inst || !note.cfiRange) return;

    const { bookId } = getBookMeta();
    if (note.bookId && note.bookId !== bookId) return;

    removeAnnotation(note.cfiRange);
    const isUl = note.isUnderline;
    const color = note.color || "#fffa65";

    try {
      inst.annotations.add(
        isUl ? "underline" : "highlight",
        note.cfiRange,
        { id: note.cfiRange },
        undefined,
        isUl ? "epub-note-underline" : "epub-note-highlight",
        isUl
          ? { stroke: color, color, "stroke-width": "2.5px" }
          : { fill: color, "fill-opacity": "0.4", stroke: color, backgroundColor: color }
      );
    } catch { }
  };

  // 注入高亮自定义样式
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

  // 生命周期与自动注入监听
  createEffect(() => {
    const inst = renditionGetter();
    if (!inst) return;

    let mounted = true;
    void localforage.getItem<NewNote[]>(GLOBAL_STORAGE_KEY).then((saved) => {
      if (!mounted) return;
      const loaded = Array.isArray(saved) ? saved : [];
      setNotes(loaded);
      isLoaded = true;

      const { bookId } = getBookMeta();
      loaded.filter((n) => n.bookId === bookId).forEach(renderAnnotation);
    });

    const contentHandler = (contents: any) => {
      injectStyles(contents.document);
      if (isLoaded) {
        const { bookId } = getBookMeta();
        notes()
          .filter((n) => n.bookId === bookId && String(n.index) === String(contents.sectionIndex))
          .forEach(renderAnnotation);
      }
    };

    inst.hooks.content.register(contentHandler);

    onCleanup(() => {
      mounted = false;
      try {
        inst.hooks.content.deregister?.(contentHandler);
      } catch { }
    });
  });

  // --- 对外核心 API ---

  // 1. 添加或更新（有则覆盖，无则新建）
  const put = (noteData: Omit<NewNote, "bookId" | "bookName" | "updatedAt">) => {
    if (!noteData.cfiRange || !isLoaded) return;
    removeAnnotation(noteData.cfiRange);

    const { bookId, bookName } = getBookMeta();
    const all = notes();
    const existingIndex = all.findIndex((n) => n.cfiRange === noteData.cfiRange && n.bookId === bookId);

    const fullNote: NewNote = existingIndex >= 0
      ? { ...all[existingIndex], ...noteData, bookId, bookName, updatedAt: Date.now() }
      : { color: "#fffa65", isUnderline: false, tags: [], title: "读书笔记", ...noteData, bookId, bookName, updatedAt: Date.now() };

    const updated = existingIndex >= 0
      ? all.map((n, i) => (i === existingIndex ? fullNote : n))
      : [...all, fullNote];

    setNotes(updated);
    void localforage.setItem(GLOBAL_STORAGE_KEY, updated);
    renderAnnotation(fullNote);
  };

  // 2. 根据 cfiRange 获取单条笔记
  const get = (cfiRange?: string | null): NewNote | undefined => {
    if (!cfiRange) return undefined;
    const { bookId } = getBookMeta();
    return notes().find((n) => n.cfiRange === cfiRange && n.bookId === bookId);
  };

  // 3. 删除笔记
  const del = (cfiRange: string) => {
    if (!cfiRange || !isLoaded) return;
    removeAnnotation(cfiRange);

    const { bookId } = getBookMeta();
    const updated = notes().filter((n) => !(n.cfiRange === cfiRange && n.bookId === bookId));
    setNotes(updated);
    void localforage.setItem(GLOBAL_STORAGE_KEY, updated);
  };

  // 4. 过滤笔记（将 tags 加上 | null，允许接收可能为空的输入）
  const filter = (params: { index?: number; tags?: string | string[] | null; cfiRange?: string } = {}): NewNote[] => {
    const { index, tags, cfiRange } = params;
    const { bookId } = getBookMeta();

    return notes().filter((n) => {
      if (bookId && n.bookId !== bookId) return false;
      if (index !== undefined && index !== null && Number(n.index) !== Number(index)) return false;
      if (cfiRange !== undefined && cfiRange !== null && n.cfiRange !== cfiRange) return false;
      if (tags) {
        const targetTags = Array.isArray(tags) ? tags : [tags];
        if (targetTags.length > 0 && !targetTags.some((t) => t && n.tags?.includes(t))) return false;
      }
      return true;
    });
  };

  // 5. 获取标签统计
  const getTags = (params: { index?: number } = {}): Record<string, number> => {
    const { index } = params;
    const { bookId } = getBookMeta();

    const targetNotes = notes().filter((n) => {
      if (bookId && n.bookId !== bookId) return false;
      if (index !== undefined && index !== null && Number(n.index) !== Number(index)) return false;
      return true;
    });

    const tagCountMap: Record<string, number> = { all: targetNotes.length };
    targetNotes.forEach((n) => {
      n.tags?.forEach((t) => {
        tagCountMap[t] = (tagCountMap[t] || 0) + 1;
      });
    });

    return tagCountMap;
  };

  return { put, get, del, filter, getTags };
}