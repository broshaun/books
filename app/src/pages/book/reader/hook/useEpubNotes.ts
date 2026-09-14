import { createSignal, onMount, onCleanup, createEffect } from "solid-js";
import localforage from "localforage";
import type { Rendition } from "epubjs";

export interface NewNote {
  book: string;
  index: number;
  cfiRange: string;
  text: string;
  title?: string;
  color?: string;
  isUnderline?: boolean;
  content?: string;
  updatedAt?: number;
}

export function useEpubNotes(rendition: () => Rendition | null, bookId: string) {
  const [current, setCurrent] = createSignal<NewNote | null>(null);
  const [currentIndexNodes, setCurrentIndexNodes] = createSignal<NewNote[]>([]);

  let notes: NewNote[] = [];
  let isLoaded = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const safeBookId = bookId ? bookId.split(/[/\\]/).pop() || bookId : "";
  const storageKey = safeBookId ? `epub_notes_${safeBookId}` : null;

  const removeAnnotationInstance = (cfiRange: string) => {
    const inst = rendition();
    if (!inst) return;
    try {
      inst.annotations.remove(cfiRange, "highlight");
      inst.annotations.remove(cfiRange, "underline");
    } catch {}
  };

  const updateCurrentIndexNodes = (list: NewNote[]) => {
    const inst = rendition();
    if (!inst) return;
    const currentLocation = inst.currentLocation() as any;
    const currentSectionIndex = currentLocation?.start?.index;
    if (currentSectionIndex !== undefined) {
      setCurrentIndexNodes(list.filter((n) => String(n.index) === String(currentSectionIndex)));
    } else {
      setCurrentIndexNodes([]);
    }
  };

  const renderAnnotation = (note: NewNote) => {
    const inst = rendition();
    if (!inst || !note.cfiRange) return;

    removeAnnotationInstance(note.cfiRange);

    const color = note.color || "#fffa65";
    const isUl = note.isUnderline;
    const type = isUl ? "underline" : "highlight";
    const className = isUl ? "epub-note-underline" : "epub-note-highlight";

    const style = isUl
      ? { stroke: color, color, "stroke-width": "2.5px" }
      : { fill: color, "fill-opacity": "0.4", stroke: color, backgroundColor: color };

    try {
      inst.annotations.add(
        type,
        note.cfiRange,
        { id: note.cfiRange },
        () => {
          const latest =
            notes.find((item) => item.cfiRange === note.cfiRange) ||
            notes.find((item) => item.index === note.index) ||
            note;
          setCurrent({ ...latest });
        },
        className,
        style
      );
    } catch {}
  };

  const persist = (list: NewNote[]) => {
    if (!storageKey || !isLoaded) return;
    void localforage.setItem(storageKey, list);
  };

  const setInternal = (list: NewNote[]) => {
    if (!Array.isArray(list)) return;

    notes.forEach((n) => removeAnnotationInstance(n.cfiRange));

    const fullList = list.map((item) => ({
      ...item,
      book: bookId,
      color: item.color || "#fffa65",
      isUnderline: item.isUnderline ?? false,
      updatedAt: item.updatedAt || Date.now(),
    }));

    notes = fullList;
    isLoaded = true;
    persist(fullList);
    updateCurrentIndexNodes(fullList);

    const inst = rendition();
    if (inst) {
      fullList.forEach(renderAnnotation);
    }
  };

  const set = (list: NewNote[]) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      setInternal(list);
    }, 300);
  };

  onMount(() => {
    if (!storageKey) return;
    let mounted = true;

    const loadNotes = async () => {
      try {
        const saved = await localforage.getItem<NewNote[]>(storageKey);
        if (!mounted) return;

        if (Array.isArray(saved) && saved.length > 0) {
          notes = saved;
          updateCurrentIndexNodes(saved);
        }
      } catch (error) {
        console.error("加载本地笔记失败:", error);
      } finally {
        isLoaded = true;
      }
    };

    void loadNotes();

    onCleanup(() => {
      mounted = false;
      if (debounceTimer) clearTimeout(debounceTimer);
    });
  });

  createEffect(() => {
    const inst = rendition();
    if (!inst || !isLoaded) return;

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
      notes.forEach((note) => {
        if (String(note.index) === String(contents.sectionIndex)) {
          renderAnnotation(note);
        }
      });
    };

    inst.hooks.content.register(contentHandler);

    const handleRelocated = (location: any) => {
      const sectionIndex = location?.start?.index;
      if (sectionIndex !== undefined) {
        setCurrentIndexNodes(notes.filter((n) => String(n.index) === String(sectionIndex)));
      }
    };

    inst.on("relocated", handleRelocated);

    notes.forEach(renderAnnotation);

    onCleanup(() => {
      try {
        inst.hooks.content.deregister?.(contentHandler);
        inst.off("relocated", handleRelocated);
      } catch {}
    });
  });

  const get = (): NewNote[] => {
    return notes;
  };

  const put = (noteData: Omit<NewNote, "book" | "updatedAt">) => {
    if (!noteData.cfiRange || !isLoaded) return;

    removeAnnotationInstance(noteData.cfiRange);

    const existingIndex = notes.findIndex((n) => n.cfiRange === noteData.cfiRange);

    let fullNote: NewNote;
    if (existingIndex >= 0) {
      fullNote = {
        ...notes[existingIndex],
        ...noteData,
        book: bookId,
        updatedAt: Date.now(),
      };
    } else {
      fullNote = {
        color: "#fffa65",
        isUnderline: false,
        ...noteData,
        title: noteData.title || "读书笔记",
        book: bookId,
        updatedAt: Date.now(),
      };
    }

    const next = existingIndex >= 0
      ? notes.map((n, i) => (i === existingIndex ? fullNote : n))
      : [...notes, fullNote];

    notes = next;
    persist(next);
    updateCurrentIndexNodes(next);

    setCurrent(fullNote);
    renderAnnotation(fullNote);
  };

  const remove = (cfiRange: string) => {
    if (!cfiRange || !isLoaded) return;

    removeAnnotationInstance(cfiRange);

    const next = notes.filter((n) => n.cfiRange !== cfiRange);
    notes = next;
    persist(next);
    updateCurrentIndexNodes(next);

    setCurrent((prev) => (prev?.cfiRange === cfiRange ? null : prev));
  };

  return { get, set, put, remove, currentIndexNodes, current };
}