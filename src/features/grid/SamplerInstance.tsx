import { useEffect, useRef } from "react";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import type { SamplerEvent } from "@/types";
import { useSampler } from "./hooks/useSampler";
import { useSamplerPattern } from "./hooks/useSamplerPattern";

type Props = {
  trackId: string;
};

export default function SamplerInstance({ trackId }: Props) {
  const { tracks, lastClickedBar } = useTracksStore();
  const track = tracks.find((t) => t.id === trackId);
  const sampleUrl = track?.samplerTrack?.sampleUrl ?? null;
  const { trigger } = useSampler(trackId, sampleUrl);
  const { schedulePatternForTrack } = useSamplerPattern();

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
      schedulePatternForTrack(
        track.id,
        pattern,
        durations,
        loopLength,
        trigger,
        lastClickedBar ?? undefined,
      );

      prevPatternRef.current = [...pattern];
      prevDurationsRef.current = [...durations];
      prevTriggerRef.current = trigger;
    }
  }, [track, trigger, schedulePatternForTrack, lastClickedBar]);

  return null;
}
