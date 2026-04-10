// src/features/utils/prisma-transformer.ts
import type { Track, Duration, SamplerPattern } from "@/types";

export const toClientTrack = (serverData: unknown): Track => {
  if (!serverData || typeof serverData !== "object") {
    throw new Error("Invalid server track data");
  }

  const d = serverData as Record<string, unknown>;

  // Only sanitize the two JSON fields that cause recursion
  const durations: Duration[] = Array.isArray(d.durations)
    ? (d.durations as Duration[])
    : [];

  let samplerTrack: Track["samplerTrack"] = null;
  if (d.samplerTrack && typeof d.samplerTrack === "object") {
    const st = d.samplerTrack as Record<string, unknown>;
    samplerTrack = {
      pattern: Array.isArray(st.pattern) ? (st.pattern as SamplerPattern) : [],
      sampleUrl: typeof st.sampleUrl === "string" ? st.sampleUrl : null,
      attackMs: typeof st.attackMs === "number" ? st.attackMs : 10,
      releaseMs: typeof st.releaseMs === "number" ? st.releaseMs : 200,
    };
  }

  return {
    id: d.id as string,
    type: (d.type as "audio" | "sampler") ?? "audio",
    label: d.label as string,
    color: d.color as string,
    sortOrder: d.sortOrder as number,
    isMute: Boolean(d.isMute),
    isSolo: Boolean(d.isSolo),
    isFavourite: Boolean(d.isFavourite),
    volumePercent: (d.volumePercent as number) ?? 75,
    low: (d.low as number) ?? 0,
    mid: (d.mid as number) ?? 0,
    high: (d.high as number) ?? 0,
    lowFrequency: (d.lowFrequency as number) ?? 0,
    highFrequency: (d.highFrequency as number) ?? 0,
    isBypass: Boolean(d.isBypass),
    loopLength: (d.loopLength as number) ?? 4,
    stackId: d.stackId as string,
    createdAt: d.createdAt as string,
    updatedAt: d.updatedAt as string,

    durations,
    audioTrack: (d.audioTrack as Track["audioTrack"]) ?? null,
    samplerTrack,
  };
};

export const toClientTracks = (data: unknown[]): Track[] =>
  data.map(toClientTrack);
