import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/../server/trpc";

type RouterOutput = inferRouterOutputs<AppRouter>;
export type Screen = RouterOutput["screen"]["getByStackId"];

export function useScreen(stackId: string) {
  const trpc = useTRPC();

  const query = useSuspenseQuery(
    trpc.screen.getByStackId.queryOptions(
      { stackId },
      {
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        enabled: !!stackId && stackId.length > 0,
      },
    ),
  );

  return {
    screen: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
