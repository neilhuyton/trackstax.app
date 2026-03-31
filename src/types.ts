import * as Tone from "tone";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "server/trpc";

export type RouterOutput = inferRouterOutputs<AppRouter>;

export type Screen = RouterOutput["screen"]["getByStackId"];
export type Track = RouterOutput["track"]["getByStackId"][number];
export type Stack = RouterOutput["stack"]["getById"];
export type Duration = RouterOutput["track"]["getByStackId"][number]["durations"][number];
export type DurationInput = Omit<Duration, "track" | "trackId" | "createdAt" | "updatedAt">;

export interface AudioTrack {
  id: string;
  filename: string;
  downloadUrl?: string;
  loopLength: number;
  offset: number;
  duration: number;
  pitch: number;
  timestretch: number;
  fullDuration: number;
  track?: Track;
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