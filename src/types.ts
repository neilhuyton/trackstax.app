import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../server/trpc";
import * as Tone from "tone";

export type RouterOutput = inferRouterOutputs<AppRouter>;

export const NOTE_NAMES = [
  "B5",
  "A#5",
  "A5",
  "G#5",
  "G5",
  "F#5",
  "F5",
  "E5",
  "D#5",
  "D5",
  "C#5",
  "C5",
  "B4",
  "A#4",
  "A4",
  "G#4",
  "G4",
  "F#4",
  "F4",
  "E4",
  "D#4",
  "D4",
  "C#4",
  "C4",
  "B3",
  "A#3",
  "A3",
  "G#3",
  "G3",
  "F#3",
  "F3",
  "E3",
  "D#3",
  "D3",
  "C#3",
  "C3",
  "B2",
  "A#2",
  "A2",
  "G#2",
  "G2",
  "F#2",
  "F2",
  "E2",
  "D#2",
  "D2",
  "C#2",
  "C2",
  "B1",
  "A#1",
  "A1",
  "G#1",
  "G1",
  "F#1",
  "F1",
  "E1",
  "D#1",
  "D1",
  "C#1",
  "C1",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export type Duration = {
  id?: string;
  start: number;
  stop: number;
};

export type SamplerEvent = {
  time: string;
  note: NoteName;
  duration: string;
};

export type SamplerPattern = SamplerEvent[];

// Clean client-facing Track type (no Prisma Json recursion)
export type Track = {
  id: string;
  type: "audio" | "sampler";
  label: string;
  color: string;
  sortOrder: number;
  isMute: boolean;
  isSolo: boolean;
  isFavourite: boolean;
  volumePercent: number;
  low: number;
  mid: number;
  high: number;
  lowFrequency: number;
  highFrequency: number;
  isBypass: boolean;
  loopLength: number;
  stackId: string;
  createdAt: string;
  updatedAt: string;

  durations: Duration[];

  audioTrack: {
    id: string;
    filename: string;
    downloadUrl: string | null;
    offset: number;
    duration: number;
    pitch: number;
    timestretch: number;
    fullDuration: number;
    sampleId: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;

  samplerTrack: {
    pattern: SamplerPattern;
    sampleUrl: string | null;
    attackMs: number;
    releaseMs: number;
  } | null;
};

export type Stack = RouterOutput["stack"]["getById"];
export type CreatedTrack = RouterOutput["track"]["create"];

export interface AudioTrack {
  id: string;
  filename: string;
  downloadUrl?: string;
  offset: number;
  duration: number;
  pitch: number;
  timestretch: number;
  fullDuration: number;
}

export type PlayerChannel = {
  track: Track;
  channel: Tone.Channel;
};

export type PlayerEQ = {
  track: Track;
  eq: Tone.EQ3;
};

export type Eq = {
  low: number;
  mid: number;
  high: number;
  lowFrequency: number;
  highFrequency: number;
  isBypass: boolean;
  track: Track;
};

export type SampleLibraryNavigation = {
  currentCollection: string | null;
  currentSubcategory: string | null;
  goToCollection: (collection: string) => void;
  goToSubcategory: (subcategory: string) => void;
  goBack: () => void;
};

export type Line = {
  rowIndex: number;
  startStep: number;
  endStep: number;
};
