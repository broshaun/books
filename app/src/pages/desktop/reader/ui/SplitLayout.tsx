import { type JSX, Show, createSignal, onMount, onCleanup } from "solid-js";
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
}

export default function SplitLayout(props: SplitLayoutProps) {
  const [isPortrait, setIsPortrait] = createSignal(false);
  const [notesVisible, setNotesVisible] = createSignal(true);
  const [isTransitioning, setIsTransitioning] = createSignal(false);
  const [isHovered, setIsHovered] = createSignal(false);

  let hoverTimer: any;
  const handleMouseEnter = () => {
    clearTimeout(hoverTimer);
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    hoverTimer = setTimeout(() => setIsHovered(false), 1000);
  };

  onMount(() => {
    const mq = matchMedia("(orientation: portrait)");
    const update = () => setIsPortrait(mq.matches);
    update();
    mq.addEventListener("change", update);
    onCleanup(() => mq.removeEventListener("change", update));
  });

  const toggleNotes = (visible: boolean) => {
    setIsTransitioning(true);
    setNotesVisible(visible);
    setTimeout(() => {
      setIsTransitioning(false);
      dispatchEvent(new Event("resize"));
    }, 300);
  };

  const btnClass = () =>
    `flex items-center rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-stone-200/60 dark:border-zinc-700/60 shadow-md text-stone-700 dark:text-stone-200 cursor-pointer hover:scale-105 active:scale-95 ${
      isHovered() ? "opacity-100 transition-none" : "opacity-0 transition-opacity duration-1000 pointer-events-none"
    }`;

  return (
    <div class="flex w-full justify-center bg-[#fbfbfa] text-stone-800">
      <div
        class="relative flex w-full max-w-7xl overflow-hidden border border-stone-200/60 bg-white shadow-xs"
        style={{
          "background-color": props.bg,
          height: props.height ? `${props.height}px` : "100vh",
        }}
      >
        {/* 主阅读区 */}
        <main
          class={`relative h-full min-w-0 overflow-y-auto transition-all duration-300 ${
            isPortrait() || !notesVisible() ? "w-full" : "w-[70%]"
          }`}
          style={{ "background-color": props.bg }}
        >
          {/* 转场加载遮罩 */}
          <Show when={isTransitioning()}>
            <div
              class="absolute inset-0 z-40 flex items-center justify-center"
              style={{ "background-color": props.bg || "#fff" }}
            >
              <div class="flex flex-col items-center gap-2">
                <IconLoader2 size={28} class="animate-spin text-stone-400" />
                <span class="text-xs text-stone-500">正在调整排版...</span>
              </div>
            </div>
          </Show>

          {props.epub}

          {/* ==================== 外围“回”字形悬浮控制层 ==================== */}
          <div
            class="absolute inset-0 z-30 pointer-events-none"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* 四周热区 */}
            <div class="absolute top-0 inset-x-0 h-10 pointer-events-auto" />
            <div class="absolute bottom-0 inset-x-0 h-10 pointer-events-auto" />
            <div class="absolute top-10 bottom-10 left-0 w-10 pointer-events-auto" />
            <div class="absolute top-10 bottom-10 right-0 w-10 pointer-events-auto" />

            {/* 顶部退出按钮 */}
            <Show when={props.onExit}>
              <div class="absolute top-2.5 left-2.5 pointer-events-auto">
                <button onClick={props.onExit} class={`${btnClass()} gap-1.5 px-3 py-1.5 text-xs`}>
                  <IconDoorExit size={16} />
                  退出
                </button>
              </div>
            </Show>

            {/* 底部翻页按钮 */}
            <Show when={props.onPrevPage || props.onNextPage}>
              <div class="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
                <Show when={props.onPrevPage}>
                  <button onClick={props.onPrevPage} class={`${btnClass()} px-3 py-1.5 text-xs`}>
                    <IconChevronLeft size={14} />
                    上一页
                  </button>
                </Show>
                <Show when={props.onPrevPage && !props.onNextPage}>
                  <div />
                </Show>
                <Show when={props.onNextPage}>
                  <button onClick={props.onNextPage} class={`${btnClass()} px-3 py-1.5 text-xs`}>
                    下一页
                    <IconChevronRight size={14} />
                  </button>
                </Show>
              </div>
            </Show>
          </div>

          {/* 折叠笔记展开按钮（提高 z-index 至 40，确保在最上层且可正常点击） */}
          <Show when={!isPortrait() && !notesVisible()}>
            <button
              onClick={() => toggleNotes(true)}
              class="absolute right-8 top-3 z-40 rounded-lg bg-white/80 p-1.5 shadow-xs cursor-pointer hover:bg-white transition-all pointer-events-auto"
              title="展开笔记"
            >
              <IconNotebook size={15} />
            </button>
          </Show>
        </main>

        {/* 右侧笔记侧边栏 */}
        <Show when={!isPortrait() && notesVisible()}>
          <aside
            class="flex h-full w-[30%] min-w-0 shrink-0 flex-col overflow-hidden border-l border-stone-200/80"
            style={{ "background-color": props.bg }}
          >
            <header class="flex items-center justify-between border-b border-stone-200/80 px-4 py-3.5">
              <span class="flex items-center gap-2 truncate text-sm font-semibold">
                <IconNotebook size={16} />
                {props.notesTitle || "读书笔记"}
              </span>
              <button
                onClick={() => toggleNotes(false)}
                class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-stone-100 cursor-pointer transition-colors"
                title="收起笔记"
              >
                <IconChevronRight size={14} />
              </button>
            </header>
            <div class="flex-1 overflow-y-auto overflow-x-hidden p-1">
              {props.notes}
            </div>
          </aside>
        </Show>
      </div>
    </div>
  );
}