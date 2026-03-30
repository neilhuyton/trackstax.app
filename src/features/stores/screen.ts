import { create } from "zustand";

interface MyStore {
  gridWidth: number;
  scrollLeft: number;
  trackListWidth: number;
  trackToolsWidth: number;
  isScrollGrid: boolean;
  scrollToPixel: number;
  isScrollToPixel: boolean;
  playheadPosition: number;
  isLoopReset: boolean;

  setGridWidth: (newGridWidth: number) => void;
  setScrollLeft: (newScrollLeft: number) => void;
  setTrackListWidth: (newTrackListWidth: number) => void;
  setTrackToolsWidth: (newTrackToolsWidth: number) => void;
  setIsScrollGrid: (newIsScrollGrid: boolean) => void;
  setScrollToPixel: (newScrollToPixel: number) => void;
  setIsScrollToPixel: (newIsScrollToPixel: boolean) => void;
  setPlayheadPosition: (newPlayHeadPosition: number) => void;
  setIsLoopReset: (newIsLoopReset: boolean) => void;
}

const useScreenStore = create<MyStore>((set) => ({
  gridWidth: 0,
  scrollLeft: 0,
  trackListWidth: 0,
  trackToolsWidth: 0,
  isScrollGrid: false,
  scrollToPixel: 0,
  isScrollToPixel: false,
  playheadPosition: 0,
  isLoopReset: false,

  setGridWidth: (newGridWidth: number) => set({ gridWidth: newGridWidth }),
  setScrollLeft: (newScrollLeft: number) => set({ scrollLeft: newScrollLeft }),
  setTrackListWidth: (newTrackListWidth: number) =>
    set({ trackListWidth: newTrackListWidth }),
  setTrackToolsWidth: (newTrackToolsWidth: number) =>
    set({ trackToolsWidth: newTrackToolsWidth }),
  setIsScrollGrid: (newIsScrollGrid: boolean) =>
    set({ isScrollGrid: newIsScrollGrid }),
  setScrollToPixel: (newScrollToPixel: number) =>
    set({ scrollToPixel: newScrollToPixel }),
  setIsScrollToPixel: (newIsScrollToPixel: boolean) =>
    set({ isScrollToPixel: newIsScrollToPixel }),
  setPlayheadPosition: (newPlayheadPosition: number) =>
    set({ playheadPosition: newPlayheadPosition }),
  setIsLoopReset: (newIsLoopReset: boolean) =>
    set({ isLoopReset: newIsLoopReset }),
}));

export default useScreenStore;
