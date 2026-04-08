import { useEffect } from "react";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import type { SamplerEvent } from "@/types";
import { useSamplerPattern } from "./hooks/useSamplerPattern";
import { useSampler } from "./hooks/useSampler";

type Props = {
  trackId: string;
};

export default function SamplerInstance({ trackId }: Props) {
  const { tracks } = useTracksStore();
  const { schedulePatternForTrack } = useSamplerPattern();

  const track = tracks.find((t) => t.id === trackId);

  const sampleUrl = track?.samplerTrack?.sampleUrl ?? null;
  const { trigger } = useSampler(trackId, sampleUrl);

  useEffect(() => {
    if (!track || !trigger) return;

    const pattern: SamplerEvent[] = track.samplerTrack?.pattern ?? [];
    const durations = track.durations ?? [];
    const loopLength = track.loopLength ?? 4;

    schedulePatternForTrack(trackId, pattern, durations, loopLength, trigger);
  }, [track, trigger, trackId, schedulePatternForTrack]);

  return null;
}
