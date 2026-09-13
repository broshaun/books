import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import localforage from 'localforage';
import { useDebounceFn } from 'ahooks';
import type { Rendition } from 'epubjs';

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

export function useEpubNotes(rendition: Rendition | null, bookId: string) {
  const [current, setCurrent] = useState<NewNote | null>(null);
  const [currentIndexNodes, setCurrentIndexNodes] = useState<NewNote[]>([]);

  const notesRef = useRef<NewNote[]>([]);
  const isLoadedRef = useRef(false);

  // 🛡️ 提取纯文件名或安全标识作为 Key，防止绝对路径中的斜杠和特殊字符导致 LocalForage 读取错乱
  const safeBookId = bookId ? bookId.split(/[/\\]/).pop() || bookId : '';
  const storageKey = safeBookId ? `epub_notes_${safeBookId}` : null;

  const removeAnnotationInstance = useCallback((cfiRange: string) => {
    if (!rendition) return;
    try {
      rendition.annotations.remove(cfiRange, 'highlight');
      rendition.annotations.remove(cfiRange, 'underline');
    } catch {}
  }, [rendition]);

  const updateCurrentIndexNodes = useCallback((list: NewNote[]) => {
    if (!rendition) return;
    const currentLocation = rendition.currentLocation() as any;
    const currentSectionIndex = currentLocation?.start?.index;
    if (currentSectionIndex !== undefined) {
      setCurrentIndexNodes(list.filter(n => String(n.index) === String(currentSectionIndex)));
    } else {
      setCurrentIndexNodes([]);
    }
  }, [rendition]);

  const renderAnnotation = useCallback(
    (note: NewNote) => {
      if (!rendition || !note.cfiRange) return;

      removeAnnotationInstance(note.cfiRange);

      const color = note.color || '#fffa65';
      const isUl = note.isUnderline;
      const type = isUl ? 'underline' : 'highlight';
      const className = isUl ? 'epub-note-underline' : 'epub-note-highlight';
      
      const style = isUl
        ? { stroke: color, color, 'stroke-width': '2.5px' }
        : { fill: color, 'fill-opacity': '0.4', stroke: color, backgroundColor: color };

      try {
        rendition.annotations.add(
          type,
          note.cfiRange,
          { id: note.cfiRange },
          () => {
            const latest =
              notesRef.current.find(item => item.cfiRange === note.cfiRange) ||
              notesRef.current.find(item => item.index === note.index) ||
              note;
            setCurrent({ ...latest });
          },
          className,
          style
        );
      } catch {}
    },
    [rendition, removeAnnotationInstance]
  );

  useEffect(() => {
    if (!rendition) return;

    const injectStyles = (doc: Document) => {
      if (!doc || doc.getElementById('epub-custom-highlight-style')) return;

      const style = doc.createElement('style');
      style.id = 'epub-custom-highlight-style';
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
      notesRef.current.forEach(note => {
        if (String(note.index) === String(contents.sectionIndex)) {
          renderAnnotation(note);
        }
      });
    };

    rendition.hooks.content.register(contentHandler);

    const handleRelocated = (location: any) => {
      const sectionIndex = location?.start?.index;
      if (sectionIndex !== undefined) {
        setCurrentIndexNodes(notesRef.current.filter(n => String(n.index) === String(sectionIndex)));
      }
    };

    rendition.on('relocated', handleRelocated);

    return () => {
      try {
        rendition.hooks.content.deregister?.(contentHandler);
        rendition.off('relocated', handleRelocated);
      } catch {}
    };
  }, [rendition, renderAnnotation]);

  const persist = useCallback(
    (list: NewNote[]) => {
      if (!storageKey || !isLoadedRef.current) return;
      void localforage.setItem(storageKey, list);
    },
    [storageKey]
  );

  const setInternal = useCallback(
    (list: NewNote[]) => {
      if (!Array.isArray(list)) return;

      notesRef.current.forEach(n => removeAnnotationInstance(n.cfiRange));

      const fullList = list.map(item => ({
        ...item,
        book: bookId,
        color: item.color || '#fffa65',
        isUnderline: item.isUnderline ?? false,
        updatedAt: item.updatedAt || Date.now(),
      }));

      notesRef.current = fullList;
      isLoadedRef.current = true;
      persist(fullList);
      updateCurrentIndexNodes(fullList);

      if (rendition) {
        fullList.forEach(renderAnnotation);
      }
    },
    [rendition, bookId, persist, renderAnnotation, updateCurrentIndexNodes, removeAnnotationInstance]
  );

  const { run: set } = useDebounceFn(setInternal, {
    wait: 300,
    leading: false,
    trailing: true,
  });

  // 🛡️ 独立于 rendition 的加载逻辑：只要 storageKey 确定，立即从 IndexedDB 恢复笔记
  useEffect(() => {
    if (!storageKey) return;
    let mounted = true;

    const loadNotes = async () => {
      try {
        const saved = await localforage.getItem<NewNote[]>(storageKey);
        if (!mounted) return;
        
        if (Array.isArray(saved) && saved.length > 0) {
          notesRef.current = saved;
          updateCurrentIndexNodes(saved);
        }
      } catch (error) {
        console.error('加载本地笔记失败:', error);
      } finally {
        isLoadedRef.current = true;
      }
    };

    loadNotes();

    return () => {
      mounted = false;
    };
  }, [storageKey, updateCurrentIndexNodes]);

  // 当 rendition 准备就绪时，把已加载的内存笔记渲染到画板上
  useEffect(() => {
    if (!rendition || !isLoadedRef.current) return;
    notesRef.current.forEach(renderAnnotation);
  }, [rendition, renderAnnotation]);

  const get = useCallback((): NewNote[] => {
    return notesRef.current;
  }, []);

  const put = useCallback(
    (noteData: Omit<NewNote, 'book' | 'updatedAt'>) => {
      if (!noteData.cfiRange || !isLoadedRef.current) return;

      removeAnnotationInstance(noteData.cfiRange);

      const existingIndex = notesRef.current.findIndex(
        n => n.cfiRange === noteData.cfiRange
      );

      let fullNote: NewNote;
      if (existingIndex >= 0) {
        fullNote = {
          ...notesRef.current[existingIndex],
          ...noteData,
          book: bookId,
          updatedAt: Date.now(),
        };
      } else {
        fullNote = {
          color: '#fffa65',
          isUnderline: false,
          ...noteData,
          title: noteData.title || '读书笔记',
          book: bookId,
          updatedAt: Date.now(),
        };
      }

      const next = existingIndex >= 0
        ? notesRef.current.map((n, i) => (i === existingIndex ? fullNote : n))
        : [...notesRef.current, fullNote];

      notesRef.current = next;
      persist(next);
      updateCurrentIndexNodes(next);
      
      setCurrent(fullNote);
      renderAnnotation(fullNote);
    },
    [bookId, persist, renderAnnotation, updateCurrentIndexNodes, removeAnnotationInstance]
  );

  const remove = useCallback(
    (cfiRange: string) => {
      if (!cfiRange || !isLoadedRef.current) return;

      removeAnnotationInstance(cfiRange);

      const next = notesRef.current.filter(n => n.cfiRange !== cfiRange);
      notesRef.current = next;
      persist(next);
      updateCurrentIndexNodes(next);

      setCurrent(prev => (prev?.cfiRange === cfiRange ? null : prev));
    },
    [persist, updateCurrentIndexNodes, removeAnnotationInstance]
  );

  return { get, set, put, remove, currentIndexNodes, current };
}