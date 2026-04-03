// src/features/grid/hooks/useSampler.ts
import { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";

export function useSampler(sampleUrl: string) {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(false);
    setError(null);

    const sampler = new Tone.Sampler({
      urls: {
        C3: sampleUrl,
      },
      attack: 0,
      release: 1.2,
      curve: "linear",

      onload: () => {
        console.log("✅ Sampler loaded:", sampleUrl);
        setIsLoaded(true);
      },
      onerror: (err: unknown) => {
        console.error("❌ Sampler load error:", err);
        setError("Failed to load sample");
      },
    }).toDestination();

    samplerRef.current = sampler;

    return () => {
      sampler.dispose();
      samplerRef.current = null;
    };
  }, [sampleUrl]);

  const trigger = useCallback(
    (note: string = "C3", duration: string = "8n", time?: number) => {
      const sampler = samplerRef.current;
      if (!sampler || !sampler.loaded) return;

      try {
        sampler.triggerAttackRelease(note, duration, time);
      } catch (err) {
        console.error(
          `Trigger failed - note: ${note}, duration: ${duration}`,
          err,
        );
        sampler.triggerAttackRelease(note, "4n", time);
      }
    },
    [],
  );

  return { trigger, isLoaded, error };
}
