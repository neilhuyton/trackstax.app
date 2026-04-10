import { useEffect, useRef } from "react";
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

  const prevTriggerRef = useRef<
    ((note?: string, duration?: string, time?: number) => void) | null
  >(null);
  const prevPatternRef = useRef<SamplerEvent[]>([]);
  const prevDurationsRef = useRef<{ start: number; stop: number }[]>([]);

  useEffect(() => {
    if (!track || !trigger) return;

    const pattern: SamplerEvent[] = track.samplerTrack?.pattern ?? [];
    const durations = track.durations ?? [];
    const loopLength = track.loopLength ?? 4;

    const patternChanged =
      JSON.stringify(pattern) !== JSON.stringify(prevPatternRef.current);
    const durationsChanged =
      JSON.stringify(durations) !== JSON.stringify(prevDurationsRef.current);
    const triggerChanged = trigger !== prevTriggerRef.current;

    if (patternChanged || durationsChanged || triggerChanged) {
      schedulePatternForTrack(trackId, pattern, durations, loopLength, trigger);

      prevPatternRef.current = [...pattern];
      prevDurationsRef.current = [...durations];
      prevTriggerRef.current = trigger;
    }
  }, [track, trigger, trackId, schedulePatternForTrack]);

  return null;
}
