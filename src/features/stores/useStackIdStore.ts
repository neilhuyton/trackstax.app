import { create } from "zustand";

interface MyStore {
  stackId: string;
  setStackId: (newStackId: string) => void;
}

const useStackIdStore = create<MyStore>((set) => ({
  stackId: "",
  setStackId: (newStackId: string) => set({ stackId: newStackId }),
}));

export default useStackIdStore;
