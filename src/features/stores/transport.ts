import { create } from "zustand";

interface TransportStore {
  isPlay: boolean;
  isForward: boolean;
  isBackward: boolean;
  isRecord: boolean;
  isReset: boolean;
  isTempo: boolean;
  recordStart: number;
  recordEnd: number;

  setIsPlay: (newIsPlay: boolean) => void;
  setIsForward: (newIsForward: boolean) => void;
  setIsBackward: (newIsBackward: boolean) => void;
  setIsRecord: (newIsRecord: boolean) => void;
  setIsReset: (newIsReset: boolean) => void;
  setIsTempo: (newIsTempo: boolean) => void;
  setRecordStart: (newRecordStart: number) => void;
  setRecordEnd: (newRecordEnd: number) => void;
}

const useTransportStore = create<TransportStore>((set) => ({
  isPlay: false,
  isForward: false,
  isBackward: false,
  isRecord: false,
  isReset: false,
  isTempo: false,
  recordStart: 0,
  recordEnd: 0,

  setIsPlay: (newIsPlay: boolean) => set({ isPlay: newIsPlay }),
  setIsForward: (newIsForward: boolean) => set({ isForward: newIsForward }),
  setIsBackward: (newIsBackward: boolean) => set({ isBackward: newIsBackward }),
  setIsRecord: (newIsRecord: boolean) => set({ isRecord: newIsRecord }),
  setIsReset: (newIsReset: boolean) => set({ isReset: newIsReset }),
  setIsTempo: (newIsTempo: boolean) => set({ isTempo: newIsTempo }),
  setRecordStart: (newRecordStart: number) =>
    set({ recordStart: newRecordStart }),
  setRecordEnd: (newRecordEnd: number) => set({ recordEnd: newRecordEnd }),
}));

export default useTransportStore;
