import { create } from "zustand";

type GridPageState = {
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: (totalBars: number) => void;
  reset: () => void;
};

export const useGridPageStore = create<GridPageState>((set, get) => ({
  currentPage: 0,
  pageSize: 8,
  setCurrentPage: (page) => set({ currentPage: Math.max(0, Math.floor(page)) }),
  goToNextPage: () => set((state) => ({ currentPage: state.currentPage + 1 })),
  goToPrevPage: () =>
    set((state) => ({ currentPage: Math.max(0, state.currentPage - 1) })),
  goToFirstPage: () => set({ currentPage: 0 }),
  goToLastPage: (totalBars) => {
    const { pageSize } = get();
    const maxPage = Math.max(0, Math.ceil(totalBars / pageSize) - 1);
    set({ currentPage: maxPage });
  },
  reset: () => set({ currentPage: 0 }),
}));
