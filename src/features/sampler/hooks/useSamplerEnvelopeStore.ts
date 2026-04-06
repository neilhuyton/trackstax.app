import { create } from "zustand";

interface SamplerEnvelopeStore {
  attackMs: number;
  releaseMs: number;
  setAttack: (value: number) => void;
  setRelease: (value: number) => void;
  initFromTrack: (attackMs: number, releaseMs: number) => void;
}

const useSamplerEnvelopeStore = create<SamplerEnvelopeStore>((set) => ({
  attackMs: 10,
  releaseMs: 200,

  initFromTrack: (attackMs: number, releaseMs: number) =>
    set({
      attackMs: Number.isFinite(attackMs) ? Math.max(0, attackMs) : 10,
      releaseMs: Number.isFinite(releaseMs) ? Math.max(0, releaseMs) : 200,
    }),

  setAttack: (value: number) => {
    const newValue = Number.isFinite(value) ? Math.max(0, value) : 10;
    set({ attackMs: newValue });
  },

  setRelease: (value: number) => {
    const newValue = Number.isFinite(value) ? Math.max(0, value) : 200;
    set({ releaseMs: newValue });
  },
}));

export default useSamplerEnvelopeStore;
