import { useEffect } from "react";
import * as Tone from "tone";

import type { Track } from "@/types";
import { useTransportRead } from "./useTransportRead";
import useTransportStore from "./useTransportStore";
import useTracksStore from "../track/hooks/useTracksStore";
import useStackIdStore from "../stacks/hooks/useStackIdStore";

import { useTRPC } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useTempo = (players: Tone.Players | null, tracks: Track[]) => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { transport, isLoading, isError } = useTransportRead(stackId);

  const { setTracks } = useTracksStore();
  const { isTempo, setIsTempo } = useTransportStore();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const tracksQueryKey = trpc.track.getByStackId.queryKey({
    stackId: stackId!,
  });

  const updateLoopLengthsMutation = useMutation(
    trpc.track.updateLoopLengths.mutationOptions({
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: tracksQueryKey });
      },

      onError: (error) => {
        console.error("Failed to update track loop lengths:", error);
        // Add banner here later
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: tracksQueryKey });
      },
    }),
  );

  useEffect(() => {
    if (!transport?.tempo || isLoading || isError || !stackId) {
      return;
    }

    Tone.getTransport().bpm.value = transport.tempo;

    if (isTempo) {
      const updatedTracks = tracks.map((t) => {
        if (t.type !== "audio" || !t.audioTrack || !players?.has(t.id)) {
          return t;
        }

        const player = players.player(t.id);
        if (!player) return t;

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
        };
      });

      setTracks(updatedTracks);

      const updates = updatedTracks
        .filter((t) => t.type === "audio" && t.audioTrack)
        .map((t) => ({
          id: t.id,
          loopLength: t.audioTrack!.loopLength,
        }));

      if (updates.length > 0) {
        updateLoopLengthsMutation.mutate(updates);
      }

      setIsTempo(false);
    }
  }, [
    transport,
    isLoading,
    isError,
    isTempo,
    tracks,
    players,
    setTracks,
    setIsTempo,
    updateLoopLengthsMutation,
    stackId,
    tracksQueryKey,
  ]);
};

export default useTempo;
