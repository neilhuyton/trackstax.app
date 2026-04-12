import * as Tone from "tone";
import { v4 as uuid } from "uuid";

import { COLORS } from "@/consts";
import type { Track, Duration, SamplerPattern } from "@/types";
import { toClientTrack } from "./prisma-transformer";

const createClientAudioTrack = (
  filename: string,
  downloadUrl: string | null,
  duration: number = 0,
  sampleId: string | null = null,
) => {
  const now = new Date().toISOString();

  return {
    id: uuid(),
    filename,
    downloadUrl,
    offset: 0,
    duration,
    pitch: 0,
    timestretch: 1,
    fullDuration: duration,
    sampleId,
    createdAt: now,
    updatedAt: now,
  };
};

const sortDurations = (durations: Duration[]): Duration[] =>
  [...durations].sort((a, b) => a.start - b.start);

const findAdjacentIndices = (
  durations: Duration[],
  bar: number,
): { prev: number; next: number } => ({
  prev: durations.findIndex((d) => d.stop === bar),
  next: durations.findIndex((d) => d.start === bar + 1),
});

export const modifyDurations = (
  durations: Duration[],
  bar: number,
  activate: boolean,
): Duration[] => {
  const sorted = sortDurations(durations);
  const spanIndex = sorted.findIndex((d) => d.start <= bar && d.stop > bar);

  if (activate) {
    const { prev, next } = findAdjacentIndices(sorted, bar);
    const start = bar;
    const stop = bar + 1;

    if (prev !== -1 && next !== -1) {
      const mergedStop = sorted[next].stop;
      sorted.splice(next, 1);
      sorted[prev] = { ...sorted[prev], stop: mergedStop };
    } else if (prev !== -1) {
      sorted[prev] = { ...sorted[prev], stop };
    } else if (next !== -1) {
      sorted[next] = { ...sorted[next], start };
    } else if (spanIndex === -1) {
      sorted.push({ id: uuid(), start, stop });
    }
  } else if (spanIndex !== -1) {
    const span = sorted[spanIndex];
    const spanLength = span.stop - span.start;

    if (spanLength === 1) {
      sorted.splice(spanIndex, 1);
    } else if (span.start === bar) {
      sorted[spanIndex] = { ...span, start: bar + 1 };
    } else if (span.stop === bar + 1) {
      sorted[spanIndex] = { ...span, stop: bar };
    } else {
      sorted[spanIndex] = { ...span, stop: bar };
      sorted.push({ id: uuid(), start: bar + 1, stop: span.stop });
    }
  }

  return sorted;
};

export const sanitiseDurations = (
  durations: Duration[],
  selectedBar: number,
  isActive: boolean,
): Duration[] => modifyDurations(durations, selectedBar, !isActive);

export const getIsActive = (bar: number, track: Track): boolean =>
  track.durations.some((item) => item.start <= bar && item.stop > bar);

export const updateTrackDurations = (
  track: Track,
  currentBar: number,
  isActive: boolean,
): Track => ({
  ...track,
  durations: sanitiseDurations(track.durations, currentBar, isActive),
});

const DEFAULT_SAMPLER_TRACK = {
  pattern: [] as SamplerPattern,
  // sampleUrl: null as string | null,
  attackMs: 10,
  releaseMs: 200,
} as const;

export type CreateNewTrackInput = {
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
  audioTrack: ReturnType<typeof createClientAudioTrack> | null;
  samplerTrack: typeof DEFAULT_SAMPLER_TRACK | null;
};

export const createNewTrack = (
  file: File | null,
  downloadUrl: string | null,
  tracks: Track[],
  stack: { id: string },
  result?: AudioBuffer,
  isSampler: boolean = false,
): CreateNewTrackInput => {
  const [lastTrack] = tracks.slice(-1);
  const lastColorIdx =
    lastTrack?.color && COLORS.some((c) => c.label === lastTrack.color)
      ? COLORS.findIndex((c) => c.label === lastTrack.color)
      : Math.floor(Math.random() * COLORS.length);

  const color = COLORS[(lastColorIdx + 1) % COLORS.length];
  const sortOrder = (lastTrack?.sortOrder || 0) + 1;
  const barDuration = Tone.TransportTime("1m").toSeconds();
  const loopLength = result
    ? Math.max(1, Math.round(result.duration / barDuration))
    : 4;

  const now = new Date().toISOString();

  return {
    type: isSampler ? "sampler" : "audio",
    label: isSampler ? `Sampler ${sortOrder}` : `Track ${sortOrder}`,
    color: color.label,
    sortOrder,
    isMute: false,
    isSolo: false,
    isFavourite: false,
    volumePercent: 75,
    low: 0,
    mid: 0,
    high: 0,
    lowFrequency: 0,
    highFrequency: 0,
    isBypass: true,
    loopLength,
    stackId: stack.id,
    createdAt: now,
    updatedAt: now,
    durations: [],
    audioTrack: isSampler
      ? null
      : file
        ? createClientAudioTrack(
            file.name,
            downloadUrl ?? null,
            result?.duration ?? 0,
          )
        : null,
    samplerTrack: isSampler ? DEFAULT_SAMPLER_TRACK : null,
  };
};


export const buildClientTrackFromServer = (
  created: unknown,
  filename: string,
  downloadUrl: string,
  duration: number,
): Track => {
  const serverTrack = toClientTrack(created);

  return {
    ...serverTrack,
    audioTrack:
      serverTrack.audioTrack ??
      createClientAudioTrack(filename, downloadUrl, duration),
  };
};
