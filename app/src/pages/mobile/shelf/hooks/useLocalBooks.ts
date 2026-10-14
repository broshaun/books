import { createSignal, onMount } from "solid-js";
import { readFile, writeFile, mkdir, exists } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import localforage from "localforage";

localforage.setDriver(localforage.INDEXEDDB);

export interface FolderItem {
  id: number;
  name: string;
}

export interface LocalBook {
  name: string;
  path: string;
  folder?: string | null;
}

const FOLDERS_KEY = "EPUB_FOLDERS";
const BOOKS_KEY = "EPUB_BOOKS";

export function useLocalBooks() {
  const [folders, setFolders] = createSignal<FolderItem[]>([]);
  const [books, setBooks] = createSignal<LocalBook[]>([]);

  // 📁 在软件数据目录下添加文件夹
  const addFolder = async (name: string) => {
    const trimmed = name?.trim();
    if (!trimmed || folders().some((f) => f.name === trimmed)) return;
    const updated = [...folders(), { id: Date.now(), name: trimmed }];
    setFolders(updated);
    await localforage.setItem(FOLDERS_KEY, updated);
  };

  const updFolder = async (oldName: string, newName: string) => {
    const tOld = oldName?.trim();
    const tNew = newName?.trim();
    if (!tOld || !tNew || tOld === tNew || folders().some((f) => f.name === tNew)) return;

    const updatedFolders = folders().map((f) => (f.name === tOld ? { ...f, name: tNew } : f));
    setFolders(updatedFolders);
    await localforage.setItem(FOLDERS_KEY, updatedFolders);

    const allBooks = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
    const updatedBooks = allBooks.map((b) => (b.folder === tOld ? { ...b, folder: tNew } : b));
    setBooks(updatedBooks);
    await localforage.setItem(BOOKS_KEY, updatedBooks);
  };

  const delFolder = async (name: string) => {
    const updatedFolders = folders().filter((f) => f.name !== name);
    setFolders(updatedFolders);
    await localforage.setItem(FOLDERS_KEY, updatedFolders);

    const allBooks = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
    const targetBooks = allBooks.filter((b) => b.folder === name);
    await Promise.all(targetBooks.map((b) => localforage.removeItem(`BOOK_${b.name}`)));

    const updatedBooks = allBooks.filter((b) => b.folder !== name);
    setBooks(updatedBooks);
    await localforage.setItem(BOOKS_KEY, updatedBooks);
  };

  const selectFolder = async (folderName?: string | null) => {
    const all = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
    const filtered = folderName ? all.filter((b) => b.folder === folderName) : all;
    setBooks(filtered);
    return filtered;
  };

  // 📥 将外部文件物理复制到软件数据目录下的指定 folders 子目录中
  const addEpub = async (filePath: string, targetFolder?: string | null) => {
    const rawPath = filePath?.trim();
    if (!rawPath) return;

    const baseDir = await appDataDir();
    const destDir = targetFolder ? await join(baseDir, targetFolder) : baseDir;

    if (!(await exists(destDir))) {
      await mkdir(destDir, { recursive: true });
    }

    const name = decodeURIComponent(rawPath).split(/[/\\]/).pop()?.split("?")[0].trim() || "未命名.epub";
    const destPath = await join(destDir, name);

    const buffer = await readFile(rawPath);
    await writeFile(destPath, buffer);
    await localforage.setItem(`BOOK_${name}`, buffer);

    const allBooks = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
    if (!allBooks.some((b) => b.name === name)) {
      const updated = [...allBooks, { name, path: destPath, folder: targetFolder || null }];
      await localforage.setItem(BOOKS_KEY, updated);
      setBooks(updated);
    }
  };

  const delEpub = async (bookName: string) => {
    if (!bookName?.trim()) return;
    await localforage.removeItem(`BOOK_${bookName}`);
    const allBooks = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
    const updated = allBooks.filter((b) => b.name !== bookName);
    await localforage.setItem(BOOKS_KEY, updated);
    setBooks(updated);
  };

  const updEpub = async (bookName: string, folderName: string | null) => {
    if (!bookName?.trim()) return;
    const allBooks = (await localforage.getItem<LocalBook[]>(BOOKS_KEY)) || [];
    const updated = allBooks.map((b) => (b.name === bookName ? { ...b, folder: folderName } : b));
    await localforage.setItem(BOOKS_KEY, updated);
    setBooks(updated);
  };

  onMount(async () => {
    const [savedFolders, savedBooks] = await Promise.all([
      localforage.getItem<FolderItem[]>(FOLDERS_KEY),
      localforage.getItem<LocalBook[]>(BOOKS_KEY),
    ]);
    if (Array.isArray(savedFolders)) setFolders(savedFolders);
    if (Array.isArray(savedBooks)) setBooks(savedBooks);
  });

  return {
    folders,
    books,
    selectFolder,
    addFolder,
    updFolder,
    delFolder,
    addEpub,
    delEpub,
    updEpub,
  };
}