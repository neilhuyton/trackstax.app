import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc";
import { toClientTracks } from "@/features/utils/prisma-transformer";

export function useTrackRead(stackId: string) {
  const trpc = useTRPC();

  const query = useSuspenseQuery(
    trpc.track.getByStackId.queryOptions(
      { stackId },
      {
        staleTime: 0,
        gcTime: 1000 * 60 * 5,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
        retry: false,
      },
    ),
  );

  return {
    tracks: toClientTracks(query.data), 
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
