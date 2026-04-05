import * as Tone from "tone";
import { v4 as uuid } from "uuid";

import { COLORS } from "@/consts";
import type { Track, Duration, SamplerPattern } from "@/types";

const createClientAudioTrack = (
  filename: string,
  downloadUrl: string | null,
  duration: number = 0,
  loopLength: number = 1,
  sampleId: string | null = null,
) => {
  const now = new Date().toISOString();

  return {
    id: uuid(),
    filename,
    downloadUrl,
    loopLength,
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
      sorted.push({
        id: uuid(),
        start,
        stop,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
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
      sorted.push({
        id: uuid(),
        start: bar + 1,
        stop: span.stop,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
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
  stackId: string;
  createdAt: string;
  updatedAt: string;
  durations: Duration[];
  audioTrack: ReturnType<typeof createClientAudioTrack> | null;
  samplerTrack: { pattern: SamplerPattern; sampleUrl: string | null } | null;
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
    : 1;

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
            loopLength,
          )
        : null,
    samplerTrack: isSampler ? { pattern: [], sampleUrl: null } : null,
  };
};

type RawServerTrack = {
  id: string;
  type: string;
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
  stackId: string;
  createdAt: string;
  updatedAt: string;
  durations?: Array<{
    id: string;
    start: number;
    stop: number;
    createdAt: string;
    updatedAt: string;
  }>;
  audioTrack?: {
    id: string;
    filename: string;
    downloadUrl: string | null;
    loopLength: number;
    offset: number;
    duration: number;
    pitch: number;
    timestretch: number;
    fullDuration: number;
    sampleId: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  samplerTrack?: {
    pattern?: unknown;
    sampleUrl?: string | null;
  } | null;
};

export const toClientTrack = (serverTrack: RawServerTrack): Track => ({
  id: serverTrack.id,
  type: serverTrack.type as "audio" | "sampler",
  label: serverTrack.label,
  color: serverTrack.color,
  sortOrder: serverTrack.sortOrder,
  isMute: serverTrack.isMute,
  isSolo: serverTrack.isSolo,
  isFavourite: serverTrack.isFavourite,
  volumePercent: serverTrack.volumePercent,
  low: serverTrack.low,
  mid: serverTrack.mid,
  high: serverTrack.high,
  lowFrequency: serverTrack.lowFrequency,
  highFrequency: serverTrack.highFrequency,
  isBypass: serverTrack.isBypass,
  stackId: serverTrack.stackId,
  createdAt: serverTrack.createdAt,
  updatedAt: serverTrack.updatedAt,
  durations: serverTrack.durations ?? [],
  audioTrack: serverTrack.audioTrack ?? null,
  samplerTrack: serverTrack.samplerTrack
    ? {
        pattern: Array.isArray(serverTrack.samplerTrack.pattern)
          ? (serverTrack.samplerTrack.pattern as SamplerPattern)
          : [],
        sampleUrl: serverTrack.samplerTrack.sampleUrl ?? null,
      }
    : null,
});

export const toClientTracks = (serverTracks: RawServerTrack[]): Track[] =>
  serverTracks.map(toClientTrack);

export const buildClientTrackFromServer = (
  baseTrack: CreateNewTrackInput,
  createdTrack: RawServerTrack,
  filename: string,
  downloadUrl: string,
  duration: number,
  loopLength: number,
): Track => {
  const audioTrack =
    createdTrack.audioTrack ??
    createClientAudioTrack(filename, downloadUrl, duration, loopLength);

  return {
    id: createdTrack.id,
    type: baseTrack.type,
    label: baseTrack.label,
    color: baseTrack.color,
    sortOrder: baseTrack.sortOrder,
    stackId: baseTrack.stackId,
    createdAt: baseTrack.createdAt,
    updatedAt: baseTrack.updatedAt,
    durations: createdTrack.durations ?? [],
    audioTrack,
    samplerTrack: baseTrack.samplerTrack ?? { pattern: [], sampleUrl: null },
    isMute: createdTrack.isMute ?? false,
    isSolo: createdTrack.isSolo ?? false,
    isFavourite: createdTrack.isFavourite ?? false,
    volumePercent: createdTrack.volumePercent ?? 75,
    low: createdTrack.low ?? 0,
    mid: createdTrack.mid ?? 0,
    high: createdTrack.high ?? 0,
    lowFrequency: createdTrack.lowFrequency ?? 0,
    highFrequency: createdTrack.highFrequency ?? 0,
    isBypass: createdTrack.isBypass ?? false,
  };
};
