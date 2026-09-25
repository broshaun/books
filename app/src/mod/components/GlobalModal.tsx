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
        <Dialog.Overlay class="fixed inset-0 z-50 bg-black/35 backdrop-blur-[14px] transition-opacity duration-200 data-closed:opacity-0 data-open:opacity-100" />
        
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <Dialog.Content class="pointer-events-auto w-[320px] max-w-full bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden flex flex-col transition-all duration-200 data-closed:scale-95 data-closed:opacity-0 data-open:scale-100 data-open:opacity-100">
            
            <Show when={state.title}>
              <div class="py-2.5 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-center">
                <Dialog.Label class="text-base font-semibold text-slate-800 dark:text-slate-100">
                  {state.title}
                </Dialog.Label>
              </div>
            </Show>

            <Show when={state.message}>
              <div class="px-4 py-4 text-center">
                <p class="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {state.message}
                </p>
              </div>
            </Show>

            <div class="flex items-center justify-center gap-3 px-4 pb-4 pt-1">
              <Show when={state.onCancel}>
                <button
                  type="button"
                  onClick={() => handleAction(state.onCancel)}
                  class="w-[100px] h-[32px] rounded-md text-xs font-medium border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  {state.cancelText}
                </button>
              </Show>

              <button
                type="button"
                onClick={() => handleAction(state.onConfirm)}
                class="w-[100px] h-[32px] rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
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