import { createSignal, onMount } from "solid-js";
import { readDir } from "@tauri-apps/plugin-fs";
import localforage from "localforage";

localforage.setDriver(localforage.INDEXEDDB);

export interface Folder {
  id: number;
  name: string;
  path: string;
}

export interface LocalBook {
  name: string;
  path: string;
}

const SAVED_FOLDERS_KEY = "EPUB_SAVED_FOLDERS";
const CACHED_BOOKS_KEY = "EPUB_CACHED_BOOKS";

export function useLocalBooks() {
  const [folders, setFolders] = createSignal<Folder[]>([]);
  const [books, setBooks] = createSignal<LocalBook[]>([]);

  // 📂 添加目录：将新目录合并到现有的 folders 列表中
  const addFolder = async (folderPath: string) => {
    if (!folderPath?.trim()) return;
    try {
      const currentFolders = folders();
      // 如果已经存在该路径，则直接返回
      if (currentFolders.some((f) => f.path === folderPath)) return currentFolders;

      // 从路径中提取目录名作为展示名
      const name = folderPath.split(/[/\\]/).pop() || folderPath;
      const newFolder: Folder = {
        id: Date.now(), // 用时间戳保证唯一 ID
        name,
        path: folderPath,
      };

      const updatedFolders = [...currentFolders, newFolder];
      setFolders(updatedFolders);
      await localforage.setItem(SAVED_FOLDERS_KEY, updatedFolders);
      return updatedFolders;
    } catch (e) {
      console.error(`添加目录失败: ${folderPath}`, e);
      return folders();
    }
  };

  // 🗑️ 删除指定路径的目录
  const delFolder = async (folderPath: string) => {
    try {
      const updatedFolders = folders().filter((f) => f.path !== folderPath);
      setFolders(updatedFolders);
      await localforage.setItem(SAVED_FOLDERS_KEY, updatedFolders);

      // 如果当前展示的书籍属于被删除的目录，可以顺便清空
      setBooks([]);
      await localforage.removeItem(CACHED_BOOKS_KEY);
      
      console.log(`已成功删除目录: ${folderPath}`);
    } catch (e) {
      console.error(`删除目录失败: ${folderPath}`, e);
    }
  };

  // 📖 扫描选中子目录中的 epub 文件
  const selectFolder = async (folderPath: string) => {
    try {
      const entries = await readDir(folderPath);
      const epubBooks: LocalBook[] = entries
        .filter((item) => item.isFile && item.name.toLowerCase().endsWith(".epub"))
        .map((item) => ({ name: item.name, path: `${folderPath}/${item.name}` }));

      setBooks(epubBooks);
      await localforage.setItem(CACHED_BOOKS_KEY, epubBooks);
      return epubBooks;
    } catch {
      setBooks([]);
      await localforage.removeItem(CACHED_BOOKS_KEY);
      return [];
    }
  };

  // 初始化加载本地缓存的目录与书籍
  onMount(async () => {
    try {
      const [savedFolders, savedBooks] = await Promise.all([
        localforage.getItem<Folder[]>(SAVED_FOLDERS_KEY),
        localforage.getItem<LocalBook[]>(CACHED_BOOKS_KEY),
      ]);

      if (Array.isArray(savedFolders)) setFolders(savedFolders);
      if (Array.isArray(savedBooks)) setBooks(savedBooks);
    } catch (e) {
      console.error("初始化本地数据失败", e);
    }
  });

  return { 
    folders, 
    books, 
    addFolder,
    delFolder,
    selectFolder 
  };
}