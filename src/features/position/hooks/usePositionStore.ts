import * as Tone from "tone";
import { create } from "zustand";

import { START_POSITION } from "@/consts";

interface PositionStore {
  position: Tone.Unit.Time;
  stopPosition: Tone.Unit.Time;

  setPosition: (newPosition: Tone.Unit.Time) => void;
  setStopPosition: (newStopPosition: Tone.Unit.Time) => void;
}

const usePositionStore = create<PositionStore>((set) => ({
  position: START_POSITION as Tone.Unit.Time,
  stopPosition: START_POSITION as Tone.Unit.Time,

  setPosition: (newPosition: Tone.Unit.Time) => set({ position: newPosition }),
  setStopPosition: (newStopPosition: Tone.Unit.Time) =>
    set({ stopPosition: newStopPosition }),
}));

export default usePositionStore;
