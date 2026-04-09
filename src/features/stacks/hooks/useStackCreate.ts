import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc";
import { useBannerStore } from "@steel-cut/steel-lib";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/../server/trpc";

type RouterOutput = inferRouterOutputs<AppRouter>;
type Stack = RouterOutput["stack"]["getAll"][number];

function createOptimisticStack(
  input: { title: string },
  prevLength: number,
): Stack {
  const now = new Date().toISOString();

  return {
    id: `temp-${crypto.randomUUID()}`,
    title: input.title,
    sortOrder: prevLength,
    userId: "",
    createdAt: now,
    updatedAt: now,
    transport: null,
    destination: null,
    tracks: [],
  } as Stack;
}

export function useStackCreate() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { show: showBanner } = useBannerStore();

  const allStacksQueryKey = trpc.stack.getAll.queryKey();

  const mutation = useMutation(
    trpc.stack.create.mutationOptions({
      onMutate: async (input: { title: string }) => {
        await queryClient.cancelQueries({ queryKey: allStacksQueryKey });

        const prev = queryClient.getQueryData<Stack[]>(allStacksQueryKey) ?? [];

        const optimistic = createOptimisticStack(input, prev.length);

        queryClient.setQueryData<Stack[]>(allStacksQueryKey, [
          ...prev,
          optimistic,
        ]);

        return { prev };
      },

      onError: (_, __, ctx) => {
        if (ctx?.prev) {
          queryClient.setQueryData(allStacksQueryKey, ctx.prev);
        }
        showBanner({
          message: "Failed to create stack. Please try again.",
          variant: "error",
          duration: 4000,
        });
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: allStacksQueryKey });
      },

      onSuccess: (created) => {
        queryClient.setQueryData<Stack[]>(allStacksQueryKey, (old = []) =>
          old.map((item) =>
            item.id.startsWith("temp-")
              ? {
                  ...item,
                  id: created.id,
                  title: created.title,
                  sortOrder: created.sortOrder,
                  createdAt: created.createdAt,
                  updatedAt: created.updatedAt,
                }
              : item,
          ),
        );

        showBanner({
          message: "Stack has been created successfully.",
          variant: "success",
          duration: 3000,
        });
      },
    }),
  );

  return {
    createStack: (
      input: { title: string },
      callbacks?: { onSuccess?: () => void },
    ) => {
      mutation.mutate(input, {
        onSuccess: () => callbacks?.onSuccess?.(),
      });
    },

    isCreating: mutation.isPending,
  };
}
