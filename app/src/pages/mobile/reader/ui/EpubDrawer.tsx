
import {
  type Component,
  type JSX,
  splitProps,
  createSignal,
  Show,
} from "solid-js";

import {
  IconPin,
  IconPinned,
  IconNotebook,
  IconX,
} from "@tabler/icons-solidjs";

export interface EpubDrawerProps {
  open?: boolean;
  initialOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  pinned?: boolean;
  initialPinned?: boolean;
  onPinChange?: (pinned: boolean) => void;

  bg?: string;
  width?: number | string;
  children: JSX.Element;
}

export const EpubDrawer: Component<EpubDrawerProps> = (props) => {
  const [local] = splitProps(props, [
    "open",
    "initialOpen",
    "onOpenChange",
    "pinned",
    "initialPinned",
    "onPinChange",
    "bg",
    "width",
    "children",
  ]);

  // 支持受控和非受控状态
  const [internalOpen, setInternalOpen] = createSignal(
    local.initialOpen ?? false
  );

  const [internalPinned, setInternalPinned] = createSignal(
    local.initialPinned ?? false
  );

  const isOpen = () => local.open ?? internalOpen();
  const isPinned = () => local.pinned ?? internalPinned();

  const setOpen = (value: boolean) => {
    if (local.open === undefined) {
      setInternalOpen(value);
    }
    local.onOpenChange?.(value);
  };

  const setPinned = (value: boolean) => {
    if (local.pinned === undefined) {
      setInternalPinned(value);
    }
    local.onPinChange?.(value);
  };

  // 关闭时自动取消固定
  const closeDrawer = () => {
    if (isPinned()) setPinned(false);
    setOpen(false);
  };

  const togglePin = () => {
    setPinned(!isPinned());
  };

  // 宽度支持 px / % / vw 等
  const drawerWidth = () => {
    const width = local.width ?? "80%";
    return typeof width === "number"
      ? `${width}px`
      : width;
  };

  const background = () => local.bg ?? "";

  const isTailwindBg = () =>
    background().startsWith("bg-");

  return (
    <>
      {/* 展开按钮 */}
      <Show when={!isOpen()}>
        <button
          type="button"
          title="展开笔记"
          aria-label="展开笔记"
          onClick={() => setOpen(true)}
          class="absolute right-4 top-4 z-30 flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white/90 p-2 text-xs text-stone-700 shadow-md backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:bg-white active:scale-95 dark:border-zinc-700/80 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <IconNotebook size={17} />
        </button>
      </Show>

      {/* 非固定模式遮罩 */}
      <Show when={isOpen() && !isPinned()}>
        <div
          class="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={closeDrawer}
        />
      </Show>

      {/* Drawer 主体 */}
      <div
        style={{
          width: drawerWidth(),
          ...(!isTailwindBg() && background()
            ? { background: background() }
            : {}),
        }}
        class={`fixed inset-y-0 right-0 z-50 flex h-full max-w-[95vw] flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isOpen()
            ? "translate-x-0 pointer-events-auto"
            : "translate-x-full pointer-events-none"
        } ${
          isTailwindBg()
            ? background()
            : "bg-white dark:bg-zinc-900"
        }`}
      >
        {/* 顶部操作栏 */}
        <div class="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePin}
              title={isPinned() ? "取消固定" : "固定面板"}
              aria-label={isPinned() ? "取消固定" : "固定面板"}
              aria-pressed={isPinned()}
              class={`rounded-lg p-1.5 cursor-pointer transition-colors ${
                isPinned()
                  ? "bg-stone-100 text-stone-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Show
                when={isPinned()}
                fallback={<IconPin size={15} />}
              >
                <IconPinned
                  size={15}
                  class="text-amber-600"
                />
              </Show>
            </button>

            <span class="text-xs font-medium text-stone-500 dark:text-zinc-400">
              📖 笔记
            </span>
          </div>

          {/* 关闭按钮：同时取消 pinned */}
          <button
            type="button"
            onClick={closeDrawer}
            title="关闭面板"
            aria-label="关闭面板"
            class="rounded-lg p-1 text-stone-400 cursor-pointer hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* 内容区 */}
        <div class="min-h-0 flex-1 overflow-y-auto p-4">
          {local.children}
        </div>
      </div>
    </>
  );
};

export default EpubDrawer;
