// src/hooks/useSampler.ts
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
      onload: () => {
        console.log("✅ Sampler loaded:", sampleUrl);
        setIsLoaded(true);
      },
      onerror: (err: any) => {
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

  // Simple trigger - accepts optional time for scheduling
  const trigger = useCallback((note: string = "D3", duration: string = "16n", time?: number) => {
    const sampler = samplerRef.current;
    if (!sampler || !sampler.loaded) return;

    sampler.triggerAttackRelease(note, duration, time);
  }, []);

  return { trigger, isLoaded, error };
}