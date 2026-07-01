import { create } from "zustand";

type PrePermissionOptions = {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => Promise<void> | void;
};

type State = {
  visible: boolean;
  options?: PrePermissionOptions;

  show: (opts: PrePermissionOptions) => void;
  hide: () => void;
};

export const usePrePermissionModal = create<State>((set) => ({
  visible: false,

  show: (opts) =>
    set({
      visible: true,
      options: opts,
    }),

  hide: () =>
    set({
      visible: false,
      options: undefined,
    }),
}));
