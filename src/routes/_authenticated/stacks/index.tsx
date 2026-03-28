import { createFileRoute } from "@tanstack/react-router";
import { useStackRead } from "@/features/stacks/useStackRead";
import { StackList } from "@/features/stacks/List";
import { columns } from "@/features/stacks/Columns";
import { FabButton } from "@steel-cut/steel-lib";
import { trpc } from "@/trpc";

export const Route = createFileRoute("/_authenticated/stacks/")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(
      trpc.stack.getAll.queryOptions(undefined),
    );
    return {};
  },

  component: StacksPage,
});

function StacksPage() {
  const { stacks } = useStackRead();
  const navigate = Route.useNavigate();

  const handleCreateNew = () => {
    navigate({ to: "/stacks/new" });
  };

  return (
    <>
      <StackList stacks={stacks} columns={columns} />
      <FabButton
        onClick={handleCreateNew}
        label="Create new stack"
        testId="fab-add-stack"
      />
    </>
  );
}
