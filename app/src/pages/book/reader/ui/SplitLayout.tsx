import { type JSX } from "solid-js";
import { IconNotebook } from "@tabler/icons-solidjs";

export interface SplitLayoutProps {
  epub: JSX.Element;
  notes: JSX.Element;
  bg?: string;
  height?: number;
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
        {/* 左侧阅读区：加入 min-w-0 防止 flex 撑破 */}
        <div 
          class="w-[70%] h-full overflow-y-auto min-w-0"
          style={{ "background-color": props.bg }}
        >
          {props.epub}
        </div>

        {/* 右侧笔记面板：必须加 min-w-0 和 overflow-hidden，锁死宽度 */}
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

          {/* 笔记滚动内容区：严格限制横向溢出 */}
          <div class="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-1">
            {props.notes}
          </div>
        </aside>
      </div>
    </div>
  );
}