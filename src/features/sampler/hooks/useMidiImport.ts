import { useCallback } from "react";
import type { Track } from "@/types";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

type UseMidiImportProps = {
  samplerTrack: Track | undefined;
  trackId: string;
};

export const useMidiImport = ({
  samplerTrack,
  trackId,
}: UseMidiImportProps) => {
  const { storeUpdateTrack } = useTracksStore();

  const updatePatternMutation = useMutation(
    trpc.sampler.updatePattern.mutationOptions(),
  );

  const handleMidiLoad = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !samplerTrack?.samplerTrack) return;

      try {
        const { midiToSamplerPattern } =
          await import("@/features/sampler/utils/midiToPattern");

        const newPattern = await midiToSamplerPattern(file);

        const updatedTrack: Track = {
          ...samplerTrack,
          samplerTrack: {
            ...samplerTrack.samplerTrack,
            pattern: newPattern,
          },
        };

        storeUpdateTrack(updatedTrack);
        updatePatternMutation.mutate({
          trackId,
          pattern: newPattern,
        });
      } catch (err) {
        console.error("Failed to load MIDI file:", err);
        alert("Failed to load MIDI file. Please check the console.");
      }

      // Reset file input
      e.target.value = "";
    },
    [samplerTrack, trackId, storeUpdateTrack, updatePatternMutation],
  );

  return { handleMidiLoad };
};
