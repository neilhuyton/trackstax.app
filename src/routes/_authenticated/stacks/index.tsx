import { createFileRoute } from "@tanstack/react-router";
import { useStackRead } from "@/features/stacks/useStackRead";
import { StackList } from "@/features/stacks/List";
import { columns } from "@/features/stacks/Columns";
import { FabButton, RouteError } from "@steel-cut/steel-lib";
// import { trpc } from "@/trpc";
// import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/_authenticated/stacks/")({
  // loader: async ({ context: { queryClient } }) => {
  //   const sessionPromise = useAuthStore.getState().waitUntilReady();
  //   const timeout = new Promise<null>((_, reject) =>
  //     setTimeout(() => reject(new Error("Auth loader timeout")), 8000),
  //   );

  //   let session;
  //   try {
  //     session = await Promise.race([sessionPromise, timeout]);
  //   } catch {
  //     session = null;
  //   }

  //   if (!session?.user?.id) {
  //     throw redirect({ to: "/login" });
  //   }

  //   try {
  //     await queryClient.ensureQueryData(
  //       trpc.stack.getAll.queryOptions(undefined),
  //     );
  //   } catch {
  //     // leave this comment here
  //   }

  //   return { session };
  // },

  pendingComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="text-muted-foreground">
          Restoring session and loading data…
        </p>
      </div>
    </div>
  ),

  pendingMs: 0,
  pendingMinMs: 400,

  errorComponent: ({ error, reset }) => (
    <RouteError
      error={error}
      reset={reset}
      title="Failed to load stacks"
      backLabel="Back to Home"
    />
  ),

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
