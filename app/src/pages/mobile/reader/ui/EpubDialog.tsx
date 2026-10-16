import { type ParentProps, Show, createSignal, createEffect, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";
import { IconX } from "@tabler/icons-solidjs";

export interface EpubDialogProps extends ParentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bg?: string;
}

export function EpubDialog(props: EpubDialogProps) {
  let dialogRef!: HTMLDivElement;
  const [confirmed, setConfirmed] = createSignal(false);

  // 当弹窗关闭时，重置确认状态
  createEffect(() => {
    if (!props.open) {
      setConfirmed(false);
    }
  });

  // 点击外部任何地方（或遮罩）直接算关闭
  createEffect(() => {
    if (!props.open) return;

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (dialogRef && !dialogRef.contains(e.target as Node)) {
        props.onOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });

    onCleanup(() => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    });
  });

  return (
    <Portal>
      <Show when={props.open}>
        <Show
          when={confirmed()}
          fallback={
            /* 阶段一：调整至顶部偏下或安全区域，采用极简半透明毛玻璃气泡，彻底避免遮挡正文 */
            <div class="fixed inset-0 z-50 pointer-events-none flex items-start justify-center pt-24 px-4">
              <div
                ref={dialogRef}
                class="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 dark:bg-white/15 shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95 border border-white/20 transition-all"
              >
                <button
                  type="button"
                  onClick={() => setConfirmed(true)}
                  class="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-all cursor-pointer select-none"
                >
                  确定
                </button>
                <div class="w-[1px] h-3 bg-white/20" />
                <button
                  type="button"
                  onClick={() => props.onOpenChange(false)}
                  class="px-3 py-1 rounded-full hover:bg-white/10 text-stone-200 hover:text-white text-xs font-medium transition-all cursor-pointer select-none"
                >
                  取消
                </button>
              </div>
            </div>
          }
        >
          {/* 
            🌟 阶段二：保持你原有的样式与结构，
            这里将外层改为独立于布局流的独立定位层，避免挤压侧边栏 EpubDrawer
          */}
          <div class="fixed inset-0 z-50 pointer-events-auto bg-black/20 backdrop-blur-3xs flex items-center justify-center p-4">
            <div
              ref={dialogRef}
              class="relative w-88 max-w-[90vw] flex flex-col rounded-2xl border border-stone-200/85 bg-white p-6 shadow-2xl transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-900 max-h-[80vh] overflow-y-auto outline-none animate-in fade-in zoom-in-95"
              style={{ "background-color": props.bg }}
            >
              {/* 右上角 X 关闭按钮 */}
              <button
                type="button"
                class="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                onClick={() => props.onOpenChange(false)}
                title="关闭"
              >
                <IconX size={18} />
              </button>

              {/* 完整交互界面内容 */}
              <div class="w-full flex-1 min-h-0 pt-2">
                {props.children}
              </div>
            </div>
          </div>
        </Show>
      </Show>
    </Portal>
  );
}

export default EpubDialog;