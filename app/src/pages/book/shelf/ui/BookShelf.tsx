import { For, Show } from "solid-js";
import { IconBook } from "@tabler/icons-solidjs";

export interface BookItem {
  name: string;
  path: string;
  cover?: string;
}

export interface BookShelfProps {
  books?: BookItem[];
  height?: string | number;
  onSelectBook?: (book: BookItem) => void;
}

export default function BookShelf(props: BookShelfProps) {
  const booksList = () => props.books || [];

  return (
    <div
      class="flex flex-col gap-2 p-4"
      style={{
        height: typeof props.height === "number" ? `${props.height}px` : props.height,
        "overflow-y": props.height ? "auto" : undefined,
      }}
    >
      <For
        each={booksList()}
        fallback={
          <div class="text-sm text-slate-400 text-center py-12">
            书架空空如也，请先选择或添加文件夹
          </div>
        }
      >
        {(book) => (
          <button
            type="button"
            onClick={() => props.onSelectBook?.(book)}
            class="flex items-center gap-4 w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors shadow-2xs text-left cursor-pointer"
          >
            <Show
              when={book.cover}
              fallback={
                <div class="w-10 h-14 bg-slate-100 dark:bg-zinc-800 rounded flex items-center justify-center text-slate-400 shrink-0">
                  <IconBook size={20} stroke="1.5" />
                </div>
              }
            >
              <img
                src={book.cover}
                alt={book.name}
                class="w-10 h-14 object-cover rounded shrink-0"
              />
            </Show>

            <span class="text-sm font-medium truncate flex-1 text-slate-800 dark:text-slate-100">
              {book.name}
            </span>
          </button>
        )}
      </For>
    </div>
  );
}