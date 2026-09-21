import localforage from "localforage";

export interface NewNote {
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
    updatedAt?: number;
}

const GLOBAL_STORAGE_KEY = "epub_global_notes";

/**
 * 获取笔记
 * @param bookId 可选。传入则只获取该书的笔记，不传则获取所有书籍的全局笔记
 */
async function getNotes(bookId?: string): Promise<NewNote[]> {
    const saved = await localforage.getItem<NewNote[]>(GLOBAL_STORAGE_KEY);
    const allNotes = Array.isArray(saved) ? saved : [];

    if (!bookId) return allNotes;
    return allNotes.filter((n) => n.bookId === bookId);
}

/**
 * 设置/保存笔记（使用 bookId + cfiRange 联合判定唯一值，按 updatedAt 取最新合并）
 * @param incomingNotes 要写入或更新的笔记列表
 * @returns 返回合并并持久化后的全局所有笔记列表
 */
async function setNotes(incomingNotes: NewNote[]): Promise<NewNote[]> {
    if (!Array.isArray(incomingNotes) || incomingNotes.length === 0) {
        const saved = await localforage.getItem<NewNote[]>(GLOBAL_STORAGE_KEY);
        return Array.isArray(saved) ? saved : [];
    }

    const saved = await localforage.getItem<NewNote[]>(GLOBAL_STORAGE_KEY);
    const allNotes = Array.isArray(saved) ? saved : [];

    // 使用 Map 存储所有笔记，以 bookId + cfiRange 作为唯一复合键
    const noteMap = new Map<string, NewNote>();

    // 1. 先将已有的全局笔记加载到 Map 中
    allNotes.forEach((n) => {
        if (n.bookId && n.cfiRange) {
            const uniqueKey = `${n.bookId}::${n.cfiRange}`;
            noteMap.set(uniqueKey, n);
        }
    });

    // 2. 处理传入的笔记，严格按 bookId + cfiRange 判定唯一值，对比 updatedAt 取最新
    incomingNotes.forEach((incoming) => {
        const bookId = incoming.bookId || "default_book";
        const cfiRange = incoming.cfiRange;
        if (!cfiRange) return;

        const uniqueKey = `${bookId}::${cfiRange}`;
        const normalizedIncoming: NewNote = {
            ...incoming,
            bookId,
            color: incoming.color || "#fffa65",
            tags: Array.isArray(incoming.tags) ? incoming.tags : [],
            isUnderline: incoming.isUnderline ?? false,
            updatedAt: incoming.updatedAt || Date.now(),
        };

        const existing = noteMap.get(uniqueKey);

        if (!existing) {
            // 如果不存在，直接存入
            noteMap.set(uniqueKey, normalizedIncoming);
        } else {
            // 如果存在，对比 updatedAt，取最新的一条
            const existingTime = existing.updatedAt || 0;
            const incomingTime = normalizedIncoming.updatedAt || 0;

            if (incomingTime >= existingTime) {
                noteMap.set(uniqueKey, normalizedIncoming);
            }
        }
    });

    // 3. 转回数组并持久化
    const finalAllNotes = Array.from(noteMap.values());
    await localforage.setItem(GLOBAL_STORAGE_KEY, finalAllNotes);
    return finalAllNotes;
}

export const epubNotesStorage = { getNotes, setNotes };