
import {
  type JSX,
  Show,
  createSignal,
  onMount,
  onCleanup,
} from "solid-js";

import {
  IconNotebook,
  IconDoorExit,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
} from "@tabler/icons-solidjs";

export interface SplitLayoutProps {
  epub: JSX.Element;
  notes: JSX.Element;
  bg?: string;
  height?: number;
  notesTitle?: string;
  onExit?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onToggleControls?: () => void;
}

export default function SplitLayout(props: SplitLayoutProps) {
  const [isPortrait, setIsPortrait] = createSignal(false);
  const [showControls, setShowControls] = createSignal(false);
  const [notesVisible, setNotesVisible] = createSignal(true);
  const [isTransitioning, setIsTransitioning] = createSignal(false);

  let transitionTimer: ReturnType<typeof setTimeout> | undefined;

  onMount(() => {
    const mq = window.matchMedia("(orientation: portrait)");

    const update = () => setIsPortrait(mq.matches);

    update();
    mq.addEventListener("change", update);

    onCleanup(() => {
      mq.removeEventListener("change", update);
      if (transitionTimer) clearTimeout(transitionTimer);
    });
  });

  const toggleNotes = (visible: boolean) => {
    if (transitionTimer) clearTimeout(transitionTimer);

    setIsTransitioning(true);
    setNotesVisible(visible);

    transitionTimer = setTimeout(() => {
      setIsTransitioning(false);
      window.dispatchEvent(new Event("resize"));
    }, 300);
  };

  const btn =
    "absolute z-40 flex items-center rounded-full " +
    "bg-white/90 backdrop-blur-md " +
    "border border-stone-200/80 shadow-md " +
    "transition-all cursor-pointer select-none " +
    "hover:bg-white";

  return (
    <div class="flex w-full justify-center bg-[#fbfbfa] text-stone-800">
      <div
        class="relative flex w-full max-w-7xl overflow-hidden border border-stone-200/60 bg-white shadow-xs"
        style={{
          "background-color": props.bg,
          height: props.height ? `${props.height}px` : "100vh",
        }}
      >
        {/* EPUB 阅读区域 */}
        <main
          class={`relative h-full min-w-0 overflow-y-auto transition-all duration-300 ${
            isPortrait() || !notesVisible()
              ? "w-full"
              : "w-[70%]"
          }`}
          style={{ "background-color": props.bg }}
        >
          <Show when={isTransitioning()}>
            <div
              class="absolute inset-0 z-50 flex items-center justify-center"
              style={{
                "background-color": props.bg || "#fff",
              }}
            >
              <div class="flex flex-col items-center gap-2">
                <IconLoader2
                  size={28}
                  class="animate-spin text-stone-400"
                />
                <span class="text-xs text-stone-500">
                  正在调整排版...
                </span>
              </div>
            </div>
          </Show>

          {/* EPUB 阅读器 */}
          <div class="relative h-full w-full">
            {props.epub}
          </div>

          {/* 中央菜单触发区 */}
          <div
            class="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer"
            style={{
              width: "10rem",
              height: "10rem",
            }}
            onClick={() => {
              setShowControls(v => !v);
              props.onToggleControls?.();
            }}
            onDblClick={() => {
              setShowControls(v => !v);
            }}
          />

          {/* 阅读器操作按钮 */}
          <Show when={showControls()}>
            <Show when={props.onExit}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onExit?.();
                }}
                class={`${btn} left-3 top-3 gap-1.5 px-3 py-1.5 text-xs`}
              >
                <IconDoorExit size={16} />
                退出
              </button>
            </Show>

            <Show when={props.onPrevPage}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onPrevPage?.();
                }}
                class={`${btn} bottom-4 left-4 px-3 py-1.5 text-xs`}
              >
                <IconChevronLeft size={16} />
                上一页
              </button>
            </Show>

            <Show when={props.onNextPage}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onNextPage?.();
                }}
                class={`${btn} bottom-4 right-4 px-3 py-1.5 text-xs`}
              >
                下一页
                <IconChevronRight size={16} />
              </button>
            </Show>
          </Show>

          {/* 显示笔记面板 */}
          <Show when={!isPortrait() && !notesVisible()}>
            <button
              type="button"
              onClick={() => toggleNotes(true)}
              class="absolute right-8 top-3 z-40 rounded-lg bg-white/95 p-1.5 shadow-md cursor-pointer"
            >
              <IconNotebook size={15} />
            </button>
          </Show>
        </main>

        {/* 笔记面板 */}
        <Show when={!isPortrait() && notesVisible()}>
          <aside
            class="flex h-full w-[30%] min-w-0 shrink-0 flex-col overflow-hidden border-l border-stone-200/80"
            style={{ "background-color": props.bg }}
          >
            <header class="flex shrink-0 items-center justify-between border-b border-stone-200/80 px-4 py-3.5">
              <span class="flex items-center gap-2 truncate text-sm font-semibold">
                <IconNotebook size={16} />
                {props.notesTitle || "读书笔记"}
              </span>

              <button
                type="button"
                onClick={() => toggleNotes(false)}
                class="flex h-6 w-6 items-center justify-center rounded-full cursor-pointer"
              >
                <IconChevronRight size={14} />
              </button>
            </header>

            {/* 笔记滚动区域：不拦截鼠标事件 */}
            <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-1">
              {props.notes}
            </div>
          </aside>
        </Show>
      </div>
    </div>
  );
}
