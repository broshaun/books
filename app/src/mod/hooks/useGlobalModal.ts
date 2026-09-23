import { createStore } from "solid-js/store";

export interface ModalOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}

interface ModalState extends ModalOptions {
  visible: boolean;
}

const initialState: ModalState = {
  visible: false,
  title: undefined,
  message: undefined,
  confirmText: "确认",
  cancelText: "取消",
  onConfirm: undefined,
  onCancel: undefined,
};

const [state, setState] = createStore<ModalState>({ ...initialState });

export function useGlobalModal() {
  const open = (options: ModalOptions) => {
    // 先恢复默认值再覆盖新配置，彻底解决残留问题
    setState({
      ...initialState,
      visible: true,
      ...options,
    });
  };

  const close = () => setState("visible", false);

  return { state, open, close };
}