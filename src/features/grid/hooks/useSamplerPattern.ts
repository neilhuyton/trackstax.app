import { useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import type { SamplerEvent } from "@/types";

type Duration = {
  start: number;
  stop: number;
};

export function useSamplerPattern() {
  const eventIdsRef = useRef<number[]>([]);

  const clearAllScheduledEvents = useCallback(() => {
    const transport = Tone.getTransport();
    eventIdsRef.current.forEach((id) => {
      try {
        transport.clear(id);
      } catch {
        // ignore errors when clearing
      }
    });
    eventIdsRef.current = [];
  }, []);

  const schedulePatternForTrack = useCallback(
    (
      trackId: string,
      pattern: SamplerEvent[],
      durations: Duration[],
      loopLength: number,
      trigger: (note: string, duration?: string, time?: number) => void,
    ) => {
      if (!trigger || pattern.length === 0 || durations.length === 0) return;

      clearAllScheduledEvents();

      durations.forEach(({ start, stop }) => {
        for (let bar = start; bar < stop; bar += loopLength) {
          const endBar = Math.min(bar + loopLength, stop);

          pattern.forEach((event) => {
            let eventTime = 0;

            if (typeof event.time === "string" && event.time.includes(":")) {
              const parts = event.time.split(":");
              eventTime =
                Number(parts[0] || 0) +
                Number(parts[1] || 0) / 4 +
                Number(parts[2] || 0) / 16;
            } else {
              eventTime = Number(event.time);
            }

            if (isNaN(eventTime)) return;

            const absoluteTimeInBars = bar + eventTime;
            if (absoluteTimeInBars >= endBar) return;

            const whole = Math.floor(absoluteTimeInBars);
            const frac = absoluteTimeInBars - whole;
            const beats = Math.floor(frac * 4);
            const sixteenths = Math.floor((frac * 4 - beats) * 4);

            const scheduleTime = `${whole}:${beats}:${sixteenths}`;

            const id = Tone.getTransport().schedule((time: number) => {
              trigger(event.note, event.duration || "16n", time);
            }, scheduleTime);

            eventIdsRef.current.push(id);
          });
        }
      });
    },
    [clearAllScheduledEvents],
  );

  // Cleanup on unmount
  useEffect(() => {
    return clearAllScheduledEvents;
  }, [clearAllScheduledEvents]);

  return {
    schedulePatternForTrack,
    clearAllScheduledEvents,
  };
}
