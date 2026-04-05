import { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";

export function useSampler(sampleUrl: string | null) {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(false);
    setError(null);

    // Cleanup previous sampler
    if (samplerRef.current) {
      samplerRef.current.dispose();
      samplerRef.current = null;
    }

    if (!sampleUrl) {
      return;
    }

    const sampler = new Tone.Sampler({
      urls: {
        C3: sampleUrl,
      },
      attack: 0,
      release: 1.2,
      curve: "linear",

      onload: () => {
        setIsLoaded(true);
      },
      onerror: () => {
        setError("Failed to load sample");
      },
    }).toDestination();        // ← Direct connection = maximum fidelity

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
        console.error(`Trigger failed - note: ${note}, duration: ${duration}`, err);
        sampler.triggerAttackRelease(note, "4n", time);
      }
    },
    [],
  );

  return {
    trigger,
    isLoaded,
    error,
    sampler: samplerRef.current,   // expose so we can control mute/volume
  };
}