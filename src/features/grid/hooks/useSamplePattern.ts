import { useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { useSampler } from "./useSampler";
import useTracksStore from "../../track/hooks/useTracksStore";
import type { SamplerEvent, Track } from "@/types";

type SamplerTrackMinimal = Track & {
  type: "sampler";
};

export function useSamplerPattern() {
  const { tracks } = useTracksStore();

  const samplerTracks = tracks.filter(
    (t): t is SamplerTrackMinimal => t.type === "sampler",
  );

  // Use the first sampler's sampleUrl (or fallback). In a full app you may want per-track samplers.
  const firstSamplerUrl = samplerTracks[0]?.samplerTrack?.sampleUrl ?? null;

  const { trigger, isLoaded } = useSampler(firstSamplerUrl);
  const eventIdsRef = useRef<number[]>([]);

  const clearAllScheduledEvents = useCallback(() => {
    const transport = Tone.getTransport();
    eventIdsRef.current.forEach((id) => {
      try {
        transport.clear(id);
      } catch {
        // ignore
      }
    });
    eventIdsRef.current = [];
  }, []);

  const scheduleAllPatterns = useCallback(() => {
    clearAllScheduledEvents();

    if (!isLoaded || samplerTracks.length === 0) return;

    samplerTracks.forEach((track) => {
      const pattern = track.samplerTrack?.pattern ?? [];

      pattern.forEach((event: SamplerEvent) => {
        const id = Tone.getTransport().schedule((time: number) => {
          trigger(event.note, event.duration || "16n", time);
        }, event.time);

        eventIdsRef.current.push(id);
      });
    });
  }, [samplerTracks, trigger, isLoaded, clearAllScheduledEvents]);

  useEffect(() => {
    if (isLoaded) {
      scheduleAllPatterns();
    } else {
      clearAllScheduledEvents();
    }
  }, [isLoaded, scheduleAllPatterns, clearAllScheduledEvents]);

  useEffect(() => {
    const transport = Tone.getTransport();

    const handleStart = () => {
      if (eventIdsRef.current.length === 0) {
        scheduleAllPatterns();
      }
    };

    const handleStopOrPause = () => {
      clearAllScheduledEvents();
    };

    transport.on("start", handleStart);
    transport.on("stop", handleStopOrPause);
    transport.on("pause", handleStopOrPause);

    return () => {
      transport.off("start", handleStart);
      transport.off("stop", handleStopOrPause);
      transport.off("pause", handleStopOrPause);
      clearAllScheduledEvents();
    };
  }, [scheduleAllPatterns, clearAllScheduledEvents]);

  useEffect(() => {
    return () => {
      clearAllScheduledEvents();
    };
  }, [clearAllScheduledEvents]);

  return { isLoaded };
}