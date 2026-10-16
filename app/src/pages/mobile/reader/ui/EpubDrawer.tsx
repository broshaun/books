import {
  type Component,
  type JSX,
  splitProps,
  createSignal,
  Show,
} from "solid-js";

import Drawer from "corvu/drawer";
import { IconPin, IconPinned, IconNotebook } from "@tabler/icons-solidjs";

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

  // 打开/关闭状态管理
  const [internalOpen, setInternalOpen] = createSignal(
    local.initialOpen ?? false
  );
  const isOpen = () => local.open ?? internalOpen();

  const handleOpenChange = (open: boolean) => {
    if (local.open === undefined) setInternalOpen(open);
    local.onOpenChange?.(open);
  };

  // 固定状态管理
  const [internalPinned, setInternalPinned] = createSignal(
    local.initialPinned ?? false
  );
  const isPinned = () => local.pinned ?? internalPinned();

  const togglePin = () => {
    const next = !isPinned();
    if (local.pinned === undefined) setInternalPinned(next);
    local.onPinChange?.(next);
  };

  // 宽度计算：数字转 px，字符串保留原样
  const drawerWidth = () => {
    const value = local.width ?? "80%"; // App 端通常默认占稍大比例，如 80% 或固定宽度
    return typeof value === "number" ? `${value}px` : value;
  };

  const buttonClass =
    "absolute z-30 flex items-center gap-1.5 " +
    "rounded-lg border border-stone-200/80 " +
    "bg-white/90 px-3 py-1.5 text-xs " +
    "text-stone-700 shadow-md backdrop-blur-md " +
    "cursor-pointer select-none transition-all duration-300 " +
    "hover:bg-white " +
    "dark:border-zinc-700/80 dark:bg-zinc-800/90 " +
    "dark:text-zinc-200 dark:hover:bg-zinc-800";

  return (
    <>
      {/* 悬浮在右上角的打开按钮：抽屉关闭时显示 */}
      <Show when={!isOpen()}>
        <button
          type="button"
          title="展开笔记"
          aria-label="展开笔记"
          class={`${buttonClass} right-4 top-4 p-2`}
          onClick={() => handleOpenChange(true)}
        >
          <IconNotebook size={17} />
        </button>
      </Show>

      <Drawer
        {...others}
        open={isOpen()}
        onOpenChange={handleOpenChange}
        side="right"
        modal={!isPinned()}
        trapFocus={!isPinned()}
        preventScroll={!isPinned()}
        noOutsidePointerEvents={false}
        closeOnOutsideFocus={false}
      >
        <Drawer.Portal>
          {/* 未固定时渲染遮罩（点击外部自动收起）；固定后卸载遮罩（允许底层选中） */}
          <Show when={!isPinned()}>
            <Drawer.Overlay class="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity data-closed:opacity-0 data-open:opacity-100" />
          </Show>

          <Drawer.Content
            data-corvu-no-drag
            style={{
              width: drawerWidth(),
              ...(local.bg && !local.bg.startsWith("bg-")
                ? { background: local.bg }
                : {}),
            }}
            class={`fixed inset-y-0 right-0 z-50 flex h-full max-w-[95vw] flex-col shadow-2xl outline-none overscroll-none transition-transform duration-300 ease-out data-closed:translate-x-full data-open:translate-x-0 ${
              local.bg?.startsWith("bg-") ? local.bg : "bg-white"
            }`}
          >
            {/* 顶栏操作区 */}
            <div
              data-corvu-no-drag
              class="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-3"
            >
              <span class="text-xs font-medium text-stone-400">
                📖 笔记面板
              </span>

              <button
                type="button"
                onClick={togglePin}
                class={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                  isPinned()
                    ? "bg-stone-100 text-stone-900"
                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                }`}
                title={isPinned() ? "取消固定" : "固定面板"}
              >
                {isPinned() ? (
                  <IconPinned size={15} class="text-amber-600" />
                ) : (
                  <IconPin size={15} />
                )}
              </button>
            </div>

            {/* 内容区 */}
            <div
              data-corvu-no-drag
              class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
            >
              {local.children}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer>
    </>
  );
};

export default EpubDrawer;