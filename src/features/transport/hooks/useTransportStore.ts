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
  masterVolumePercent: number;
  masterMuted: boolean;
  isLoop: boolean;
  loopStart: number;
  loopEnd: number;
  samplerRescheduleKey: number;

  setIsPlay: (newIsPlay: boolean) => void;
  setIsForward: (newIsForward: boolean) => void;
  setIsBackward: (newIsBackward: boolean) => void;
  setIsRecord: (newIsRecord: boolean) => void;
  setIsReset: (newIsReset: boolean) => void;
  setIsTempo: (newIsTempo: boolean) => void;
  setRecordStart: (newRecordStart: number) => void;
  setRecordEnd: (newRecordEnd: number) => void;
  setMasterVolumePercent: (percent: number) => void;
  setMasterMute: (mute: boolean) => void;
  setIsLoop: (isLoop: boolean) => void;
  setLoopStart: (loopStart: number) => void;
  setLoopEnd: (loopEnd: number) => void;
  incrementSamplerRescheduleKey: () => void;
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
  masterVolumePercent: 100,
  masterMuted: false,
  isLoop: false,
  loopStart: 0,
  loopEnd: 0,
  samplerRescheduleKey: 0,

  setIsPlay: (newIsPlay: boolean) => set({ isPlay: newIsPlay }),
  setIsForward: (newIsForward: boolean) => set({ isForward: newIsForward }),
  setIsBackward: (newIsBackward: boolean) => set({ isBackward: newIsBackward }),
  setIsRecord: (newIsRecord: boolean) => set({ isRecord: newIsRecord }),
  setIsReset: (newIsReset: boolean) => set({ isReset: newIsReset }),
  setIsTempo: (newIsTempo: boolean) => set({ isTempo: newIsTempo }),
  setRecordStart: (newRecordStart: number) =>
    set({ recordStart: newRecordStart }),
  setRecordEnd: (newRecordEnd: number) => set({ recordEnd: newRecordEnd }),
  setMasterVolumePercent: (percent: number) =>
    set({ masterVolumePercent: Math.max(0, Math.min(100, percent)) }),
  setMasterMute: (mute: boolean) => set({ masterMuted: mute }),
  setIsLoop: (isLoop: boolean) => set({ isLoop }),
  setLoopStart: (loopStart: number) => set({ loopStart }),
  setLoopEnd: (loopEnd: number) => set({ loopEnd }),
  incrementSamplerRescheduleKey: () =>
    set((state) => ({ samplerRescheduleKey: state.samplerRescheduleKey + 1 })),
}));

export default useTransportStore;
