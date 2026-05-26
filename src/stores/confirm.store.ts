import { create } from "zustand";

type ConfirmOptions = {
  title?: string;
  message?: string;
  type?: "default" | "danger";
  onConfirm?: () => void | Promise<void>;
};

type ConfirmState = {
  visible: boolean;
  options: ConfirmOptions;
  show: (opts: ConfirmOptions) => void;
  hide: () => void;
};

export const useConfirmStore = create<ConfirmState>((set) => ({
  visible: false,
  options: {},

  show: (opts) =>
    set({
      visible: true,
      options: opts,
    }),

  hide: () =>
    set({
      visible: false,
      options: {},
    }),
}));
