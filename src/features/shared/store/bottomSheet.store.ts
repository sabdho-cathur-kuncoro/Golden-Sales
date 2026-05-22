import React from "react";
import { create } from "zustand";

type BottomSheetStore = {
  isOpen: boolean;
  header: React.ReactNode | null;
  content: React.ReactNode | null;
  footer: React.ReactNode | null;
  snapPoints: (string | number)[];

  open: (
    content: React.ReactNode,
    snapPoints?: (string | number)[],
    header?: React.ReactNode,
    footer?: React.ReactNode
  ) => void;

  close: () => void;
};

export const useBottomSheetStore = create<BottomSheetStore>((set) => ({
  isOpen: false,
  header: null,
  content: null,
  footer: null,
  snapPoints: ["50%"],

  open: (content, snapPoints = ["50%"], header = null, footer = null) =>
    set({ isOpen: true, content, snapPoints, header, footer }),

  close: () =>
    set({
      isOpen: false,
      content: null,
      header: null,
      footer: null,
    }),
}));
