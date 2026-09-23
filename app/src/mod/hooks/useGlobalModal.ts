import { createStore } from "solid-js/store";

export interface ModalOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}

// 模块级全局响应式 Store
const [state, setState] = createStore<ModalOptions & { visible: boolean }>({
  visible: false,
  confirmText: "确认",
  cancelText: "取消",
});

export function useGlobalModal() {
  const open = (options: ModalOptions) => {
    setState({
      visible: true,
      confirmText: "确认",
      cancelText: "取消",
      ...options,
    });
  };

  const close = () => setState("visible", false);

  return { state, open, close };
}