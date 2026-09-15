import { createSignal } from "solid-js";
import * as Dialog from "@kobalte/core/dialog";

export default function Drawer2() {
  const [open, setOpen] = createSignal(false);

  return (
    <Dialog.Root open={open()} onOpenChange={setOpen}>
      {/* 触发按钮 */}
      <Dialog.Trigger class="px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors">
        目录 (Kobalte)
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* 背景遮罩 */}
        <Dialog.Overlay class="fixed inset-0 bg-black/30 backdrop-blur-xs z-50" />

        {/* 抽屉主体：纯净亮色设计，无夜间模式干扰 */}
        <Dialog.Content class="fixed inset-y-0 left-0 w-80 bg-white text-zinc-800 p-6 shadow-2xl z-50 flex flex-col outline-none border-r border-zinc-200">
          
          {/* 头部：标题与关闭按钮 */}
          <div class="flex items-center justify-between pb-4 border-b border-zinc-200">
            <Dialog.Title class="font-bold text-sm text-zinc-900">
              📚 电子书目录
            </Dialog.Title>
            
            <Dialog.CloseButton class="p-1 text-xs text-zinc-400 hover:text-zinc-700 rounded transition-colors">
              ✕
            </Dialog.CloseButton>
          </div>

          {/* 无障碍描述 */}
          <Dialog.Description class="sr-only">
            书籍章节目录侧边栏
          </Dialog.Description>

          {/* 列表内容区 */}
          <div class="flex-1 overflow-y-auto py-4 space-y-1 text-sm">
            <div class="p-2 rounded-md hover:bg-zinc-100 cursor-pointer text-zinc-700 transition-colors">
              第一章：底层架构与原理
            </div>
            <div class="p-2 rounded-md hover:bg-zinc-100 cursor-pointer text-zinc-700 transition-colors">
              第二章：使用 Kobalte 构建交互
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}