import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc";
import type { SamplerPattern } from "@/types";

export function useSamplerPatternRead(trackId: string | null) {
  const trpc = useTRPC();

  const query = useSuspenseQuery(
    trpc.sampler.getByTrackId.queryOptions(
      { trackId: trackId! },
      {
        enabled: !!trackId,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
      },
    ),
  );

  return {
    pattern: query.data?.pattern as SamplerPattern,
    isLoading: query.isLoading,
  };
}
