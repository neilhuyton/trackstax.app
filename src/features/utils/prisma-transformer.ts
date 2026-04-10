import type { Track, Duration, SamplerPattern } from "@/types";

export const toClientTrack = (prismaData: unknown): Track => {
  if (!prismaData || typeof prismaData !== "object") {
    throw new Error("Invalid track data received from server");
  }

  const data = prismaData as Record<string, unknown>;

  // Only sanitize JSON fields that cause infinite recursion with Prisma JsonValue
  const durations: Duration[] = Array.isArray(data.durations)
    ? (data.durations as Duration[])
    : [];

  let samplerTrack: Track["samplerTrack"] = null;

  if (data.samplerTrack && typeof data.samplerTrack === "object") {
    const st = data.samplerTrack as Record<string, unknown>;

    samplerTrack = {
      pattern: Array.isArray(st.pattern) ? (st.pattern as SamplerPattern) : [],
      sampleUrl: typeof st.sampleUrl === "string" ? st.sampleUrl : null,
      attackMs: typeof st.attackMs === "number" ? st.attackMs : 10,
      releaseMs: typeof st.releaseMs === "number" ? st.releaseMs : 200,
    };
  }

  return {
    id: data.id as string,
    type: (data.type as "audio" | "sampler") ?? "audio",
    label: data.label as string,
    color: data.color as string,
    sortOrder: data.sortOrder as number,
    isMute: Boolean(data.isMute),
    isSolo: Boolean(data.isSolo),
    isFavourite: Boolean(data.isFavourite),
    volumePercent: (data.volumePercent as number) ?? 75,
    low: (data.low as number) ?? 0,
    mid: (data.mid as number) ?? 0,
    high: (data.high as number) ?? 0,
    lowFrequency: (data.lowFrequency as number) ?? 0,
    highFrequency: (data.highFrequency as number) ?? 0,
    isBypass: Boolean(data.isBypass),
    loopLength: (data.loopLength as number) ?? 4,
    stackId: data.stackId as string,
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,

    durations,
    audioTrack: (data.audioTrack as Track["audioTrack"]) ?? null,
    samplerTrack,
  };
};

export const toClientTracks = (prismaTracks: unknown[]): Track[] =>
  prismaTracks.map(toClientTrack);
