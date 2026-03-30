import * as Tone from "tone";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "server/trpc";

export type RouterOutput = inferRouterOutputs<AppRouter>;

// Derived from Prisma via tRPC (includes relations if your router includes them)
export type Screen = RouterOutput["screen"]["getByStackId"];
export type Track = RouterOutput["track"]["getByStackId"][number];
export type Stack = RouterOutput["stack"]["getById"];

// Prisma-derived Duration (best practice)
export type Duration = RouterOutput["track"]["getByStackId"][number]["durations"][number];

// Optional: If you want a version without the relation back to Track (for utility functions)
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
