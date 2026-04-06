import { useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { useSampler } from "./useSampler";
import useTracksStore from "../../track/hooks/useTracksStore";
import type { Track } from "@/types";

type SamplerEvent = {
  time: string | number;
  note: string;
  duration?: string;
};

type Duration = {
  start: number;
  stop: number;
};

type SamplerTrack = Track & {
  type: "sampler";
  samplerTrack?: {
    pattern: SamplerEvent[];
    sampleUrl?: string;
  };
  durations: Duration[];
  loopLength?: number;
};

export function useSamplerPattern() {
  const { tracks } = useTracksStore();

  const samplerTracks = tracks.filter(
    (t): t is SamplerTrack => t.type === "sampler",
  );

  const playableSamplerTracks = samplerTracks.filter(
    (track) => track.durations && track.durations.length > 0,
  );

  const firstSamplerUrl =
    playableSamplerTracks[0]?.samplerTrack?.sampleUrl ?? null;

  const { trigger, isLoaded } = useSampler(firstSamplerUrl);

  const eventIdsRef = useRef<number[]>([]);

  const clearAllScheduledEvents = useCallback(() => {
    const transport = Tone.getTransport();
    eventIdsRef.current.forEach((id) => {
      try {
        transport.clear(id);
      } catch {
        // empty catch
      }
    });
    eventIdsRef.current = [];
  }, []);

  const scheduleAllPatterns = useCallback(() => {
    clearAllScheduledEvents();

    if (!isLoaded || playableSamplerTracks.length === 0) return;

    const toTransportTime = (bars: number): string => {
      const whole = Math.floor(bars);
      const frac = bars - whole;
      const beats = Math.floor(frac * 4);
      const sixteenths = Math.floor((frac * 4 - beats) * 4);
      return `${whole}:${beats}:${sixteenths}`;
    };

    playableSamplerTracks.forEach((track) => {
      const pattern = track.samplerTrack?.pattern ?? [];
      if (pattern.length === 0) return;

      const loopLength = track.loopLength ?? 4;

      track.durations.forEach((duration) => {
        const { start, stop } = duration;

        for (
          let loopStartBar = start;
          loopStartBar < stop;
          loopStartBar += loopLength
        ) {
          const loopEndBar = Math.min(loopStartBar + loopLength, stop);

          pattern.forEach((event) => {
            let eventTime: number = 0;

            if (typeof event.time === "string") {
              if (event.time.includes(":")) {
                const parts = event.time.split(":");
                const bars = Number(parts[0] || 0);
                const beats = Number(parts[1] || 0);
                const sixteenths = Number(parts[2] || 0);
                eventTime = bars + beats / 4 + sixteenths / 16;
              } else {
                eventTime = Number(event.time);
              }
            } else {
              eventTime = Number(event.time);
            }

            if (isNaN(eventTime)) return;

            const absoluteTimeInBars = loopStartBar + eventTime;

            if (absoluteTimeInBars < loopEndBar) {
              const scheduleTime = toTransportTime(absoluteTimeInBars);

              const id = Tone.getTransport().schedule((time: number) => {
                trigger(event.note, event.duration || "16n", time);
              }, scheduleTime);

              eventIdsRef.current.push(id);
            }
          });
        }
      });
    });
  }, [playableSamplerTracks, trigger, isLoaded, clearAllScheduledEvents]);

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

    const handleStopOrPause = () => clearAllScheduledEvents();

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
    return () => clearAllScheduledEvents();
  }, [clearAllScheduledEvents]);

  return { isLoaded };
}
