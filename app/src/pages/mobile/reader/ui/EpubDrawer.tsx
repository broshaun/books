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

  // 💡 核心改动：默认背景使用全局的 `--bg-surface` 变量，完美匹配抽屉和面板的卡片风格
  const background = () => local.bg ?? "var(--bg-surface)";
  const isTailwindBg = () => background().startsWith("bg-");

  return (
    <div class="hidden landscape:block">
      {/* 展开图书按钮：使用 CSS 变量自适应当前主题 */}
      <Show when={!isOpen()}>
        <button
          type="button"
          title="展开笔记"
          aria-label="展开笔记"
          onClick={handleOpenDrawer}
          style={{
            ...parsePositionStyle(local.initialX, local.initialY),
            "background-color": "var(--bg-surface)",
            "color": "var(--text-main)",
            "border-color": "var(--border-color)",
            "box-shadow": "var(--shadow-lg)",
          }}
          class="absolute z-30 flex items-center gap-1.5 rounded-xl border p-2.5 cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-[var(--bg-hover)]"
        >
          <IconNotebook size={19} style={{ color: "var(--accent-color)" }} />
        </button>
      </Show>

      {/* 非固定模式遮罩 */}
      <Show when={isOpen() && !isPinned()}>
        <div
          class="absolute inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={closeDrawer}
        />
      </Show>

      {/* Drawer 主体：完美应用全局背景与边框变量 */}
      <div
        style={{
          width: drawerWidth(),
          background: isTailwindBg() ? undefined : background(),
          color: "var(--text-main)",
          "border-color": "var(--border-color)",
          "box-shadow": "var(--shadow-lg)",
          ...(!isTailwindBg() && local.bg ? { background: local.bg } : {}),
        }}
        class={`absolute inset-y-0 right-0 z-50 flex h-full max-w-[95vw] flex-col border-l transition-transform duration-300 ease-out ${
          isOpen()
            ? "translate-x-0 pointer-events-auto"
            : "translate-x-full pointer-events-none"
        } ${isTailwindBg() ? background() : ""}`}
      >
        {/* 顶部操作栏 */}
        <div 
          class="flex shrink-0 items-center justify-between border-b px-4 py-3"
          style={{ "border-color": "var(--border-color)" }}
        >
          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePin}
              title={isPinned() ? "取消固定" : "固定面板"}
              aria-label={isPinned() ? "取消固定" : "固定面板"}
              aria-pressed={isPinned()}
              style={{
                "background-color": isPinned() ? "var(--bg-hover)" : "var(--bg-surface)",
                "border-color": "var(--border-color)",
                color: isPinned() ? "var(--accent-color)" : "var(--text-secondary)",
              }}
              class="rounded-lg p-2 cursor-pointer transition-all border shadow-sm hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]"
            >
              <Show
                when={isPinned()}
                fallback={<IconPin size={17} stroke="2.2" />}
              >
                <IconPinned
                  size={17}
                  stroke="2.4"
                  style={{ color: "var(--accent-color)" }}
                />
              </Show>
            </button>

            <button
              type="button"
              onClick={() => local.onTitleClick?.()}
              style={{ color: "var(--text-main)" }}
              class="group flex items-center cursor-pointer select-none border-none bg-transparent p-0 text-xs font-semibold transition-colors hover:opacity-80"
            >
              <span class="underline underline-offset-4 decoration-[var(--border-color)] transition-colors group-hover:decoration-[var(--text-main)]">
                📖 笔记列表
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            title="关闭面板"
            aria-label="关闭面板"
            style={{ color: "var(--text-secondary)" }}
            class="rounded-lg p-1.5 border border-transparent cursor-pointer hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] transition-colors"
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