import { type JSX, type ParentProps, splitProps, Show } from "solid-js";
import { IconDoorExit } from "@tabler/icons-solidjs";

export interface EpubViewProps extends ParentProps {
  ref?: JSX.IntrinsicElements["div"]["ref"];
  bg?: string;
  width?: number | string;
  height?: number | string;
  controlsEnabled?: boolean;
  onExit?: () => void;
}

export function EpubView(props: EpubViewProps) {
  const [local, rest] = splitProps(props, [
    "ref",
    "children",
    "bg",
    "width",
    "height",
    "controlsEnabled",
    "onExit",
  ]);

  const toSize = (v?: number | string) => (typeof v === "number" ? `${v}px` : v ?? "100%");

  // 默认给一个兜底背景色（比如深色模式或默认白，避免 undefined 导致的白光闪烁）
  const currentBg = () => local.bg || "#ffffff";

  return (
    <div
      class="relative isolate overflow-hidden shrink-0"
      style={{
        width: toSize(local.width),
        height: toSize(local.height),
        background: currentBg(),
      }}
    >
      {/* 挂载 epub.js 的核心容器 */}
      <div
        {...rest}
        ref={local.ref}
        class="h-full w-full overflow-y-auto"
        style={{ background: currentBg() }}
      >
        {local.children}
      </div>

      {/* 退出按钮 */}
      <Show when={local.controlsEnabled && local.onExit}>
        <button
          type="button"
          title="退出阅读"
          class="absolute z-30 flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white/90 px-3 py-1.5 text-xs text-stone-700 shadow-md backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800 left-4 top-4"
          onClick={() => local.onExit?.()}
        >
          <IconDoorExit size={16} />
          退出
        </button>
      </Show>
    </div>
  );
}

export default EpubView;