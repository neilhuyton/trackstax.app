import { useState, useRef, useEffect } from "react";
import * as Tone from "tone";
import type { Sample } from "./useSampleLibrary";

export function useAudioPreview() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const previewPlayerRef = useRef<Tone.Player | null>(null);

  useEffect(() => {
    return () => {
      if (previewPlayerRef.current) {
        previewPlayerRef.current.stop();
        previewPlayerRef.current.dispose();
        previewPlayerRef.current = null;
      }
    };
  }, []);

  const togglePreview = async (sample: Sample) => {
    if (playingId === sample.id) {
      stopPreview();
      return;
    }

    stopPreview();

    try {
      setPlayingId(sample.id);

      const player = new Tone.Player({
        url: sample.downloadUrl, // ← no replace
        onload: () => player.start(),
        onstop: () => setPlayingId(null),
      }).toDestination();

      previewPlayerRef.current = player;
    } catch (error) {
      console.error("Preview failed:", error);
      setPlayingId(null);
    }
  };

  const stopPreview = () => {
    if (previewPlayerRef.current) {
      previewPlayerRef.current.stop();
      previewPlayerRef.current.dispose();
      previewPlayerRef.current = null;
    }
    setPlayingId(null);
  };

  return {
    playingId,
    togglePreview,
    stopPreview,
  };
}
