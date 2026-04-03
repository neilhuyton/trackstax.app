import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc";

export function useTrackRead(stackId: string) {
  const trpc = useTRPC();

  const query = useSuspenseQuery(
    trpc.track.getByStackId.queryOptions(
      { stackId },
      {
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        enabled: !!stackId && stackId.length > 0,
      },
    ),
  );

  return {
    tracks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
