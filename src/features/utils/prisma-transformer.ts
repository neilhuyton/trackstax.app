import type {
  Track,
  Duration,
  SamplerPattern,
  SamplerZone,
  NoteName,
} from "@/types";

export const toClientTrack = (serverData: unknown): Track => {
  if (!serverData || typeof serverData !== "object") {
    throw new Error("Invalid server track data");
  }

  const d = serverData as Record<string, unknown>;

  const durations: Duration[] = Array.isArray(d.durations)
    ? (d.durations as Duration[])
    : [];

  let samplerTrack: Track["samplerTrack"] = null;

  if (d.samplerTrack && typeof d.samplerTrack === "object") {
    const st = d.samplerTrack as Record<string, unknown>;

    const rawZones = Array.isArray(st.zones) ? st.zones : [];

    const zones: SamplerZone[] = rawZones
      .map((zone: unknown): SamplerZone | null => {
        if (!zone || typeof zone !== "object") return null;

        const z = zone as Record<string, unknown>;

        const id = typeof z.id === "string" ? z.id : "";
        const sampleUrl = typeof z.sampleUrl === "string" ? z.sampleUrl : "";
        const lowNote =
          typeof z.lowNote === "string" ? (z.lowNote as NoteName) : "C4";
        const highNote =
          typeof z.highNote === "string" ? (z.highNote as NoteName) : "C4";
        const rootNote =
          typeof z.rootNote === "string" ? (z.rootNote as NoteName) : "C4"; // fallback for old data

        if (!id || !sampleUrl) return null;

        return {
          id,
          sampleUrl,
          lowNote,
          highNote,
          rootNote,
        };
      })
      .filter((zone): zone is SamplerZone => zone !== null);

    samplerTrack = {
      pattern: Array.isArray(st.pattern) ? (st.pattern as SamplerPattern) : [],
      attackMs: typeof st.attackMs === "number" ? st.attackMs : 10,
      releaseMs: typeof st.releaseMs === "number" ? st.releaseMs : 200,
      zones,
    };
  }

  return {
    id: typeof d.id === "string" ? d.id : "",
    type: (d.type as "audio" | "sampler") ?? "audio",
    label: typeof d.label === "string" ? d.label : "",
    color: typeof d.color === "string" ? d.color : "",
    sortOrder: typeof d.sortOrder === "number" ? d.sortOrder : 0,
    isMute: Boolean(d.isMute),
    isSolo: Boolean(d.isSolo),
    isFavourite: Boolean(d.isFavourite),
    volumePercent: typeof d.volumePercent === "number" ? d.volumePercent : 75,
    low: typeof d.low === "number" ? d.low : 0,
    mid: typeof d.mid === "number" ? d.mid : 0,
    high: typeof d.high === "number" ? d.high : 0,
    lowFrequency: typeof d.lowFrequency === "number" ? d.lowFrequency : 0,
    highFrequency: typeof d.highFrequency === "number" ? d.highFrequency : 0,
    isBypass: Boolean(d.isBypass),
    loopLength: typeof d.loopLength === "number" ? d.loopLength : 4,
    stackId: typeof d.stackId === "string" ? d.stackId : "",
    createdAt: typeof d.createdAt === "string" ? d.createdAt : "",
    updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : "",

    durations,
    audioTrack: (d.audioTrack as Track["audioTrack"]) ?? null,
    samplerTrack,
  };
};

export const toClientTracks = (data: unknown[]): Track[] =>
  data.map(toClientTrack);
