import { useState, useEffect } from 'react';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';
import localforage from 'localforage';

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

const LEAF_FOLDERS_KEY = 'EPUB_LEAF_FOLDERS';
const CACHED_BOOKS_KEY = 'EPUB_CACHED_BOOKS';

const getFolderName = (p: string) => p.split(/[/\\]/).pop() || '未命名文件夹';

export function useLocalBooks() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [books, setBooks] = useState<LocalBook[]>([]);

  useEffect(() => {
    let mounted = true;

    const initData = async () => {
      try {
        const [savedFolders, savedBooks] = await Promise.all([
          localforage.getItem<unknown[]>(LEAF_FOLDERS_KEY),
          localforage.getItem<LocalBook[]>(CACHED_BOOKS_KEY),
        ]);

        if (!mounted) return;

        if (Array.isArray(savedFolders)) {
          const normalized: Folder[] = savedFolders
            .map((item, index) => {
              const rawPath = typeof item === 'string' ? item : (item as any)?.path;
              if (!rawPath) return null;
              const path = String(rawPath);
              return {
                id: typeof (item as any)?.id === 'number' ? (item as any).id : index + 1,
                name: (item as any)?.name || getFolderName(path),
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
        if (!mounted) return;
        setFolders([]);
        setBooks([]);
      }
    };

    void initData();

    return () => {
      mounted = false;
    };
  }, []);

  const saveFolders = async (newFolders: Folder[]) => {
    setFolders(newFolders);
    await localforage.setItem(LEAF_FOLDERS_KEY, newFolders);
    return newFolders;
  };

  const addFolder = async (folderPath?: unknown) => {
    const rawPath = typeof folderPath === 'string'
      ? folderPath
      : await openDialog({ directory: true, multiple: false });

    const path = Array.isArray(rawPath) ? rawPath[0] : rawPath;
    if (typeof path !== 'string' || !path.trim() || folders.some((f) => f.path === path)) return;

    const newFolder: Folder = {
      id: folders.length ? Math.max(...folders.map((f) => f.id)) + 1 : 1,
      name: getFolderName(path),
      path,
    };

    return saveFolders([...folders, newFolder]);
  };

  const delFolder = async (folderIds: number | number[]) => {
    const idsToRemove = new Set(Array.isArray(folderIds) ? folderIds : [folderIds]);
    const newFolders = folders.filter((f) => !idsToRemove.has(f.id));
    
    if (newFolders.length === folders.length) return folders;

    await saveFolders(newFolders);
    setBooks([]);
    await localforage.removeItem(CACHED_BOOKS_KEY);
    return newFolders;
  };

  const selectFolder = async (folderPath: string) => {
    try {
      const entries = await readDir(folderPath);
      const epubBooks: LocalBook[] = entries
        .filter((item) => item.isFile && item.name.toLowerCase().endsWith('.epub'))
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