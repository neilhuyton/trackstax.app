import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc";
import { useBannerStore } from "@steel-cut/steel-lib";

export function useStackDelete() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { show: showBanner } = useBannerStore();

  const allStacksQueryKey = trpc.stack.getAll.queryKey();

  const mutation = useMutation(
    trpc.stack.delete.mutationOptions({
      onMutate: async ({ id }: { id: string }) => {
        await queryClient.cancelQueries({ queryKey: allStacksQueryKey });

        const previousStacks =
          queryClient.getQueryData(allStacksQueryKey) ?? [];

        queryClient.setQueryData<typeof previousStacks>(
          allStacksQueryKey,
          (old = []) => old.filter((s) => s.id !== id),
        );

        return { previousStacks };
      },

      onError: (_, __, context) => {
        if (context?.previousStacks) {
          queryClient.setQueryData(allStacksQueryKey, context.previousStacks);
        }

        showBanner({
          message: "Failed to delete stack. Please try again.",
          variant: "error",
          duration: 5000,
        });
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: allStacksQueryKey });
      },

      onSuccess: () => {
        showBanner({
          message: "Stack deleted successfully.",
          variant: "success",
          duration: 3000,
        });
      },
    }),
  );

  return {
    deleteStack: (
      stackId: string,
      callbacks?: {
        onSuccess?: () => void;
        onError?: () => void;
      },
    ) => {
      mutation.mutate(
        { id: stackId },
        {
          onSuccess: () => callbacks?.onSuccess?.(),
          onError: () => callbacks?.onError?.(),
        },
      );
    },

    isDeleting: mutation.isPending,
  };
}
