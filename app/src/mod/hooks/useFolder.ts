import { createSignal, onMount } from "solid-js";
import { readDir } from "@tauri-apps/plugin-fs";
import { documentDir, homeDir } from "@tauri-apps/api/path";

export interface DirEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
}

export function useFolder() {
  const [path, setPath] = createSignal("");
  const [entries, setEntries] = createSignal<DirEntry[]>([]);

  const dir = () => entries();

  const open = async (targetPath: string) => {
    try {
      const res = (await readDir(targetPath)) as DirEntry[];
      setEntries(res.filter(e => e.isDirectory && !e.name.startsWith(".")));
      setPath(targetPath);
    } catch (e) {
      console.error(`打开目录失败: ${targetPath}`, e);
    }
  };

  onMount(async () => {
    try {
      await open((await documentDir()) || (await homeDir()));
    } catch (e) {
      console.error("初始化默认路径失败", e);
    }
  });

  return { path, open, dir };
}