import { create } from "zustand";

type ModalCallback = (() => void | Promise<void>) | null;

interface ModalOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: ModalCallback;
  onCancel?: ModalCallback;
}

interface ModalState {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: ModalCallback;
  onCancel: ModalCallback;
}

interface ModalStore extends ModalState {
  open: (options?: ModalOptions) => void;
  close: () => void;
}

const initialState: ModalState = {
  visible: false,
  title: "",
  message: "",
  confirmText: "确定",
  cancelText: "取消",
  onConfirm: null,
  onCancel: null,
};


export const useGlobalModal = create<ModalStore>((set) => ({
  ...initialState,
  open: (options: ModalOptions = {}) =>
    set({
      ...initialState,
      ...options,
      visible: true,
      confirmText: options.confirmText ?? "确定",
      cancelText: options.cancelText ?? "取消",
    }),


  close: () => set(initialState),

}));