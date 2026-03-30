import { useCallback } from "react";

import InlineEdit from "@/features/grid/InlineEdit";
import { useStack } from "../stacks/useStackRead";
import useStackIdStore from "../stacks/useStackIdStore";
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const GridTitle = () => {
  const stackId = useStackIdStore((state) => state.stackId);
  const { data: stack, isError } = useStack(stackId);

  const queryClient = useQueryClient();

  const updateStackMutation = useMutation(
    trpc.stack.update.mutationOptions({
      onMutate: async (variables) => {
        if (!stack) return;

        await queryClient.cancelQueries({
          queryKey: trpc.stack.getById.queryKey({ id: stackId }),
        });

        const previousStack = stack;

        const optimisticStack = {
          ...stack,
          title: variables.title,
        };

        queryClient.setQueryData(
          trpc.stack.getById.queryKey({ id: stackId }),
          optimisticStack,
        );

        return { previousStack };
      },
      onError: (_, __, context) => {
        if (context?.previousStack) {
          queryClient.setQueryData(
            trpc.stack.getById.queryKey({ id: stackId }),
            context.previousStack,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.stack.getById.queryKey({ id: stackId }),
        });
      },
    }),
  );

  const handleSave = useCallback(
    async (value: string) => {
      if (!stack) return;

      updateStackMutation.mutate({
        id: stack.id,
        title: value,
      });
    },
    [stack, updateStackMutation],
  );

  if (isError) return null;
  if (!stack) return null;

  return (
    <h2 className="text-white font-semibold text-xl leading-7 mr-1.5">
      <InlineEdit
        value={stack.title}
        onSave={handleSave}
        inputClass="text-white font-semibold text-xl leading-7 mr-1.5 p-0 bg-transparent"
        spanClass="text-white font-semibold text-xl leading-7 mr-1.5 cursor-pointer"
        maxLength={50}
        minLength={3}
      />
    </h2>
  );
};

export default GridTitle;
