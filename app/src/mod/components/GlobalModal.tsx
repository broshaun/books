import { Show } from "solid-js";
import Dialog from "corvu/dialog";
import { useGlobalModal } from "@/hooks/useGlobalModal";

export function GlobalModal() {
  const { state, close } = useGlobalModal();

  const handleAction = async (action?: () => void | Promise<void>) => {
    try {
      await action?.();
    } finally {
      close();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (state.onCancel) {
        handleAction(state.onCancel);
      } else {
        close();
      }
    }
  };

  return (
    <Dialog open={state.visible} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* 遮罩层 */}
        <Dialog.Overlay class="fixed inset-0 z-50 bg-black/35 backdrop-blur-[14px] transition-opacity duration-200 data-closed:opacity-0 data-open:opacity-100" />
        
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          {/* 弹窗内容主体：应用全局表面背景、边框、立体大阴影与平滑过渡 */}
          <Dialog.Content 
            class="pointer-events-auto w-[320px] max-w-full rounded-xl border overflow-hidden flex flex-col transition-all duration-300 data-closed:scale-95 data-closed:opacity-0 data-open:scale-100 data-open:opacity-100"
            style={{
              "background-color": "var(--bg-surface)",
              "border-color": "var(--border-color)",
              "box-shadow": "var(--shadow-lg)",
              "color": "var(--text-main)",
            }}
          >
            
            {/* 标题栏 */}
            <Show when={state.title}>
              <div 
                class="py-2.5 px-4 border-b text-center"
                style={{
                  /* 💡 标题栏背景采用 --bg-main，与 --bg-surface 弹窗主体形成细腻层叠 */
                  "background-color": "var(--bg-main)",
                  "border-color": "var(--border-color)",
                }}
              >
                <Dialog.Label 
                  class="text-base font-semibold" 
                  style={{ color: "var(--text-title)" }}
                >
                  {state.title}
                </Dialog.Label>
              </div>
            </Show>

            {/* 消息内容区 */}
            <Show when={state.message}>
              <div class="px-4 py-4 text-center">
                <p class="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {state.message}
                </p>
              </div>
            </Show>

            {/* 底部按钮区 */}
            <div class="flex items-center justify-center gap-3 px-4 pb-4 pt-1">
              {/* 取消按钮 */}
              <Show when={state.onCancel}>
                <button
                  type="button"
                  onClick={() => handleAction(state.onCancel)}
                  class="w-[100px] h-[32px] rounded-md text-xs font-medium border transition-colors cursor-pointer select-none"
                  style={{
                    "background-color": "var(--bg-surface)",
                    "border-color": "var(--border-color)",
                    "color": "var(--text-main)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-button-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
                >
                  {state.cancelText}
                </button>
              </Show>

              {/* 确认按钮 */}
              <button
                type="button"
                onClick={() => handleAction(state.onConfirm)}
                class="w-[100px] h-[32px] rounded-md text-xs font-medium text-white transition-opacity hover:opacity-90 cursor-pointer select-none shadow-xs"
                style={{
                  /* 💡 替换原先未定义的 --accent-color 为全新的 --text-link-color */
                  "background-color": "var(--text-link-color)",
                }}
              >
                {state.confirmText}
              </button>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
}

export default GlobalModal;