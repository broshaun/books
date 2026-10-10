import { createSignal, onMount } from "solid-js";
import { readFile } from "@tauri-apps/plugin-fs";
import localforage from "localforage";

localforage.setDriver(localforage.INDEXEDDB);

export interface Tag { id: number; name: string }
export interface LocalBook { name: string; path: string; tagName?: string | null }

const TAGS_KEY = "EPUB_SAVED_TAGS";
const BOOKS_KEY = "EPUB_CACHED_BOOKS";

export function useLocalBooks() {
  const [tags, setTags] = createSignal<Tag[]>([]);
  const [books, setBooks] = createSignal<LocalBook[]>([]);

  // 🏷️ 添加标签
  const addTag = async (name: string) => {
    const trimmed = name?.trim();
    if (!trimmed || tags().some((t) => t.name === trimmed)) return;
    
    const updated = [...tags(), { id: Date.now(), name: trimmed }];
    setTags(updated);
    await localforage.setItem(TAGS_KEY, updated);
  };

  // 🗑️ 删除标签（同步清理该分组下的所有书籍及二进制缓存）
  const delTag = async (name: string) => {
    try {
      const updatedTags = tags().filter((t) => t.name !== name);
      setTags(updatedTags);
      await localforage.setItem(TAGS_KEY, updatedTags);

      const allBooks = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
      const targetBooks = allBooks.filter((b) => b.tagName === name);

      // 并行清理二进制缓存
      await Promise.all(targetBooks.map((b) => localforage.removeItem(`BOOK_CACHE_${b.name}`)));

      const updatedBooks = allBooks.filter((b) => b.tagName !== name);
      setBooks(updatedBooks);
      await localforage.setItem(BOOKS_KEY, updatedBooks);
    } catch (e) {
      console.error(`删除标签失败: ${name}`, e);
    }
  };

  // 📖 过滤标签
  const selectTag = async (tagName?: string | null) => {
    const all = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
    const filtered = tagName ? all.filter((b) => b.tagName === tagName) : all;
    setBooks(filtered);
    return filtered;
  };

  // 📥 导入 EPUB 文件
  const addEpub = async (filePath: string, tagName?: string | null) => {
    const path = filePath?.trim();
    if (!path) return;
    try {
      const buffer = await readFile(path);
      const name = path.split(/[/\\]/).pop() || "未知图书.epub";

      await localforage.setItem(`BOOK_CACHE_${name}`, buffer);

      const allBooks = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
      if (!allBooks.some((b) => b.name === name)) {
        const updated = [...allBooks, { name, path, tagName: tagName || null }];
        await localforage.setItem(BOOKS_KEY, updated);
        setBooks(updated);
      }
    } catch (e) {
      console.error(`导入文件失败: ${filePath}`, e);
    }
  };

  // 🗑️ 删除 EPUB 书籍
  const delEpub = async (bookName: string) => {
    if (!bookName?.trim()) return;
    try {
      await localforage.removeItem(`BOOK_CACHE_${bookName}`);
      const allBooks = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
      const updated = allBooks.filter((b) => b.name !== bookName);
      await localforage.setItem(BOOKS_KEY, updated);
      setBooks(updated);
    } catch (e) {
      console.error(`删除书籍失败: ${bookName}`, e);
    }
  };

  // 🌟 修改书籍信息（更新分组）
  const updEpub = async (bookName: string, tagName: string | null) => {
    if (!bookName?.trim()) return;
    try {
      const allBooks = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
      const updated = allBooks.map((b) => (b.name === bookName ? { ...b, tagName } : b));
      await localforage.setItem(BOOKS_KEY, updated);
      setBooks(updated);
    } catch (e) {
      console.error(`更新书籍分组失败: ${bookName}`, e);
    }
  };

  // 初始化加载缓存
  onMount(async () => {
    try {
      const [savedTags, savedBooks] = await Promise.all([
        localforage.getItem<Tag[]>(TAGS_KEY),
        localforage.getItem<LocalBook[]>(BOOKS_KEY),
      ]);
      if (Array.isArray(savedTags)) setTags(savedTags);
      if (Array.isArray(savedBooks)) setBooks(savedBooks);
    } catch (e) {
      console.error("初始化本地数据失败", e);
    }
  });

  return { tags, books, addEpub, addTag, delTag, selectTag, delEpub, updEpub };
}