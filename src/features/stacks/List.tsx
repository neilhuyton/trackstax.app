import { type ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import DataTable from "./DataTable";

import type { Stack } from "./hooks/useStackRead";

type Props = {
  stacks: Stack[];
  columns: ColumnDef<Stack>[];
};

export const StackList = ({ stacks, columns }: Props) => {
  return (
    <Card className="w-full flex flex-col p-6">
      <div className="pb-4 flex items-center justify-between">
        <h2 className="text-white font-semibold text-xl">Your Stacks</h2>
        <div className="text-sm text-muted-foreground">
          {stacks.length} stacks
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable columns={columns} data={stacks} />
      </div>
    </Card>
  );
};
