import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useSampler } from "./useSampler";

type SamplerEvent = {
  time: string;
  note: string;
  duration?: string;
};

export function useSamplerPattern(pattern: SamplerEvent[]) {
  const { trigger, isLoaded } = useSampler("/samples/43.wav");
  const eventIdsRef = useRef<number[]>([]);

  const schedulePattern = () => {
    eventIdsRef.current.forEach((id) => Tone.getTransport().clear(id));
    eventIdsRef.current = [];

    if (!pattern) return;

    pattern.forEach((event) => {
      const id = Tone.getTransport().schedule((time: number) => {
        trigger(event.note, event.duration || "16n", time);
      }, event.time);
      eventIdsRef.current.push(id);
    });
  };

  useEffect(() => {
    if (!isLoaded || !pattern || pattern.length === 0) return;
    schedulePattern();
  }, [isLoaded, trigger, pattern]);

  useEffect(() => {
    const handleStart = () => schedulePattern();

    const handleStopOrPause = () => {
      eventIdsRef.current.forEach((id) => Tone.getTransport().clear(id));
      eventIdsRef.current = [];
    };

    const transport = Tone.getTransport();
    transport.on("start", handleStart);
    transport.on("stop", handleStopOrPause);
    transport.on("pause", handleStopOrPause);

    return () => {
      transport.off("start", handleStart);
      transport.off("stop", handleStopOrPause);
      transport.off("pause", handleStopOrPause);
      handleStopOrPause();
    };
  }, [isLoaded, trigger, pattern]);

  return { isLoaded };
}
