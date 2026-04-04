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

  const { trigger, isLoaded } = useSampler("/samples/43.wav");
  const eventIdsRef = useRef<number[]>([]);

  const clearAllScheduledEvents = useCallback(() => {
    const transport = Tone.getTransport();
    eventIdsRef.current.forEach((id) => {
      try {
        transport.clear(id);
      } catch {
        // ignore if already cleared
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

  // Re-schedule when patterns change or sampler is loaded
  useEffect(() => {
    if (isLoaded) {
      scheduleAllPatterns();
    } else {
      clearAllScheduledEvents();
    }
  }, [isLoaded, scheduleAllPatterns, clearAllScheduledEvents]);

  // Transport event listeners
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllScheduledEvents();
    };
  }, [clearAllScheduledEvents]);

  return { isLoaded };
}
