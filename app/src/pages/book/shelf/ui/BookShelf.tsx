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
  const heightStyle = () => {
    const h = props.height;
    if (h === undefined) return undefined;
    return typeof h === "number" ? `${h}px` : h;
  };

  return (
    <div
      class="flex flex-col w-full"
      style={{
        height: heightStyle(),
        "overflow-y": props.height ? "auto" : undefined,
      }}
    >
      <For
        each={props.books || []}
        fallback={
          <div class="text-xs text-slate-400 text-center py-12 px-4">
            书架空空如也，请先选择或添加文件夹
          </div>
        }
      >
        {(book) => (
          <button
            type="button"
            onClick={() => props.onSelectBook?.(book)}
            class="flex items-center gap-3 w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors text-left cursor-pointer"
          >
            <Show
              when={book.cover}
              fallback={
                <div class="w-9 h-12 bg-slate-100 dark:bg-zinc-800 rounded flex items-center justify-center text-slate-400 shrink-0">
                  <IconBook size={18} stroke="1.5" />
                </div>
              }
            >
              <img
                src={book.cover}
                alt={book.name}
                class="w-9 h-12 object-cover rounded shrink-0"
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