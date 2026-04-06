import { useEffect } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import useTransportStore from "./useTransportStore";

export function useMasterVolumePersistence(stackId: string) {
  const { data: destination } = useSuspenseQuery(
    trpc.destination.getByStackId.queryOptions(
      { stackId },
      { enabled: !!stackId },
    ),
  );

  const updateMutation = useMutation(
    trpc.destination.update.mutationOptions({
      onError: (error) => {
        console.error("Failed to update master volume:", error);
      },
    }),
  );

  // Load from DB and set store immediately
  useEffect(() => {
    if (destination?.volumePercent !== undefined) {
      useTransportStore.setState({
        masterVolumePercent: destination.volumePercent,
      });
    }
  }, [destination]);

  const saveMasterVolume = async (percent: number) => {
    const safePercent = Math.max(0, Math.min(100, percent));

    await updateMutation.mutateAsync({
      stackId,
      volumePercent: safePercent,
    });
  };

  return {
    saveMasterVolume,
  };
}
