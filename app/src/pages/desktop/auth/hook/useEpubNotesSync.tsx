import { createSignal, onMount, onCleanup } from "solid-js";
import { notesCache } from "@/api/cache/notesCache"; // 根据你的实际路径调整

export interface EpubNotesSyncOptions {
  interval?: number; // 同步间隔，默认 3000ms
  onSyncGet?: () => Promise<any[]> | any[]; // 远程拉取回调
  onSyncSet?: (localNotes: any[]) => Promise<void> | void; // 本地推送回调
}

export function useEpubNotesSync(options: EpubNotesSyncOptions = {}) {
  const { interval = 3000, onSyncGet, onSyncSet } = options;
  const [isSyncing, setIsSyncing] = createSignal(false);

  // 核心同步逻辑
  const syncNow = async () => {
    if (isSyncing()) return;
    setIsSyncing(true);
    try {
      // 1. 如果有配置 onSyncGet，先从远程/API 获取数据
      if (onSyncGet && typeof onSyncGet === "function") {
        const remoteNotes = await onSyncGet();
        if (Array.isArray(remoteNotes) && notesCache.set) {
          await notesCache.set(remoteNotes);
        }
      }

      // 2. 获取本地全部笔记并推送（使用正确的 notesCache.get()）
      const localNotes = (await notesCache.get?.()) || [];
      if (onSyncSet && typeof onSyncSet === "function") {
        await onSyncSet(localNotes);
      }
    } catch (e) {
      console.error("笔记同步失败:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // 定时器挂载与清理
  let timer: number | NodeJS.Timeout;

  onMount(() => {
    if (interval > 0) {
      timer = setInterval(syncNow, interval);
    }
  });

  onCleanup(() => {
    clearInterval(timer);
  });

  return { isSyncing, syncNow };
}

export default useEpubNotesSync;