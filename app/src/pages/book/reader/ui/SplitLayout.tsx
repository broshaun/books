import { type JSX, Show, createSignal, onMount, onCleanup } from "solid-js";
import { IconNotebook, IconDoorExit, IconChevronLeft, IconChevronRight } from "@tabler/icons-solidjs";

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
  const [showControls, setShowControls] = createSignal(false);

  onMount(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    setIsPortrait(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    mq.addEventListener("change", handler);
    onCleanup(() => mq.removeEventListener("change", handler));
  });

  // 公共按钮样式（毛玻璃 + 圆角 + 阴影 + 悬停过渡）
  const btnBaseClass = "absolute z-20 flex items-center bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-stone-200/60 dark:border-zinc-700/60 shadow-xs transition-all cursor-pointer animate-fade-in";

  return (
    <div class="w-full flex justify-center bg-[#fbfbfa] text-stone-800">
      <div 
        class="flex w-full max-w-7xl overflow-hidden relative shadow-xs border border-stone-200/60 rounded-2xl bg-white"
        style={{
          "background-color": props.bg,
          "height": props.height !== undefined ? `${props.height}px` : "100vh"
        }}
      >
        {/* 左侧阅读区 */}
        <div 
          class={`h-full overflow-y-auto min-w-0 relative transition-all duration-300 ${isPortrait() ? 'w-full' : 'w-[70%]'}`}
          style={{ "background-color": props.bg }}
        >
          {/* 中间双击触发区（直径 4cm 的正圆） */}
          <div 
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 cursor-default rounded-full"
            style={{ width: "4cm", height: "4cm" }}
            onDblClick={() => setShowControls(!showControls())}
            title="双击中间区域显示/隐藏菜单"
          />

          {props.epub}

          {/* 控制菜单显隐 */}
          <Show when={showControls()}>
            <Show when={props.onExit}>
              <button
                type="button"
                onClick={props.onExit}
                class={`${btnBaseClass} top-3 left-3 gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 dark:text-zinc-300 hover:text-stone-900 hover:bg-white group`}
                title="退出阅读"
              >
                <IconDoorExit size={16} class="transition-transform group-hover:-translate-x-0.5" />
                <span>退出</span>
              </button>
            </Show>

            <Show when={props.onPrevPage}>
              <button
                type="button"
                onClick={props.onPrevPage}
                class={`${btnBaseClass} bottom-3 left-3 gap-0.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-stone-700 dark:text-zinc-200 hover:bg-white/90`}
                title="上一页"
              >
                <IconChevronLeft size={14} />
                <span>上一页</span>
              </button>
            </Show>

            <Show when={props.onNextPage}>
              <button
                type="button"
                onClick={props.onNextPage}
                class={`${btnBaseClass} bottom-3 right-3 gap-0.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-stone-700 dark:text-zinc-200 hover:bg-white/90`}
                title="下一页"
              >
                <span>下一页</span>
                <IconChevronRight size={14} />
              </button>
            </Show>
          </Show>
        </div>

        {/* 右侧笔记面板（横屏显示） */}
        <Show when={!isPortrait()}>
          <aside 
            class="w-[30%] h-full border-l border-stone-200/80 flex flex-col overflow-hidden shrink-0 min-w-0 bg-stone-50/40"
            style={{ "background-color": props.bg }}
          >
            <header class="flex items-center px-4 py-3.5 border-b border-stone-200/80 bg-white/60 shrink-0">
              <span class="text-sm font-semibold text-stone-700 flex items-center gap-2 truncate">
                <IconNotebook size={16} class="text-stone-400 shrink-0" />
                {props.notesTitle || "读书笔记"}
              </span>
            </header>

            <div class="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-1">
              {props.notes}
            </div>
          </aside>
        </Show>
      </div>
    </div>
  );
}