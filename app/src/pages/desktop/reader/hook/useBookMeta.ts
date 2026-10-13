import { createResource } from "solid-js";
import { readFile } from "@tauri-apps/plugin-fs";
import ePub from "epubjs";

export interface BookMeta {
  title: string;
  creator: string;
  publisher?: string;
  description?: string;
  language?: string;
  identifier?: string;
  coverUrl?: string | null;
  bookId: string;
}

export function useBookMeta(bookPath: string | (() => string | undefined)) {
  const getPath = typeof bookPath === "function" ? bookPath : () => bookPath;

  const [resource, { refetch }] = createResource(getPath, async (path) => {
    if (!path) return null;

    // 🌟 1. 使用 Tauri 的 readFile 读取二进制并用 await book.opened 打开
    const bytes = await readFile(path);
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const book = ePub(buffer);
    await book.opened;

    // 🌟 2. 正常获取元数据和封面
    const metadata = (book.loaded.metadata || {}) as Record<string, any>;
    const coverUrl = await book.coverUrl().catch(() => null);

    // 🌟 3. 规范化生成 bookId
    const rawId = metadata.identifier || `${metadata.title || "unknown"}_${metadata.creator || "unknown"}`;
    const bookId = String(rawId).replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, "_").substring(0, 64);

    return {
      book,
      meta: {
        title: metadata.title || "未知书名",
        creator: metadata.creator || "未知作者",
        publisher: metadata.publisher,
        description: metadata.description,
        language: metadata.language,
        identifier: metadata.identifier,
        coverUrl,
        bookId,
      } as BookMeta,
    };
  });

  return {
    book: () => resource()?.book ?? null,
    meta: () => resource()?.meta ?? null,
    loading: resource.loading,
    error: resource.error,
    refetch,
  };
}