import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc";
import type { SamplerPattern } from "@/types";

export function useSamplerPatternRead(stackId: string | null) {
  const trpc = useTRPC();

  const query = useSuspenseQuery(
    trpc.sampler.getByStackId.queryOptions(
      { stackId: stackId! },
      {
        enabled: !!stackId,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
      },
    ),
  );

  return {
    pattern: query.data?.pattern as SamplerPattern,
  };
}
