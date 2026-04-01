import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/../server/trpc";

type RouterOutput = inferRouterOutputs<AppRouter>;
export type Transport = RouterOutput["transport"]["getByStackId"];

export function useTransportRead(stackId: string) {
  const trpc = useTRPC();

  const query = useSuspenseQuery(
    trpc.transport.getByStackId.queryOptions(
      { stackId },
      {
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        enabled: !!stackId && stackId.length > 0,
        retry: false,
      },
    ),
  );

  return {
    transport: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
