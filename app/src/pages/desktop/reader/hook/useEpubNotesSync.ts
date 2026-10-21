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
const LAST_SYNC_TIME_KEY = "epub_last_synced_at"; // 用于记录上一次同步的时间戳

export interface UseEpubNotesSyncOptions {
    interval?: number;                             
    onSyncGet?: () => Promise<NewNote[] | null>;   
    onSyncSet?: (updatedNotes: NewNote[]) => Promise<void>; // 此时传入的是最新时间戳更新的数据
}

export function useEpubNotesSync(options: UseEpubNotesSyncOptions = {}) {
    const { interval = 0, onSyncGet, onSyncSet } = options;
    const [isSyncing, setIsSyncing] = createSignal(false);

    // 内部合并逻辑
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

    const syncNow = async () => {
        if (isSyncing()) return;
        setIsSyncing(true);

        try {
            // 记录本次开始同步的时间点
            const syncStartTime = Date.now();

            // 获取上一次成功同步的时间戳（如果没有，默认为 0，表示全量）
            const lastSyncedAt = (await localforage.getItem<number>(LAST_SYNC_TIME_KEY)) || 0;

            // 1. 读取本地笔记
            const saved = await localforage.getItem<NewNote[]>(GLOBAL_STORAGE_KEY);
            let currentNotes = Array.isArray(saved) ? saved : [];

            // 2. 远端拉取与合并
            if (onSyncGet) {
                try {
                    const remoteNotes = await onSyncGet();
                    if (Array.isArray(remoteNotes) && remoteNotes.length > 0) {
                        currentNotes = mergeNotes(currentNotes, remoteNotes);
                        await localforage.setItem(GLOBAL_STORAGE_KEY, currentNotes);
                    }
                } catch (getErr) {
                    console.error("[Sync] onSyncGet error:", getErr);
                }
            }

            // 3. 筛选出“最新时间戳更新的数据”（updatedAt 大于上次同步时间）
            const changedNotes = currentNotes.filter(
                (note) => (note.updatedAt || 0) > lastSyncedAt
            );

            // 4. 只有当有真正变动的数据时，才调用 onSyncSet 推送给远端
            if (onSyncSet && changedNotes.length > 0) {
                try {
                    await onSyncSet(changedNotes);
                    // 推送成功后，更新本地记录的上次同步时间戳
                    await localforage.setItem(LAST_SYNC_TIME_KEY, syncStartTime);
                } catch (setErr) {
                    console.error("[Sync] onSyncSet error:", setErr);
                }
            }
        } catch (err) {
            console.error("Sync process global error:", err);
        } finally {
            setIsSyncing(false);
        }
    };

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