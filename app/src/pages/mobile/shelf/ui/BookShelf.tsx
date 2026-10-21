import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { IconBook, IconDotsVertical, IconTrash, IconFolder, IconX } from "@tabler/icons-solidjs";
import Dialog from "corvu/dialog";

export interface Tag {
  id: number;
  name: string;
}

export interface BookItem {
  name: string;
  path: string;
  cover?: string;
  tagName?: string | null;
}

export interface BookShelfProps {
  books?: BookItem[];
  tags?: Tag[];
  height?: string | number;
  onSelectBook?: (book: BookItem) => void;
  onDelEpub?: (bookName: string) => void;
  onUpdEpub?: (bookName: string, tagName: string | null) => void;
}

export function BookShelf(props: BookShelfProps) {
  const [activeMenuBook, setActiveMenuBook] = createSignal<string | null>(null);
  const [choosingBook, setChoosingBook] = createSignal<BookItem | null>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest(".book-menu-container")) {
      setActiveMenuBook(null);
    }
  };

  onMount(() => document.addEventListener("click", handleClickOutside));
  onCleanup(() => document.removeEventListener("click", handleClickOutside));

  const heightStyle = () => {
    const h = props.height;
    return h === undefined ? undefined : typeof h === "number" ? `${h}px` : h;
  };

  return (
    <div
      class="flex flex-col w-full p-2 box-border select-none outline-none transition-colors duration-300"
      style={{
        "height": heightStyle(),
        "overflow-y": props.height ? "auto" : undefined,
        "background-color": "var(--bg-main)",
        "color": "var(--text-main)",
      }}
    >
      <div class="flex flex-col gap-1.5 w-full pt-0.5">
        <For
          each={props.books || []}
          fallback={
            <div class="text-xs opacity-60 text-center py-8 px-4 select-none" style={{ color: "var(--text-secondary)" }}>
              书架空空如也，请先添加或选择书籍
            </div>
          }
        >
          {(book) => {
            const isMenuOpen = () => activeMenuBook() === book.name;

            return (
              <div 
                class="relative flex items-center w-full rounded-lg border transition-all duration-300 group/book"
                style={{
                  "background-color": "var(--bg-surface)",
                  "border-color": "var(--border-color)",
                  "box-shadow": "var(--shadow-sm)",
                }}
              >
                {/* 书籍点击打开 */}
                <button
                  type="button"
                  onClick={() => props.onSelectBook?.(book)}
                  class="flex items-center gap-2.5 flex-1 px-3 py-2 text-left cursor-pointer outline-none bg-transparent border-none overflow-hidden"
                  style={{ color: "inherit" }}
                >
                  <Show
                    when={book.cover}
                    fallback={
                      <div 
                        class="w-8 h-11 rounded flex items-center justify-center shrink-0 border"
                        style={{ "background-color": "var(--bg-main)", "border-color": "var(--border-color)" }}
                      >
                        <IconBook size={16} stroke="1.5" style={{ color: "var(--icon-color)" }} />
                      </div>
                    }
                  >
                    <img src={book.cover} alt={book.name} class="w-8 h-11 object-cover rounded shrink-0 border" style={{ "border-color": "var(--border-color)" }} />
                  </Show>
                  <span class="text-xs font-medium truncate flex-1" style={{ color: "var(--text-main)" }}>
                    {book.name}
                  </span>
                </button>

                {/* 右侧更多操作菜单 */}
                <div class="relative book-menu-container pr-1">
                  <button
                    type="button"
                    title="更多操作"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuBook(isMenuOpen() ? null : book.name);
                    }}
                    class="p-2 bg-transparent border-none cursor-pointer shrink-0 outline-none opacity-70 hover:opacity-100 transition-opacity rounded-md"
                    style={{ color: "var(--icon-color)" }}
                  >
                    <IconDotsVertical size={16} />
                  </button>

                  <Show when={isMenuOpen()}>
                    <div 
                      class="absolute right-0 top-full mt-1 w-32 rounded-lg z-50 p-1 flex flex-col gap-0.5 select-none border"
                      style={{
                        "background-color": "var(--bg-surface)",
                        "border-color": "var(--border-color)",
                        "box-shadow": "var(--shadow-lg)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuBook(null);
                          setChoosingBook(book);
                        }}
                        class="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded transition-colors text-left cursor-pointer border-none bg-transparent outline-none hover:bg-[var(--bg-hover)]"
                        style={{ color: "var(--text-main)" }}
                      >
                        <IconFolder size={14} style={{ color: "var(--icon-color)" }} />
                        <span>切换分组</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuBook(null);
                          props.onDelEpub?.(book.name);
                        }}
                        class="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors text-left cursor-pointer border-none bg-transparent outline-none"
                      >
                        <IconTrash size={14} />
                        <span>删除书籍</span>
                      </button>
                    </div>
                  </Show>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      {/* 切换分组弹窗 */}
      <Dialog open={!!choosingBook()} onOpenChange={(open) => !open && setChoosingBook(null)}>
        <Dialog.Portal>
          <Dialog.Overlay class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity" />
          <Dialog.Content 
            class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[300px] rounded-xl p-4 flex flex-col gap-3 z-50 outline-none border"
            style={{
              "background-color": "var(--bg-surface)",
              "color": "var(--text-main)",
              "border-color": "var(--border-color)",
              "box-shadow": "var(--shadow-lg)",
            }}
          >
            <div class="flex justify-between items-center px-1">
              <span class="font-semibold text-sm" style={{ color: "var(--text-main)" }}>选择目标分组</span>
              <Dialog.Close class="bg-transparent border-none cursor-pointer opacity-70 hover:opacity-100 p-1 outline-none rounded" style={{ color: "var(--icon-color)" }}>
                <IconX size={18} />
              </Dialog.Close>
            </div>

            <div class="max-h-[220px] overflow-auto space-y-1 my-1 pr-1">
              <For
                each={props.tags || []}
                fallback={<div class="text-xs opacity-50 text-center py-4" style={{ color: "var(--text-secondary)" }}>暂无可选分组</div>}
              >
                {(tag) => {
                  const isSelected = () => choosingBook()?.tagName === tag.name;
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        const book = choosingBook();
                        if (book) {
                          props.onUpdEpub?.(book.name, tag.name);
                          setChoosingBook(null);
                        }
                      }}
                      class={`w-full px-3 py-2 text-xs rounded-lg text-left cursor-pointer border outline-none truncate transition-colors ${
                        isSelected()
                          ? "font-medium"
                          : "opacity-80 hover:opacity-100 hover:bg-[var(--bg-hover)]"
                      }`}
                      style={{
                        "background-color": isSelected() ? "var(--bg-hover)" : "transparent",
                        "border-color": isSelected() ? "var(--accent-color)" : "var(--border-color)",
                        "color": "var(--text-main)",
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                }}
              </For>
            </div>

            <div class="pt-1">
              <button
                type="button"
                onClick={() => setChoosingBook(null)}
                class="w-full py-2 px-3 rounded-lg text-xs font-medium cursor-pointer border transition-colors outline-none hover:bg-[var(--bg-hover)]"
                style={{
                  "background-color": "var(--bg-surface)",
                  "color": "var(--text-main)",
                  "border-color": "var(--border-color)",
                }}
              >
                取消
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </div>
  );
}

export default BookShelf;