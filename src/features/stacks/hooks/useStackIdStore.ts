import { create } from "zustand";

interface StackIdStore {
  stackId: string;
  setStackId: (newStackId: string) => void;
}

const useStackIdStore = create<StackIdStore>((set) => ({
  stackId: "",
  setStackId: (newStackId: string) => set({ stackId: newStackId }),
}));

export default useStackIdStore;
