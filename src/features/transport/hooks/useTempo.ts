import { useEffect } from "react";
import * as Tone from "tone";

import type { Track } from "@/types";

import { useTRPC } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useStackIdStore from "@/features/stacks/hooks/useStackIdStore";
import useTracksStore from "@/features/track/hooks/useTracksStore";
import { useTransportRead } from "@/features/transport/hooks/useTransportRead";
import useTransportStore from "./useTransportStore";

const useTempo = (tracks: Track[]) => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { transport, isLoading, isError } = useTransportRead(stackId);

  const { setTracks } = useTracksStore();
  const { isTempo, setIsTempo } = useTransportStore();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const tracksQueryKey = trpc.track.getByStackId.queryKey({
    stackId: stackId!,
  });

  const updateTrackMutation = useMutation(
    trpc.track.update.mutationOptions({
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: tracksQueryKey });
      },

      onError: (error: unknown) => {
        console.error("Failed to update track loop lengths:", error);
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: tracksQueryKey });
      },
    })
  );

  useEffect(() => {
    if (!transport?.tempo || isLoading || isError || !stackId) {
      return;
    }

    Tone.getTransport().bpm.value = transport.tempo;

    if (isTempo) {
      const updatedTracks = tracks.map((t) => {
        if (t.type !== "audio" || !t.audioTrack) {
          return t;
        }

        const barDuration = Tone.TransportTime("1m").toSeconds();
        const newLoopLength = Math.max(
          1,
          Math.round(t.audioTrack.fullDuration / barDuration),
        );

        return {
          ...t,
          audioTrack: {
            ...t.audioTrack,
            loopLength: newLoopLength,
          },
        } as Track;
      });

      setTracks(updatedTracks);

      const updates = updatedTracks.filter(
        (t) => t.type === "audio" && t.audioTrack,
      );

      if (updates.length > 0) {
        const trackToUpdate = updates[0];

        updateTrackMutation.mutate({
          id: trackToUpdate.id,
          loopLength: trackToUpdate.loopLength,
        });
      }

      setIsTempo(false);
    }
  }, [
    transport,
    isLoading,
    isError,
    isTempo,
    tracks,
    setTracks,
    setIsTempo,
    updateTrackMutation,
    stackId,
    tracksQueryKey,
  ]);
};

export default useTempo;