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

  // 🌟 修改分组名（同步更新标签列表以及关联书籍的 tagName）
  const updateTag = async (oldName: string, newName: string) => {
    const trimmedOld = oldName?.trim();
    const trimmedNew = newName?.trim();
    if (!trimmedOld || !trimmedNew || trimmedOld === trimmedNew) return;

    // 检查新名称是否已存在
    if (tags().some((t) => t.name === trimmedNew)) return;

    try {
      // 1. 更新标签列表中的名称
      const updatedTags = tags().map((t) => (t.name === trimmedOld ? { ...t, name: trimmedNew } : t));
      setTags(updatedTags);
      await localforage.setItem(TAGS_KEY, updatedTags);

      // 2. 获取所有书籍，同步更新属于该分组的书籍的 tagName
      const allBooks = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
      const updatedBooks = allBooks.map((b) => (b.tagName === trimmedOld ? { ...b, tagName: trimmedNew } : b));
      setBooks(updatedBooks);
      await localforage.setItem(BOOKS_KEY, updatedBooks);
    } catch (e) {
      console.error(`修改分组名失败: ${trimmedOld} -> ${trimmedNew}`, e);
    }
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

      // 🌟 1. 对传入的 URI 路径进行 URL 解码（把 %3A 转成 : 等）
      const decodedPath = decodeURIComponent(path);

      // 🌟 2. 智能提取真正的文件名：
      // 无论是 Windows/Linux 的反斜杠，还是 Android 的 content:// 路径、URL 路径，
      // 我们通过正则或 split 取出最后一段，并且把可能存在的多余查询参数（如 ? 后面带的）过滤掉
      const rawName = decodedPath.split(/[/\\]/).pop() || "未知图书.epub";
      const name = rawName.split("?")[0].trim() || "未知图书.epub";

      await localforage.setItem(`BOOK_CACHE_${name}`, buffer);

      const allBooks = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
      if (!allBooks.some((b) => b.name === name)) {
        const updated = [...allBooks, { name, path: decodedPath, tagName: tagName || null }];
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

  return { tags, books, addEpub, addTag, updateTag, delTag, selectTag, delEpub, updEpub };
}