import { type JSX, Show, createSignal, onMount, onCleanup } from "solid-js";
import { IconNotebook, IconDoorExit } from "@tabler/icons-solidjs";

export interface SplitLayoutProps {
  
  epub: JSX.Element;
  notes: JSX.Element;
  bg?: string;
  height?: number;
  onExit?: () => void;
}

export default function SplitLayout(props: SplitLayoutProps) {
  // 监听屏幕方向：true 表示竖屏，false 表示横屏
  const [isPortrait, setIsPortrait] = createSignal(false);

  onMount(() => {
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    setIsPortrait(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsPortrait(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    onCleanup(() => mediaQuery.removeEventListener("change", handleChange));
  });

  return (
    <div class="w-full flex justify-center bg-[#fbfbfa] text-stone-800">
      <div 
        class="flex w-full max-w-7xl overflow-hidden relative shadow-xs border border-stone-200/60 rounded-2xl bg-white"
        style={{
          "background-color": props.bg,
          "height": props.height !== undefined ? `${props.height}px` : "100vh"
        }}
      >
        {/* 左侧阅读区：如果是竖屏，宽度占满(100%)；如果是横屏，占70% */}
        <div 
          class={`h-full overflow-y-auto min-w-0 relative transition-all duration-300 ${
            isPortrait() ? 'w-full' : 'w-[70%]'
          }`}
          style={{ "background-color": props.bg }}
        >
          {/* 左上角悬浮的精致退出胶囊按钮 */}
          <Show when={props.onExit}>
            <button
              type="button"
              onClick={props.onExit}
              class="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-stone-200/80 dark:border-zinc-700/80 text-xs font-medium text-stone-600 dark:text-zinc-300 hover:text-stone-900 hover:bg-white shadow-xs transition-all cursor-pointer group"
              title="退出阅读"
            >
              <IconDoorExit size={16} class="transition-transform group-hover:-translate-x-0.5" />
              <span>退出</span>
            </button>
          </Show>

          {props.epub}
        </div>

        {/* 右侧笔记面板：如果是横屏则正常显示(30%)；如果是竖屏则隐藏（或可按需改为抽屉/浮层） */}
        <Show when={!isPortrait()}>
          <aside 
            class="w-[30%] h-full border-l border-stone-200/80 flex flex-col overflow-hidden shrink-0 min-w-0 bg-stone-50/40"
            style={{ "background-color": props.bg }}
          >
            {/* 顶部标题栏 */}
            <header class="flex items-center px-4 py-3.5 border-b border-stone-200/80 bg-white/60 shrink-0">
              <span class="text-sm font-semibold text-stone-700 flex items-center gap-2 truncate">
                <IconNotebook size={16} class="text-stone-400 shrink-0" />
                读书笔记
              </span>
            </header>

            {/* 笔记滚动内容区 */}
            <div class="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-1">
              {props.notes}
            </div>
          </aside>
        </Show>
      </div>
    </div>
  );
}