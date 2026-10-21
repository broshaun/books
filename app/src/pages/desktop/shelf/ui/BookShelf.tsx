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
      class="flex flex-col w-full p-2 box-border transition-colors"
      style={{
        height: heightStyle(),
        "overflow-y": props.height ? "auto" : undefined,
        "background-color": "var(--bg-main)",
        "color": "var(--text-main)",
      }}
    >
      {/* 紧凑的列表容器 */}
      <div class="flex flex-col gap-1.5 w-full">
        <For
          each={props.books || []}
          fallback={
            <div 
              class="text-xs text-center py-8 px-4 select-none"
              style={{ color: "var(--text-secondary)" }}
            >
              书架空空如也，请先选择或添加文件夹
            </div>
          }
        >
          {(book) => (
            <button
              type="button"
              onClick={() => props.onSelectBook?.(book)}
              class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg border text-left cursor-pointer transition-all shadow-xs"
              style={{
                "background-color": "var(--bg-surface)",
                "border-color": "var(--border-color)",
                "color": "var(--text-main)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-button-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
            >
              {/* 紧凑的封面占位或图片 */}
              <Show
                when={book.cover}
                fallback={
                  <div 
                    class="w-8 h-11 rounded flex items-center justify-center shrink-0 border shadow-xs"
                    style={{
                      "background-color": "var(--bg-input)",
                      "border-color": "var(--border-color)",
                      "color": "var(--text-secondary)",
                    }}
                  >
                    <IconBook size={16} stroke="1.5" />
                  </div>
                }
              >
                <img
                  src={book.cover}
                  alt={book.name}
                  class="w-8 h-11 object-cover rounded shrink-0 border shadow-xs"
                  style={{ "border-color": "var(--border-color)" }}
                />
              </Show>

              {/* 书名 */}
              <span 
                class="text-xs font-semibold truncate flex-1"
                style={{ color: "var(--text-title)" }}
              >
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