import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/../server/trpc";

type RouterOutput = inferRouterOutputs<AppRouter>;
export type Stack = RouterOutput["stack"]["getAll"][number];

export function useStackRead() {
  const trpc = useTRPC();

  const stacksQueryKey = trpc.stack.getAll.queryKey();

  const { data: stacks = [] } = useSuspenseQuery(
    trpc.stack.getAll.queryOptions(undefined, {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60 * 24,
    }),
  );

  return {
    stacks,
    stacksQueryKey,
  };
}
