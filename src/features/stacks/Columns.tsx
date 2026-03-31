import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { Stack } from "./hooks/useStackRead";

export const columns: ColumnDef<Stack>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const stack = row.original;
      return (
        <a href={`/stacks/${stack.id}`} className="font-medium hover:underline">
          {stack.title}
        </a>
      );
    },
  },
  {
    accessorKey: "transport.tempo",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tempo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.original.transport?.tempo ?? "—"}
      </div>
    ),
  },
  {
    id: "trackCount",
    accessorFn: (row) => row.tracks?.length ?? 0,
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tracks
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ getValue }) => (
      <div className="text-center font-medium">{getValue() as number}</div>
    ),
  },
  {
    id: "delete",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const stack = row.original;
      return (
        <div className="text-right">
          <a
            href={`/stacks/${stack.id}/delete`}
            className="text-destructive hover:underline text-sm"
          >
            Delete
          </a>
        </div>
      );
    },
  },
];
