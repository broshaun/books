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
  
  /** 点击图书按钮时的专属回调 */
  onToggleOpen?: (open: boolean) => void;

  /** 点击“笔记面板”标题时的回调 */
  onTitleClick?: () => void;

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
    "onToggleOpen",
    "onTitleClick",
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

  // 点击图书按钮展开
  const handleOpenDrawer = () => {
    setOpen(true);
    local.onToggleOpen?.(true);
  };

  // 关闭时自动取消固定
  const closeDrawer = () => {
    if (isPinned()) setPinned(false);
    setOpen(false);
    local.onToggleOpen?.(false);
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
      {/* 展开图书按钮 */}
      <Show when={!isOpen()}>
        <button
          type="button"
          title="展开笔记"
          aria-label="展开笔记"
          onClick={handleOpenDrawer}
          class="absolute right-4 top-4 z-30 flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white/95 p-2.5 text-stone-800 shadow-lg backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:bg-stone-50 hover:scale-105 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800/95 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <IconNotebook size={19} class="text-amber-600 dark:text-amber-500" />
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
        <div class="flex shrink-0 items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-zinc-800">
          <div class="flex items-center gap-2">
            {/* 固定按钮 */}
            <button
              type="button"
              onClick={togglePin}
              title={isPinned() ? "取消固定" : "固定面板"}
              aria-label={isPinned() ? "取消固定" : "固定面板"}
              aria-pressed={isPinned()}
              class={`rounded-lg p-2 cursor-pointer transition-all border shadow-sm ${
                isPinned()
                  ? "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/40 dark:border-amber-700/60 dark:text-amber-400"
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:bg-zinc-800/80 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }`}
            >
              <Show
                when={isPinned()}
                fallback={<IconPin size={17} stroke="2.2" />}
              >
                <IconPinned
                  size={17}
                  stroke="2.4"
                  class="text-amber-600 dark:text-amber-400"
                />
              </Show>
            </button>

            {/* 带下划线与回调的笔记面板标题 */}
            <button
              type="button"
              onClick={() => local.onTitleClick?.()}
              class="group flex items-center cursor-pointer select-none border-none bg-transparent p-0 text-xs font-semibold text-stone-600 transition-colors hover:text-stone-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              <span class="underline underline-offset-4 decoration-stone-300 transition-colors group-hover:decoration-stone-600 dark:decoration-zinc-600 dark:group-hover:decoration-zinc-300">
                📖 笔记面板
              </span>
            </button>
          </div>

          {/* 关闭按钮 */}
          <button
            type="button"
            onClick={closeDrawer}
            title="关闭面板"
            aria-label="关闭面板"
            class="rounded-lg p-1.5 border border-transparent text-stone-400 cursor-pointer hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <IconX size={17} stroke="2.2" />
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