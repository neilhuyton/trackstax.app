import { useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { useSampler } from "./useSampler";
import useStackIdStore from "../../stacks/hooks/useStackIdStore";
import { useSamplerPatternRead } from "./useSamplerPatternRead";

export function useSamplerPattern() {
  const stackId = useStackIdStore((state) => state.stackId);
  const { pattern } = useSamplerPatternRead(stackId);
  const { trigger, isLoaded } = useSampler("/samples/43.wav");

  const eventIdsRef = useRef<number[]>([]);

  const schedulePattern = useCallback(() => {
    const transport = Tone.getTransport();

    eventIdsRef.current.forEach((id) => transport.clear(id));
    eventIdsRef.current = [];

    if (!pattern || pattern.length === 0) return;

    pattern.forEach((event) => {
      const id = transport.schedule((time: number) => {
        trigger(event.note, event.duration || "16n", time);
      }, event.time);

      eventIdsRef.current.push(id);
    });
  }, [pattern, trigger]);

  useEffect(() => {
    if (!isLoaded) return;

    schedulePattern();
  }, [isLoaded, schedulePattern]);

  useEffect(() => {
    const transport = Tone.getTransport();

    const handleStart = () => {
      schedulePattern();
    };

    const handleStopOrPause = () => {
      eventIdsRef.current.forEach((id) => transport.clear(id));
      eventIdsRef.current = [];
    };

    transport.on("start", handleStart);
    transport.on("stop", handleStopOrPause);
    transport.on("pause", handleStopOrPause);

    return () => {
      transport.off("start", handleStart);
      transport.off("stop", handleStopOrPause);
      transport.off("pause", handleStopOrPause);
      handleStopOrPause();
    };
  }, [schedulePattern]);

  return { isLoaded };
}
