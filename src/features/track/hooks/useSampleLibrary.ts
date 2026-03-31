import { useTRPC } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { RouterOutput } from "@/types";

export type Sample = RouterOutput["sample"]["getSamples"][number];

export function useSampleCollections() {
  const trpc = useTRPC();

  return useQuery(
    trpc.sample.getCollections.queryOptions(undefined, {
      staleTime: 1000 * 60 * 10,
    }),
  );
}

export function useSampleSubcategories(collection: string | null) {
  const trpc = useTRPC();

  return useQuery(
    trpc.sample.getSubcategories.queryOptions(
      { collection: collection ?? "" },
      {
        enabled: !!collection,
        staleTime: 1000 * 60 * 10,
      },
    ),
  );
}

export function useSamples(
  collection: string | null,
  subcategory: string | null,
  bpmFilter: number | null = null,
  search: string = "", // ← new
) {
  const trpc = useTRPC();

  return useQuery(
    trpc.sample.getSamples.queryOptions(
      {
        collection: collection ?? "",
        subcategory: subcategory ?? null,
        bpm: bpmFilter,
        search: search.trim() || undefined,
      },
      {
        enabled: !!collection,
        staleTime: 1000 * 60 * 5,
      },
    ),
  );
}
