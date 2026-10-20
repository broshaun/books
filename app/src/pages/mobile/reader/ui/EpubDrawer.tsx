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
  onToggleOpen?: (open: boolean) => void;
  onTitleClick?: () => void;
  pinned?: boolean;
  initialPinned?: boolean;
  onPinChange?: (pinned: boolean) => void;

  initialX?: number | string;
  initialY?: number | string;

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
    "initialX",
    "initialY",
    "bg",
    "width",
    "children",
  ]);

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

  const handleOpenDrawer = () => {
    setOpen(true);
    local.onToggleOpen?.(true);
  };

  const closeDrawer = () => {
    if (isPinned()) setPinned(false);
    setOpen(false);
    local.onToggleOpen?.(false);
  };

  const togglePin = () => {
    setPinned(!isPinned());
  };

  const parsePositionStyle = (x?: number | string, y?: number | string) => {
    const style: Record<string, string> = {};

    if (typeof x === "number" && x < 0) {
      style.right = `${Math.abs(x)}px`;
    } else if (typeof x === "string" && x.startsWith("-")) {
      style.right = `${parseFloat(x)}px`;
    } else {
      style.left = x === undefined ? "16px" : typeof x === "number" ? `${x}px` : x;
    }

    if (typeof y === "number" && y < 0) {
      style.bottom = `${Math.abs(y)}px`;
    } else if (typeof y === "string" && y.startsWith("-")) {
      style.bottom = `${parseFloat(y)}px`;
    } else {
      style.top = y === undefined ? "16px" : typeof y === "number" ? `${y}px` : y;
    }

    return style;
  };

  const drawerWidth = () => {
    const width = local.width ?? "320px";
    return typeof width === "number" ? `${width}px` : width;
  };

  const background = () => local.bg ?? "";
  const isTailwindBg = () => background().startsWith("bg-");

  return (
    /* 💡 核心修改：使用 Tailwind 的 portrait:hidden，当检测到设备/窗口处于竖屏时，整个组件直接隐藏不渲染 */
    <div class="hidden landscape:block">
      {/* 展开图书按钮：支持通过 initialX / initialY 自由定位在容器内部 */}
      <Show when={!isOpen()}>
        <button
          type="button"
          title="展开笔记"
          aria-label="展开笔记"
          onClick={handleOpenDrawer}
          style={parsePositionStyle(local.initialX, local.initialY)}
          class="absolute z-30 flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white/95 p-2.5 text-stone-800 shadow-lg backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:bg-stone-50 hover:scale-105 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800/95 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <IconNotebook size={19} class="text-amber-600 dark:text-amber-500" />
        </button>
      </Show>

      {/* 非固定模式遮罩：绝对定位，严格限制在父容器内部 */}
      <Show when={isOpen() && !isPinned()}>
        <div
          class="absolute inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={closeDrawer}
        />
      </Show>

      {/* Drawer 主体：absolute 定位，紧贴父容器右侧 */}
      <div
        style={{
          width: drawerWidth(),
          ...(!isTailwindBg() && background()
            ? { background: background() }
            : {}),
        }}
        class={`absolute inset-y-0 right-0 z-50 flex h-full max-w-[95vw] flex-col shadow-2xl transition-transform duration-300 ease-out ${isOpen()
          ? "translate-x-0 pointer-events-auto"
          : "translate-x-full pointer-events-none"
          } ${isTailwindBg()
            ? background()
            : "bg-white dark:bg-zinc-900"
          }`}
      >
        {/* 顶部操作栏 */}
        <div class="flex shrink-0 items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-zinc-800">
          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePin}
              title={isPinned() ? "取消固定" : "固定面板"}
              aria-label={isPinned() ? "取消固定" : "固定面板"}
              aria-pressed={isPinned()}
              class={`rounded-lg p-2 cursor-pointer transition-all border shadow-sm ${isPinned()
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

            <button
              type="button"
              onClick={() => local.onTitleClick?.()}
              class="group flex items-center cursor-pointer select-none border-none bg-transparent p-0 text-xs font-semibold text-stone-600 transition-colors hover:text-stone-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              <span class="underline underline-offset-4 decoration-stone-300 transition-colors group-hover:decoration-black dark:decoration-zinc-600 dark:group-hover:decoration-white text-black dark:text-black">
                📖 笔记列表
              </span>
            </button>
          </div>

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
    </div>
  );
};

export default EpubDrawer;