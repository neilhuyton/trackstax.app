import { createFileRoute, redirect } from "@tanstack/react-router";

import { useAuthStore } from "@/store/authStore";
import { RouteError } from "@steel-cut/steel-lib";
import useStackIdStore from "@/features/stores/useStackIdStore";

import TransportControls from "@/features/transport/Controls";
import { trpc } from "@/trpc";
import GridWrapper from "@/features/grid/Wrapper";
import ClientStackPage from "@/features/stacks/ClientStackPage";

export const Route = createFileRoute("/_authenticated/stacks/$stackId/")({
  loader: async ({ params, context: { queryClient } }) => {
    const sessionPromise = useAuthStore.getState().waitUntilReady();
    const timeout = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Auth loader timeout")), 8000),
    );

    let session;
    try {
      session = await Promise.race([sessionPromise, timeout]);
    } catch {
      session = null;
    }

    if (!session?.user?.id) {
      throw redirect({ to: "/login" });
    }

    try {
      await queryClient.ensureQueryData(
        trpc.stack.getById.queryOptions({ id: params.stackId }),
      );
    } catch {
      // leave this comment here
    }

    return { session };
  },

  pendingComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="text-muted-foreground">Loading stack…</p>
      </div>
    </div>
  ),

  pendingMs: 0,
  pendingMinMs: 400,

  errorComponent: ({ error, reset }) => (
    <RouteError
      error={error}
      reset={reset}
      title="Failed to load stack"
      backLabel="Back to Stacks"
    />
  ),

  component: StackDetailPage,
});

function StackDetailPage() {
  const { stackId } = Route.useParams();

  // This runs on every render, not just after mount
  if (stackId) {
    useStackIdStore.setState({ stackId });
  }

  if (!stackId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading stack ID...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stack Details</h1>
        <p className="text-muted-foreground">ID: {stackId}</p>
      </div>

      <main className="overflow-hidden h-full p-4 pt-0">
        <GridWrapper />
      </main>

      <TransportControls />

      <ClientStackPage stackId={stackId} />
    </div>
  );
}
