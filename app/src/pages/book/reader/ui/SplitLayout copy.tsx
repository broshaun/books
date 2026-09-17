import { type JSX, Show } from "solid-js";
import { IconNotebook, IconDoorExit } from "@tabler/icons-solidjs";

export interface SplitLayoutProps {
  epub: JSX.Element;
  notes: JSX.Element;
  quick?: JSX.Element;
  bg?: string;
  height?: number;
  onExit?: () => void;
}

export default function SplitLayout(props: SplitLayoutProps) {
  return (
    <div class="w-full flex justify-center bg-[#fbfbfa] text-stone-800">
      <div 
        class="flex w-full max-w-7xl overflow-hidden relative shadow-xs border border-stone-200/60 rounded-2xl bg-white"
        style={{
          "background-color": props.bg,
          "height": props.height !== undefined ? `${props.height}px` : "100vh"
        }}
      >
        {/* 左侧阅读区：加入 relative 以为悬浮退出按钮定位 */}
        <div 
          class="w-[70%] h-full overflow-y-auto min-w-0 relative"
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

        {/* 右侧笔记面板：保持纯净的标题栏 */}
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

        {/* 悬浮快捷菜单 */}
        {props.quick}
      </div>
    </div>
  );
}