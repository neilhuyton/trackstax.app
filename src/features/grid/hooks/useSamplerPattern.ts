import { useRef, useCallback, useEffect } from "react";
import * as Tone from "tone";
import type { SamplerEvent } from "@/types";
import { getCurrentTransportBar } from "@/features/utils/getCurrentBar";

type Duration = {
  start: number;
  stop: number;
};

const globalSamplerEventMapRef = { current: new Map<string, number[]>() };

export function useSamplerPattern() {
  const eventMapRef = useRef<Map<string, number[]>>(
    globalSamplerEventMapRef.current,
  );

  const clearSamplerTrackEvents = useCallback((trackId: string) => {
    const eventIds = eventMapRef.current.get(trackId) || [];
    const transport = Tone.getTransport();
    eventIds.forEach((id) => {
      try {
        transport.clear(id);
      } catch {
        // fail silently
      }
    });
    eventMapRef.current.delete(trackId);
  }, []);

  const clearAllScheduledEvents = useCallback(() => {
    const transport = Tone.getTransport();
    eventMapRef.current.forEach((eventIds) => {
      eventIds.forEach((id) => {
        try {
          transport.clear(id);
        } catch {
          // fail silently
        }
      });
    });
    eventMapRef.current.clear();
  }, []);

  const updateSamplerSchedule = useCallback(
    (
      trackId: string,
      pattern: SamplerEvent[],
      durations: Duration[],
      loopLength: number,
      trigger: (note?: string, duration?: string, time?: number) => void,
    ) => {
      if (!trigger || pattern.length === 0 || durations.length === 0) return;

      clearSamplerTrackEvents(trackId);

      const newEventIds: number[] = [];
      const transport = Tone.getTransport();
      const currentBar = getCurrentTransportBar();

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
            if (absoluteTimeInBars < currentBar) return;

            const whole = Math.floor(absoluteTimeInBars);
            const frac = absoluteTimeInBars - whole;
            const beats = Math.floor(frac * 4);
            const sixteenths = Math.floor((frac * 4 - beats) * 4);

            const scheduleTime = `${whole}:${beats}:${sixteenths}`;

            const id = transport.schedule((time: number) => {
              trigger(event.note, event.duration || "16n", time);
            }, scheduleTime);

            newEventIds.push(id);
          });
        }
      });

      eventMapRef.current.set(trackId, newEventIds);
    },
    [clearSamplerTrackEvents],
  );

  useEffect(() => {
    return clearAllScheduledEvents;
  }, [clearAllScheduledEvents]);

  return {
    schedulePatternForTrack: updateSamplerSchedule,
    clearSamplerTrackEvents,
    clearAllScheduledEvents,
  };
}

export const clearAllSamplerEvents = () => {
  const transport = Tone.getTransport();
  globalSamplerEventMapRef.current.forEach((eventIds) => {
    eventIds.forEach((id) => {
      try {
        transport.clear(id);
      } catch {
        // fail silently
      }
    });
  });
  globalSamplerEventMapRef.current.clear();
};
