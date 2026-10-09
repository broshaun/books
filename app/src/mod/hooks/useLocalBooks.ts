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

const BASE_DIR_KEY = "EPUB_BASE_DIR";
const CACHED_BOOKS_KEY = "EPUB_CACHED_BOOKS";

export function useLocalBooks() {
  const [baseDir, setBaseDir] = createSignal<string>("");
  const [folders, setFolders] = createSignal<Folder[]>([]);
  const [books, setBooks] = createSignal<LocalBook[]>([]);

  // 根据基础目录扫描其下的子目录作为 folders
  const scanSubFolders = async (dirPath: string) => {
    try {
      const entries = await readDir(dirPath);
      // 仅保留未隐藏的目录作为 folders
      const subFolders: Folder[] = entries
        .filter((e) => e.isDirectory && !e.name.startsWith("."))
        .map((e, index) => ({
          id: index + 1,
          name: e.name,
          path: `${dirPath}/${e.name}`, // 注意：跨平台路径拼接可按需调整或使用 @tauri-apps/api/path 的 join
        }));

      setFolders(subFolders);
      setBaseDir(dirPath);
      await localforage.setItem(BASE_DIR_KEY, dirPath);
      return subFolders;
    } catch (e) {
      console.error(`扫描基础目录失败: ${dirPath}`, e);
      setFolders([]);
      return [];
    }
  };

  // 初始化加载缓存的基础目录及子文件夹
  onMount(() => {
    const init = async () => {
      try {
        const [savedBaseDir, savedBooks] = await Promise.all([
          localforage.getItem<string>(BASE_DIR_KEY),
          localforage.getItem<LocalBook[]>(CACHED_BOOKS_KEY),
        ]);

        if (savedBaseDir) {
          await scanSubFolders(savedBaseDir);
        }
        if (Array.isArray(savedBooks)) {
          setBooks(savedBooks);
        }
      } catch (e) {
        console.error("初始化本地数据失败", e);
      }
    };

    void init();
  });

  // 设置基础目录并刷新子文件夹列表
  const setBaseFolder = async (folderPath: string) => {
    if (!folderPath || !folderPath.trim()) return;
    setBooks([]);
    await localforage.removeItem(CACHED_BOOKS_KEY);
    return await scanSubFolders(folderPath);
  };

  // 点击选中子目录，扫描其中的 epub 文件
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

  return { 
    baseDir, 
    folders, 
    books, 
    setBaseFolder, 
    selectFolder 
  };
}