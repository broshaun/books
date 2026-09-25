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

const LEAF_FOLDERS_KEY = "EPUB_LEAF_FOLDERS";
const CACHED_BOOKS_KEY = "EPUB_CACHED_BOOKS";

const getFolderName = (p: string) => p.split(/[/\\]/).pop() || "未命名文件夹";

export function useLocalBooks() {
  const [folders, setFolders] = createSignal<Folder[]>([]);
  const [books, setBooks] = createSignal<LocalBook[]>([]);

  onMount(() => {
    const initData = async () => {
      try {
        const [savedFolders, savedBooks] = await Promise.all([
          localforage.getItem<unknown[]>(LEAF_FOLDERS_KEY),
          localforage.getItem<LocalBook[]>(CACHED_BOOKS_KEY),
        ]);

        if (Array.isArray(savedFolders)) {
          const normalized: Folder[] = savedFolders
            .map((item, index) => {
              const rawRecord = item as Record<string, unknown> | null;
              const rawPath = typeof item === "string" ? item : rawRecord?.path;
              if (!rawPath) return null;
              const path = String(rawPath);
              return {
                id: typeof rawRecord?.id === "number" ? rawRecord.id : index + 1,
                name: rawRecord?.name ? String(rawRecord.name) : getFolderName(path),
                path,
              };
            })
            .filter((f): f is Folder => f !== null);

          setFolders(normalized);
          await localforage.setItem(LEAF_FOLDERS_KEY, normalized);
        }

        if (Array.isArray(savedBooks)) {
          setBooks(savedBooks);
        }
      } catch {
        setFolders([]);
        setBooks([]);
      }
    };

    void initData();
  });

  const saveFolders = async (newFolders: Folder[]) => {
    setFolders(newFolders);
    await localforage.setItem(LEAF_FOLDERS_KEY, newFolders);
    return newFolders;
  };

  // 🌟 直接接收外部传进来的文件夹路径字符串
  const addFolder = async (folderPath: string) => {
    if (!folderPath || !folderPath.trim()) return;

    const currentFolders = folders();
    if (currentFolders.some((f) => f.path === folderPath)) return;

    const newFolder: Folder = {
      id: currentFolders.length ? Math.max(...currentFolders.map((f) => f.id)) + 1 : 1,
      name: getFolderName(folderPath),
      path: folderPath,
    };

    return saveFolders([...currentFolders, newFolder]);
  };

  const delFolder = async (folderIds: number | number[]) => {
    const idsToRemove = new Set(Array.isArray(folderIds) ? folderIds : [folderIds]);
    const currentFolders = folders();
    const newFolders = currentFolders.filter((f) => !idsToRemove.has(f.id));
    
    if (newFolders.length === currentFolders.length) return currentFolders;

    await saveFolders(newFolders);
    setBooks([]);
    await localforage.removeItem(CACHED_BOOKS_KEY);
    return newFolders;
  };

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

  return { folders, books, addFolder, delFolder, selectFolder };
}