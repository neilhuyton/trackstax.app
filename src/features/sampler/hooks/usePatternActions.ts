import { useCallback } from "react";
import type { SamplerEvent, Track } from "@/types";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

import {
  addNoteToPattern,
  removeNoteFromPattern,
} from "@/features/sampler/utils/pianoRollUtils";

type UsePatternActionsProps = {
  samplerTrack: Track | undefined;
  currentPattern: SamplerEvent[];
  trackId: string;
};

export const usePatternActions = ({
  samplerTrack,
  currentPattern,
  trackId,
}: UsePatternActionsProps) => {
  const { storeUpdateTrack } = useTracksStore();

  const updatePatternMutation = useMutation(
    trpc.sampler.updatePattern.mutationOptions(),
  );

  const updatePattern = useCallback(
    (newPattern: SamplerEvent[]) => {
      if (!samplerTrack || !samplerTrack.samplerTrack) return;

      const updatedTrack: Track = {
        ...samplerTrack,
        samplerTrack: {
          pattern: newPattern,
          attackMs: samplerTrack.samplerTrack.attackMs ?? 10,
          releaseMs: samplerTrack.samplerTrack.releaseMs ?? 200,
          zones: samplerTrack.samplerTrack.zones ?? [],
        },
      };

      storeUpdateTrack(updatedTrack);
      updatePatternMutation.mutate({ trackId, pattern: newPattern });
    },
    [samplerTrack, storeUpdateTrack, updatePatternMutation, trackId],
  );

  const handleAddNote = useCallback(
    (time: string, note: string, duration = "0:0:0") => {
      const latestPattern = addNoteToPattern(
        currentPattern,
        time,
        note,
        duration,
      );
      updatePattern(latestPattern);
    },
    [currentPattern, updatePattern],
  );

  const handleRemoveNote = useCallback(
    (time: string, note: string) => {
      const latestPattern = removeNoteFromPattern(currentPattern, time, note);
      updatePattern(latestPattern);
    },
    [currentPattern, updatePattern],
  );

  return {
    handleAddNote,
    handleRemoveNote,
    updatePattern,
  };
};
