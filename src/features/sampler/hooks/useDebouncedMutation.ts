import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useCallback, useRef, useEffect } from "react";

export function useDebouncedMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
  debounceMs: number = 400,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const mutation = useMutation(options);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    mutate: originalMutate,
    mutateAsync: originalMutateAsync,
    ...rest
  } = mutation;

  const debouncedMutate = useCallback(
    (variables: TVariables) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        originalMutate(variables);
      }, debounceMs);
    },
    [originalMutate, debounceMs],
  );

  const debouncedMutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      return originalMutateAsync(variables);
    },
    [originalMutateAsync],
  );

  // Cleanup timeout when the hook unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...rest,
    mutate: debouncedMutate,
    mutateAsync: debouncedMutateAsync,
  } as UseMutationResult<TData, TError, TVariables, TContext>;
}
