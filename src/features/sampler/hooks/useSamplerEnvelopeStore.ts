import { create } from "zustand";
import useTracksStore from "@/features/track/hooks/useTracksStore";

interface SamplerEnvelopeStore {
  attackMs: number;
  releaseMs: number;
  setAttack: (value: number) => void;
  setRelease: (value: number) => void;
}

export const useSamplerEnvelopeStore = create<SamplerEnvelopeStore>((set) => ({
  attackMs: 10,
  releaseMs: 200,

  setAttack: (value: number) => {
    const newValue = Number.isFinite(value) ? Math.max(0, value) : 10;
    set({ attackMs: newValue });
  },

  setRelease: (value: number) => {
    const newValue = Number.isFinite(value) ? Math.max(0, value) : 200;
    set({ releaseMs: newValue });
  },
}));

// Subscribe to tracks store and sync envelope values when sampler track data changes
useTracksStore.subscribe((state) => {
  const samplerTrack = state.tracks.find(
    (t) => t.type === "sampler",
  )?.samplerTrack;

  const attack =
    typeof samplerTrack?.attackMs === "number" && samplerTrack.attackMs >= 0
      ? samplerTrack.attackMs
      : 10;

  const release =
    typeof samplerTrack?.releaseMs === "number" && samplerTrack.releaseMs >= 0
      ? samplerTrack.releaseMs
      : 200;

  const current = useSamplerEnvelopeStore.getState();

  if (attack !== current.attackMs) {
    useSamplerEnvelopeStore.setState({ attackMs: attack });
  }
  if (release !== current.releaseMs) {
    useSamplerEnvelopeStore.setState({ releaseMs: release });
  }
});
