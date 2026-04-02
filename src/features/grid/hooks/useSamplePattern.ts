import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useSampler } from "./useSampler";

type SamplerEvent = {
  time: string;
  note: string;
  duration?: string;
};

export function useSamplerPattern(pattern: SamplerEvent[]) {
  const { trigger, isLoaded, error } = useSampler("/samples/43.wav");
  const eventIdsRef = useRef<number[]>([]);

  const schedulePattern = () => {
    // Super aggressive cleanup to prevent overlaps/duplicates
    Tone.getTransport().cancel(0);
    eventIdsRef.current.forEach((id) => Tone.getTransport().clear(id));
    eventIdsRef.current = [];

    pattern.forEach((event) => {
      const id = Tone.getTransport().schedule((time: number) => {
        trigger(event.note, event.duration || "16n", time);
      }, event.time);
      eventIdsRef.current.push(id);
    });
  };

  // Schedule when sampler is ready
  useEffect(() => {
    if (!isLoaded || pattern.length === 0) return;
    schedulePattern();
  }, [isLoaded, trigger, pattern]);

  // Handle Transport lifecycle (Play / Stop / Pause)
  useEffect(() => {
    const handleStart = () => {
      schedulePattern();
    };

    const handleStopOrPause = () => {
      Tone.getTransport().cancel(0);
      eventIdsRef.current.forEach((id) => Tone.getTransport().clear(id));
      eventIdsRef.current = [];
    };

    Tone.getTransport().on("start", handleStart);
    Tone.getTransport().on("stop", handleStopOrPause);
    Tone.getTransport().on("pause", handleStopOrPause);

    return () => {
      Tone.getTransport().off("start", handleStart);
      Tone.getTransport().off("stop", handleStopOrPause);
      Tone.getTransport().off("pause", handleStopOrPause);
      handleStopOrPause();
    };
  }, [isLoaded, trigger, pattern]);

  return { isLoaded, error, patternLength: pattern.length };
}
