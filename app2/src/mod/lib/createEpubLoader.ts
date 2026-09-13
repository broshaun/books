import { readFile } from '@tauri-apps/plugin-fs';
import ePub, { type Book } from 'epubjs';

export interface LocalBook {
  name: string;
  path: string;
}

export function createEpubLoader() {
  const openBook = async (bookPath: string): Promise<Book> => {
    const bytes = await readFile(bookPath);
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const book = ePub(buffer);
    await book.opened;
    return book;
  };

  return {
    openBook,

  };
}