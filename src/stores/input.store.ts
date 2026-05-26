import { create } from "zustand";

type InputOptions = {
  title?: string;
  placeholder?: string;
  onConfirm?: (value: string) => void | Promise<void>;
};

type InputState = {
  visible: boolean;
  options: InputOptions;

  showInput: (opts: InputOptions) => void;
  hideInput: () => void;
};

export const useInputModalStore = create<InputState>((set) => ({
  visible: false,
  options: {},

  showInput: (opts) =>
    set({
      visible: true,
      options: opts,
    }),

  hideInput: () =>
    set({
      visible: false,
      options: {},
    }),
}));
