import {
  type Component,
  type JSX,
  splitProps,
  createSignal,
  Show,
  onMount,
  onCleanup,
} from "solid-js";
import { IconPin, IconPinned, IconNotebook, IconX } from "@tabler/icons-solidjs";

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
  const [local, others] = splitProps(props, [
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

  let drawerContentRef!: HTMLDivElement;

  // 打开/关闭状态
  const [internalOpen, setInternalOpen] = createSignal(local.initialOpen ?? false);
  const isOpen = () => local.open ?? internalOpen();

  const handleOpenChange = (nextOpen: boolean) => {
    if (local.open === undefined) setInternalOpen(nextOpen);
    local.onOpenChange?.(nextOpen);
  };

  // Pin（固定）状态
  const [internalPinned, setInternalPinned] = createSignal(local.initialPinned ?? false);
  const isPinned = () => local.pinned ?? internalPinned();

  const togglePin = () => {
    const next = !isPinned();
    if (local.pinned === undefined) setInternalPinned(next);
    local.onPinChange?.(next);
  };

  // 计算宽度的通用函数
  const drawerWidth = () => {
    const val = local.width ?? "80%";
    return typeof val === "number" ? `${val}px` : val;
  };

  // 点击外部收起逻辑（仅在非 Pinned 且打开时生效）
  const handleClickOutside = (e: MouseEvent) => {
    if (isPinned() || !isOpen()) return;
    if (drawerContentRef && !drawerContentRef.contains(e.target as Node)) {
      handleOpenChange(false);
    }
  };

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });

  return (
    <>
      {/* 1. 当抽屉处于关闭状态时展示的快捷展开按钮 */}
      <Show when={!isOpen()}>
        <button
          type="button"
          title="展开笔记"
          aria-label="展开笔记"
          class="absolute right-4 top-4 z-30 flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white/90 p-2 text-xs text-stone-700 shadow-md backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:bg-white active:scale-95 dark:border-zinc-700/80 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800"
          onClick={() => handleOpenChange(true)}
        >
          <IconNotebook size={17} />
        </button>
      </Show>

      {/* 2. 背景遮罩：仅在【未固定】且【打开状态】下显示 */}
      <Show when={!isPinned() && isOpen()}>
        <div
          class="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300"
          onClick={() => handleOpenChange(false)}
        />
      </Show>

      {/* 3. 抽屉主体：直接挂载在 DOM 流中，无任何全屏指针事件屏蔽 */}
      <div
        ref={drawerContentRef}
        style={{
          width: drawerWidth(),
          ...(local.bg && !local.bg.startsWith("bg-") ? { background: local.bg } : {}),
        }}
        class={`fixed inset-y-0 right-0 z-50 flex h-full max-w-[95vw] flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isOpen() ? "translate-x-0" : "translate-x-full"
        } ${local.bg?.startsWith("bg-") ? local.bg : "bg-white dark:bg-zinc-900"}`}
      >
        {/* 顶部操作区 */}
        <div class="flex shrink-0 items-center justify-between border-b border-stone-100 dark:border-zinc-800 px-4 py-3">
          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePin}
              class={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                isPinned()
                  ? "bg-stone-100 text-stone-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
              title={isPinned() ? "取消固定" : "固定面板"}
            >
              {isPinned() ? (
                <IconPinned size={15} class="text-amber-600" />
              ) : (
                <IconPin size={15} />
              )}
            </button>

            <span class="text-xs font-medium text-stone-500 dark:text-zinc-400">
              📖 笔记
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            class="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            title="关闭面板"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* 笔记卡片列表/内容区 */}
        <div class="min-h-0 flex-1 overflow-y-auto p-4">
          {local.children}
        </div>
      </div>
    </>
  );
};

export default EpubDrawer;