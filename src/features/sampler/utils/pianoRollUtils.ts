import type { SamplerEvent, NoteName, Line } from "@/types";
import { NOTE_NAMES } from "@/types";
import * as Tone from "tone";
import usePositionStore from "@/features/position/hooks/usePositionStore";

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
  duration: string = "0:0:0",
): SamplerEvent[] => {
  const newEvent: SamplerEvent = {
    time,
    note: note as NoteName,
    duration,
  };

  const filtered = currentPattern.filter(
    (p) => !(p.time === time && p.note === note),
  );

  return sortPattern([...filtered, newEvent]);
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

export const getDurationInSteps = (duration: string): number => {
  const [bars = 0, beats = 0, sixteenths = 0] = duration.split(":").map(Number);
  const steps = bars * 16 + beats * 4 + sixteenths;
  return Math.max(0, steps);
};

export const eventToLine = (event: SamplerEvent, totalSteps: number): Line => {
  const [bar, beat, sixteenth] = event.time.split(":").map(Number);
  const startStep = bar * 16 + beat * 4 + sixteenth;
  const durationSteps = getDurationInSteps(event.duration);
  const endStep = Math.min(totalSteps - 1, startStep + durationSteps - 1);

  return {
    rowIndex: NOTE_NAMES.indexOf(event.note as NoteName),
    startStep: Math.max(0, startStep),
    endStep: Math.max(startStep, endStep),
  };
};

export const lineToEvent = (
  rowIndex: number,
  startStep: number,
  endStep: number,
): { time: string; note: string; duration: string } | null => {
  const note = NOTE_NAMES[rowIndex];
  if (!note) return null;

  if (startStep > endStep) return null;

  const bar = Math.floor(startStep / 16);
  const beat = Math.floor((startStep % 16) / 4);
  const sixteenth = startStep % 4;
  const time = `${bar}:${beat}:${sixteenth}`;

  const durationSteps = endStep - startStep + 1;
  const bars = Math.floor(durationSteps / 16);
  const remaining = durationSteps % 16;
  const beats = Math.floor(remaining / 4);
  const sixteenths = remaining % 4;

  const duration = `${bars}:${beats}:${sixteenths}`;

  return { time, note, duration };
};
