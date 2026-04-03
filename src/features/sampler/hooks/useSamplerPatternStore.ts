import { create } from "zustand";
import type { SamplerEvent } from "@/types";

interface SamplerPatternStore {
  patterns: Record<string, SamplerEvent[]>;
  setPattern: (trackId: string, pattern: SamplerEvent[]) => void;
  addNote: (
    trackId: string,
    time: string,
    note: string,
    duration?: string,
  ) => void;
  removeNote: (trackId: string, time: string, note: string) => void;
}

export const useSamplerPatternStore = create<SamplerPatternStore>((set) => ({
  patterns: {},

  setPattern: (trackId, pattern) =>
    set((state) => ({
      patterns: { ...state.patterns, [trackId]: pattern },
    })),

  addNote: (trackId, time, note, duration = "16n") =>
    set((state) => {
      const current = state.patterns[trackId] || [];

      const alreadyExists = current.some(
        (p) => p.time === time && p.note === note,
      );

      if (alreadyExists) return state;

      const newEvent: SamplerEvent = {
        time,
        note: note as SamplerEvent["note"],
        duration,
      };

      const newPattern = [...current, newEvent].sort((a, b) => {
        const [barA, beatA, sixteenthA] = a.time.split(":").map(Number);
        const [barB, beatB, sixteenthB] = b.time.split(":").map(Number);
        return barA - barB || beatA - beatB || sixteenthA - sixteenthB;
      });

      return {
        patterns: { ...state.patterns, [trackId]: newPattern },
      };
    }),

  removeNote: (trackId, time, note) =>
    set((state) => {
      const current = state.patterns[trackId] || [];

      const newPattern = current.filter(
        (p) => !(p.time === time && p.note === note),
      );

      return {
        patterns: { ...state.patterns, [trackId]: newPattern },
      };
    }),
}));
