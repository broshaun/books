import { createSignal, createEffect } from "solid-js";
import localforage from "localforage";

export interface Bookmark {
  cfi: string;       // EPUB 的定位符 (CFI)
  title?: string;    // 章节标题或摘要
  createdAt: number; // 创建时间戳
}

/**
 * SolidJS 书签 Hook
 * @param bookInstance 接收 epub.js book 实例的响应式 Getter（如 () => book()）
 */
export function useBookmarks(bookInstance: () => any) {
  const [bookmarks, setBookmarks] = createSignal<Bookmark[]>([]);
  const [loading, setLoading] = createSignal(true);

  // 1. 自动从 book 实例中提取唯一标识作为存储 Key
  const getBookKey = () => {
    const book = bookInstance();
    if (!book) return null;
    return typeof book.key === "function" ? book.key() : book.path || "default_book";
  };

  // 当 book 实例改变时，自动从 localforage 加载对应的书签
  createEffect(async () => {
    const id = getBookKey();
    if (!id) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const stored = await localforage.getItem<Bookmark[]>(`bookmarks_${id}`);
      setBookmarks(stored || []);
    } finally {
      setLoading(false);
    }
  });

  // 2. 精准获取章节标题（支持可选 cfi）
  const getChapterTitle = (cfi?: string): string => {
    const book = bookInstance();
    if (!cfi || !book) return "未命名书签";

    try {
      const spineItem = book.spine.get(cfi);
      if (spineItem && book.navigation?.toc) {
        const matchToc = (items: any[]): string | null => {
          for (const item of items) {
            if (spineItem.href && item.href && spineItem.href.includes(item.href.split('#')[0])) {
              return item.label;
            }
            if (item.subitems && item.subitems.length > 0) {
              const subMatch = matchToc(item.subitems);
              if (subMatch) return subMatch;
            }
          }
          return null;
        };

        const title = matchToc(book.navigation.toc);
        if (title) return title.trim();

        if (spineItem.idref) {
          return `片段: ${spineItem.idref}`;
        }
      }
    } catch (e) {
      console.warn("获取章节标题失败:", e);
    }

    try {
      const percentage = book.locations.percentageFromCfi(cfi);
      if (!isNaN(percentage)) {
        return `阅读进度 ${(percentage * 100).toFixed(1)}%`;
      }
    } catch (e) {}

    return "当前阅读";
  };

  // 3. 判断指定 CFI 是否已加书签
  const isBookmarked = (cfi?: string): boolean => {
    if (!cfi) return false;
    return bookmarks().some((b) => b.cfi === cfi);
  };

  // 4. 添加书签（支持 cfi 为 undefined）
  const addBookmark = async (cfi?: string, customTitle?: string) => {
    const id = getBookKey();
    if (!id || !cfi) return;

    const current = bookmarks();
    if (current.some(b => b.cfi === cfi)) return;

    const newBookmark: Bookmark = {
      cfi,
      title: customTitle || getChapterTitle(cfi),
      createdAt: Date.now(),
    };

    const updated = [newBookmark, ...current];
    setBookmarks(updated);
    await localforage.setItem(`bookmarks_${id}`, updated);
  };

  // 5. 删除书签（支持 cfi 为 undefined）
  const removeBookmark = async (cfi?: string) => {
    const id = getBookKey();
    if (!id || !cfi) return;

    const current = bookmarks();
    const updated = current.filter(b => b.cfi !== cfi);

    setBookmarks(updated);
    await localforage.setItem(`bookmarks_${id}`, updated);
  };

  // 6. 智能切换书签
  const toggleBookmark = async (cfi?: string) => {
    if (!cfi) return;
    if (isBookmarked(cfi)) {
      await removeBookmark(cfi);
    } else {
      await addBookmark(cfi);
    }
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
  };
}