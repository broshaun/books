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

export function BookShelf(props: BookShelfProps) {
  const heightStyle = () => {
    const h = props.height;
    if (h === undefined) return undefined;
    return typeof h === "number" ? `${h}px` : h;
  };

  return (
    <div
      class="flex flex-col w-full bg-zinc-900 text-zinc-100 p-2 box-border"
      style={{
        height: heightStyle(),
        "overflow-y": props.height ? "auto" : undefined,
      }}
    >
      {/* 紧凑的列表容器 */}
      <div class="flex flex-col gap-1.5 w-full">
        <For
          each={props.books || []}
          fallback={
            <div class="text-xs text-zinc-400 text-center py-8 px-4 select-none">
              书架空空如也，请先选择或添加文件夹
            </div>
          }
        >
          {(book) => (
            <button
              type="button"
              onClick={() => props.onSelectBook?.(book)}
              class="flex items-center gap-2.5 w-full px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700 text-left cursor-pointer shadow-2xs"
            >
              {/* 紧凑的封面占位或图片 */}
              <Show
                when={book.cover}
                fallback={
                  <div class="w-8 h-11 bg-zinc-700 rounded flex items-center justify-center text-zinc-200 shrink-0 border border-zinc-600">
                    <IconBook size={16} stroke="1.5" />
                  </div>
                }
              >
                <img
                  src={book.cover}
                  alt={book.name}
                  class="w-8 h-11 object-cover rounded shrink-0 border border-zinc-600 shadow-2xs"
                />
              </Show>

              {/* 书名 */}
              <span class="text-xs font-medium truncate flex-1 text-zinc-100">
                {book.name}
              </span>
            </button>
          )}
        </For>
      </div>
    </div>
  );
}

export default BookShelf;