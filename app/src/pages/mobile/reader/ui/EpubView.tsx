import {
  type JSX,
  type ParentProps,
  splitProps,
  createSignal,
  Show,
} from "solid-js";

import {
  IconNotebook,
  IconDoorExit,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-solidjs";

export interface EpubViewProps extends ParentProps {
  ref?: JSX.IntrinsicElements["div"]["ref"];

  bg?: string;
  height?: number;

  // 控制功能开关
  controlsEnabled?: boolean;
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

  // 阅读控制栏显示状态（默认隐藏，点击正文唤醒/隐藏）
  const [controlsVisible, setControlsVisible] = createSignal(false);

  const buttonClass =
    "flex items-center justify-center gap-1 " +
    "rounded-full border border-stone-200/80 " +
    "bg-white/95 px-3.5 py-2 text-xs font-medium " +
    "text-stone-700 shadow-lg backdrop-blur-md " +
    "cursor-pointer select-none active:scale-95 transition-transform";

  return (
    <div
      class="relative isolate w-full overflow-hidden"
      style={{
        height: local.height != null ? `${local.height}px` : "100%",
        "background-color": local.bg,
      }}
    >
      {/* EPUB 挂载容器 */}
      <div
        {...rest}
        ref={local.ref}
        class="h-full w-full min-w-0 overflow-y-auto"
        style={{ "background-color": local.bg }}
      >
        {local.children}
      </div>

      {/* 屏幕点击触发层（放置在底层，仅用于点击正文空白处切换控制栏） */}
      <div
        class="absolute inset-0 z-10 cursor-pointer"
        onClick={() => setControlsVisible((prev) => !prev)}
      />

      {/* 1. 笔记按钮：【常驻】在最顶层（z-40），不随 controlsVisible 隐藏，独立可点 */}
      <Show when={local.notesEnabled && local.onOpenNotes}>
        <div class="absolute right-4 top-4 z-40 pointer-events-auto">
          <button
            type="button"
            title="展开笔记"
            aria-label="展开笔记"
            class={`${buttonClass} p-2.5`}
            onClick={(e) => {
              e.stopPropagation(); // 阻止事件冒泡，防止触发正文点击
              local.onOpenNotes?.();
            }}
          >
            <IconNotebook size={18} class="text-stone-700" />
          </button>
        </div>
      </Show>

      {/* 2. 阅读控制层（退出、上一页、下一页）：受 controlsVisible 控制显隐 */}
      <Show when={local.controlsEnabled}>
        <div
          class={`absolute inset-0 z-30 transition-opacity duration-200 ease-in-out ${
            controlsVisible()
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* 顶部左侧：退出按钮 */}
          <Show when={local.onExit}>
            <button
              type="button"
              title="退出阅读"
              aria-label="退出阅读"
              class={`${buttonClass} absolute left-4 top-4`}
              onClick={(e) => {
                e.stopPropagation();
                local.onExit?.();
              }}
            >
              <IconDoorExit size={16} class="text-stone-500" />
              <span>退出</span>
            </button>
          </Show>

          {/* 底部左侧：上一页 */}
          <Show when={local.onPrevPage}>
            <button
              type="button"
              title="上一页"
              aria-label="上一页"
              class={`${buttonClass} absolute bottom-6 left-5`}
              onClick={(e) => {
                e.stopPropagation();
                local.onPrevPage?.();
              }}
            >
              <IconChevronLeft size={16} />
              <span>上一页</span>
            </button>
          </Show>

          {/* 底部右侧：下一页 */}
          <Show when={local.onNextPage}>
            <button
              type="button"
              title="下一页"
              aria-label="下一页"
              class={`${buttonClass} absolute bottom-6 right-5`}
              onClick={(e) => {
                e.stopPropagation();
                local.onNextPage?.();
              }}
            >
              <span>下一页</span>
              <IconChevronRight size={16} />
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
}

export default EpubView;