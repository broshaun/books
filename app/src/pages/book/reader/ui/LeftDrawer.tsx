import { createSignal } from "solid-js";
import Drawer from "@corvu/drawer";

export default function LeftDrawer() {
  const [open, setOpen] = createSignal(false);

  return (
    <Drawer open={open()} onOpenChange={setOpen} side="left">
      {/* 触发按钮 */}
      <Drawer.Trigger class="px-3 py-1.5 text-xs font-medium bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors">
        打开目录抽屉
      </Drawer.Trigger>

      <Drawer.Portal>
        {/* 背景遮罩 */}
        <Drawer.Overlay class="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity" />

        {/* 抽屉主体：side="left" 自动支持向右滑动关闭 */}
        <Drawer.Content class="fixed top-0 left-0 bottom-0 w-80 bg-white text-zinc-800 p-6 shadow-2xl z-50 flex flex-col outline-none border-r border-zinc-200">
          
          <div class="flex items-center justify-between pb-4 border-b border-zinc-200">
            <span class="font-bold text-sm text-zinc-900">📚 电子书目录</span>
            {/* 使用普通的 HTML 按钮配合 setOpen(false) 关掉抽屉 */}
            <button 
              onClick={() => setOpen(false)}
              class="p-1 text-xs text-zinc-400 hover:text-zinc-700 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div class="flex-1 overflow-y-auto py-4 space-y-1 text-sm">
            <div class="p-2 rounded-md hover:bg-zinc-100 cursor-pointer">第一章：手势交互</div>
            <div class="p-2 rounded-md hover:bg-zinc-100 cursor-pointer">第二章：流畅的侧边栏</div>
          </div>

          <div class="pt-4 border-t border-zinc-200 text-xs text-zinc-400 text-center">
            提示：在抽屉任意位置向右滑动即可直接关闭
          </div>

        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  );
}