import { createSignal, onCleanup } from "solid-js";
import localforage from "localforage";

export interface NewNote {
    id?: string;
    bookId: string;
    bookName: string;
    index: number;
    cfiRange: string;
    tags?: string[];
    text: string;
    title?: string;
    color?: string;
    isUnderline?: boolean;
    content?: string;
    created_at?: string;
    updatedAt?: number;
}

const GLOBAL_STORAGE_KEY = "epub_global_notes";

export interface UseEpubNotesSyncOptions {
    interval?: number;                             // 自动定时同步周期（毫秒），设为 0 则不自动定时
    onSyncGet?: () => Promise<NewNote[] | null>;   // 定时从远端拉取数据的回调
    onSyncSet?: (notes: NewNote[]) => Promise<void>; // 定时向远端推送数据的回调
}

export function useEpubNotesSync(options: UseEpubNotesSyncOptions = {}) {
    const { interval = 0, onSyncGet, onSyncSet } = options;
    const [isSyncing, setIsSyncing] = createSignal(false);

    // 内部合并逻辑（按 bookId + cfiRange 联合判定，比对 updatedAt 取最新）
    const mergeNotes = (existingNotes: NewNote[], incomingNotes: NewNote[]): NewNote[] => {
        const noteMap = new Map<string, NewNote>();

        existingNotes.forEach((n) => {
            if (n.bookId && n.cfiRange) {
                noteMap.set(`${n.bookId}::${n.cfiRange}`, n);
            }
        });

        incomingNotes.forEach((incoming) => {
            const bookId = incoming.bookId || "default_book";
            const cfiRange = incoming.cfiRange;
            if (!cfiRange) return;

            const uniqueKey = `${bookId}::${cfiRange}`;
            const normalized: NewNote = {
                ...incoming,
                bookId,
                color: incoming.color || "#fffa65",
                tags: Array.isArray(incoming.tags) ? incoming.tags : [],
                isUnderline: incoming.isUnderline ?? false,
                updatedAt: incoming.updatedAt || Date.now(),
            };

            const existing = noteMap.get(uniqueKey);
            if (!existing || (normalized.updatedAt || 0) >= (existing.updatedAt || 0)) {
                noteMap.set(uniqueKey, normalized);
            }
        });

        return Array.from(noteMap.values());
    };

    // 执行完整的同步流程（读本地 ➔ 远端拉取合并 ➔ 存本地 ➔ 远端推送）
    const syncNow = async () => {
        if (isSyncing()) return;
        setIsSyncing(true);
        try {
            // 1. 读取本地笔记
            const saved = await localforage.getItem<NewNote[]>(GLOBAL_STORAGE_KEY);
            let currentNotes = Array.isArray(saved) ? saved : [];

            // 2. 如果有远端获取回调，独立捕获异常
            if (onSyncGet) {
                try {
                    const remoteNotes = await onSyncGet();
                    if (Array.isArray(remoteNotes) && remoteNotes.length > 0) {
                        currentNotes = mergeNotes(currentNotes, remoteNotes);
                        await localforage.setItem(GLOBAL_STORAGE_KEY, currentNotes);
                    }
                } catch (getErr) {
                    console.error("[Sync] onSyncGet error (Check your fetch URL or network):", getErr);
                }
            }

            // 3. 如果有远端推送回调，独立捕获异常
            if (onSyncSet) {
                try {
                    await onSyncSet(currentNotes);
                } catch (setErr) {
                    console.error("[Sync] onSyncSet error (Check your request builder/payload):", setErr);
                }
            }
        } catch (err) {
            console.error("Sync process global error:", err);
        } finally {
            setIsSyncing(false);
        }
    };

    // 自动定时执行同步
    if (interval > 0) {
        const timer = setInterval(() => {
            void syncNow();
        }, interval);

        onCleanup(() => {
            clearInterval(timer);
        });
    }

    return {
        isSyncing,
        syncNow,
    };
}