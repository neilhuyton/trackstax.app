import * as Tone from "tone";
import usePositionStore from "@/features/position/hooks/usePositionStore";
import type { SamplerEvent, NoteName } from "@/types";
import { NOTE_NAMES } from "@/types";

export const sortPattern = (pattern: SamplerEvent[]): SamplerEvent[] => {
  return [...pattern].sort((a, b) => {
    const [barA, beatA, sixteenthA] = a.time.split(":").map(Number);
    const [barB, beatB, sixteenthB] = b.time.split(":").map(Number);
    return barA - barB || beatA - beatB || sixteenthA - sixteenthB;
  });
};

export const addNoteToPattern = (
  currentPattern: SamplerEvent[],
  time: string,
  note: string,
  duration: string = "16n",
): SamplerEvent[] => {
  const newEvent: SamplerEvent = {
    time,
    note: note as SamplerEvent["note"],
    duration,
  };

  return sortPattern([...currentPattern, newEvent]);
};

export const removeNoteFromPattern = (
  currentPattern: SamplerEvent[],
  time: string,
  note: string,
): SamplerEvent[] => {
  return currentPattern.filter((p) => !(p.time === time && p.note === note));
};

export const getCurrentBar = (): number => {
  const { position } = usePositionStore.getState();

  if (!position) return -1;

  try {
    const pos = Tone.getTransport().position as string;

    if (typeof pos === "string" && pos.includes(":")) {
      const [barsStr] = pos.split(":");
      const bar = parseInt(barsStr, 10);
      return isNaN(bar) ? -1 : bar;
    }

    const transportTime = Tone.TransportTime(position);
    const bbs = transportTime.toBarsBeatsSixteenths();
    const bar = parseInt(bbs.split(":")[0], 10);
    return isNaN(bar) ? -1 : bar;
  } catch {
    return -1;
  }
};

export const parseDurationToSteps = (duration: string): number => {
  switch (duration) {
    case "8n":
      return 2;
    case "4n":
      return 4;
    case "2n":
      return 8;
    case "1n":
      return 16;
    default:
      return 1; // 16n
  }
};

export const stepsToDuration = (steps: number): string => {
  if (steps >= 16) return "1n";
  if (steps >= 8) return "2n";
  if (steps >= 4) return "4n";
  if (steps >= 2) return "8n";
  return "16n";
};

export const eventToLine = (event: SamplerEvent, totalSteps: number) => {
  const [bar, beat, sixteenth] = event.time.split(":").map(Number);
  const startStep = bar * 16 + beat * 4 + sixteenth;
  const durationSteps = parseDurationToSteps(event.duration || "16n");
  const endStep = Math.min(totalSteps - 1, startStep + durationSteps - 1);

  return {
    rowIndex: NOTE_NAMES.indexOf(event.note as NoteName),
    startStep: Math.max(0, startStep),
    endStep,
  };
};

export const lineToEvent = (
  rowIndex: number,
  startStep: number,
  endStep: number,
): { time: string; note: string; duration: string } | null => {
  const note = NOTE_NAMES[rowIndex];
  if (!note) return null;

  if (startStep > endStep) {
    return null; // Will be handled as remove
  }

  const bar = Math.floor(startStep / 16);
  const beat = Math.floor((startStep % 16) / 4);
  const sixteenth = startStep % 4;
  const time = `${bar}:${beat}:${sixteenth}`;

  const durationSteps = endStep - startStep + 1;
  const duration = stepsToDuration(durationSteps);

  return { time, note, duration };
};
