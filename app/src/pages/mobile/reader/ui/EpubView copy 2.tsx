import {
  type JSX,
  type ParentProps,
  splitProps,
  Show,
  createSignal,
} from "solid-js";

import {
  IconNotebook,
  IconDoorExit,
} from "@tabler/icons-solidjs";

export interface EpubViewProps extends ParentProps {
  ref?: JSX.IntrinsicElements["div"]["ref"];

  bg?: string;
  height?: number;

  // 阅读器控制开关（保留 controlsEnabled 用于决定是否允许手势控制/退出）
  controlsEnabled?: boolean;

  // 笔记入口
  notesEnabled?: boolean;

  onExit?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onOpenNotes?: () => void;
}

export function EpubView(props: EpubViewProps) {
  const [local, rest] = splitProps(props, [
    "ref",
    "children",
    "bg",
    "height",
    "controlsEnabled",
    "notesEnabled",
    "onExit",
    "onPrevPage",
    "onNextPage",
    "onOpenNotes",
  ]);

  // 控制退出按钮的显隐与渐隐动画状态
  const [exitVisible, setExitVisible] = createSignal(false);
  let fadeTimer: NodeJS.Timeout | null = null;

  let startX = 0;
  let startY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    // 如果用户正在划线选中文字，不触发手势
    if (window.getSelection()?.toString().trim()) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const minThreshold = 50; // 最小触发像素

    if (absX > absY) {
      // 左右横向滑动
      if (absX > minThreshold) {
        if (deltaX > 0) {
          props.onPrevPage?.(); // 右滑 -> 上一页
        } else {
          props.onNextPage?.(); // 左滑 -> 下一页
        }
      }
    } else {
      // 上下纵向滑动
      if (absY > minThreshold && deltaY > 0 && local.controlsEnabled && local.onExit) {
        // 下滑 -> 显示退出按钮
        setExitVisible(true);

        if (fadeTimer) clearTimeout(fadeTimer);

        // 2秒后开始淡化，配合 Tailwind 的 transition-opacity 产生渐隐效果
        fadeTimer = setTimeout(() => {
          setExitVisible(false);
        }, 2000);
      }
    }
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
    <div
      class="relative isolate w-full overflow-hidden"
      style={{
        height:
          local.height != null
            ? `${local.height}px`
            : "100%",
        "background-color": local.bg,
      }}
    >
      {/* EPUB 挂载容器：绑定触摸手势 */}
      <div
        {...rest}
        ref={local.ref}
        class="h-full w-full min-w-0 overflow-y-auto"
        style={{
          "background-color": local.bg,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {local.children}
      </div>

      {/* 下滑唤醒、随后自动慢慢淡化的退出按钮 */}
      <Show when={local.controlsEnabled && local.onExit}>
        <button
          type="button"
          title="退出阅读"
          class={`${buttonClass} left-4 top-4 ${
            exitVisible() ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => local.onExit?.()}
        >
          <IconDoorExit size={16} />
          退出
        </button>
      </Show>

      {/* 右上角展开笔记入口（保持常驻） */}
      <Show when={local.notesEnabled && local.onOpenNotes}>
        <button
          type="button"
          title="展开笔记"
          aria-label="展开笔记"
          class={`${buttonClass} right-4 top-4 p-2`}
          onClick={() => local.onOpenNotes?.()}
        >
          <IconNotebook size={17} />
        </button>
      </Show>
    </div>
  );
}

export default EpubView;