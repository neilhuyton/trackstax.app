import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export function useMasterVolumeUpdate(stackId: string) {
  const updateMutation = useMutation(
    trpc.destination.update.mutationOptions({
      onError: (error) => {
        console.error("Failed to update master volume:", error);
      },
    }),
  );

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
