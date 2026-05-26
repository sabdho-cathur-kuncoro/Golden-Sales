import { create } from "zustand";

type GlobalStore = {
  selectedAddress: any;

  setAddress: (param: any) => void;
};

export const useGlobalStore = create<GlobalStore>((set) => ({
  selectedAddress: null,
  setAddress: (param) => set({ selectedAddress: param }),
}));
